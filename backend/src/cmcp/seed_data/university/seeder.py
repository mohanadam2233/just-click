from __future__ import annotations

import logging
from typing import Optional, Tuple, Dict, Any, List

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy.inspection import inspect as sa_inspect

from cmcp.modules.education_people.models import StudentProfile
from cmcp.common.security.passwords import hash_password

from cmcp.modules.University.models import Company
from cmcp.modules.auth.models import User, UserTypeEnum, UserAffiliation
from cmcp.modules.rbac.models import Role, UserRole

from cmcp.modules.academic.models import (
    Faculty, Department, AcademicYear, Semester, Course, CourseOffering, CourseChapter
)

from cmcp.seed_data.university.data import UNIVERSITIES

logger = logging.getLogger(__name__)


# ------------------------------------------------------------
# helpers
# ------------------------------------------------------------
def _get_or_create(
        db: Session,
        model,
        *,
        defaults: Optional[dict] = None,
        **filters,
) -> Tuple[object, bool]:
    """
    Idempotent get/create with proper duplicate handling.
    """
    obj = db.scalar(select(model).filter_by(**filters))
    if obj:
        return obj, False

    obj = model(**{**filters, **(defaults or {})})
    db.add(obj)
    try:
        db.flush([obj])
        return obj, True
    except IntegrityError as e:
        db.rollback()
        # Try to fetch again - it might have been created by another process
        existing = db.scalar(select(model).filter_by(**filters))
        if existing is not None:
            return existing, False

        # If still not found, raise with helpful message
        raise RuntimeError(
            f"Failed creating {model.__name__} with filters={filters}. "
            f"This is NOT a duplicate; it likely violates NOT NULL / FK / CHECK constraints. "
            f"Original error: {e}"
        ) from e


def _safe_hash(plain: str) -> str:
    return hash_password(plain)


def _user_type_from_str(v: str) -> UserTypeEnum:
    vv = (v or "").strip().lower()
    if vv == "admin":
        return UserTypeEnum.ADMIN
    if vv == "staff":
        return UserTypeEnum.STAFF
    if vv == "teacher":
        return UserTypeEnum.TEACHER
    return UserTypeEnum.STUDENT


def _ensure_role(db: Session, name: str) -> Role:
    role = db.scalar(select(Role).where(Role.name == name))
    if not role:
        raise RuntimeError(
            f"Role '{name}' not found. Run RBAC seeding first (seed_rbac)."
        )
    return role


def _set_if_hasattr(obj: object, field: str, value: Any) -> bool:
    """Set obj.field=value only if the field exists. Returns True if changed."""
    if not hasattr(obj, field):
        return False
    if getattr(obj, field) != value:
        setattr(obj, field, value)
        return True
    return False


def _user_required_fill_from_username(username: str) -> Dict[str, Any]:
    """
    Best-effort defaults for common required User fields.
    Only applied if those columns exist.
    """
    uname = username.strip()
    safe_local = uname.replace(" ", "").lower()
    return {
        "email": f"{safe_local}@example.local",
        "full_name": uname,
        "first_name": uname.split("_")[0].title() if "_" in uname else uname.title(),
        "last_name": "User",
        "phone": None,
    }


def _apply_user_defaults_if_columns_exist(defaults: Dict[str, Any]) -> Dict[str, Any]:
    """
    Filters defaults to only columns that actually exist on User.
    """
    mapper = sa_inspect(User)
    cols = {c.key for c in mapper.columns}
    return {k: v for k, v in defaults.items() if k in cols}


def _resolve_student_profile_fks(
        db: Session,
        *,
        company_id: int,
        p_spec: Dict[str, Any],
        faculty_by_code: Dict[str, Faculty],
        dept_by_code: Dict[str, Department],
        sem_by_number: Dict[int, Semester],
) -> Dict[str, Any]:
    """
    Allow StudentProfile spec to provide either:
      - faculty_id / department_id / semester_id (as you have now), OR
      - faculty_code / department_code / semester_number (recommended, stable)
    """
    out = dict(p_spec)

    if out.get("faculty_id") is None and out.get("faculty_code"):
        code = str(out["faculty_code"]).strip()
        fac = faculty_by_code.get(code)
        if not fac:
            raise RuntimeError(f"Student profile faculty_code '{code}' not found for company_id={company_id}")
        out["faculty_id"] = int(fac.id)
        # Remove the code to avoid confusion
        out.pop("faculty_code", None)

    if out.get("department_id") is None and out.get("department_code"):
        code = str(out["department_code"]).strip()
        dept = dept_by_code.get(code)
        if not dept:
            raise RuntimeError(f"Student profile department_code '{code}' not found for company_id={company_id}")
        out["department_id"] = int(dept.id)
        out.pop("department_code", None)

    if out.get("semester_id") is None and out.get("semester_number") is not None:
        num = int(out["semester_number"])
        sem = sem_by_number.get(num)
        if not sem:
            raise RuntimeError(f"Student profile semester_number '{num}' not found for company_id={company_id}")
        out["semester_id"] = int(sem.id)
        out.pop("semester_number", None)

    return out


# ------------------------------------------------------------
# seed one student (inside same university spec)
# ------------------------------------------------------------
def _seed_one_student(
        db: Session,
        *,
        company: Company,
        spec: Dict[str, Any],
        faculty_by_code: Dict[str, Faculty],
        dept_by_code: Dict[str, Department],
        sem_by_number: Dict[int, Semester],
) -> None:
    """
    Creates/ensures:
      - Student User
      - Affiliation (company-scoped)
      - UserRole: Student (company-scoped)
      - StudentProfile
      - Links affiliation -> StudentProfile
    """
    s_spec = spec.get("student_user")
    if not s_spec:
        return

    u_spec = s_spec
    p_spec = (s_spec.get("profile") or {})

    username = (u_spec.get("username") or "").strip()
    if not username:
        raise RuntimeError("student_user.username is required in UNIVERSITIES spec")

    password = u_spec.get("password")
    if not password:
        raise RuntimeError("student_user.password is required in UNIVERSITIES spec")

    desired_type = _user_type_from_str(u_spec.get("user_type", "STUDENT"))

    # Build safe defaults for User
    base_defaults = {
        "password_hash": _safe_hash(password),
        "user_type": desired_type,
        "is_system_owner": False,
        "is_enabled": True,
    }

    # Optional user fields from spec (only if your model has them)
    optional_user_fields = {}
    for key in ["email", "full_name", "first_name", "last_name", "phone"]:
        if u_spec.get(key) is not None:
            optional_user_fields[key] = u_spec.get(key)

    # Fill common required fields if not provided
    filled = _user_required_fill_from_username(username)
    for k, v in filled.items():
        optional_user_fields.setdefault(k, v)

    # Keep only columns that exist on User model
    optional_user_fields = _apply_user_defaults_if_columns_exist(optional_user_fields)

    user, created_user = _get_or_create(
        db,
        User,
        username=username,
        defaults={**base_defaults, **optional_user_fields},
    )

    if user is None:
        raise RuntimeError("User creation returned None. Check User model constraints.")

    # Ensure enabled + type (idempotent)
    u_changed = False
    u_changed |= _set_if_hasattr(user, "is_enabled", True)
    u_changed |= _set_if_hasattr(user, "user_type", desired_type)
    if u_changed:
        db.flush([user])

    logger.info("👤 %s student user: %s", "Created" if created_user else "Ensured", username)

    # 2) Affiliation
    aff, created_aff = _get_or_create(
        db,
        UserAffiliation,
        user_id=int(user.id),
        company_id=int(company.id),
        defaults={
            "is_primary": True,
            "is_enabled": True,
            "is_company_owner": False,
            "linked_entity_type": None,
            "linked_entity_id": None,
        },
    )

    aff_changed = False
    aff_changed |= _set_if_hasattr(aff, "is_primary", True)
    aff_changed |= _set_if_hasattr(aff, "is_enabled", True)
    aff_changed |= _set_if_hasattr(aff, "is_company_owner", False)
    if aff_changed:
        db.flush([aff])

    logger.info("🔗 %s student affiliation user=%s company=%s",
                "Created" if created_aff else "Ensured", user.id, company.id)

    # 3) Role assignment
    student_role = _ensure_role(db, "Student")

    ur, created_ur = _get_or_create(
        db,
        UserRole,
        company_id=int(company.id),
        user_id=int(user.id),
        role_id=int(student_role.id),
        defaults={"is_enabled": True},
    )

    if getattr(ur, "is_enabled", True) is not True:
        ur.is_enabled = True
        db.flush([ur])

    logger.info("🛡️ %s role 'Student' for user=%s in company=%s",
                "Assigned" if created_ur else "Ensured", user.id, company.id)

    # 4) StudentProfile
    p_spec2 = _resolve_student_profile_fks(
        db,
        company_id=int(company.id),
        p_spec=p_spec,
        faculty_by_code=faculty_by_code,
        dept_by_code=dept_by_code,
        sem_by_number=sem_by_number,
    )

    # Validate required fks exist now
    for required_key in ["faculty_id", "department_id"]:
        if p_spec2.get(required_key) is None:
            raise RuntimeError(
                f"Student profile missing {required_key}. Provide it OR use faculty_code/department_code."
            )

    profile, created_profile = _get_or_create(
        db,
        StudentProfile,
        company_id=int(company.id),
        user_id=int(user.id),
        defaults={
            "full_name": str(p_spec2.get("full_name") or "").strip() or "Student",
            "student_id": str(p_spec2.get("student_id") or "").strip(),
            "faculty_id": int(p_spec2["faculty_id"]),
            "department_id": int(p_spec2["department_id"]),
            "classroom_id": int(p_spec2["classroom_id"]) if p_spec2.get("classroom_id") is not None else None,
            "semester_id": int(p_spec2["semester_id"]) if p_spec2.get("semester_id") is not None else None,
            "is_enabled": bool(p_spec2.get("is_enabled", True)),
        },
    )

    # Ensure fields (idempotent)
    desired_fields = {
        "full_name": str(p_spec2.get("full_name") or "").strip() or "Student",
        "student_id": str(p_spec2.get("student_id") or "").strip(),
        "faculty_id": int(p_spec2["faculty_id"]),
        "department_id": int(p_spec2["department_id"]),
        "classroom_id": int(p_spec2["classroom_id"]) if p_spec2.get("classroom_id") is not None else None,
        "semester_id": int(p_spec2["semester_id"]) if p_spec2.get("semester_id") is not None else None,
        "is_enabled": bool(p_spec2.get("is_enabled", True)),
    }

    p_changed = False
    for field, val in desired_fields.items():
        if getattr(profile, field, None) != val:
            setattr(profile, field, val)
            p_changed = True

    if p_changed:
        db.flush([profile])

    logger.info("🎓 %s student profile user=%s student_id=%s company=%s",
                "Created" if created_profile else "Ensured",
                user.id, getattr(profile, "student_id", None), company.id)

    # 5) Link affiliation -> student profile
    if hasattr(aff, "linked_entity_type") and hasattr(aff, "linked_entity_id"):
        link_type = "student_profile"
        link_id = int(profile.id)
        if aff.linked_entity_type != link_type or aff.linked_entity_id != link_id:
            aff.linked_entity_type = link_type
            aff.linked_entity_id = link_id
            db.flush([aff])


# ------------------------------------------------------------
# seed one university + mock academic data
# ------------------------------------------------------------
def _seed_one_university(db: Session, spec: Dict[str, Any]) -> None:
    c_spec = spec["company"]
    u_spec = spec["super_admin_user"]
    a_spec = spec["academic"]

    # 1) Company - Use upsert pattern to avoid duplicates
    company_code = (c_spec.get("code") or "").strip() or None

    company = db.scalar(
        select(Company).where(Company.code == company_code) if company_code
        else select(Company).where(Company.name == c_spec["name"].strip())
    )

    if company:
        created_company = False
        # Update existing company
        changed = False
        for field in ["name", "contact_email", "contact_phone", "country", "city", "timezone", "is_enabled"]:
            new_val = c_spec.get(field)
            if field == "name":
                new_val = c_spec["name"].strip()
            if new_val is not None and getattr(company, field, None) != new_val:
                setattr(company, field, new_val)
                changed = True
        if changed:
            db.flush([company])
        logger.info("🏫 Ensured company: %s (%s)", company.name, company.code)
    else:
        # Create new company
        company = Company(
            name=c_spec["name"].strip(),
            code=company_code,
            contact_email=c_spec.get("contact_email"),
            contact_phone=c_spec.get("contact_phone"),
            country=c_spec.get("country"),
            city=c_spec.get("city"),
            timezone=c_spec.get("timezone"),
            is_enabled=bool(c_spec.get("is_enabled", True)),
        )
        db.add(company)
        db.flush([company])
        created_company = True
        logger.info("🏫 Created company: %s (%s)", company.name, company.code)

    # 2) Super Admin user
    username = u_spec["username"].strip()
    password = u_spec.get("password")
    if not password:
        raise RuntimeError("super_admin_user.password is required in UNIVERSITIES spec")

    desired_type = _user_type_from_str(u_spec.get("user_type", "ADMIN"))

    user_defaults = {
        "password_hash": _safe_hash(password),
        "user_type": desired_type,
        "is_system_owner": False,
        "is_enabled": True,
    }

    user_defaults.update(_apply_user_defaults_if_columns_exist(_user_required_fill_from_username(username)))

    user, created_user = _get_or_create(
        db,
        User,
        username=username,
        defaults=user_defaults,
    )

    u_changed = False
    u_changed |= _set_if_hasattr(user, "is_enabled", True)
    u_changed |= _set_if_hasattr(user, "user_type", desired_type)
    if u_changed:
        db.flush([user])

    logger.info("👤 %s user: %s", "Created" if created_user else "Ensured", username)

    # 3) Affiliation
    aff, created_aff = _get_or_create(
        db,
        UserAffiliation,
        user_id=int(user.id),
        company_id=int(company.id),
        defaults={
            "is_primary": True,
            "is_enabled": True,
            "is_company_owner": True,
            "linked_entity_type": None,
            "linked_entity_id": None,
        },
    )

    aff_changed = False
    aff_changed |= _set_if_hasattr(aff, "is_primary", True)
    aff_changed |= _set_if_hasattr(aff, "is_enabled", True)
    aff_changed |= _set_if_hasattr(aff, "is_company_owner", True)
    if aff_changed:
        db.flush([aff])

    logger.info("🔗 %s affiliation user=%s company=%s", "Created" if created_aff else "Ensured", user.id, company.id)

    # 4) Role assignment: Super Admin
    super_admin_role = _ensure_role(db, "Super Admin")

    ur, created_ur = _get_or_create(
        db,
        UserRole,
        company_id=int(company.id),
        user_id=int(user.id),
        role_id=int(super_admin_role.id),
        defaults={"is_enabled": True},
    )

    if getattr(ur, "is_enabled", True) is not True:
        ur.is_enabled = True
        db.flush([ur])

    logger.info("🛡️ %s role 'Super Admin' for user=%s in company=%s",
                "Assigned" if created_ur else "Ensured", user.id, company.id)

    # 5) Academic mock data
    faculty_spec = a_spec["faculty"]

    # Check if faculty exists by code or name
    faculty_code = (faculty_spec.get("code") or "").strip()
    faculty = None

    if faculty_code:
        faculty = db.scalar(select(Faculty).where(
            Faculty.company_id == int(company.id),
            Faculty.code == faculty_code
        ))

    if not faculty:
        faculty = db.scalar(select(Faculty).where(
            Faculty.company_id == int(company.id),
            Faculty.name == faculty_spec["name"].strip()
        ))

    if not faculty:
        faculty = Faculty(
            company_id=int(company.id),
            name=faculty_spec["name"].strip(),
            code=faculty_code or None,
            is_enabled=True,
        )
        db.add(faculty)
        db.flush([faculty])
        logger.info("📚 Created faculty: %s", faculty.name)
    else:
        logger.info("📚 Ensured faculty: %s", faculty.name)

    faculty_by_code: Dict[str, Faculty] = {}
    if faculty_code:
        faculty_by_code[faculty_code] = faculty

    # Departments - handle duplicates properly
    dept_by_code: Dict[str, Department] = {}
    for d in a_spec.get("departments", []):
        dept_code = (d.get("code") or "").strip()
        dept = None

        # Try to find by code first (unique constraint)
        if dept_code:
            dept = db.scalar(select(Department).where(
                Department.company_id == int(company.id),
                Department.code == dept_code
            ))

        # If not found by code, try by name
        if not dept:
            dept = db.scalar(select(Department).where(
                Department.company_id == int(company.id),
                Department.faculty_id == int(faculty.id),
                Department.name == d["name"].strip()
            ))

        if not dept:
            dept = Department(
                company_id=int(company.id),
                faculty_id=int(faculty.id),
                name=d["name"].strip(),
                code=dept_code or None,
                is_enabled=True,
            )
            db.add(dept)
            db.flush([dept])
            logger.info("  📁 Created department: %s (%s)", dept.name, dept.code)
        else:
            # Update if needed
            if dept_code and dept.code != dept_code:
                dept.code = dept_code
                db.flush([dept])
            logger.info("  📁 Ensured department: %s (%s)", dept.name, dept.code)

        if dept_code:
            dept_by_code[dept_code] = dept

    # Academic year
    year_spec = a_spec["academic_year"]
    year_name = year_spec["name"].strip()

    year = db.scalar(select(AcademicYear).where(
        AcademicYear.company_id == int(company.id),
        AcademicYear.name == year_name
    ))

    if not year:
        year = AcademicYear(
            company_id=int(company.id),
            name=year_name,
            is_enabled=True,
        )
        db.add(year)
        db.flush([year])
        logger.info("📅 Created academic year: %s", year.name)
    else:
        logger.info("📅 Ensured academic year: %s", year.name)

    # Semesters
    sem_by_number: Dict[int, Semester] = {}
    for s in a_spec.get("semesters", []):
        sem_number = int(s["number"])

        sem = db.scalar(select(Semester).where(
            Semester.company_id == int(company.id),
            Semester.academic_year_id == int(year.id),
            Semester.number == sem_number
        ))

        if not sem:
            sem = Semester(
                company_id=int(company.id),
                academic_year_id=int(year.id),
                number=sem_number,
                name=(s.get("name") or "").strip() or None,
                is_enabled=True,
            )
            db.add(sem)
            db.flush([sem])
            logger.info("  📖 Created semester: %s (Year: %s)", sem.name or f"Semester {sem.number}", year.name)
        else:
            logger.info("  📖 Ensured semester: %s (Year: %s)", sem.name or f"Semester {sem.number}", year.name)

        sem_by_number[sem_number] = sem

    # Courses + CourseOfferings + CourseChapters
    chapters_template = a_spec.get("chapters_per_course", [])

    for c in a_spec.get("courses", []):
        sem = sem_by_number.get(int(c["semester_number"]))
        if not sem:
            raise RuntimeError(f"Semester {c['semester_number']} not found while seeding courses.")

        dept_code = (c.get("department_code") or "").strip()
        dept = dept_by_code.get(dept_code)
        if not dept:
            raise RuntimeError(f"Department code '{dept_code}' not found while seeding courses.")

        # Find or create Course
        course = db.scalar(select(Course).where(
            Course.company_id == int(company.id),
            Course.title == c["title"].strip()
        ))

        if not course:
            course = Course(
                company_id=int(company.id),
                title=c["title"].strip(),
                code=(c.get("code") or "").strip() or None,
                description=(c.get("description") or "").strip() or None,
                is_enabled=True,
            )
            db.add(course)
            db.flush([course])
            logger.info("  📘 Created course: %s (%s)", course.title, course.code)
        else:
            logger.info("  📘 Ensured course: %s (%s)", course.title, course.code)

        # Find or create CourseOffering
        offering = db.scalar(select(CourseOffering).where(
            CourseOffering.company_id == int(company.id),
            CourseOffering.course_id == int(course.id),
            CourseOffering.department_id == int(dept.id),
            CourseOffering.semester_id == int(sem.id)
        ))

        if not offering:
            offering = CourseOffering(
                company_id=int(company.id),
                course_id=int(course.id),
                department_id=int(dept.id),
                semester_id=int(sem.id),
                custom_title=None,
                credit_hours=3,  # Default credit hours
                is_enabled=True,
            )
            db.add(offering)
            db.flush([offering])
            logger.info("    📗 Created offering for course: %s in dept: %s", course.title, dept.name)
        else:
            logger.info("    📗 Ensured offering for course: %s in dept: %s", course.title, dept.name)

        # Create chapters for this offering
        for idx, ch in enumerate(chapters_template, start=1):
            chapter = db.scalar(select(CourseChapter).where(
                CourseChapter.company_id == int(company.id),
                CourseChapter.course_offering_id == int(offering.id),
                CourseChapter.number == idx
            ))

            if not chapter:
                chapter = CourseChapter(
                    company_id=int(company.id),
                    course_offering_id=int(offering.id),
                    number=idx,
                    title=ch["title"],
                    description=None,
                    is_enabled=True,
                )
                db.add(chapter)
                db.flush([chapter])
                logger.info("      📄 Created chapter %d: %s", idx, ch["title"])

    logger.info("📚 Academic mock data ensured for company=%s", company.id)

    # ✅ 6) Seed student (after faculty/dept/sem exist so we can resolve by codes)
    _seed_one_student(
        db,
        company=company,
        spec=spec,
        faculty_by_code=faculty_by_code,
        dept_by_code=dept_by_code,
        sem_by_number=sem_by_number,
    )


# ------------------------------------------------------------
# PUBLIC ENTRY POINT
# ------------------------------------------------------------
def seed_university(db: Session) -> None:
    logger.info("🚀 Seeding UNIVERSITY data...")
    for spec in UNIVERSITIES:
        _seed_one_university(db, spec)
    logger.info("🎉 University seeding complete.")
# from __future__ import annotations
#
# import logging
# from typing import Optional, Tuple, Dict, Any
#
# from sqlalchemy import select
# from sqlalchemy.exc import IntegrityError
# from sqlalchemy.orm import Session
# from cmcp.modules.education_people.models import StudentProfile
# from cmcp.common.security.passwords import hash_password
#
# from cmcp.modules.University.models import Company
# from cmcp.modules.auth.models import User, UserTypeEnum, UserAffiliation
# from cmcp.modules.rbac.models import Role, UserRole
#
# from cmcp.modules.academic.models import (
#     Faculty, Department, AcademicYear, Semester, Course, Chapter
# )
#
# from cmcp.seed_data.university.data import UNIVERSITIES
#
# logger = logging.getLogger(__name__)
#
#
# # ------------------------------------------------------------
# # helpers
# # ------------------------------------------------------------
# def _get_or_create(
#     db: Session,
#     model,
#     *,
#     defaults: Optional[dict] = None,
#     **filters,
# ) -> Tuple[object, bool]:
#     obj = db.scalar(select(model).filter_by(**filters))
#     if obj:
#         return obj, False
#
#     obj = model(**{**filters, **(defaults or {})})
#     db.add(obj)
#     try:
#         db.flush([obj])
#         return obj, True
#     except IntegrityError:
#         db.rollback()
#         return db.scalar(select(model).filter_by(**filters)), False
#
#
# def _safe_hash(plain: str) -> str:
#     return hash_password(plain)
#
#
# def _user_type_from_str(v: str) -> UserTypeEnum:
#     vv = (v or "").strip().lower()
#     if vv == "admin":
#         return UserTypeEnum.ADMIN
#     if vv == "staff":
#         return UserTypeEnum.STAFF
#     if vv == "teacher":
#         return UserTypeEnum.TEACHER
#     return UserTypeEnum.STUDENT
#
#
# def _ensure_role(db: Session, name: str) -> Role:
#     role = db.scalar(select(Role).where(Role.name == name))
#     if not role:
#         raise RuntimeError(
#             f"Role '{name}' not found. Make sure you ran RBAC seeding first (seed_rbac)."
#         )
#     return role
# # ------------------------------------------------------------
# # seed one student (inside same university spec)
# # ------------------------------------------------------------
# def _seed_one_student(db: Session, *, company: Company, spec: Dict[str, Any]) -> None:
#     """
#     Creates:
#       - Student User
#       - Affiliation (company-scoped)
#       - UserRole: Student (company-scoped)
#       - StudentProfile
#       - Links affiliation -> StudentProfile (linked_entity_*)
#     """
#     s_spec = spec.get("student_user")
#     if not s_spec:
#         return
#
#     u_spec = s_spec
#     p_spec = (s_spec.get("profile") or {})
#
#     # 1) User
#     username = (u_spec.get("username") or "").strip()
#     if not username:
#         raise RuntimeError("student_user.username is required in UNIVERSITIES spec")
#
#     desired_type = _user_type_from_str(u_spec.get("user_type", "STUDENT"))
#
#     user, created_user = _get_or_create(
#         db,
#         User,
#         username=username,
#         defaults={
#             "password_hash": _safe_hash(u_spec["password"]),
#             "user_type": desired_type,
#             "is_system_owner": False,
#             "is_enabled": True,
#         },
#     )
#
#     u_changed = False
#     if getattr(user, "is_enabled", True) is not True:
#         user.is_enabled = True
#         u_changed = True
#     if getattr(user, "user_type", None) != desired_type:
#         user.user_type = desired_type
#         u_changed = True
#     if u_changed:
#         db.flush([user])
#
#     logger.info("👤 %s student user: %s", "Created" if created_user else "Ensured", username)
#
#     # 2) Affiliation
#     aff, created_aff = _get_or_create(
#         db,
#         UserAffiliation,
#         user_id=int(user.id),
#         company_id=int(company.id),
#         defaults={
#             "is_primary": True,
#             "is_enabled": True,
#             "is_company_owner": False,
#             # create first as None, we will link AFTER profile exists
#             "linked_entity_type": None,
#             "linked_entity_id": None,
#         },
#     )
#
#     aff_changed = False
#     if aff.is_primary is not True:
#         aff.is_primary = True
#         aff_changed = True
#     if aff.is_enabled is not True:
#         aff.is_enabled = True
#         aff_changed = True
#     if getattr(aff, "is_company_owner", False) is not False:
#         aff.is_company_owner = False
#         aff_changed = True
#
#     if aff_changed:
#         db.flush([aff])
#
#     logger.info("🔗 %s student affiliation user=%s company=%s",
#                 "Created" if created_aff else "Ensured", user.id, company.id)
#
#     # 3) Role assignment: Student
#     student_role = _ensure_role(db, "Student")
#
#     ur, created_ur = _get_or_create(
#         db,
#         UserRole,
#         company_id=int(company.id),
#         user_id=int(user.id),
#         role_id=int(student_role.id),
#         defaults={"is_enabled": True},
#     )
#
#     if getattr(ur, "is_enabled", True) is not True:
#         ur.is_enabled = True
#         db.flush([ur])
#
#     logger.info("🛡️ %s role 'Student' for user=%s in company=%s",
#                 "Assigned" if created_ur else "Ensured", user.id, company.id)
#
#     # 4) StudentProfile
#     # Required: full_name, student_id, faculty_id, department_id
#     profile, created_profile = _get_or_create(
#         db,
#         StudentProfile,
#         company_id=int(company.id),
#         user_id=int(user.id),
#         defaults={
#             "full_name": str(p_spec.get("full_name") or "").strip() or "Student",
#             "student_id": str(p_spec.get("student_id") or "").strip(),
#             "faculty_id": int(p_spec["faculty_id"]),
#             "department_id": int(p_spec["department_id"]),
#             "classroom_id": int(p_spec["classroom_id"]) if p_spec.get("classroom_id") is not None else None,
#             "semester_id": int(p_spec["semester_id"]) if p_spec.get("semester_id") is not None else None,
#             "is_enabled": bool(p_spec.get("is_enabled", True)),
#         },
#     )
#
#     # ensure fields (idempotent)
#     desired_fields = {
#         "full_name": str(p_spec.get("full_name") or "").strip() or "Student",
#         "student_id": str(p_spec.get("student_id") or "").strip(),
#         "faculty_id": int(p_spec["faculty_id"]),
#         "department_id": int(p_spec["department_id"]),
#         "classroom_id": int(p_spec["classroom_id"]) if p_spec.get("classroom_id") is not None else None,
#         "semester_id": int(p_spec["semester_id"]) if p_spec.get("semester_id") is not None else None,
#         "is_enabled": bool(p_spec.get("is_enabled", True)),
#     }
#
#     p_changed = False
#     for field, val in desired_fields.items():
#         if getattr(profile, field, None) != val:
#             setattr(profile, field, val)
#             p_changed = True
#
#     if p_changed:
#         db.flush([profile])
#
#     logger.info("🎓 %s student profile user=%s student_id=%s company=%s",
#                 "Created" if created_profile else "Ensured",
#                 user.id, profile.student_id, company.id)
#
#     # 5) Link affiliation -> student profile (NOW we can, because profile.id exists)
#     if hasattr(aff, "linked_entity_type") and hasattr(aff, "linked_entity_id"):
#         link_type = "student_profile"
#         link_id = int(profile.id)
#         if aff.linked_entity_type != link_type or aff.linked_entity_id != link_id:
#             aff.linked_entity_type = link_type
#             aff.linked_entity_id = link_id
#             db.flush([aff])
#
# # ------------------------------------------------------------
# # seed one university + mock academic data
# # ------------------------------------------------------------
# def _seed_one_university(db: Session, spec: Dict[str, Any]) -> None:
#     c_spec = spec["company"]
#     u_spec = spec["super_admin_user"]
#     a_spec = spec["academic"]
#
#     # 1) Company
#     company, created_company = _get_or_create(
#         db,
#         Company,
#         code=(c_spec.get("code") or "").strip() or None,
#         defaults={
#             "name": c_spec["name"].strip(),
#             "contact_email": c_spec.get("contact_email"),
#             "contact_phone": c_spec.get("contact_phone"),
#             "country": c_spec.get("country"),
#             "city": c_spec.get("city"),
#             "timezone": c_spec.get("timezone"),
#             "is_enabled": bool(c_spec.get("is_enabled", True)),
#         },
#     )
#
#     # If company existed but name differs, keep idempotent and ensure fields
#     changed = False
#     for field in ["name", "contact_email", "contact_phone", "country", "city", "timezone", "is_enabled"]:
#         new_val = c_spec.get(field)
#         if field == "name":
#             new_val = c_spec["name"].strip()
#         if new_val is not None and getattr(company, field, None) != new_val:
#             setattr(company, field, new_val)
#             changed = True
#     if changed:
#         db.flush([company])
#
#     logger.info("🏫 %s company: %s (%s)", "Created" if created_company else "Ensured", company.name, company.code)
#
#     # 2) Super Admin user
#     username = u_spec["username"].strip()
#     user, created_user = _get_or_create(
#         db,
#         User,
#         username=username,
#         defaults={
#             "password_hash": _safe_hash(u_spec["password"]),
#             "user_type": _user_type_from_str(u_spec.get("user_type", "ADMIN")),
#             "is_system_owner": False,
#             "is_enabled": True,
#         },
#     )
#
#     # ensure enabled + type
#     u_changed = False
#     if getattr(user, "is_enabled", True) is not True:
#         user.is_enabled = True
#         u_changed = True
#
#     desired_type = _user_type_from_str(u_spec.get("user_type", "ADMIN"))
#     if getattr(user, "user_type", None) != desired_type:
#         user.user_type = desired_type
#         u_changed = True
#
#     # don't force overwrite password if user exists (safer). If you want, you can add a flag later.
#     if u_changed:
#         db.flush([user])
#
#     logger.info("👤 %s user: %s", "Created" if created_user else "Ensured", username)
#
#     # 3) Affiliation
#     aff, created_aff = _get_or_create(
#         db,
#         UserAffiliation,
#         user_id=int(user.id),
#         company_id=int(company.id),
#         defaults={
#             "is_primary": True,
#             "is_enabled": True,
#             "is_company_owner": True,  # this is your “Super Admin scope inside company” switch
#             "linked_entity_type": None,
#             "linked_entity_id": None,
#         },
#     )
#
#     aff_changed = False
#     if aff.is_primary is not True:
#         aff.is_primary = True
#         aff_changed = True
#     if aff.is_enabled is not True:
#         aff.is_enabled = True
#         aff_changed = True
#     if getattr(aff, "is_company_owner", False) is not True:
#         aff.is_company_owner = True
#         aff_changed = True
#
#     if aff_changed:
#         db.flush([aff])
#
#     logger.info("🔗 %s affiliation user=%s company=%s", "Created" if created_aff else "Ensured", user.id, company.id)
#
#     # 4) Role assignment (company scoped): Super Admin
#     super_admin_role = _ensure_role(db, "Super Admin")
#
#     ur, created_ur = _get_or_create(
#         db,
#         UserRole,
#         company_id=int(company.id),
#         user_id=int(user.id),
#         role_id=int(super_admin_role.id),
#         defaults={"is_enabled": True},
#     )
#
#     if getattr(ur, "is_enabled", True) is not True:
#         ur.is_enabled = True
#         db.flush([ur])
#
#     logger.info("🛡️ %s role 'Super Admin' for user=%s in company=%s",
#                 "Assigned" if created_ur else "Ensured", user.id, company.id)
#
#     # 5) Academic mock data
#     faculty_spec = a_spec["faculty"]
#     faculty, _ = _get_or_create(
#         db,
#         Faculty,
#         company_id=int(company.id),
#         name=faculty_spec["name"].strip(),
#         defaults={
#             "code": (faculty_spec.get("code") or "").strip() or None,
#             "is_enabled": True,
#         },
#     )
#
#     # Departments (keyed by code)
#     dept_by_code: Dict[str, Department] = {}
#     for d in a_spec.get("departments", []):
#         dept, _ = _get_or_create(
#             db,
#             Department,
#             company_id=int(company.id),
#             faculty_id=int(faculty.id),
#             name=d["name"].strip(),
#             defaults={
#                 "code": (d.get("code") or "").strip() or None,
#                 "is_enabled": True,
#             },
#         )
#         code = (d.get("code") or "").strip()
#         if code:
#             dept_by_code[code] = dept
#
#     # Academic year
#     year_spec = a_spec["academic_year"]
#     year, _ = _get_or_create(
#         db,
#         AcademicYear,
#         company_id=int(company.id),
#         name=year_spec["name"].strip(),
#         defaults={"is_enabled": True},
#     )
#
#     # Semesters (key by number)
#     sem_by_number: Dict[int, Semester] = {}
#     for s in a_spec.get("semesters", []):
#         sem, _ = _get_or_create(
#             db,
#             Semester,
#             company_id=int(company.id),
#             academic_year_id=int(year.id),
#             number=int(s["number"]),
#             defaults={
#                 "name": (s.get("name") or "").strip() or None,
#                 "is_enabled": True,
#             },
#         )
#         sem_by_number[int(s["number"])] = sem
#
#     # Courses + Chapters
#     chapters_template = a_spec.get("chapters_per_course") or []
#     for c in a_spec.get("courses", []):
#         sem = sem_by_number.get(int(c["semester_number"]))
#         if not sem:
#             raise RuntimeError(f"Semester {c['semester_number']} not found while seeding courses.")
#
#         dept = dept_by_code.get((c.get("department_code") or "").strip())
#         if not dept:
#             raise RuntimeError(f"Department code {c.get('department_code')} not found while seeding courses.")
#
#         course, _ = _get_or_create(
#             db,
#             Course,
#             company_id=int(company.id),
#             semester_id=int(sem.id),
#             department_id=int(dept.id),
#             title=c["title"].strip(),
#             defaults={
#                 "code": (c.get("code") or "").strip() or None,
#                 "description": (c.get("description") or "").strip() or None,
#                 "is_enabled": True,
#             },
#         )
#
#         # optional chapters (idempotent by unique constraint: company_id + course_id + number)
#         for ch in chapters_template:
#             _get_or_create(
#                 db,
#                 Chapter,
#                 company_id=int(company.id),
#                 course_id=int(course.id),
#                 number=int(ch["number"]),
#                 defaults={
#                     "title": str(ch["title"]).strip(),
#                     "description": None,
#                     "is_enabled": True,
#                 },
#             )
#
#     logger.info("📚 Academic mock data ensured for company=%s", company.id)
#     # ✅ 6) Seed the single student (IMPORTANT: here we DO have `company`)
#     _seed_one_student(db, company=company, spec=spec)
#
#
# # ------------------------------------------------------------
# # PUBLIC ENTRY POINT
# # ------------------------------------------------------------
# def seed_university(db: Session) -> None:
#     """
#     Seeds:
#       - Company
#       - Super Admin user
#       - Affiliation (is_company_owner=True)
#       - UserRole Super Admin (company-scoped)
#       - Academic mock data
#     """
#     logger.info("🚀 Seeding UNIVERSITY data...")
#     for spec in UNIVERSITIES:
#         _seed_one_university(db, spec)
#
#     logger.info("🎉 University seeding complete.")
from __future__ import annotations

import logging
from typing import Optional, Tuple, Dict, Any

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
    Faculty, Department, AcademicYear, Semester, Course, Chapter
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
    Idempotent get/create.
    If create fails for reasons other than "already exists", we raise with details
    (instead of returning None and crashing later).
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
        existing = db.scalar(select(model).filter_by(**filters))
        if existing is not None:
            return existing, False

        # Nothing exists => it failed due to missing required fields / FK / constraints.
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
        "last_name": "Student",
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

    if out.get("department_id") is None and out.get("department_code"):
        code = str(out["department_code"]).strip()
        dept = dept_by_code.get(code)
        if not dept:
            raise RuntimeError(f"Student profile department_code '{code}' not found for company_id={company_id}")
        out["department_id"] = int(dept.id)

    if out.get("semester_id") is None and out.get("semester_number") is not None:
        num = int(out["semester_number"])
        sem = sem_by_number.get(num)
        if not sem:
            raise RuntimeError(f"Student profile semester_number '{num}' not found for company_id={company_id}")
        out["semester_id"] = int(sem.id)

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
        # should never happen now, but keep defensive
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

    # 1) Company
    company, created_company = _get_or_create(
        db,
        Company,
        code=(c_spec.get("code") or "").strip() or None,
        defaults={
            "name": c_spec["name"].strip(),
            "contact_email": c_spec.get("contact_email"),
            "contact_phone": c_spec.get("contact_phone"),
            "country": c_spec.get("country"),
            "city": c_spec.get("city"),
            "timezone": c_spec.get("timezone"),
            "is_enabled": bool(c_spec.get("is_enabled", True)),
        },
    )

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

    logger.info("🏫 %s company: %s (%s)", "Created" if created_company else "Ensured", company.name, company.code)

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

    # Fill common fields if exist
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
    faculty, _ = _get_or_create(
        db,
        Faculty,
        company_id=int(company.id),
        name=faculty_spec["name"].strip(),
        defaults={
            "code": (faculty_spec.get("code") or "").strip() or None,
            "is_enabled": True,
        },
    )

    faculty_by_code: Dict[str, Faculty] = {}
    fcode = (faculty_spec.get("code") or "").strip()
    if fcode:
        faculty_by_code[fcode] = faculty

    # Departments
    dept_by_code: Dict[str, Department] = {}
    for d in a_spec.get("departments", []):
        dept, _ = _get_or_create(
            db,
            Department,
            company_id=int(company.id),
            faculty_id=int(faculty.id),
            name=d["name"].strip(),
            defaults={
                "code": (d.get("code") or "").strip() or None,
                "is_enabled": True,
            },
        )
        code = (d.get("code") or "").strip()
        if code:
            dept_by_code[code] = dept

    # Academic year
    year_spec = a_spec["academic_year"]
    year, _ = _get_or_create(
        db,
        AcademicYear,
        company_id=int(company.id),
        name=year_spec["name"].strip(),
        defaults={"is_enabled": True},
    )

    # Semesters
    sem_by_number: Dict[int, Semester] = {}
    for s in a_spec.get("semesters", []):
        sem, _ = _get_or_create(
            db,
            Semester,
            company_id=int(company.id),
            academic_year_id=int(year.id),
            number=int(s["number"]),
            defaults={
                "name": (s.get("name") or "").strip() or None,
                "is_enabled": True,
            },
        )
        sem_by_number[int(s["number"])] = sem

    # Courses + Chapters
    chapters_template = a_spec.get("chapters_per_course") or []
    for c in a_spec.get("courses", []):
        sem = sem_by_number.get(int(c["semester_number"]))
        if not sem:
            raise RuntimeError(f"Semester {c['semester_number']} not found while seeding courses.")

        dept = dept_by_code.get((c.get("department_code") or "").strip())
        if not dept:
            raise RuntimeError(f"Department code {c.get('department_code')} not found while seeding courses.")

        course, _ = _get_or_create(
            db,
            Course,
            company_id=int(company.id),
            semester_id=int(sem.id),
            department_id=int(dept.id),
            title=c["title"].strip(),
            defaults={
                "code": (c.get("code") or "").strip() or None,
                "description": (c.get("description") or "").strip() or None,
                "is_enabled": True,
            },
        )

        for ch in chapters_template:
            _get_or_create(
                db,
                Chapter,
                company_id=int(company.id),
                course_id=int(course.id),
                number=int(ch["number"]),
                defaults={
                    "title": str(ch["title"]).strip(),
                    "description": None,
                    "is_enabled": True,
                },
            )

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
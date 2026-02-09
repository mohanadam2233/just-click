from __future__ import annotations

import logging
from typing import Optional, Tuple, Dict, Any

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

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
    obj = db.scalar(select(model).filter_by(**filters))
    if obj:
        return obj, False

    obj = model(**{**filters, **(defaults or {})})
    db.add(obj)
    try:
        db.flush([obj])
        return obj, True
    except IntegrityError:
        db.rollback()
        return db.scalar(select(model).filter_by(**filters)), False


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
            f"Role '{name}' not found. Make sure you ran RBAC seeding first (seed_rbac)."
        )
    return role


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

    # If company existed but name differs, keep idempotent and ensure fields
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
    user, created_user = _get_or_create(
        db,
        User,
        username=username,
        defaults={
            "password_hash": _safe_hash(u_spec["password"]),
            "user_type": _user_type_from_str(u_spec.get("user_type", "ADMIN")),
            "is_system_owner": False,
            "is_enabled": True,
        },
    )

    # ensure enabled + type
    u_changed = False
    if getattr(user, "is_enabled", True) is not True:
        user.is_enabled = True
        u_changed = True

    desired_type = _user_type_from_str(u_spec.get("user_type", "ADMIN"))
    if getattr(user, "user_type", None) != desired_type:
        user.user_type = desired_type
        u_changed = True

    # don't force overwrite password if user exists (safer). If you want, you can add a flag later.
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
            "is_company_owner": True,  # this is your “Super Admin scope inside company” switch
            "linked_entity_type": None,
            "linked_entity_id": None,
        },
    )

    aff_changed = False
    if aff.is_primary is not True:
        aff.is_primary = True
        aff_changed = True
    if aff.is_enabled is not True:
        aff.is_enabled = True
        aff_changed = True
    if getattr(aff, "is_company_owner", False) is not True:
        aff.is_company_owner = True
        aff_changed = True

    if aff_changed:
        db.flush([aff])

    logger.info("🔗 %s affiliation user=%s company=%s", "Created" if created_aff else "Ensured", user.id, company.id)

    # 4) Role assignment (company scoped): Super Admin
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

    # Departments (keyed by code)
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

    # Semesters (key by number)
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

        # optional chapters (idempotent by unique constraint: company_id + course_id + number)
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


# ------------------------------------------------------------
# PUBLIC ENTRY POINT
# ------------------------------------------------------------
def seed_university(db: Session) -> None:
    """
    Seeds:
      - Company
      - Super Admin user
      - Affiliation (is_company_owner=True)
      - UserRole Super Admin (company-scoped)
      - Academic mock data
    """
    logger.info("🚀 Seeding UNIVERSITY data...")
    for spec in UNIVERSITIES:
        _seed_one_university(db, spec)
    logger.info("🎉 University seeding complete.")

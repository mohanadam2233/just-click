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

from cmcp.modules.academic.models import Faculty, Department, Semester
from cmcp.modules.education_people.models import Classroom, StudentProfile, StaffProfile
from cmcp.seed_data.people.data import PEOPLE

logger = logging.getLogger(__name__)


# ------------------------------------------------------------
# helpers (same style as university seeder)
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


def _ensure_affiliation(db: Session, *, user_id: int, company_id: int, is_owner: bool = False) -> None:
    aff, _ = _get_or_create(
        db,
        UserAffiliation,
        user_id=int(user_id),
        company_id=int(company_id),
        defaults={
            "is_primary": True,
            "is_enabled": True,
            "is_company_owner": bool(is_owner),
            "linked_entity_type": None,
            "linked_entity_id": None,
        },
    )

    changed = False
    if aff.is_enabled is not True:
        aff.is_enabled = True
        changed = True
    if aff.is_primary is not True:
        aff.is_primary = True
        changed = True

    # keep owner false for normal staff/students unless you want otherwise
    if bool(is_owner) and getattr(aff, "is_company_owner", False) is not True:
        aff.is_company_owner = True
        changed = True

    if changed:
        db.flush([aff])


def _assign_role(db: Session, *, company_id: int, user_id: int, role_name: str) -> None:
    role = _ensure_role(db, role_name)
    ur, _ = _get_or_create(
        db,
        UserRole,
        company_id=int(company_id),
        user_id=int(user_id),
        role_id=int(role.id),
        defaults={"is_enabled": True},
    )
    if getattr(ur, "is_enabled", True) is not True:
        ur.is_enabled = True
        db.flush([ur])


# ------------------------------------------------------------
# PUBLIC ENTRY POINT
# ------------------------------------------------------------
def seed_people(db: Session) -> None:
    """
    Seeds:
      - Classrooms
      - Staff users + affiliation + staff profiles (+ optional role)
      - Student users + affiliation + student profiles (+ optional role)

    Must run AFTER seed_university (because it needs Faculty/Department/Semester records).
    """
    logger.info("🚀 Seeding PEOPLE data...")

    for spec in PEOPLE:
        code = (spec.get("company_code") or "").strip()
        company = db.scalar(select(Company).where(Company.code == code))
        if not company:
            logger.warning("Company with code '%s' not found. Skipping education_people seed.", code)
            continue

        company_id = int(company.id)

        # faculty lookup by code (optional)
        def _faculty_id(f_code: Optional[str]) -> Optional[int]:
            if not f_code:
                return None
            fac = db.scalar(select(Faculty).where(Faculty.company_id == company_id, Faculty.code == f_code))
            return int(fac.id) if fac else None

        def _dept_id(d_code: Optional[str], faculty_id: Optional[int]) -> Optional[int]:
            if not d_code:
                return None
            q = select(Department).where(Department.company_id == company_id, Department.code == d_code)
            # if you want stricter match, also require faculty_id
            if faculty_id is not None:
                q = q.where(Department.faculty_id == int(faculty_id))
            dep = db.scalar(q)
            return int(dep.id) if dep else None

        def _semester_id(number: Optional[int]) -> Optional[int]:
            if not number:
                return None
            sem = db.scalar(select(Semester).where(Semester.company_id == company_id, Semester.number == int(number)))
            return int(sem.id) if sem else None

        # --------------------------------------------------------
        # 1) Classrooms
        # --------------------------------------------------------
        classroom_by_name: Dict[str, Classroom] = {}
        for c in spec.get("classrooms", []):
            name = (c.get("name") or "").strip()
            if not name:
                continue

            rec, created = _get_or_create(
                db,
                Classroom,
                company_id=company_id,
                name=name,
                defaults={
                    "room_number": c.get("room_number"),
                    "is_enabled": bool(c.get("is_enabled", True)),
                },
            )

            # ensure fields (idempotent)
            changed = False
            if c.get("room_number") is not None and rec.room_number != c.get("room_number"):
                rec.room_number = c.get("room_number")
                changed = True
            desired_enabled = bool(c.get("is_enabled", True))
            if getattr(rec, "is_enabled", True) != desired_enabled:
                rec.is_enabled = desired_enabled
                changed = True
            if changed:
                db.flush([rec])

            classroom_by_name[name] = rec
            logger.info("🏫 %s classroom: %s", "Created" if created else "Ensured", name)

        # --------------------------------------------------------
        # 2) Staff
        # --------------------------------------------------------
        for stf in spec.get("staff", []):
            u = stf["user"]
            username = u["username"].strip()

            user, created_user = _get_or_create(
                db,
                User,
                username=username,
                defaults={
                    "password_hash": _safe_hash(u["password"]),
                    "user_type": _user_type_from_str(u.get("user_type", "STAFF")),
                    "is_system_owner": False,
                    "is_enabled": True,
                },
            )

            # ensure enabled + type (do NOT overwrite password if exists)
            u_changed = False
            desired_type = _user_type_from_str(u.get("user_type", "STAFF"))
            if getattr(user, "user_type", None) != desired_type:
                user.user_type = desired_type
                u_changed = True
            if getattr(user, "is_enabled", True) is not True:
                user.is_enabled = True
                u_changed = True
            if u_changed:
                db.flush([user])

            _ensure_affiliation(db, user_id=int(user.id), company_id=company_id, is_owner=False)

            # profile
            faculty_id = _faculty_id(stf.get("faculty_code"))
            dept_id = _dept_id(stf.get("department_code"), faculty_id)

            p = stf["profile"]
            prof, created_prof = _get_or_create(
                db,
                StaffProfile,
                company_id=company_id,
                user_id=int(user.id),
                defaults={
                    "full_name": p["full_name"].strip(),
                    "staff_id": (p.get("staff_id") or None),
                    "faculty_id": faculty_id,
                    "department_id": dept_id,
                    "is_enabled": bool(p.get("is_enabled", True)),
                },
            )

            # ensure fields
            changed = False
            if prof.full_name != p["full_name"].strip():
                prof.full_name = p["full_name"].strip()
                changed = True
            if p.get("staff_id") is not None and prof.staff_id != p.get("staff_id"):
                prof.staff_id = p.get("staff_id")
                changed = True
            if prof.faculty_id != faculty_id:
                prof.faculty_id = faculty_id
                changed = True
            if prof.department_id != dept_id:
                prof.department_id = dept_id
                changed = True
            desired_enabled = bool(p.get("is_enabled", True))
            if getattr(prof, "is_enabled", True) != desired_enabled:
                prof.is_enabled = desired_enabled
                changed = True
            if changed:
                db.flush([prof])

            # optional role assignment
            role_name = stf.get("role_name")
            if role_name:
                _assign_role(db, company_id=company_id, user_id=int(user.id), role_name=role_name)

            logger.info("👩‍🏫 %s staff: %s", "Created" if created_prof else "Ensured", username)

        # --------------------------------------------------------
        # 3) Students
        # --------------------------------------------------------
        for st in spec.get("students", []):
            u = st["user"]
            username = u["username"].strip()

            user, created_user = _get_or_create(
                db,
                User,
                username=username,
                defaults={
                    "password_hash": _safe_hash(u["password"]),
                    "user_type": _user_type_from_str(u.get("user_type", "STUDENT")),
                    "is_system_owner": False,
                    "is_enabled": True,
                },
            )

            # ensure enabled + type
            u_changed = False
            desired_type = _user_type_from_str(u.get("user_type", "STUDENT"))
            if getattr(user, "user_type", None) != desired_type:
                user.user_type = desired_type
                u_changed = True
            if getattr(user, "is_enabled", True) is not True:
                user.is_enabled = True
                u_changed = True
            if u_changed:
                db.flush([user])

            _ensure_affiliation(db, user_id=int(user.id), company_id=company_id, is_owner=False)

            faculty_id = _faculty_id(st.get("faculty_code"))
            dept_id = _dept_id(st.get("department_code"), faculty_id)

            classroom = classroom_by_name.get((st.get("classroom_name") or "").strip()) if st.get("classroom_name") else None
            sem_id = _semester_id(st.get("semester_number"))

            p = st["profile"]
            prof, created_prof = _get_or_create(
                db,
                StudentProfile,
                company_id=company_id,
                user_id=int(user.id),
                defaults={
                    "full_name": p["full_name"].strip(),
                    "student_id": p["student_id"].strip(),
                    "faculty_id": int(faculty_id) if faculty_id is not None else None,
                    "department_id": int(dept_id) if dept_id is not None else None,
                    "classroom_id": int(classroom.id) if classroom else None,
                    "semester_id": int(sem_id) if sem_id is not None else None,
                    "is_enabled": bool(p.get("is_enabled", True)),
                },
            )

            # ensure fields
            changed = False
            if prof.full_name != p["full_name"].strip():
                prof.full_name = p["full_name"].strip()
                changed = True
            if prof.student_id != p["student_id"].strip():
                prof.student_id = p["student_id"].strip()
                changed = True
            if prof.faculty_id != faculty_id:
                prof.faculty_id = faculty_id
                changed = True
            if prof.department_id != dept_id:
                prof.department_id = dept_id
                changed = True
            desired_classroom_id = int(classroom.id) if classroom else None
            if prof.classroom_id != desired_classroom_id:
                prof.classroom_id = desired_classroom_id
                changed = True
            desired_sem_id = int(sem_id) if sem_id is not None else None
            if prof.semester_id != desired_sem_id:
                prof.semester_id = desired_sem_id
                changed = True
            desired_enabled = bool(p.get("is_enabled", True))
            if getattr(prof, "is_enabled", True) != desired_enabled:
                prof.is_enabled = desired_enabled
                changed = True
            if changed:
                db.flush([prof])

            # optional role assignment
            role_name = st.get("role_name")
            if role_name:
                _assign_role(db, company_id=company_id, user_id=int(user.id), role_name=role_name)

            logger.info("🎓 %s student: %s", "Created" if created_prof else "Ensured", username)

        logger.info("✅ People seeded for company=%s", company_id)

    logger.info("🎉 People seeding complete.")

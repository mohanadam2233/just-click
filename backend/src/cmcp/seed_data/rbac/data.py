from __future__ import annotations
from typing import Dict, List, Tuple

# ─────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────
WILDCARD_DOCTYPE_NAME = "*"
WILDCARD_ACTION_NAME = "*"

# ─────────────────────────────────────────────────────────────
# Actions
# ─────────────────────────────────────────────────────────────
# MANAGE expands to: READ, CREATE, UPDATE, DELETE, UPLOAD, DOWNLOAD
DEFAULT_ACTIONS: List[Tuple[str, str]] = [
    ("READ",     "View details"),
    ("CREATE",   "Add new record"),
    ("UPDATE",   "Edit record"),
    ("DELETE",   "Remove record"),

    ("UPLOAD",   "Upload files (PDF/PPT)"),
    ("DOWNLOAD", "Download files"),

    ("MANAGE",   "Full Control (CRUD + Upload/Download)"),

    (WILDCARD_ACTION_NAME, "Superuser access"),
]

# ─────────────────────────────────────────────────────────────
# Modules (UI grouping only)
# NOTE: Your DocType table does NOT store module.
# This is only for organizing seed data / UI menus later.
# ─────────────────────────────────────────────────────────────
DEFAULT_DOCTYPE_MODULES = [
    "Access Control",
    "Academic",
    "People",
    "Content",
]

# ─────────────────────────────────────────────────────────────
# DocType registry names
# Must match your app’s registry names (human readable).
# ─────────────────────────────────────────────────────────────
DEFAULT_DOCTYPE_MAPPINGS: Dict[str, List[str]] = {
    "Access Control": [
        "Role",
        "User Role",
        "Permission",
        "DocType",
        "Action",
    ],

    "Academic": [
        "Faculty",
        "Department",
        "Academic Year",
        "Academic Term",
        "Course",
        "Chapter",
    ],

    "People": [
        "Student Profile",
        "Staff Profile",
        "Classroom",
    ],

    "Content": [
        "Material",
        "Student Material Interaction",
    ],
}

# ─────────────────────────────────────────────────────────────
# Roles
# ─────────────────────────────────────────────────────────────
DEFAULT_ROLES = [
    {"name": "Administrator", "description": "System admin/developer. Full access to everything."},
    {"name": "Super Admin",   "description": "University owner. Full access within their company."},

    {"name": "Academic Staff", "description": "Registrar/office staff. Curriculum + enrollment support."},

    {"name": "Teacher", "description": "Lecturer. Uploads materials, manages chapters."},
    {"name": "Student", "description": "Learner. Views and downloads materials."},
]

# ─────────────────────────────────────────────────────────────
# Permissions Matrix
# ─────────────────────────────────────────────────────────────
ROLE_PERMISSION_MAP: Dict[str, List[str]] = {
    # 1) Administrator (system)
    "Administrator": [
        f"{WILDCARD_DOCTYPE_NAME}:{WILDCARD_ACTION_NAME}",
    ],

    # 2) Super Admin (company owner)
    "Super Admin": [
        # Company settings handled elsewhere (affiliation is_company_owner etc),
        # here we grant broad app-level access.
        "Role:READ",
        "User Role:MANAGE",
        "Permission:READ",
        "DocType:READ",
        "Action:READ",

        "Faculty:MANAGE",
        "Department:MANAGE",
        "Academic Year:MANAGE",
        "Academic Term:MANAGE",
        "Course:MANAGE",
        "Chapter:MANAGE",
        "Classroom:MANAGE",

        "Student Profile:MANAGE",
        "Staff Profile:MANAGE",

        "Material:MANAGE",
        "Student Material Interaction:READ",
    ],

    # 3) Academic Staff
    "Academic Staff": [
        "User Role:READ",

        "Student Profile:MANAGE",
        "Staff Profile:READ",

        "Faculty:READ",
        "Department:READ",
        "Academic Year:MANAGE",
        "Academic Term:MANAGE",
        "Course:MANAGE",
        "Classroom:MANAGE",

        "Chapter:READ",
        "Material:READ",
        "Material:DOWNLOAD",
    ],

    # 4) Teacher
    "Teacher": [
        "Staff Profile:READ",

        "Faculty:READ",
        "Department:READ",
        "Academic Year:READ",
        "Academic Term:READ",
        "Course:READ",
        "Classroom:READ",

        "Student Profile:READ",

        "Chapter:MANAGE",
        "Material:CREATE",
        "Material:READ",
        "Material:UPDATE",
        "Material:DELETE",
        "Material:UPLOAD",
        "Material:DOWNLOAD",
    ],

    # 5) Student
    "Student": [
        "Student Profile:READ",

        "Faculty:READ",
        "Department:READ",
        "Academic Year:READ",
        "Academic Term:READ",
        "Course:READ",
        "Chapter:READ",

        "Material:READ",
        "Material:DOWNLOAD",

        "Student Material Interaction:CREATE",
        "Student Material Interaction:READ",
        "Student Material Interaction:UPDATE",
    ],
}

from __future__ import annotations
from typing import Dict, List, Tuple

WILDCARD_DOCTYPE_NAME = "*"
WILDCARD_ACTION_NAME = "*"

DEFAULT_ACTIONS: List[Tuple[str, str]] = [
    ("READ",   "View a resource"),
    ("CREATE", "Create a new resource"),
    ("UPDATE", "Modify a resource"),
    ("DELETE", "Permanently remove a resource"),

    ("SUBMIT", "Move a document to submitted/posted state"),
    ("CANCEL", "Cancel a submitted document"),
    ("AMEND",  "Amend a submitted document"),

    ("PRINT",  "Generate a printable version"),
    ("EXPORT", "Export data"),
    ("IMPORT", "Import bulk data"),

    ("MANAGE", "CRUD = READ, CREATE, UPDATE, DELETE"),
    ("ASSIGN", "Assign roles or permissions"),

    (WILDCARD_ACTION_NAME, "Unrestricted access to all actions within a resource."),
]

# Minimal modules for now
DEFAULT_DOCTYPE_MODULES = [
    "System",
    "Access Control",
    "Education",
    "Exams",
    "Fees",
]

# ✅ Only what you said you need (courses, academic year/semester, faculty/department, etc.)
DEFAULT_DOCTYPE_MAPPINGS: Dict[str, List[str]] = {
    "System": [
        "Company",
    ],
    "Access Control": [
        "User",
        "User Affiliation",
        "Role",
        "User Role",
        "Action",
        "DocType",
        "Permission",
        "Role Permission",
        "Permission Override",
    ],
    "Education": [
        "Academic Year",
        "Academic Term",     # semester/term
        "Faculty",
        "Department",
        "Program",
        "Course",
        "Subject",
        "Class",
        "Instructor",
        "Student",
        "Enrollment",
        "Attendance",
    ],
    "Exams": [
        "Assessment",
        "Assessment Mark",
        "Grade Scale",
    ],
    "Fees": [
        "Fee Category",
        "Fee Structure",
        "Fee Invoice",
        "Fee Payment",
    ],
}

# Roles: simple + standard
DEFAULT_ROLES = [
    {"name": "System Owner", "scope": "SYSTEM",  "description": "Platform owner. Full access across all companies."},
    {"name": "Company Owner", "scope": "COMPANY", "description": "Tenant owner. Full access within the company."},

    {"name": "Admin",   "scope": "COMPANY", "description": "University administrator."},
    {"name": "Staff",   "scope": "COMPANY", "description": "General staff."},
    {"name": "Teacher", "scope": "COMPANY", "description": "Academic staff."},
    {"name": "Student", "scope": "COMPANY", "description": "Student portal access."},
]

# Role permission mapping (simple, sane defaults)
ROLE_PERMISSION_MAP: Dict[str, List[str]] = {
    "System Owner": [
        f"{WILDCARD_DOCTYPE_NAME}:{WILDCARD_ACTION_NAME}",
    ],

    "Company Owner": [
        f"{WILDCARD_DOCTYPE_NAME}:{WILDCARD_ACTION_NAME}",
    ],

    "Admin": [
        # Manage education setup
        "Academic Year:MANAGE",
        "Academic Term:MANAGE",
        "Faculty:MANAGE",
        "Department:MANAGE",
        "Program:MANAGE",
        "Course:MANAGE",
        "Subject:MANAGE",
        "Class:MANAGE",

        # People
        "Instructor:MANAGE",
        "Student:MANAGE",

        # Enrollments + attendance
        "Enrollment:MANAGE",
        "Attendance:MANAGE",

        # Exams
        "Assessment:MANAGE",
        "Assessment Mark:MANAGE",
        "Grade Scale:MANAGE",

        # Fees
        "Fee Category:MANAGE",
        "Fee Structure:MANAGE",
        "Fee Invoice:MANAGE",
        "Fee Payment:MANAGE",

        # Access control (not full manage by default, but can read)
        "User:READ",
        "Role:READ",
        "User Role:READ",
    ],

    "Staff": [
        "Student:READ",
        "Enrollment:MANAGE",
        "Attendance:MANAGE",

        "Fee Invoice:MANAGE",
        "Fee Payment:MANAGE",

        # Read structure
        "Academic Year:READ",
        "Academic Term:READ",
        "Program:READ",
        "Course:READ",
        "Class:READ",
    ],

    "Teacher": [
        "Student:READ",
        "Class:READ",
        "Course:READ",
        "Subject:READ",

        "Attendance:MANAGE",

        "Assessment:READ",
        "Assessment Mark:MANAGE",
        "Grade Scale:READ",
    ],

    "Student": [
        # mostly read
        "Program:READ",
        "Course:READ",
        "Subject:READ",
        "Class:READ",

        "Enrollment:READ",
        "Attendance:READ",

        "Assessment:READ",
        "Assessment Mark:READ",

        "Fee Invoice:READ",
        "Fee Payment:READ",
    ],
}

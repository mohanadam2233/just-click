from __future__ import annotations

from typing import Dict, List, Any

UNIVERSITIES: List[Dict[str, Any]] = [
    {
        "company": {
            "name": "Jamhuriya University",
            "code": "JC",
            "contact_email": "info@jamhuriya.edu",
            "contact_phone": "+252 61 000 0000",
            "country": "Somalia",
            "city": "Mogadishu",
            "timezone": "Africa/Mogadishu",
            "is_enabled": True,
        },
        "super_admin_user": {
            "username": "jc_admin",
            "password": "ChangeMe!123",
            # user_type is in your enum: ADMIN makes sense for Super Admin
            "user_type": "ADMIN",
        },
        "academic": {
            "faculty": {"name": "Faculty of Computer Science", "code": "FCS"},
            "departments": [
                {"name": "Computer Applications", "code": "CA"},
                {"name": "Computer Networks", "code": "CN"},
                {"name": "Software Engineering", "code": "SE"},
                {"name": "Information Systems", "code": "IS"},
            ],
            "academic_year": {"name": "2025/2026"},
            "semesters": [
                {"number": 1, "name": "Semester 1"},
                {"number": 2, "name": "Semester 2"},
            ],
            # 8 subjects (spread across depts + semesters)
            "courses": [
                # Semester 1
                {"title": "Python Programming", "code": "PY101", "semester_number": 1, "department_code": "CA",
                 "description": "Intro to Python, syntax, functions, and basic problem solving."},
                {"title": "Arabic Language I", "code": "AR101", "semester_number": 1, "department_code": "IS",
                 "description": "Basic Arabic skills for academic writing and communication."},
                {"title": "English Language I", "code": "EN101", "semester_number": 1, "department_code": "IS",
                 "description": "Academic English writing, reading, and speaking fundamentals."},
                {"title": "Computer Networks Fundamentals", "code": "NET101", "semester_number": 1, "department_code": "CN",
                 "description": "Networking basics: IP, routing, switching, and network models."},

                # Semester 2
                {"title": "Data Structures", "code": "DS102", "semester_number": 2, "department_code": "SE",
                 "description": "Arrays, linked lists, stacks, queues, trees, and complexity basics."},
                {"title": "Database Systems", "code": "DB102", "semester_number": 2, "department_code": "IS",
                 "description": "Relational databases, SQL, constraints, and normalization."},
                {"title": "Web Development Basics", "code": "WEB102", "semester_number": 2, "department_code": "CA",
                 "description": "HTML/CSS/JS basics and building simple web pages."},
                {"title": "Operating Systems Basics", "code": "OS102", "semester_number": 2, "department_code": "SE",
                 "description": "Processes, memory, scheduling, files, and OS fundamentals."},
            ],
            # Optional: create a few chapters for each course
            "chapters_per_course": [
                {"number": 1, "title": "Introduction"},
                {"number": 2, "title": "Core Concepts"},
                {"number": 3, "title": "Practice & Exercises"},
            ],
        },
    }
]

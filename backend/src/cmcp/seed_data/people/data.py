from __future__ import annotations
from typing import Dict, List, Any

PEOPLE: List[Dict[str, Any]] = [
    {
        "company_code": "JC",  # match UNIVERSITIES seed
        "classrooms": [
            {"name": "CA222", "room_number": "12", "is_enabled": True},
            {"name": "CA227", "room_number": "7", "is_enabled": True},
            {"name": "CN101", "room_number": "3", "is_enabled": True},
            {"name": "SE203", "room_number": "9", "is_enabled": True},
        ],

        # staff users + their profile
        "staff": [
            {
                "user": {"username": "dr_abdullahi", "password": "ChangeMe!123", "user_type": "STAFF"},
                "profile": {"full_name": "Dr. Abdullahi Mohamed", "staff_id": "JC-STF-0001", "is_enabled": True},
                "faculty_code": "FCS",
                "department_code": "SE",
            },
            {
                "user": {"username": "u_hodan", "password": "ChangeMe!123", "user_type": "STAFF"},
                "profile": {"full_name": "Hodan Ali Hassan", "staff_id": "JC-STF-0002", "is_enabled": True},
                "faculty_code": "FCS",
                "department_code": "CA",
            },
            {
                "user": {"username": "u_yusuf", "password": "ChangeMe!123", "user_type": "STAFF"},
                "profile": {"full_name": "Yusuf Ahmed Warsame", "staff_id": "JC-STF-0003", "is_enabled": True},
                "faculty_code": "FCS",
                "department_code": "CN",
            },
        ],

        # student users + their profile
        "students": [
            {
                "user": {"username": "c1221321", "password": "ChangeMe!123", "user_type": "STUDENT"},
                "profile": {
                    "full_name": "Abdifitah Mohamed Hassan",
                    "student_id": "C1221321",
                    "is_enabled": True,
                },
                "faculty_code": "FCS",
                "department_code": "CA",
                "classroom_name": "CA227",
                "semester_number": 2,
            },
            {
                "user": {"username": "c1221262", "password": "ChangeMe!123", "user_type": "STUDENT"},
                "profile": {"full_name": "Ahmed Abukar Ali", "student_id": "C1221262", "is_enabled": True},
                "faculty_code": "FCS",
                "department_code": "CA",
                "classroom_name": "CA227",
                "semester_number": 2,
            },
            {
                "user": {"username": "c1220474", "password": "ChangeMe!123", "user_type": "STUDENT"},
                "profile": {"full_name": "Ismaciil Cabaas Cismaan", "student_id": "C1220474", "is_enabled": True},
                "faculty_code": "FCS",
                "department_code": "CA",
                "classroom_name": "CA227",
                "semester_number": 2,
            },
            {
                "user": {"username": "c1220626", "password": "ChangeMe!123", "user_type": "STUDENT"},
                "profile": {"full_name": "Naima Mohamud Ali", "student_id": "C1220626", "is_enabled": True},
                "faculty_code": "FCS",
                "department_code": "CA",
                "classroom_name": "CA227",
                "semester_number": 2,
            },
            {
                "user": {"username": "c1220816", "password": "ChangeMe!123", "user_type": "STUDENT"},
                "profile": {"full_name": "Nimco Yusuf Sharif", "student_id": "C1220816", "is_enabled": True},
                "faculty_code": "FCS",
                "department_code": "CA",
                "classroom_name": "CA222",
                "semester_number": 1,
            },
        ],
    }
]

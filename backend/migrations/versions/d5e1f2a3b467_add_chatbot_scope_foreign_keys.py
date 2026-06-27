"""add chatbot scope foreign keys

Revision ID: d5e1f2a3b467
Revises: c3a8f1d2e456
Create Date: 2026-06-25 12:00:00.000000

"""
from alembic import op


revision = "d5e1f2a3b467"
down_revision = "c3a8f1d2e456"
branch_labels = None
depends_on = None


def _create_fk(table: str, column: str, ref_table: str, constraint_name: str) -> None:
    op.create_foreign_key(
        constraint_name,
        table,
        ref_table,
        [column],
        ["id"],
        ondelete="SET NULL",
    )


def upgrade():
    for table in ("chatbot_material_indexes", "chatbot_sessions"):
        _create_fk(table, "course_id", "edu_courses", f"fk_{table}_course_id")
        _create_fk(table, "course_offering_id", "edu_course_offerings", f"fk_{table}_course_offering_id")
        _create_fk(table, "chapter_id", "edu_course_chapters", f"fk_{table}_chapter_id")
        _create_fk(table, "semester_id", "edu_semesters", f"fk_{table}_semester_id")
        _create_fk(table, "department_id", "edu_departments", f"fk_{table}_department_id")
        _create_fk(table, "faculty_id", "edu_faculties", f"fk_{table}_faculty_id")
        _create_fk(table, "academic_year_id", "edu_academic_years", f"fk_{table}_academic_year_id")

    _create_fk("chatbot_sessions", "material_id", "edu_materials", "fk_chatbot_sessions_material_id")


def downgrade():
    op.drop_constraint("fk_chatbot_sessions_material_id", "chatbot_sessions", type_="foreignkey")

    for table in ("chatbot_sessions", "chatbot_material_indexes"):
        for column in (
            "academic_year_id",
            "faculty_id",
            "department_id",
            "semester_id",
            "chapter_id",
            "course_offering_id",
            "course_id",
        ):
            op.drop_constraint(f"fk_{table}_{column}", table, type_="foreignkey")

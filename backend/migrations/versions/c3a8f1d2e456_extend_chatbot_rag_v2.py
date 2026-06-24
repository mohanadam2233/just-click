"""extend chatbot tables for material-scoped RAG v2

Revision ID: c3a8f1d2e456
Revises: b7c4d2a8e951
Create Date: 2026-06-25 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "c3a8f1d2e456"
down_revision = "b7c4d2a8e951"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("chatbot_material_indexes", sa.Column("course_id", sa.BigInteger(), nullable=True))
    op.add_column("chatbot_material_indexes", sa.Column("course_offering_id", sa.BigInteger(), nullable=True))
    op.add_column("chatbot_material_indexes", sa.Column("chapter_id", sa.BigInteger(), nullable=True))
    op.add_column("chatbot_material_indexes", sa.Column("semester_id", sa.BigInteger(), nullable=True))
    op.add_column("chatbot_material_indexes", sa.Column("department_id", sa.BigInteger(), nullable=True))
    op.add_column("chatbot_material_indexes", sa.Column("faculty_id", sa.BigInteger(), nullable=True))
    op.add_column("chatbot_material_indexes", sa.Column("academic_year_id", sa.BigInteger(), nullable=True))
    op.add_column("chatbot_material_indexes", sa.Column("embedding_provider", sa.String(length=80), nullable=True))
    op.add_column("chatbot_material_indexes", sa.Column("embedding_model", sa.String(length=120), nullable=True))
    op.add_column("chatbot_material_indexes", sa.Column("embedding_dimension", sa.Integer(), nullable=True))
    op.add_column("chatbot_material_indexes", sa.Column("chunk_size", sa.Integer(), nullable=True))
    op.add_column("chatbot_material_indexes", sa.Column("chunk_overlap", sa.Integer(), nullable=True))
    op.add_column(
        "chatbot_material_indexes",
        sa.Column("index_status", sa.String(length=20), server_default="pending", nullable=False),
    )
    op.add_column("chatbot_material_indexes", sa.Column("indexed_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("chatbot_material_indexes", sa.Column("last_error", sa.Text(), nullable=True))

    op.create_index("ix_chatbot_index_company_status", "chatbot_material_indexes", ["company_id", "index_status"])
    op.create_index("ix_chatbot_index_company_offering", "chatbot_material_indexes", ["company_id", "course_offering_id"])
    op.create_index("ix_chatbot_index_company_chapter", "chatbot_material_indexes", ["company_id", "chapter_id"])

    op.add_column("chatbot_sessions", sa.Column("material_id", sa.BigInteger(), nullable=True))
    op.add_column("chatbot_sessions", sa.Column("course_id", sa.BigInteger(), nullable=True))
    op.add_column("chatbot_sessions", sa.Column("course_offering_id", sa.BigInteger(), nullable=True))
    op.add_column("chatbot_sessions", sa.Column("chapter_id", sa.BigInteger(), nullable=True))
    op.add_column("chatbot_sessions", sa.Column("semester_id", sa.BigInteger(), nullable=True))
    op.add_column("chatbot_sessions", sa.Column("department_id", sa.BigInteger(), nullable=True))
    op.add_column("chatbot_sessions", sa.Column("faculty_id", sa.BigInteger(), nullable=True))
    op.add_column("chatbot_sessions", sa.Column("academic_year_id", sa.BigInteger(), nullable=True))
    op.add_column(
        "chatbot_sessions",
        sa.Column("scope", sa.String(length=30), server_default="material", nullable=False),
    )
    op.add_column("chatbot_sessions", sa.Column("context_json", postgresql.JSONB(), nullable=True))
    op.add_column("chatbot_sessions", sa.Column("vector_filter_json", postgresql.JSONB(), nullable=True))

    op.create_index("ix_chatbot_sessions_material_id", "chatbot_sessions", ["material_id"])

    op.create_table(
        "chatbot_index_jobs",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("company_id", sa.BigInteger(), nullable=False),
        sa.Column("material_id", sa.BigInteger(), nullable=False),
        sa.Column("requested_by_user_id", sa.BigInteger(), nullable=True),
        sa.Column("trigger_type", sa.String(length=30), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="pending", nullable=False),
        sa.Column("attempt_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("file_hash", sa.String(length=64), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["material_id"], ["edu_materials.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_chatbot_jobs_company_status", "chatbot_index_jobs", ["company_id", "status"])
    op.create_index("ix_chatbot_jobs_company_material", "chatbot_index_jobs", ["company_id", "material_id"])
    op.create_index(op.f("ix_chatbot_index_jobs_company_id"), "chatbot_index_jobs", ["company_id"])
    op.create_index(op.f("ix_chatbot_index_jobs_material_id"), "chatbot_index_jobs", ["material_id"])
    op.create_index(op.f("ix_chatbot_index_jobs_status"), "chatbot_index_jobs", ["status"])
    op.create_index(op.f("ix_chatbot_index_jobs_trigger_type"), "chatbot_index_jobs", ["trigger_type"])


def downgrade():
    op.drop_index(op.f("ix_chatbot_index_jobs_trigger_type"), table_name="chatbot_index_jobs")
    op.drop_index(op.f("ix_chatbot_index_jobs_status"), table_name="chatbot_index_jobs")
    op.drop_index(op.f("ix_chatbot_index_jobs_material_id"), table_name="chatbot_index_jobs")
    op.drop_index(op.f("ix_chatbot_index_jobs_company_id"), table_name="chatbot_index_jobs")
    op.drop_index("ix_chatbot_jobs_company_material", table_name="chatbot_index_jobs")
    op.drop_index("ix_chatbot_jobs_company_status", table_name="chatbot_index_jobs")
    op.drop_table("chatbot_index_jobs")

    op.drop_index("ix_chatbot_sessions_material_id", table_name="chatbot_sessions")
    op.drop_column("chatbot_sessions", "vector_filter_json")
    op.drop_column("chatbot_sessions", "context_json")
    op.drop_column("chatbot_sessions", "scope")
    op.drop_column("chatbot_sessions", "academic_year_id")
    op.drop_column("chatbot_sessions", "faculty_id")
    op.drop_column("chatbot_sessions", "department_id")
    op.drop_column("chatbot_sessions", "semester_id")
    op.drop_column("chatbot_sessions", "chapter_id")
    op.drop_column("chatbot_sessions", "course_offering_id")
    op.drop_column("chatbot_sessions", "course_id")
    op.drop_column("chatbot_sessions", "material_id")

    op.drop_index("ix_chatbot_index_company_chapter", table_name="chatbot_material_indexes")
    op.drop_index("ix_chatbot_index_company_offering", table_name="chatbot_material_indexes")
    op.drop_index("ix_chatbot_index_company_status", table_name="chatbot_material_indexes")
    op.drop_column("chatbot_material_indexes", "last_error")
    op.drop_column("chatbot_material_indexes", "indexed_at")
    op.drop_column("chatbot_material_indexes", "index_status")
    op.drop_column("chatbot_material_indexes", "chunk_overlap")
    op.drop_column("chatbot_material_indexes", "chunk_size")
    op.drop_column("chatbot_material_indexes", "embedding_dimension")
    op.drop_column("chatbot_material_indexes", "embedding_model")
    op.drop_column("chatbot_material_indexes", "embedding_provider")
    op.drop_column("chatbot_material_indexes", "academic_year_id")
    op.drop_column("chatbot_material_indexes", "faculty_id")
    op.drop_column("chatbot_material_indexes", "department_id")
    op.drop_column("chatbot_material_indexes", "semester_id")
    op.drop_column("chatbot_material_indexes", "chapter_id")
    op.drop_column("chatbot_material_indexes", "course_offering_id")
    op.drop_column("chatbot_material_indexes", "course_id")

"""add chatbot tables

Revision ID: b7c4d2a8e951
Revises: ef452e18f598
Create Date: 2026-06-19 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "b7c4d2a8e951"
down_revision = "ef452e18f598"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "chatbot_material_indexes",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("company_id", sa.BigInteger(), nullable=False),
        sa.Column("material_id", sa.BigInteger(), nullable=False),
        sa.Column("file_hash", sa.String(length=64), nullable=False),
        sa.Column("chunk_count", sa.Integer(), nullable=False),
        sa.Column("semester_label", sa.String(length=80), nullable=False),
        sa.Column("subject_name", sa.String(length=200), nullable=False),
        sa.Column("source_name", sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["material_id"], ["edu_materials.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id", "material_id", name="uq_chatbot_index_company_material"),
    )
    op.create_index("ix_chatbot_index_company_subject", "chatbot_material_indexes", ["company_id", "semester_label", "subject_name"])
    op.create_index(op.f("ix_chatbot_material_indexes_company_id"), "chatbot_material_indexes", ["company_id"])
    op.create_index(op.f("ix_chatbot_material_indexes_created_at"), "chatbot_material_indexes", ["created_at"])
    op.create_index(op.f("ix_chatbot_material_indexes_file_hash"), "chatbot_material_indexes", ["file_hash"])
    op.create_index(op.f("ix_chatbot_material_indexes_material_id"), "chatbot_material_indexes", ["material_id"])
    op.create_index(op.f("ix_chatbot_material_indexes_semester_label"), "chatbot_material_indexes", ["semester_label"])
    op.create_index(op.f("ix_chatbot_material_indexes_subject_name"), "chatbot_material_indexes", ["subject_name"])
    op.create_index(op.f("ix_chatbot_material_indexes_updated_at"), "chatbot_material_indexes", ["updated_at"])

    op.create_table(
        "chatbot_sessions",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("company_id", sa.BigInteger(), nullable=False),
        sa.Column("user_id", sa.BigInteger(), nullable=False),
        sa.Column("semester_label", sa.String(length=80), nullable=False),
        sa.Column("subject_name", sa.String(length=200), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_chatbot_sessions_company_user", "chatbot_sessions", ["company_id", "user_id"])
    op.create_index(op.f("ix_chatbot_sessions_company_id"), "chatbot_sessions", ["company_id"])
    op.create_index(op.f("ix_chatbot_sessions_created_at"), "chatbot_sessions", ["created_at"])
    op.create_index(op.f("ix_chatbot_sessions_semester_label"), "chatbot_sessions", ["semester_label"])
    op.create_index(op.f("ix_chatbot_sessions_subject_name"), "chatbot_sessions", ["subject_name"])
    op.create_index(op.f("ix_chatbot_sessions_updated_at"), "chatbot_sessions", ["updated_at"])
    op.create_index(op.f("ix_chatbot_sessions_user_id"), "chatbot_sessions", ["user_id"])

    op.create_table(
        "chatbot_messages",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("company_id", sa.BigInteger(), nullable=False),
        sa.Column("session_id", sa.String(length=64), nullable=False),
        sa.Column("role_name", sa.String(length=20), nullable=False),
        sa.Column("message_text", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["session_id"], ["chatbot_sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_chatbot_messages_company_session", "chatbot_messages", ["company_id", "session_id"])
    op.create_index(op.f("ix_chatbot_messages_company_id"), "chatbot_messages", ["company_id"])
    op.create_index(op.f("ix_chatbot_messages_created_at"), "chatbot_messages", ["created_at"])
    op.create_index(op.f("ix_chatbot_messages_role_name"), "chatbot_messages", ["role_name"])
    op.create_index(op.f("ix_chatbot_messages_session_id"), "chatbot_messages", ["session_id"])
    op.create_index(op.f("ix_chatbot_messages_updated_at"), "chatbot_messages", ["updated_at"])


def downgrade():
    op.drop_index(op.f("ix_chatbot_messages_updated_at"), table_name="chatbot_messages")
    op.drop_index(op.f("ix_chatbot_messages_session_id"), table_name="chatbot_messages")
    op.drop_index(op.f("ix_chatbot_messages_role_name"), table_name="chatbot_messages")
    op.drop_index(op.f("ix_chatbot_messages_created_at"), table_name="chatbot_messages")
    op.drop_index(op.f("ix_chatbot_messages_company_id"), table_name="chatbot_messages")
    op.drop_index("ix_chatbot_messages_company_session", table_name="chatbot_messages")
    op.drop_table("chatbot_messages")

    op.drop_index(op.f("ix_chatbot_sessions_user_id"), table_name="chatbot_sessions")
    op.drop_index(op.f("ix_chatbot_sessions_updated_at"), table_name="chatbot_sessions")
    op.drop_index(op.f("ix_chatbot_sessions_subject_name"), table_name="chatbot_sessions")
    op.drop_index(op.f("ix_chatbot_sessions_semester_label"), table_name="chatbot_sessions")
    op.drop_index(op.f("ix_chatbot_sessions_created_at"), table_name="chatbot_sessions")
    op.drop_index(op.f("ix_chatbot_sessions_company_id"), table_name="chatbot_sessions")
    op.drop_index("ix_chatbot_sessions_company_user", table_name="chatbot_sessions")
    op.drop_table("chatbot_sessions")

    op.drop_index(op.f("ix_chatbot_material_indexes_updated_at"), table_name="chatbot_material_indexes")
    op.drop_index(op.f("ix_chatbot_material_indexes_subject_name"), table_name="chatbot_material_indexes")
    op.drop_index(op.f("ix_chatbot_material_indexes_semester_label"), table_name="chatbot_material_indexes")
    op.drop_index(op.f("ix_chatbot_material_indexes_material_id"), table_name="chatbot_material_indexes")
    op.drop_index(op.f("ix_chatbot_material_indexes_file_hash"), table_name="chatbot_material_indexes")
    op.drop_index(op.f("ix_chatbot_material_indexes_created_at"), table_name="chatbot_material_indexes")
    op.drop_index(op.f("ix_chatbot_material_indexes_company_id"), table_name="chatbot_material_indexes")
    op.drop_index("ix_chatbot_index_company_subject", table_name="chatbot_material_indexes")
    op.drop_table("chatbot_material_indexes")

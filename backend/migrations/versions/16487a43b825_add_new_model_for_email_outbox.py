"""add new model for email outbox

Revision ID: 16487a43b825
Revises: f9023371e122
Create Date: 2026-02-14 13:42:26.392385
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect, text


revision = "16487a43b825"
down_revision = "f9023371e122"
branch_labels = None
depends_on = None


# ---------------- helpers ----------------
def _has_table(bind, table_name: str) -> bool:
    return inspect(bind).has_table(table_name)


def _existing_columns(bind, table_name: str) -> set[str]:
    insp = inspect(bind)
    if not insp.has_table(table_name):
        return set()
    return {c["name"] for c in insp.get_columns(table_name)}


def _index_exists(bind, index_name: str, schema: str = "public") -> bool:
    q = text(
        """
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = :schema
          AND indexname = :idx
        LIMIT 1
        """
    )
    return bind.execute(q, {"schema": schema, "idx": index_name}).scalar() is not None


def _create_index_if_missing(bind, index_name: str, table: str, cols_sql: str):
    # cols_sql example: "(ref_id)" or "(status, created_at)"
    if not _index_exists(bind, index_name):
        op.execute(sa.text(f"CREATE INDEX {index_name} ON {table} {cols_sql}"))


def _unique_constraint_exists(bind, table: str, constraint_name: str) -> bool:
    insp = inspect(bind)
    for uc in insp.get_unique_constraints(table):
        if uc.get("name") == constraint_name:
            return True
    return False


def _fk_exists(bind, table: str, fk_name: str) -> bool:
    insp = inspect(bind)
    for fk in insp.get_foreign_keys(table):
        if fk.get("name") == fk_name:
            return True
    return False


def upgrade():
    bind = op.get_bind()

    # ---------------- code_types ----------------
    if not _has_table(bind, "code_types"):
        op.create_table(
            "code_types",
            sa.Column("name", sa.String(length=100), nullable=False),
            sa.Column("prefix", sa.String(length=50), nullable=False),
            sa.Column("pattern", sa.String(length=120), nullable=False),
            sa.Column("scope", sa.Enum("GLOBAL", "COMPANY", name="code_scope_enum"), nullable=False),
            sa.Column("reset_policy", sa.Enum("NEVER", "YEARLY", "MONTHLY", name="code_reset_policy_enum"), nullable=False),
            sa.Column("padding", sa.Integer(), nullable=False),
            sa.Column("id", sa.BigInteger(), primary_key=True, nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.UniqueConstraint("name"),
        )

    _create_index_if_missing(bind, "ix_code_type_name_prefix", "code_types", "(name, prefix)")
    _create_index_if_missing(bind, "ix_code_types_created_at", "code_types", "(created_at)")
    _create_index_if_missing(bind, "ix_code_types_prefix", "code_types", "(prefix)")
    _create_index_if_missing(bind, "ix_code_types_reset_policy", "code_types", "(reset_policy)")
    _create_index_if_missing(bind, "ix_code_types_scope", "code_types", "(scope)")
    _create_index_if_missing(bind, "ix_code_types_updated_at", "code_types", "(updated_at)")

    # ---------------- email_outbox ----------------
    if not _has_table(bind, "email_outbox"):
        # IMPORTANT: do NOT set index=True here (avoid auto index duplicates)
        op.create_table(
            "email_outbox",
            sa.Column("to_email", sa.String(length=255), nullable=False),
            sa.Column("subject", sa.String(length=255), nullable=False),
            sa.Column("template", sa.String(length=120), nullable=False),
            sa.Column("payload_json", sa.Text(), nullable=True),

            sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
            sa.Column("tries", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("last_error", sa.String(length=800), nullable=True),

            sa.Column("locked_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),

            sa.Column("ref_type", sa.String(length=50), nullable=True),
            sa.Column("ref_id", sa.BigInteger(), nullable=True),

            sa.Column("from_email", sa.String(length=255), nullable=True),
            sa.Column("from_name", sa.String(length=255), nullable=True),

            sa.Column("id", sa.BigInteger(), primary_key=True, nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        )

    _create_index_if_missing(bind, "ix_email_outbox_to_email", "email_outbox", "(to_email)")
    _create_index_if_missing(bind, "ix_email_outbox_template", "email_outbox", "(template)")
    _create_index_if_missing(bind, "ix_email_outbox_status", "email_outbox", "(status)")
    _create_index_if_missing(bind, "ix_email_outbox_created_at", "email_outbox", "(created_at)")
    _create_index_if_missing(bind, "ix_email_outbox_updated_at", "email_outbox", "(updated_at)")
    _create_index_if_missing(bind, "ix_email_outbox_ref_type", "email_outbox", "(ref_type)")
    _create_index_if_missing(bind, "ix_email_outbox_ref_id", "email_outbox", "(ref_id)")
    _create_index_if_missing(bind, "ix_email_outbox_ref", "email_outbox", "(ref_type, ref_id)")
    _create_index_if_missing(bind, "ix_email_outbox_locked", "email_outbox", "(status, locked_at)")
    _create_index_if_missing(bind, "ix_email_outbox_status_created", "email_outbox", "(status, created_at)")
    _create_index_if_missing(bind, "ix_email_outbox_template_status", "email_outbox", "(template, status)")

    # ---------------- code_counters ----------------
    if not _has_table(bind, "code_counters"):
        op.create_table(
            "code_counters",
            sa.Column("code_type_id", sa.BigInteger(), nullable=False),
            sa.Column("company_id", sa.BigInteger(), nullable=True),
            sa.Column("period_key", sa.String(length=20), nullable=True),
            sa.Column("last_sequence_number", sa.BigInteger(), nullable=False),
            sa.Column("id", sa.BigInteger(), primary_key=True, nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["code_type_id"], ["code_types.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["company_id"], ["companies.id"], ondelete="CASCADE"),
            sa.UniqueConstraint("code_type_id", "company_id", "period_key", name="uq_code_counter_partition"),
        )

    _create_index_if_missing(bind, "ix_code_counter_company", "code_counters", "(company_id)")
    _create_index_if_missing(bind, "ix_code_counters_code_type_id", "code_counters", "(code_type_id)")
    _create_index_if_missing(bind, "ix_code_counters_company_id", "code_counters", "(company_id)")
    _create_index_if_missing(bind, "ix_code_counters_period_key", "code_counters", "(period_key)")
    _create_index_if_missing(bind, "ix_code_counters_created_at", "code_counters", "(created_at)")
    _create_index_if_missing(bind, "ix_code_counters_updated_at", "code_counters", "(updated_at)")

    # ---------------- user_affiliations index ----------------
    if _has_table(bind, "user_affiliations"):
        _create_index_if_missing(bind, "ix_user_aff_enabled", "user_affiliations", "(company_id, is_enabled)")

    # ---------------- users changes ----------------
    if not _has_table(bind, "users"):
        return

    # Create enum type safely
    user_status_enum = sa.Enum(
        "PENDING_EMAIL",
        "PENDING_APPROVAL",
        "ACTIVE",
        "REJECTED",
        name="user_status_enum",
    )
    user_status_enum.create(bind, checkfirst=True)

    cols = _existing_columns(bind, "users")

    with op.batch_alter_table("users") as batch_op:
        if "email" not in cols:
            batch_op.add_column(sa.Column("email", sa.String(length=255), nullable=True))

        if "status" not in cols:
            batch_op.add_column(sa.Column("status", user_status_enum, nullable=True, server_default="PENDING_EMAIL"))

        if "email_verified_at" not in cols:
            batch_op.add_column(sa.Column("email_verified_at", sa.DateTime(timezone=True), nullable=True))
        if "email_verify_token_hash" not in cols:
            batch_op.add_column(sa.Column("email_verify_token_hash", sa.String(length=255), nullable=True))
        if "email_verify_expires_at" not in cols:
            batch_op.add_column(sa.Column("email_verify_expires_at", sa.DateTime(timezone=True), nullable=True))

        if "approved_at" not in cols:
            batch_op.add_column(sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True))
        if "approved_by" not in cols:
            batch_op.add_column(sa.Column("approved_by", sa.BigInteger(), nullable=True))

        if "rejected_at" not in cols:
            batch_op.add_column(sa.Column("rejected_at", sa.DateTime(timezone=True), nullable=True))
        if "rejected_by" not in cols:
            batch_op.add_column(sa.Column("rejected_by", sa.BigInteger(), nullable=True))
        if "rejection_reason" not in cols:
            batch_op.add_column(sa.Column("rejection_reason", sa.String(length=500), nullable=True))

        if "must_change_password" not in cols:
            batch_op.add_column(sa.Column("must_change_password", sa.Boolean(), nullable=False, server_default=sa.text("false")))
        if "temp_password_expires_at" not in cols:
            batch_op.add_column(sa.Column("temp_password_expires_at", sa.DateTime(timezone=True), nullable=True))

    # Backfill email for existing users
    op.execute(
        sa.text(
            """
            UPDATE users
            SET email = CONCAT('unknown+', id::text, '@invalid.local')
            WHERE email IS NULL
            """
        )
    )

    # ✅ FIX: cast values to enum type
    op.execute(
        sa.text(
            """
            UPDATE users
            SET status = CASE
                WHEN is_enabled = TRUE THEN 'ACTIVE'::user_status_enum
                ELSE 'PENDING_EMAIL'::user_status_enum
            END
            WHERE status IS NULL
            """
        )
    )

    # enforce NOT NULL + constraints/fks
    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column("email", existing_type=sa.String(length=255), nullable=False)
        batch_op.alter_column("status", nullable=False, server_default=None)
        batch_op.alter_column("must_change_password", server_default=None)

        if not _unique_constraint_exists(bind, "users", "uq_users_email"):
            batch_op.create_unique_constraint("uq_users_email", ["email"])

        if not _fk_exists(bind, "users", "fk_users_approved_by_users"):
            batch_op.create_foreign_key(
                "fk_users_approved_by_users",
                "users",
                ["approved_by"],
                ["id"],
                ondelete="SET NULL",
            )
        if not _fk_exists(bind, "users", "fk_users_rejected_by_users"):
            batch_op.create_foreign_key(
                "fk_users_rejected_by_users",
                "users",
                ["rejected_by"],
                ["id"],
                ondelete="SET NULL",
            )

    # indexes for users (if missing)
    _create_index_if_missing(bind, "ix_users_email", "users", "(email)")
    _create_index_if_missing(bind, "ix_users_email_verify_token_hash", "users", "(email_verify_token_hash)")
    _create_index_if_missing(bind, "ix_users_approved_by", "users", "(approved_by)")
    _create_index_if_missing(bind, "ix_users_rejected_by", "users", "(rejected_by)")
    _create_index_if_missing(bind, "ix_users_must_change_password", "users", "(must_change_password)")
    _create_index_if_missing(bind, "ix_users_status", "users", "(status)")
    _create_index_if_missing(bind, "ix_users_type", "users", "(user_type)")


def downgrade():
    bind = op.get_bind()

    if _has_table(bind, "users"):
        with op.batch_alter_table("users") as batch_op:
            for cname, ctype in [
                ("fk_users_rejected_by_users", "foreignkey"),
                ("fk_users_approved_by_users", "foreignkey"),
                ("uq_users_email", "unique"),
            ]:
                try:
                    batch_op.drop_constraint(cname, type_=ctype)
                except Exception:
                    pass

            for col in [
                "temp_password_expires_at",
                "must_change_password",
                "rejection_reason",
                "rejected_by",
                "rejected_at",
                "approved_by",
                "approved_at",
                "email_verify_expires_at",
                "email_verify_token_hash",
                "email_verified_at",
                "status",
                "email",
            ]:
                try:
                    batch_op.drop_column(col)
                except Exception:
                    pass

    if _has_table(bind, "code_counters"):
        op.drop_table("code_counters")
    if _has_table(bind, "email_outbox"):
        op.drop_table("email_outbox")
    if _has_table(bind, "code_types"):
        op.drop_table("code_types")

    user_status_enum = sa.Enum(
        "PENDING_EMAIL",
        "PENDING_APPROVAL",
        "ACTIVE",
        "REJECTED",
        name="user_status_enum",
    )
    user_status_enum.drop(bind, checkfirst=True)
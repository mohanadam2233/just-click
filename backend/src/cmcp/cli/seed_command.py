from __future__ import annotations

import logging

import click
from flask.cli import with_appcontext

from cmcp.config.database import db
from cmcp.seed_data.rbac.seeder import seed_rbac

logger = logging.getLogger(__name__)


@click.group(name="seed")
def seed_cli() -> None:
    """Database seeding commands."""
    pass


@seed_cli.command("all")
@with_appcontext
def seed_all() -> None:
    """Run all seeders in the correct order."""
    try:
        click.echo("🚀 Starting full database seeding...")

        # 1) Core (system owners etc.)
        click.echo("🌱 Seeding CORE...")
        from cmcp.seed_data.core.seeder import seed_core
        seed_core(db.session)

        # 2) RBAC
        click.echo("🔐 Seeding RBAC...")
        seed_rbac(db.session)

        db.session.commit()
        click.secho("✅ All data seeded successfully!", fg="green")

    except Exception as e:
        db.session.rollback()
        logger.error("Seeding failed", exc_info=True)
        click.secho(f"❌ Seeding failed: {e}", fg="red")
        raise SystemExit(1)


@seed_cli.command("rbac")
@with_appcontext
def seed_rbac_only() -> None:
    """Seed RBAC (DocTypes, Actions, Permissions, Roles, RolePermissions)."""
    try:

        # 2) RBAC
        click.echo("🔐 Seeding RBAC...")
        seed_rbac(db.session)
        db.session.commit()
        click.secho("✅ RBAC seeded successfully!", fg="green")
        # 3) University/company mock
        click.echo("🏫 Seeding UNIVERSITY...")
        from cmcp.seed_data.university.seeder import seed_university
        seed_university(db.session)


    except Exception as e:
        db.session.rollback()
        logger.error("RBAC seeding failed", exc_info=True)
        click.secho(f"❌ RBAC seeding failed: {e}", fg="red")
        raise SystemExit(1)


@seed_cli.command("core")
@with_appcontext
def seed_core_only() -> None:
    """Seed CORE system data (system owner users)."""
    try:
        click.echo("🌱 Seeding core system data...")

        from cmcp.seed_data.core.seeder import seed_core
        seed_core(db.session)

        db.session.commit()
        click.secho("✅ Core data seeded successfully!", fg="green")

    except Exception as e:
        db.session.rollback()
        logger.error("Core seeding failed", exc_info=True)
        click.secho(f"❌ Error seeding core data: {e}", fg="red")
        raise SystemExit(1)
@seed_cli.command("university")
@with_appcontext
def seed_university_only() -> None:
    """Seed one university/company + super admin + academic mock data."""
    try:
        click.echo("🏫 Seeding university data...")
        from cmcp.seed_data.university.seeder import seed_university
        seed_university(db.session)
        db.session.commit()
        click.secho("✅ University seeded successfully!", fg="green")

    except Exception as e:
        db.session.rollback()
        logger.error("University seeding failed", exc_info=True)
        click.secho(f"❌ University seeding failed: {e}", fg="red")
        raise SystemExit(1)

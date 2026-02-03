# app/commands/seed_command.py
from __future__ import annotations

from typing import List

import click
import logging
from flask.cli import with_appcontext


# Your Flask-SQLAlchemy db
from cmcp.config.database import db

# Import your seeders (RBAC for now). Keep a fallback import to reduce path headaches.
try:
    from app.seed_data.rbac.seeder import seed_rbac
except ImportError:
    # If you placed it under project_root/seed_data/rbac/seeder.py
    from seed_data.rbac.seeder import seed_rbac  # type: ignore

logger = logging.getLogger(__name__)


@click.group(name="seed")
def seed_cli():
    """Database seeding commands."""
    # nothing to do here; subcommands will run under app context
    pass

@seed_cli.command("all")
@with_appcontext
def seed_all():
    """
    Run all seeders in the correct order.
    Extend this as you add more seeders (geo, core, etc).
    """
    try:
        click.echo("🚀 Starting full database seeding...")

        # Call seeders in dependency order.
        # Seeders are called in dependency order:
        # Core data (users, companies) must exist before RBAC roles can be assigned.

        click.echo("🏢 Seeding initial organization (companies, branches, departments, owners)...")

        click.echo("🔐 Seeding RBAC...")
        seed_rbac(db.session)

        # --- NEW COA SEEDING ---
        # click.echo("💰 Seeding Chart of Accounts for specified companies...")
        # seed_chart_of_accounts(db.session, company_id=22)
        # seed_chart_of_accounts(db.session, company_id=5)
        # seed_initial_organization(db.session)

        db.session.commit()
        click.secho("✅ All data seeded successfully!", fg="green")
    except Exception as e:
        db.session.rollback()
        logger.error("Seeding failed", exc_info=True)
        click.secho(f"❌ Seeding failed: {e}", fg="red")
        raise SystemExit(1)

@seed_cli.command("rbac")
@with_appcontext
def seed_rbac_only():
    """Seed RBAC (DocTypes, Actions, Permissions, Roles, RolePermissions)."""
    try:
        click.echo("🌱 Seeding RBAC...")
        seed_rbac(db.session)
        db.session.commit()
        click.secho("✅ RBAC seeded successfully!", fg="green")
    except Exception as e:
        db.session.rollback()
        logger.error("RBAC seeding failed", exc_info=True)
        click.secho(f"❌ RBAC seeding failed: {e}", fg="red")
        raise SystemExit(1)
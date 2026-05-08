"""update courser model and chapter logical add new models couser offering

Revision ID: ef452e18f598
Revises: 74f46c98d2fb
Create Date: 2026-05-08 19:46:18.333048

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'ef452e18f598'
down_revision = '74f46c98d2fb'
branch_labels = None
depends_on = None


def upgrade():
    # Step 1: Drop foreign key constraints from edu_materials that reference old tables
    with op.batch_alter_table('edu_materials', schema=None) as batch_op:
        try:
            batch_op.drop_constraint('edu_materials_course_id_fkey', type_='foreignkey')
        except Exception:
            pass
        try:
            batch_op.drop_constraint('edu_materials_chapter_id_fkey', type_='foreignkey')
        except Exception:
            pass

    # Step 2: Clear invalid chapter references (set NULL for chapters that will be deleted)
    op.execute("UPDATE edu_materials SET chapter_id = NULL WHERE chapter_id IS NOT NULL")

    # Step 3: Drop old tables that are being replaced
    with op.batch_alter_table('edu_chapters', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_edu_chapters_company_id'))
        batch_op.drop_index(batch_op.f('ix_edu_chapters_course_id'))
        batch_op.drop_index(batch_op.f('ix_edu_chapters_created_at'))
        batch_op.drop_index(batch_op.f('ix_edu_chapters_is_enabled'))
        batch_op.drop_index(batch_op.f('ix_edu_chapters_number'))
        batch_op.drop_index(batch_op.f('ix_edu_chapters_title'))
        batch_op.drop_index(batch_op.f('ix_edu_chapters_updated_at'))

    op.drop_table('edu_chapters')

    # Step 4: Create new tables
    op.create_table('edu_course_offerings',
                    sa.Column('id', sa.BigInteger(), nullable=False),
                    sa.Column('course_id', sa.BigInteger(), nullable=False),
                    sa.Column('department_id', sa.BigInteger(), nullable=False),
                    sa.Column('semester_id', sa.BigInteger(), nullable=True),
                    sa.Column('custom_title', sa.String(length=200), nullable=True),
                    sa.Column('credit_hours', sa.Integer(), nullable=True),
                    sa.Column('is_enabled', sa.Boolean(), nullable=False),
                    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'),
                              nullable=False),
                    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'),
                              nullable=False),
                    sa.Column('company_id', sa.BigInteger(), nullable=False),
                    sa.CheckConstraint('(credit_hours IS NULL) OR (credit_hours >= 0)',
                                       name='ck_edu_course_offering_credit_hours_min'),
                    sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
                    sa.ForeignKeyConstraint(['course_id'], ['edu_courses.id'], ondelete='CASCADE'),
                    sa.ForeignKeyConstraint(['department_id'], ['edu_departments.id'], ondelete='CASCADE'),
                    sa.ForeignKeyConstraint(['semester_id'], ['edu_semesters.id'], ondelete='CASCADE'),
                    sa.PrimaryKeyConstraint('id'),
                    sa.UniqueConstraint('company_id', 'course_id', 'department_id', 'semester_id',
                                        name='uq_edu_course_offering_scope')
                    )

    with op.batch_alter_table('edu_course_offerings', schema=None) as batch_op:
        batch_op.create_index('ix_edu_course_offerings_company_course', ['company_id', 'course_id'], unique=False)
        batch_op.create_index('ix_edu_course_offerings_company_department', ['company_id', 'department_id'],
                              unique=False)
        batch_op.create_index(batch_op.f('ix_edu_course_offerings_company_id'), ['company_id'], unique=False)
        batch_op.create_index('ix_edu_course_offerings_company_semester', ['company_id', 'semester_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_course_offerings_course_id'), ['course_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_course_offerings_created_at'), ['created_at'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_course_offerings_department_id'), ['department_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_course_offerings_is_enabled'), ['is_enabled'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_course_offerings_semester_id'), ['semester_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_course_offerings_updated_at'), ['updated_at'], unique=False)

    op.create_table('edu_course_chapters',
                    sa.Column('id', sa.BigInteger(), nullable=False),
                    sa.Column('course_offering_id', sa.BigInteger(), nullable=False),
                    sa.Column('number', sa.Integer(), nullable=False),
                    sa.Column('title', sa.String(length=200), nullable=False),
                    sa.Column('description', sa.Text(), nullable=True),
                    sa.Column('is_enabled', sa.Boolean(), nullable=False),
                    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'),
                              nullable=False),
                    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'),
                              nullable=False),
                    sa.Column('company_id', sa.BigInteger(), nullable=False),
                    sa.CheckConstraint('number >= 1', name='ck_edu_course_chapters_number_min'),
                    sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
                    sa.ForeignKeyConstraint(['course_offering_id'], ['edu_course_offerings.id'], ondelete='CASCADE'),
                    sa.PrimaryKeyConstraint('id'),
                    sa.UniqueConstraint('company_id', 'course_offering_id', 'number',
                                        name='uq_edu_course_chapters_offering_number')
                    )

    with op.batch_alter_table('edu_course_chapters', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_edu_course_chapters_company_id'), ['company_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_course_chapters_course_offering_id'), ['course_offering_id'],
                              unique=False)
        batch_op.create_index(batch_op.f('ix_edu_course_chapters_created_at'), ['created_at'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_course_chapters_is_enabled'), ['is_enabled'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_course_chapters_number'), ['number'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_course_chapters_title'), ['title'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_course_chapters_updated_at'), ['updated_at'], unique=False)

    # Step 5: Modify edu_courses - remove columns
    with op.batch_alter_table('edu_courses', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_edu_courses_department_id'))
        batch_op.drop_index(batch_op.f('ix_edu_courses_semester_id'))
        batch_op.drop_constraint(batch_op.f('uq_edu_course_scope_title'), type_='unique')
        batch_op.create_unique_constraint('uq_edu_courses_company_title', ['company_id', 'title'])
        batch_op.drop_constraint(batch_op.f('edu_courses_semester_id_fkey'), type_='foreignkey')
        batch_op.drop_constraint(batch_op.f('edu_courses_department_id_fkey'), type_='foreignkey')
        batch_op.drop_column('department_id')
        batch_op.drop_column('semester_id')

    # Step 6: Add course_offering_id as nullable first
    with op.batch_alter_table('edu_materials', schema=None) as batch_op:
        batch_op.add_column(sa.Column('course_offering_id', sa.BigInteger(), nullable=True))

    # Step 7: Create default course offerings for existing courses
    # Get the first available department and semester for each company
    op.execute("""
        INSERT INTO edu_course_offerings (
            course_id, department_id, semester_id, company_id, is_enabled, created_at, updated_at
        )
        SELECT DISTINCT 
            m.course_id,
            COALESCE(
                (SELECT id FROM edu_departments d WHERE d.company_id = m.company_id AND d.is_enabled = true LIMIT 1),
                (SELECT id FROM edu_departments d WHERE d.company_id = m.company_id LIMIT 1)
            ) as department_id,
            COALESCE(
                (SELECT id FROM edu_semesters s WHERE s.company_id = m.company_id AND s.is_enabled = true LIMIT 1),
                (SELECT id FROM edu_semesters s WHERE s.company_id = m.company_id LIMIT 1)
            ) as semester_id,
            m.company_id,
            true as is_enabled,
            NOW() as created_at,
            NOW() as updated_at
        FROM edu_materials m
        WHERE m.course_offering_id IS NULL
        AND m.course_id IS NOT NULL
        ON CONFLICT (company_id, course_id, department_id, semester_id) DO NOTHING
    """)

    # Step 8: Update materials with the offering ID
    op.execute("""
        UPDATE edu_materials m
        SET course_offering_id = (
            SELECT co.id 
            FROM edu_course_offerings co 
            WHERE co.course_id = m.course_id 
            AND co.company_id = m.company_id
            LIMIT 1
        )
        WHERE m.course_offering_id IS NULL
        AND m.course_id IS NOT NULL
    """)

    # Step 9: Verify all materials have course_offering_id, if not create individual offerings
    op.execute("""
        DO $$
        DECLARE
            mat_record RECORD;
            dept_id BIGINT;
            sem_id BIGINT;
            offering_id BIGINT;
        BEGIN
            FOR mat_record IN 
                SELECT id, course_id, company_id 
                FROM edu_materials 
                WHERE course_offering_id IS NULL 
                AND course_id IS NOT NULL
            LOOP
                -- Get or create department for this company
                SELECT id INTO dept_id FROM edu_departments 
                WHERE company_id = mat_record.company_id AND is_enabled = true 
                LIMIT 1;
                IF dept_id IS NULL THEN
                    SELECT id INTO dept_id FROM edu_departments 
                    WHERE company_id = mat_record.company_id 
                    LIMIT 1;
                END IF;

                -- Get or create semester for this company
                SELECT id INTO sem_id FROM edu_semesters 
                WHERE company_id = mat_record.company_id AND is_enabled = true 
                LIMIT 1;
                IF sem_id IS NULL THEN
                    SELECT id INTO sem_id FROM edu_semesters 
                    WHERE company_id = mat_record.company_id 
                    LIMIT 1;
                END IF;

                -- Create offering
                INSERT INTO edu_course_offerings (
                    course_id, department_id, semester_id, company_id, is_enabled, created_at, updated_at
                ) VALUES (
                    mat_record.course_id, dept_id, sem_id, mat_record.company_id, true, NOW(), NOW()
                ) ON CONFLICT (company_id, course_id, department_id, semester_id) DO UPDATE SET updated_at = NOW()
                RETURNING id INTO offering_id;

                -- Update material
                UPDATE edu_materials SET course_offering_id = offering_id 
                WHERE id = mat_record.id;
            END LOOP;
        END $$;
    """)

    # Step 10: Now make course_offering_id NOT NULL
    with op.batch_alter_table('edu_materials', schema=None) as batch_op:
        batch_op.alter_column('course_offering_id', nullable=False)

    # Step 11: Update column comments and other modifications
    with op.batch_alter_table('edu_materials', schema=None) as batch_op:
        batch_op.alter_column('page_count',
                              existing_type=sa.INTEGER(),
                              comment='For PDF/DOC materials',
                              existing_nullable=True)
        batch_op.alter_column('slide_count',
                              existing_type=sa.INTEGER(),
                              comment='For SLIDES/PPT materials',
                              existing_nullable=True)
        batch_op.alter_column('file_size_mb',
                              existing_type=sa.DOUBLE_PRECISION(precision=53),
                              comment='File size in megabytes',
                              existing_nullable=True)
        batch_op.alter_column('learning_objectives',
                              existing_type=postgresql.JSONB(astext_type=sa.Text()),
                              comment='e.g. ["Understand loops", "Apply recursion"]',
                              existing_comment='e.g. ["Learn Syntax", "Understand Loops"]',
                              existing_nullable=True)
        batch_op.alter_column('is_downloadable',
                              existing_type=sa.BOOLEAN(),
                              comment='If False, students can view but not download',
                              existing_nullable=False)

        # Drop old indexes and constraints
        batch_op.drop_index(batch_op.f('ix_edu_materials_company_course'))
        batch_op.drop_index(batch_op.f('ix_edu_materials_course_id'))
        batch_op.drop_constraint(batch_op.f('uq_edu_materials_scope_title'), type_='unique')

        # Create new indexes
        batch_op.create_index('ix_edu_materials_company_chapter', ['company_id', 'chapter_id'], unique=False)
        batch_op.create_index('ix_edu_materials_company_offering', ['company_id', 'course_offering_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_materials_course_offering_id'), ['course_offering_id'], unique=False)

        # Create new unique constraints with partial indexes
        batch_op.create_index('uq_edu_materials_offering_chapter_title',
                              ['company_id', 'course_offering_id', 'chapter_id', 'title'],
                              unique=True,
                              postgresql_where=sa.text('chapter_id IS NOT NULL'))
        batch_op.create_index('uq_edu_materials_offering_no_chapter_title',
                              ['company_id', 'course_offering_id', 'title'],
                              unique=True,
                              postgresql_where=sa.text('chapter_id IS NULL'))

        # Drop old column
        batch_op.drop_column('course_id')


def downgrade():
    # Step 1: Clear chapter references
    with op.batch_alter_table('edu_materials', schema=None) as batch_op:
        try:
            batch_op.drop_constraint('fk_materials_course_offering', type_='foreignkey')
        except Exception:
            pass

    # Step 2: Restore edu_courses columns
    with op.batch_alter_table('edu_courses', schema=None) as batch_op:
        batch_op.add_column(sa.Column('semester_id', sa.BIGINT(), nullable=True))
        batch_op.add_column(sa.Column('department_id', sa.BIGINT(), nullable=True))

        op.execute("""
            UPDATE edu_courses c
            SET department_id = co.department_id,
                semester_id = co.semester_id
            FROM edu_course_offerings co
            WHERE co.course_id = c.id
            AND c.department_id IS NULL
        """)

        batch_op.alter_column('department_id', nullable=False)
        batch_op.alter_column('semester_id', nullable=False)

        batch_op.create_foreign_key(batch_op.f('edu_courses_department_id_fkey'), 'edu_departments', ['department_id'],
                                    ['id'], ondelete='CASCADE')
        batch_op.create_foreign_key(batch_op.f('edu_courses_semester_id_fkey'), 'edu_semesters', ['semester_id'],
                                    ['id'], ondelete='CASCADE')
        batch_op.drop_constraint('uq_edu_courses_company_title', type_='unique')
        batch_op.create_unique_constraint(batch_op.f('uq_edu_course_scope_title'),
                                          ['company_id', 'semester_id', 'department_id', 'title'])
        batch_op.create_index(batch_op.f('ix_edu_courses_semester_id'), ['semester_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_courses_department_id'), ['department_id'], unique=False)

    # Step 3: Restore old edu_chapters table
    op.create_table('edu_chapters',
                    sa.Column('id', sa.BIGINT(), autoincrement=True, nullable=False),
                    sa.Column('course_id', sa.BIGINT(), autoincrement=False, nullable=False),
                    sa.Column('number', sa.INTEGER(), autoincrement=False, nullable=False),
                    sa.Column('title', sa.VARCHAR(length=200), autoincrement=False, nullable=False),
                    sa.Column('description', sa.TEXT(), autoincrement=False, nullable=True),
                    sa.Column('is_enabled', sa.BOOLEAN(), autoincrement=False, nullable=False),
                    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'),
                              autoincrement=False, nullable=False),
                    sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'),
                              autoincrement=False, nullable=False),
                    sa.Column('company_id', sa.BIGINT(), autoincrement=False, nullable=False),
                    sa.CheckConstraint('number >= 1', name=op.f('ck_edu_chapters_number_min')),
                    sa.ForeignKeyConstraint(['company_id'], ['companies.id'], name=op.f('edu_chapters_company_id_fkey'),
                                            ondelete='CASCADE'),
                    sa.ForeignKeyConstraint(['course_id'], ['edu_courses.id'], name=op.f('edu_chapters_course_id_fkey'),
                                            ondelete='CASCADE'),
                    sa.PrimaryKeyConstraint('id', name=op.f('edu_chapters_pkey')),
                    sa.UniqueConstraint('company_id', 'course_id', 'number', name=op.f('uq_edu_chapters_course_number'))
                    )

    with op.batch_alter_table('edu_chapters', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_edu_chapters_updated_at'), ['updated_at'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_chapters_title'), ['title'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_chapters_number'), ['number'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_chapters_is_enabled'), ['is_enabled'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_chapters_created_at'), ['created_at'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_chapters_course_id'), ['course_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_chapters_company_id'), ['company_id'], unique=False)

    # Step 4: Drop new tables
    with op.batch_alter_table('edu_course_chapters', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_edu_course_chapters_updated_at'))
        batch_op.drop_index(batch_op.f('ix_edu_course_chapters_title'))
        batch_op.drop_index(batch_op.f('ix_edu_course_chapters_number'))
        batch_op.drop_index(batch_op.f('ix_edu_course_chapters_is_enabled'))
        batch_op.drop_index(batch_op.f('ix_edu_course_chapters_created_at'))
        batch_op.drop_index(batch_op.f('ix_edu_course_chapters_course_offering_id'))
        batch_op.drop_index(batch_op.f('ix_edu_course_chapters_company_id'))

    op.drop_table('edu_course_chapters')

    with op.batch_alter_table('edu_course_offerings', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_edu_course_offerings_updated_at'))
        batch_op.drop_index(batch_op.f('ix_edu_course_offerings_semester_id'))
        batch_op.drop_index(batch_op.f('ix_edu_course_offerings_is_enabled'))
        batch_op.drop_index(batch_op.f('ix_edu_course_offerings_department_id'))
        batch_op.drop_index(batch_op.f('ix_edu_course_offerings_created_at'))
        batch_op.drop_index(batch_op.f('ix_edu_course_offerings_course_id'))
        batch_op.drop_index('ix_edu_course_offerings_company_semester')
        batch_op.drop_index(batch_op.f('ix_edu_course_offerings_company_id'))
        batch_op.drop_index('ix_edu_course_offerings_company_department')
        batch_op.drop_index('ix_edu_course_offerings_company_course')

    op.drop_table('edu_course_offerings')

    # Step 5: Restore edu_materials to original state
    with op.batch_alter_table('edu_materials', schema=None) as batch_op:
        batch_op.add_column(sa.Column('course_id', sa.BIGINT(), nullable=True))

        op.execute("""
            UPDATE edu_materials m
            SET course_id = co.course_id
            FROM edu_course_offerings co
            WHERE co.id = m.course_offering_id
            AND m.course_id IS NULL
        """)

        batch_op.alter_column('course_id', nullable=False)

        batch_op.drop_index('uq_edu_materials_offering_no_chapter_title')
        batch_op.drop_index('uq_edu_materials_offering_chapter_title')
        batch_op.drop_index(batch_op.f('ix_edu_materials_course_offering_id'))
        batch_op.drop_index('ix_edu_materials_company_offering')
        batch_op.drop_index('ix_edu_materials_company_chapter')

        batch_op.create_index(batch_op.f('ix_edu_materials_course_id'), ['course_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_edu_materials_company_course'), ['company_id', 'course_id'], unique=False)
        batch_op.create_unique_constraint(batch_op.f('uq_edu_materials_scope_title'),
                                          ['company_id', 'course_id', 'chapter_id', 'title'])

        batch_op.alter_column('is_downloadable',
                              existing_type=sa.BOOLEAN(),
                              comment=None,
                              existing_comment='If False, students can view but not download',
                              existing_nullable=False)
        batch_op.alter_column('learning_objectives',
                              existing_type=postgresql.JSONB(astext_type=sa.Text()),
                              comment='e.g. ["Learn Syntax", "Understand Loops"]',
                              existing_comment='e.g. ["Understand loops", "Apply recursion"]',
                              existing_nullable=True)
        batch_op.alter_column('file_size_mb',
                              existing_type=sa.DOUBLE_PRECISION(precision=53),
                              comment=None,
                              existing_comment='File size in megabytes',
                              existing_nullable=True)
        batch_op.alter_column('slide_count',
                              existing_type=sa.INTEGER(),
                              comment=None,
                              existing_comment='For SLIDES/PPT materials',
                              existing_nullable=True)
        batch_op.alter_column('page_count',
                              existing_type=sa.INTEGER(),
                              comment=None,
                              existing_comment='For PDF/DOC materials',
                              existing_nullable=True)

        batch_op.create_foreign_key(batch_op.f('edu_materials_chapter_id_fkey'), 'edu_chapters', ['chapter_id'], ['id'],
                                    ondelete='SET NULL')
        batch_op.create_foreign_key(batch_op.f('edu_materials_course_id_fkey'), 'edu_courses', ['course_id'], ['id'],
                                    ondelete='CASCADE')

        batch_op.drop_column('course_offering_id')
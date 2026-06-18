"""Initial Zareb schema

Revision ID: 001
Revises: 
Create Date: 2026-06-18
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("company_name", sa.String(255), nullable=True),
        sa.Column("country", sa.String(100), nullable=False, server_default="Other"),
        sa.Column("export_market", sa.String(10), nullable=False, server_default="EU"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # documents
    op.create_table(
        "documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("doc_type", sa.String(20), nullable=False),
        sa.Column("cloudinary_url", sa.Text, nullable=False),
        sa.Column("parsed_text", sa.Text, nullable=True),
        sa.Column("upload_date", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
    )

    # compliance_reports
    op.create_table(
        "compliance_reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("standard", sa.String(20), nullable=False),
        sa.Column("overall_score", sa.Integer, nullable=False),
        sa.Column("gaps_found", postgresql.JSONB, nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("recommendations", postgresql.JSONB, nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("critical_issues", postgresql.JSONB, nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("export_specific_notes", sa.Text, nullable=True),
        sa.Column("audit_readiness", sa.String(20), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # saved_checklists
    op.create_table(
        "saved_checklists",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("standard", sa.String(20), nullable=False),
        sa.Column("completed_items", postgresql.JSONB, nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("user_id", "standard"),
    )


def downgrade() -> None:
    op.drop_table("saved_checklists")
    op.drop_table("compliance_reports")
    op.drop_table("documents")
    op.drop_table("users")

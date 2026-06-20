"""Shared utility functions."""

import uuid


def gen_uuid() -> str:
    """Generate a UUID4 string for use as a primary key."""
    return str(uuid.uuid4())

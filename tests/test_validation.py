"""
Zareb — Validation & Security Tests

Tests the Pydantic validation models and security utilities.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.security import validate_password_strength, verify_password, get_password_hash


class TestPasswordStrength:
    """Password validation rules."""

    def test_accepts_strong_password(self):
        error = validate_password_strength("StrongP@ss1")
        assert error is None

    def test_rejects_short_password(self):
        error = validate_password_strength("Ab1$")
        assert error is not None
        assert "8 characters" in error.lower() or "short" in error.lower()

    def test_rejects_no_uppercase(self):
        error = validate_password_strength("weakpass1$")
        assert error is not None
        assert "uppercase" in error.lower()

    def test_rejects_no_digit(self):
        error = validate_password_strength("WeakPass$")
        assert error is not None
        assert "digit" in error.lower() or "number" in error.lower()

    def test_rejects_no_special_char(self):
        error = validate_password_strength("WeakPass1")
        assert error is not None


class TestPasswordHashing:
    """Password hashing round-trip."""

    def test_hash_and_verify(self):
        password = "SecureP@ss123"
        hashed = get_password_hash(password)
        assert hashed != password  # hash is not plaintext
        assert verify_password(password, hashed) is True

    def test_wrong_password_fails(self):
        password = "SecureP@ss123"
        hashed = get_password_hash(password)
        assert verify_password("WrongP@ss456", hashed) is False

    def test_different_hashes_for_same_password(self):
        """Each call to get_password_hash should produce a unique salt."""
        pwd = "SameP@ss1"
        hash1 = get_password_hash(pwd)
        hash2 = get_password_hash(pwd)
        assert hash1 != hash2  # different salts
        assert verify_password(pwd, hash1) is True
        assert verify_password(pwd, hash2) is True

import pytest
from pydantic import ValidationError

from app.config import Settings


def test_password_is_hidden_from_settings_representation():
    settings = Settings(_env_file=None, db_password="private-test-password")
    assert "private-test-password" not in repr(settings)


def test_database_port_must_be_valid():
    with pytest.raises(ValidationError):
        Settings(_env_file=None, db_port=70000)

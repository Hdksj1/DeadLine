from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app.config import Settings, get_settings
from app.main import app


def test_health_does_not_connect_to_database():
    with patch("app.main.check_database_connection") as check:
        with TestClient(app) as client:
            assert client.get("/health").json() == {"status": "ok"}
        check.assert_not_called()


def test_missing_database_configuration():
    app.dependency_overrides[get_settings] = lambda: Settings(
        _env_file=None, db_user="", db_name="ddl_radar"
    )
    try:
        with patch("app.main.check_database_connection") as check:
            with TestClient(app) as client:
                response = client.get("/health/db")
            assert response.status_code == 503
            assert response.json()["status"] == "not_configured"
            check.assert_not_called()
    finally:
        app.dependency_overrides.clear()


def test_database_health_success_and_failure_hide_credentials():
    app.dependency_overrides[get_settings] = lambda: Settings(
        _env_file=None, db_user="test_user", db_name="ddl_radar"
    )
    try:
        with patch("app.main.check_database_connection") as check:
            with TestClient(app) as client:
                assert client.get("/health/db").json()["database"] == "connected"
                check.side_effect = OperationalError(
                    "SELECT 1", {}, Exception("secret-password")
                )
                response = client.get("/health/db")
                assert response.status_code == 503
                assert response.json()["status"] == "unavailable"
                assert "secret-password" not in response.text
    finally:
        app.dependency_overrides.clear()

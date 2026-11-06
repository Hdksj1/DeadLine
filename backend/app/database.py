from functools import lru_cache

from sqlalchemy import URL, create_engine, text
from sqlalchemy.engine import Engine

from app.config import get_settings


@lru_cache
def get_engine() -> Engine:
    settings = get_settings()
    if not settings.database_configured:
        raise RuntimeError("Database configuration is incomplete")

    # URL.create handles special characters in credentials without interpolation.
    url = URL.create(
        "mysql+pymysql",
        username=settings.db_user,
        password=settings.db_password.get_secret_value(),
        host=settings.db_host,
        port=settings.db_port,
        database=settings.db_name,
        query={"charset": "utf8mb4"},
    )
    return create_engine(
        url,
        pool_pre_ping=True,
        pool_size=2,
        max_overflow=0,
        pool_timeout=5,
        echo=False,
        connect_args={"connect_timeout": 5, "read_timeout": 5, "write_timeout": 5},
    )


def check_database_connection() -> None:
    """Check the configured database without creating tables or writing data."""
    with get_engine().connect() as connection:
        connection.execute(text("SELECT 1")).scalar_one()

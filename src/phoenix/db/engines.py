from __future__ import annotations

import asyncio
import json
import logging
from collections.abc import Callable
from datetime import datetime
from enum import Enum
from sqlite3 import Connection
from typing import Any

import aiosqlite
import numpy as np
import sqlalchemy
import sqlean
from sqlalchemy import URL, StaticPool, event, make_url
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from typing_extensions import assert_never

from phoenix.config import LoggingMode, get_env_database_schema
from phoenix.db.helpers import SupportedSQLDialect
from phoenix.db.migrate import migrate_in_thread
from phoenix.db.models import init_models
from phoenix.db.pg_config import get_pg_config
from phoenix.settings import Settings

sqlean.extensions.enable("text", "stats")

logger = logging.getLogger(__name__)


def set_sqlite_pragma(connection: Connection, _: Any) -> None:
    cursor = connection.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")
    cursor.execute("PRAGMA journal_mode = WAL;")
    cursor.execute("PRAGMA synchronous = OFF;")
    cursor.execute("PRAGMA cache_size = -32000;")
    cursor.execute("PRAGMA busy_timeout = 10000;")
    cursor.close()


def get_printable_db_url(connection_str: str) -> str:
    return make_url(connection_str).render_as_string(hide_password=True)


def get_async_db_url(connection_str: str) -> URL:
    """
    Parses the database URL string and returns a URL object that is async
    """
    url = make_url(connection_str)
    if not url.database:
        raise ValueError("Failed to parse database from connection string")
    backend = SupportedSQLDialect(url.get_backend_name())
    if backend is SupportedSQLDialect.SQLITE:
        return url.set(drivername="sqlite+aiosqlite")
    elif backend is SupportedSQLDialect.POSTGRESQL:
        url = url.set(drivername="postgresql+asyncpg")
        # For some reason username and password cannot be parsed from the typical slot
        # So we need to parse them out manually
        if url.username and url.password:
            url = url.set(
                query={**url.query, "user": url.username, "password": url.password},
                password=None,
                username=None,
            )
        return url
    else:
        assert_never(backend)


def create_engine(
    connection_str: str,
    migrate: bool = not Settings.disable_migrations,
    log_to_stdout: bool = False,
) -> AsyncEngine:
    """
    Factory to create a SQLAlchemy engine from a URL string.
    """
    url = make_url(connection_str)
    if not url.database:
        raise ValueError("Failed to parse database from connection string")
    backend = SupportedSQLDialect(url.get_backend_name())
    url = get_async_db_url(url.render_as_string(hide_password=False))
    # If Phoenix is run as an application, we want to pass log_migrations_to_stdout=False
    # and let the configured sqlalchemy logger handle the migration logs
    log_migrations_to_stdout = (
        Settings.log_migrations and Settings.logging_mode != LoggingMode.STRUCTURED
    )
    if backend is SupportedSQLDialect.SQLITE:
        return aio_sqlite_engine(
            url=url,
            migrate=migrate,
            log_to_stdout=log_to_stdout,
            log_migrations_to_stdout=log_migrations_to_stdout,
        )
    elif backend is SupportedSQLDialect.POSTGRESQL:
        return aio_postgresql_engine(
            url=url,
            migrate=migrate,
            log_to_stdout=log_to_stdout,
            log_migrations_to_stdout=log_migrations_to_stdout,
        )
    else:
        assert_never(backend)


def aio_sqlite_engine(
    url: URL,
    migrate: bool = True,
    shared_cache: bool = True,
    log_to_stdout: bool = False,
    log_migrations_to_stdout: bool = True,
) -> AsyncEngine:
    database = url.database or ":memory:"
    if database.startswith("file:"):
        database = database[5:]
    if database.startswith(":memory:") and shared_cache:
        url = url.set(query={**url.query, "cache": "shared"}, database=":memory:")
    database = url.render_as_string().partition("///")[-1]

    def async_creator() -> aiosqlite.Connection:
        conn = aiosqlite.Connection(
            lambda: sqlean.connect(f"file:{database}", uri=True),
            iter_chunk_size=64,
        )
        conn.daemon = True
        return conn

    engine = create_async_engine(
        url=url,
        echo=log_to_stdout,
        json_serializer=_dumps,
        async_creator=async_creator,
        poolclass=StaticPool,
    )
    event.listen(engine.sync_engine, "connect", set_sqlite_pragma)
    if not migrate:
        return engine
    if database.startswith(":memory:"):
        try:
            asyncio.get_running_loop()
        except RuntimeError:
            asyncio.run(init_models(engine))
        else:
            asyncio.create_task(init_models(engine))
    else:
        sync_engine = sqlalchemy.create_engine(
            url=url.set(drivername="sqlite"),
            echo=log_migrations_to_stdout,
            json_serializer=_dumps,
            creator=lambda: sqlean.connect(f"file:{database}", uri=True),
        )
        migrate_in_thread(sync_engine)
    return engine


def set_postgresql_search_path(schema: str) -> Callable[[Connection, Any], None]:
    def _(connection: Connection, _: Any) -> None:
        cursor = connection.cursor()
        cursor.execute(f"CREATE SCHEMA IF NOT EXISTS {schema};")
        cursor.execute(f"SET search_path TO {schema};")

    return _


def aio_postgresql_engine(
    url: URL,
    migrate: bool = True,
    log_to_stdout: bool = False,
    log_migrations_to_stdout: bool = True,
) -> AsyncEngine:
    asyncpg_url, asyncpg_args = get_pg_config(url, "asyncpg")
    engine = create_async_engine(
        url=asyncpg_url,
        connect_args=asyncpg_args,
        echo=log_to_stdout,
        json_serializer=_dumps,
    )
    if not migrate:
        return engine

    psycopg_url, psycopg_args = get_pg_config(url, "psycopg")
    sync_engine = sqlalchemy.create_engine(
        url=psycopg_url,
        connect_args=psycopg_args,
        echo=log_migrations_to_stdout,
        json_serializer=_dumps,
    )
    if schema := get_env_database_schema():
        event.listen(sync_engine, "connect", set_postgresql_search_path(schema))
    migrate_in_thread(sync_engine)
    return engine


def _dumps(obj: Any) -> str:
    return json.dumps(obj, cls=_Encoder)


class _Encoder(json.JSONEncoder):
    def default(self, obj: Any) -> Any:
        if isinstance(obj, datetime):
            return obj.isoformat()
        elif isinstance(obj, Enum):
            return obj.value
        elif isinstance(obj, np.ndarray):
            return list(obj)
        elif isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        return super().default(obj)

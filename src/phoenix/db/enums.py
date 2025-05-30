from collections.abc import Mapping
from enum import Enum

from sqlalchemy.orm import InstrumentedAttribute

from phoenix.db import models

__all__ = ["UserRole", "COLUMN_ENUMS"]


class UserRole(Enum):
    SYSTEM = "SYSTEM"
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"


COLUMN_ENUMS: Mapping[InstrumentedAttribute[str], type[Enum]] = {
    models.UserRole.name: UserRole,
}

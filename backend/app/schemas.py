from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models import MovementType


class CategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class ProductBase(BaseModel):
    sku: str = Field(min_length=1, max_length=50)
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    category_id: int | None = None
    quantity: int = Field(ge=0, default=0)
    unit_price: Decimal = Field(ge=0, default=Decimal("0"))
    reorder_level: int = Field(ge=0, default=10)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    sku: str | None = Field(default=None, min_length=1, max_length=50)
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    category_id: int | None = None
    unit_price: Decimal | None = Field(default=None, ge=0)
    reorder_level: int | None = Field(default=None, ge=0)


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    category: CategoryRead | None = None
    is_low_stock: bool = False


class StockMovementCreate(BaseModel):
    movement_type: MovementType
    quantity: int = Field(gt=0)
    note: str | None = None


class StockMovementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    movement_type: MovementType
    quantity: int
    note: str | None
    created_at: datetime


class DashboardReport(BaseModel):
    total_products: int
    total_units: int
    inventory_value: Decimal
    low_stock_count: int
    category_breakdown: list[dict]
    recent_movements: list[dict]

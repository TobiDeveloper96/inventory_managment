from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Category, Product, StockMovement
from app.schemas import DashboardReport

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/dashboard", response_model=DashboardReport)
def dashboard(db: Session = Depends(get_db)):
    products = db.query(Product).options(joinedload(Product.category)).all()
    total_units = sum(p.quantity for p in products)
    inventory_value = sum(Decimal(str(p.unit_price)) * p.quantity for p in products)
    low_stock = [p for p in products if p.quantity <= p.reorder_level]

    category_rows = (
        db.query(
            Category.name,
            func.count(Product.id).label("product_count"),
            func.coalesce(func.sum(Product.quantity), 0).label("total_units"),
        )
        .outerjoin(Product, Product.category_id == Category.id)
        .group_by(Category.id, Category.name)
        .all()
    )

    recent = (
        db.query(StockMovement)
        .order_by(StockMovement.created_at.desc())
        .limit(10)
        .all()
    )
    product_map = {p.id: p for p in products}
    recent_movements = [
        {
            "id": m.id,
            "product_name": product_map[m.product_id].name if m.product_id in product_map else "Unknown",
            "movement_type": m.movement_type.value,
            "quantity": m.quantity,
            "created_at": m.created_at.isoformat(),
        }
        for m in recent
    ]

    return DashboardReport(
        total_products=len(products),
        total_units=total_units,
        inventory_value=inventory_value,
        low_stock_count=len(low_stock),
        category_breakdown=[
            {
                "category": name or "Uncategorized",
                "product_count": product_count,
                "total_units": int(total_units or 0),
            }
            for name, product_count, total_units in category_rows
        ],
        recent_movements=recent_movements,
    )

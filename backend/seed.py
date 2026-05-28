"""Seed sample data. Run after DB is up: python seed.py"""
from decimal import Decimal

from app.database import SessionLocal, engine
from app.models import Base, Category, MovementType, Product, StockMovement

Base.metadata.create_all(bind=engine)

db = SessionLocal()

if db.query(Product).count() > 0:
    print("Database already seeded.")
    db.close()
    exit(0)

electronics = Category(name="Electronics", description="Devices and accessories")
office = Category(name="Office Supplies", description="Desk and office items")
db.add_all([electronics, office])
db.flush()

items = [
    Product(
        sku="LAP-001",
        name="Business Laptop",
        category_id=electronics.id,
        quantity=25,
        unit_price=Decimal("899.99"),
        reorder_level=5,
    ),
    Product(
        sku="MON-002",
        name="27\" Monitor",
        category_id=electronics.id,
        quantity=40,
        unit_price=Decimal("249.50"),
        reorder_level=10,
    ),
    Product(
        sku="PEN-100",
        name="Ballpoint Pens (Box)",
        category_id=office.id,
        quantity=8,
        unit_price=Decimal("12.99"),
        reorder_level=15,
    ),
    Product(
        sku="NB-050",
        name="A5 Notebook",
        category_id=office.id,
        quantity=120,
        unit_price=Decimal("4.25"),
        reorder_level=20,
    ),
]
db.add_all(items)
db.flush()

db.add_all(
    [
        StockMovement(product_id=items[0].id, movement_type=MovementType.IN, quantity=25, note="Initial stock"),
        StockMovement(product_id=items[2].id, movement_type=MovementType.OUT, quantity=12, note="Office restock"),
    ]
)
db.commit()
db.close()
print("Seed complete.")

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import MovementType, Product, StockMovement
from app.schemas import ProductCreate, ProductRead, ProductUpdate, StockMovementCreate, StockMovementRead

router = APIRouter(prefix="/products", tags=["products"])


def _to_product_read(product: Product) -> ProductRead:
    data = ProductRead.model_validate(product)
    data.is_low_stock = product.quantity <= product.reorder_level
    return data


@router.get("", response_model=list[ProductRead])
def list_products(
    db: Session = Depends(get_db),
    search: str | None = Query(None),
    category_id: int | None = Query(None),
    low_stock_only: bool = Query(False),
):
    query = db.query(Product).options(joinedload(Product.category))
    if search:
        term = f"%{search}%"
        query = query.filter((Product.name.ilike(term)) | (Product.sku.ilike(term)))
    if category_id is not None:
        query = query.filter(Product.category_id == category_id)
    products = query.order_by(Product.name).all()
    if low_stock_only:
        products = [p for p in products if p.quantity <= p.reorder_level]
    return [_to_product_read(p) for p in products]


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        .options(joinedload(Product.category))
        .filter(Product.id == product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return _to_product_read(product)


@router.post("", response_model=ProductRead, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    if db.query(Product).filter(Product.sku == payload.sku).first():
        raise HTTPException(status_code=400, detail="SKU already exists")
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return _to_product_read(product)


@router.patch("/{product_id}", response_model=ProductRead)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    updates = payload.model_dump(exclude_unset=True)
    if "sku" in updates:
        conflict = (
            db.query(Product)
            .filter(Product.sku == updates["sku"], Product.id != product_id)
            .first()
        )
        if conflict:
            raise HTTPException(status_code=400, detail="SKU already exists")
    for key, value in updates.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return _to_product_read(product)


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()


@router.post("/{product_id}/movements", response_model=StockMovementRead, status_code=201)
def record_movement(
    product_id: int, payload: StockMovementCreate, db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    delta = payload.quantity
    if payload.movement_type == MovementType.OUT:
        if product.quantity < delta:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        product.quantity -= delta
    elif payload.movement_type == MovementType.IN:
        product.quantity += delta
    else:
        product.quantity = delta

    movement = StockMovement(
        product_id=product_id,
        movement_type=payload.movement_type,
        quantity=payload.quantity,
        note=payload.note,
    )
    db.add(movement)
    db.commit()
    db.refresh(movement)
    return movement


@router.get("/{product_id}/movements", response_model=list[StockMovementRead])
def list_movements(product_id: int, db: Session = Depends(get_db)):
    if not db.query(Product).filter(Product.id == product_id).first():
        raise HTTPException(status_code=404, detail="Product not found")
    return (
        db.query(StockMovement)
        .filter(StockMovement.product_id == product_id)
        .order_by(StockMovement.created_at.desc())
        .limit(50)
        .all()
    )

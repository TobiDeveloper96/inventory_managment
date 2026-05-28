import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "../api";
import type { Category, Product, StockMovement } from "../types";

const emptyForm = {
  sku: "",
  name: "",
  description: "",
  category_id: "",
  quantity: "0",
  unit_price: "0",
  reorder_level: "10",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | "movement" | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [movement, setMovement] = useState({ movement_type: "in", quantity: "1", note: "" });
  const [history, setHistory] = useState<StockMovement[]>([]);

  const load = useCallback(() => {
    api
      .listProducts({
        search: search || undefined,
        category_id: categoryFilter ? Number(categoryFilter) : undefined,
        low_stock_only: lowStockOnly,
      })
      .then(setProducts)
      .catch((e) => setError(e.message));
  }, [search, categoryFilter, lowStockOnly]);

  useEffect(() => {
    api.listCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  function openCreate() {
    setForm(emptyForm);
    setSelected(null);
    setModal("create");
  }

  function openEdit(p: Product) {
    setSelected(p);
    setForm({
      sku: p.sku,
      name: p.name,
      description: p.description || "",
      category_id: p.category_id ? String(p.category_id) : "",
      quantity: String(p.quantity),
      unit_price: p.unit_price,
      reorder_level: String(p.reorder_level),
    });
    setModal("edit");
  }

  async function openMovement(p: Product) {
    setSelected(p);
    setMovement({ movement_type: "in", quantity: "1", note: "" });
    setModal("movement");
    try {
      const moves = await api.listMovements(p.id);
      setHistory(moves);
    } catch {
      setHistory([]);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const body = {
      sku: form.sku,
      name: form.name,
      description: form.description || null,
      category_id: form.category_id ? Number(form.category_id) : null,
      quantity: Number(form.quantity),
      unit_price: form.unit_price,
      reorder_level: Number(form.reorder_level),
    };
    try {
      if (modal === "create") {
        await api.createProduct(body);
      } else if (selected) {
        const { quantity: _, ...updates } = body;
        await api.updateProduct(selected.id, updates);
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onMovementSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError("");
    try {
      await api.recordMovement(selected.id, {
        movement_type: movement.movement_type,
        quantity: Number(movement.quantity),
        note: movement.note || undefined,
      });
      setModal(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Movement failed");
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Delete this product?")) return;
    try {
      await api.deleteProduct(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <>
      <header className="page-header">
        <h2>Products</h2>
        <p>Manage SKUs, stock levels, and movements</p>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="toolbar">
        <input
          placeholder="Search name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
          />
          Low stock only
        </label>
        <button type="button" onClick={openCreate}>
          Add product
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Unit price</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={7} className="empty">
                No products found
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.id}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.category?.name || "—"}</td>
                <td>{p.quantity}</td>
                <td>${Number(p.unit_price).toFixed(2)}</td>
                <td>
                  {p.is_low_stock ? (
                    <button type="button" className="low-stock-button">
                      Low stock
                    </button>
                  ) : (
                    <span className="badge">OK</span>
                  )}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button type="button" className="secondary" onClick={() => openMovement(p)}>
                    Stock
                  </button>{" "}
                  <button type="button" className="secondary" onClick={() => openEdit(p)}>
                    Edit
                  </button>{" "}
                  <button type="button" className="danger secondary" onClick={() => onDelete(p.id)}>
                    Del
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {modal === "movement" && selected ? (
              <>
                <h3>Stock: {selected.name}</h3>
                <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
                  Current quantity: <strong>{selected.quantity}</strong>
                </p>
                <form className="form-grid" onSubmit={onMovementSubmit}>
                  <div>
                    <label>Type</label>
                    <select
                      value={movement.movement_type}
                      onChange={(e) => setMovement({ ...movement, movement_type: e.target.value })}
                    >
                      <option value="in">Stock in</option>
                      <option value="out">Stock out</option>
                      <option value="adjustment">Set quantity</option>
                    </select>
                  </div>
                  <div>
                    <label>Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={movement.quantity}
                      onChange={(e) => setMovement({ ...movement, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label>Note</label>
                    <input
                      value={movement.note}
                      onChange={(e) => setMovement({ ...movement, note: e.target.value })}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="secondary" onClick={() => setModal(null)}>
                      Cancel
                    </button>
                    <button type="submit">Record</button>
                  </div>
                </form>
                {history.length > 0 && (
                  <div style={{ marginTop: "1.5rem" }}>
                    <h4 style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>Recent history</h4>
                    <ul style={{ listStyle: "none", fontSize: "0.85rem", color: "var(--muted)" }}>
                      {history.slice(0, 5).map((h) => (
                        <li key={h.id}>
                          {h.movement_type} ×{h.quantity} — {new Date(h.created_at).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <>
                <h3>{modal === "create" ? "New product" : "Edit product"}</h3>
                <form className="form-grid" onSubmit={onSubmit}>
                  <div>
                    <label>SKU</label>
                    <input
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label>Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label>Category</label>
                    <select
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    >
                      <option value="">None</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {modal === "create" && (
                    <div>
                      <label>Initial quantity</label>
                      <input
                        type="number"
                        min={0}
                        value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      />
                    </div>
                  )}
                  <div>
                    <label>Unit price</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.unit_price}
                      onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Reorder level</label>
                    <input
                      type="number"
                      min={0}
                      value={form.reorder_level}
                      onChange={(e) => setForm({ ...form, reorder_level: e.target.value })}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="secondary" onClick={() => setModal(null)}>
                      Cancel
                    </button>
                    <button type="submit">Save</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

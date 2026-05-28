import { useEffect, useState } from "react";
import { api } from "../api";
import type { DashboardReport } from "../types";

export default function DashboardPage() {
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDashboard()
      .then(setReport)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!report)
    return (
      <div className="loading-screen">
        <div className="loading-power">
          <div className="loading-ring" />
          <div className="loading-shine" />
          <div className="loading-text">Loading dashboard…</div>
        </div>
      </div>
    );

  const value = Number(report.inventory_value).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });

  return (
    <>
      <header className="page-header">
        <h2>Dashboard</h2>
        <p>Inventory overview and recent activity</p>
      </header>

      <div className="cards">
        <div className="card">
          <div className="label">Products</div>
          <div className="value">{report.total_products}</div>
        </div>
        <div className="card">
          <div className="label">Total units</div>
          <div className="value">{report.total_units}</div>
        </div>
        <div className="card">
          <div className="label">Inventory value</div>
          <div className="value">{value}</div>
        </div>
        <div className={`card${report.low_stock_count ? " warning" : ""}`}>
          <div className="label">Low stock items</div>
          <div className="value">{report.low_stock_count}</div>
        </div>
      </div>

      <div className="two-col">
        <section>
          <h3 style={{ marginBottom: "0.75rem" }}>By category</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Products</th>
                <th>Units</th>
              </tr>
            </thead>
            <tbody>
              {report.category_breakdown.map((row) => (
                <tr key={row.category}>
                  <td>{row.category}</td>
                  <td>{row.product_count}</td>
                  <td>{row.total_units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3 style={{ marginBottom: "0.75rem" }}>Recent movements</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Qty</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {report.recent_movements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty">
                    No movements yet
                  </td>
                </tr>
              ) : (
                report.recent_movements.map((m) => (
                  <tr key={m.id}>
                    <td>{m.product_name}</td>
                    <td>
                      <span className="badge">{m.movement_type}</span>
                    </td>
                    <td>{m.quantity}</td>
                    <td>{new Date(m.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}

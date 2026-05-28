import { FormEvent, useEffect, useState } from "react";
import { api } from "../api";
import type { Category } from "../types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const load = () =>
    api
      .listCategories()
      .then(setCategories)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.createCategory({ name, description: description || undefined });
      setName("");
      setDescription("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Delete this category?")) return;
    setError("");
    try {
      await api.deleteCategory(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <>
      <header className="page-header">
        <h2>Categories</h2>
        <p>Organize products into groups</p>
      </header>

      {error && <p className="error">{error}</p>}

      <form className="toolbar" onSubmit={onSubmit} style={{ marginBottom: "1.5rem" }}>
        <input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add category</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan={3} className="empty">
                No categories yet
              </td>
            </tr>
          ) : (
            categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.description || "—"}</td>
                <td>
                  <button type="button" className="danger secondary" onClick={() => onDelete(c.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}

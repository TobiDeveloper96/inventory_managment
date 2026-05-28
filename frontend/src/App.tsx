import { NavLink, Route, Routes } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import CategoriesPage from "./pages/CategoriesPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import SettingsPage from "./pages/SettingsPage";

const logos = [
  "INVENTORY LAB",
  "STOCKFLOW",
  "QUANTUM WARE",
  "VOLUMAX",
  "TRACKTRON",
  "STORIFY",
];

const slogans = [
  "Powering your supply chain with speed",
  "Smart inventory. Zero guesswork.",
  "Real-time stock control in one place",
  "Inventory insights built for action",
  "Where stock stays sharp and ready",
];

export default function App() {
  const [isSplashVisible, setSplashVisible] = useState(true);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const logo = useMemo(() => logos[Math.floor(Math.random() * logos.length)], []);
  const slogan = useMemo(() => slogans[Math.floor(Math.random() * slogans.length)], []);

  useEffect(() => {
    const storedUser = window.localStorage.getItem("inventory-user");
    const storedDisplay = window.localStorage.getItem("inventory-display-name");
    if (storedUser) {
      setAuthenticated(true);
      setUserName(storedUser);
      setDisplayName(storedDisplay || storedUser);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setSplashVisible(false), 1400);
    return () => window.clearTimeout(timer);
  }, []);

  function handleLogin(username: string) {
    window.localStorage.setItem("inventory-user", username);
    window.localStorage.setItem("inventory-display-name", username);
    setUserName(username);
    setDisplayName(username);
    setAuthenticated(true);
  }

  function handleLogout() {
    setAuthenticated(false);
    setUserName("");
    setDisplayName("");
    window.localStorage.removeItem("inventory-user");
  }

  function handleReset() {
    window.localStorage.clear();
    window.location.reload();
  }

  function handleUpdateDisplayName(name: string) {
    setDisplayName(name);
    window.localStorage.setItem("inventory-display-name", name);
  }

  if (isSplashVisible) {
    return (
      <div className="app-splash">
        <div className="app-splash-content">
          <div className="app-logo">{logo}</div>
          <div className="app-splash-note">{slogan}</div>
          <div className="app-splash-ring" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} onReset={handleReset} />;
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Inventory</h1>
        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/categories">Categories</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
        <div className="sidebar-footer">
          <button type="button" className="secondary" onClick={handleLogout}>
            Power off
          </button>
          <button type="button" className="danger" onClick={handleReset}>
            Reset system
          </button>
        </div>
      </aside>
      <main className="main">
        <div className="user-banner">Signed in as {displayName || userName}</div>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route
            path="/settings"
            element={<SettingsPage displayName={displayName || userName} onUpdateDisplayName={handleUpdateDisplayName} />}
          />
        </Routes>
      </main>
    </div>
  );
}

import { FormEvent, useEffect, useState } from "react";

interface SettingsPageProps {
  displayName: string;
  onUpdateDisplayName: (name: string) => void;
}

export default function SettingsPage({ displayName, onUpdateDisplayName }: SettingsPageProps) {
  const [name, setName] = useState(displayName);
  const [autoSave, setAutoSave] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem("inventory-settings");
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        setAutoSave(Boolean(settings.autoSave));
        setNotifications(Boolean(settings.notifications));
        setCompactMode(Boolean(settings.compactMode));
      } catch {
        // ignore invalid settings
      }
    }
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    const newSettings = {
      autoSave,
      notifications,
      compactMode,
    };
    window.localStorage.setItem("inventory-settings", JSON.stringify(newSettings));
    onUpdateDisplayName(name.trim() || "admin");
    setMessage("Settings saved successfully.");
  }

  return (
    <div className="settings-page">
      <header className="page-header">
        <h2>Settings</h2>
        <p>Manage system behavior and user preferences.</p>
      </header>

      <div className="settings-grid">
        <section className="settings-card">
          <h3>System settings</h3>
          <p className="muted">Toggle the system preferences that control app behavior.</p>
          <ul className="settings-list">
            <li>
              <strong>Auto-save</strong>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                />
                <span className="slider" />
              </label>
            </li>
            <li>
              <strong>Notifications</strong>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <span className="slider" />
              </label>
            </li>
            <li>
              <strong>Compact mode</strong>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                />
                <span className="slider" />
              </label>
            </li>
          </ul>
        </section>

        <section className="settings-card">
          <h3>User settings</h3>
          <p className="muted">Change your display name and personalize the system.</p>
          <form className="settings-form" onSubmit={handleSubmit}>
            <label>
              Display name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin user"
              />
            </label>
            <label>
              Username
              <input value="admin" disabled />
            </label>
            <button type="submit">Save settings</button>
            {message && <p className="success">{message}</p>}
          </form>
        </section>
      </div>
    </div>
  );
}

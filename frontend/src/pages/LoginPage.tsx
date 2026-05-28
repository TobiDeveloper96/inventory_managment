import { FormEvent, useState } from "react";

interface LoginPageProps {
  onLogin: (username: string) => void;
  onReset: () => void;
}

export default function LoginPage({ onLogin, onReset }: LoginPageProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    if (username.trim() === "admin" && password === "admin") {
      onLogin(username.trim());
      return;
    }

    setError("Invalid credentials. Use admin / admin to sign in.");
  }

  return (
    <div className="login-screen">
      <div className="login-box">
        <h1>Inventory login</h1>
        <p className="login-subtitle">Enter your username and password to continue.</p>
        {error && <p className="error">{error}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          <div className="login-actions">
            <button type="submit">Sign in</button>
            <button type="button" className="secondary" onClick={onReset}>
              Reset app
            </button>
          </div>
        </form>
        <p className="login-hint">Default login: <strong>admin</strong> / <strong>admin</strong></p>
      </div>
    </div>
  );
}

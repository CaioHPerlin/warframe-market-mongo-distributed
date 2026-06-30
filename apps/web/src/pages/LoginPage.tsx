import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      nav("/");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-warframe-surface border border-warframe-border rounded px-3 py-2 text-warframe-text placeholder-warframe-muted"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-warframe-surface border border-warframe-border rounded px-3 py-2 text-warframe-text placeholder-warframe-muted"
        />
        {error && <p className="text-warframe-red text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-warframe-accent text-white rounded px-4 py-2 hover:opacity-90 cursor-pointer"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-sm text-warframe-muted">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

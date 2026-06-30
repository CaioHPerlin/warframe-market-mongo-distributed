import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./lib/auth";
import ItemsPage from "./pages/ItemsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PlayerPage from "./pages/PlayerPage";
import CreateOrderPage from "./pages/CreateOrderPage";

export default function App() {
  const { player, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-warframe-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-warframe-border bg-warframe-surface px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-warframe-gold no-underline hover:underline">
          Warframe Market
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {player ? (
            <>
              <Link to={`/players/${player.id}`} className="text-warframe-text no-underline hover:text-warframe-accent">
                {player.username}
              </Link>
              <button onClick={logout} className="text-warframe-muted hover:text-warframe-red cursor-pointer bg-transparent border-0">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-warframe-text no-underline hover:text-warframe-accent">Login</Link>
              <Link to="/register" className="text-warframe-text no-underline hover:text-warframe-accent">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1 px-6 py-6 max-w-6xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<ItemsPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/orders/new" element={<CreateOrderPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/players/:id" element={<PlayerPage />} />
        </Routes>
      </main>
    </div>
  );
}

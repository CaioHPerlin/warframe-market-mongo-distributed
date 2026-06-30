import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { NavBar } from "./components/NavBar";
import { Button } from "./components/ui/button";
import { Skeleton } from "./components/ui/skeleton";
import ItemsPage from "./pages/ItemsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PlayerPage from "./pages/PlayerPage";
import CreateOrderPage from "./pages/CreateOrderPage";

function LoadingScreen() {
  return (
    <div className="flex flex-col gap-4 p-8 max-w-6xl mx-auto w-full">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Button render={<Link to="/" />}>Go home</Button>
    </div>
  );
}

export default function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 px-4 py-6 max-w-6xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<ItemsPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/orders/new" element={<CreateOrderPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/players/:id" element={<PlayerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

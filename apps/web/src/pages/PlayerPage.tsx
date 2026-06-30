import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";

type PlayerProfile = {
  id: string;
  username: string;
  platform: string;
  createdAt: string;
  reputation: Record<string, number>;
};

export default function PlayerPage() {
  const { id } = useParams();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get<PlayerProfile>(`/api/players/${id}`)
      .then(setPlayer)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-warframe-muted">Loading...</p>;
  if (!player) return <p className="text-warframe-red">Player not found</p>;

  const positive = player.reputation.positive || 0;
  const neutral = player.reputation.neutral || 0;
  const total = positive + neutral;

  return (
    <div className="max-w-lg mx-auto mt-8">
      <div className="border border-warframe-border bg-warframe-surface rounded p-6">
        <h1 className="text-2xl font-bold">{player.username}</h1>
        <p className="text-sm text-warframe-muted mt-1">{player.platform.toUpperCase()}</p>
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Reputation</h2>
          <div className="flex gap-4 text-sm">
            <span className="text-warframe-green">{positive} positive</span>
            <span className="text-warframe-muted">{neutral} neutral</span>
            <span className="text-warframe-muted">{total} total</span>
          </div>
        </div>
      </div>
    </div>
  );
}

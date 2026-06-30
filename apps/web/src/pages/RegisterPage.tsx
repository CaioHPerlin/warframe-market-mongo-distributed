import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { UserPlusIcon } from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = ["pc", "ps4", "xbox", "switch"] as const;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [platform, setPlatform] = useState("pc");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(username, password, platform);
      toast.success("Account created");
      navigate("/");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center pt-16">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>Create your Tenno account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(v) => v && setPlatform(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? "Creating..." : <><UserPlusIcon className="size-4" /> Register</>}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-primary no-underline hover:underline font-medium">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

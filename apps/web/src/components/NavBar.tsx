import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "./ui/sheet";
import { MenuIcon, LogOutIcon, UserIcon, LogInIcon, UserPlusIcon, PackageIcon } from "lucide-react";
import { useState } from "react";

export function NavBar() {
  const { player, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6 h-14 flex items-center justify-between">
      <Link to="/" className="font-heading text-lg font-bold text-gold no-underline hover:text-gold/80 transition-colors">
        Warframe Market
      </Link>

      <nav className="hidden md:flex items-center gap-1">
        {player ? (
          <>
            <Button variant="ghost" size="sm" render={<Link to={`/players/${player.id}`} />} className="gap-2">
              <Avatar className="size-6">
                <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                  {player.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {player.username}
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive">
              <LogOutIcon className="size-3.5" />
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" render={<Link to="/login" />}>
              <LogInIcon className="size-3.5" />
              Login
            </Button>
            <Button variant="default" size="sm" render={<Link to="/register" />}>
              <UserPlusIcon className="size-3.5" />
              Register
            </Button>
          </>
        )}
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
          <MenuIcon className="size-5" />
        </SheetTrigger>
        <SheetContent side="right" className="w-64">
          <SheetHeader>
            <SheetTitle className="text-gold">Warframe Market</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 mt-6">
            <Button variant="ghost" className="justify-start gap-3" render={<Link to="/" onClick={() => setOpen(false)} />}>
              <PackageIcon className="size-4" />
              Items
            </Button>
            {player ? (
              <>
                <Button variant="ghost" className="justify-start gap-3" render={<Link to={`/players/${player.id}`} onClick={() => setOpen(false)} />}>
                  <UserIcon className="size-4" />
                  Profile
                </Button>
                <Button variant="ghost" className="justify-start gap-3 text-muted-foreground hover:text-destructive" onClick={() => { logout(); setOpen(false); }}>
                  <LogOutIcon className="size-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="justify-start gap-3" render={<Link to="/login" onClick={() => setOpen(false)} />}>
                  <LogInIcon className="size-4" />
                  Login
                </Button>
                <Button variant="default" className="justify-start gap-3" render={<Link to="/register" onClick={() => setOpen(false)} />}>
                  <UserPlusIcon className="size-4" />
                  Register
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

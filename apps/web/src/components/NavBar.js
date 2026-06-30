import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { MenuIcon, LogOutIcon, UserIcon } from "lucide-react";
import { useState } from "react";
export function NavBar() {
    const { player, logout } = useAuth();
    const [open, setOpen] = useState(false);
    return (<header className="sticky top-0 z-40 border-b bg-background px-4 py-2 flex items-center justify-between">
      <Link to="/" className="font-heading text-lg font-bold text-gold no-underline hover:underline">
        Warframe Market
      </Link>

      <nav className="hidden md:flex items-center gap-4 text-sm">
        {player ? (<>
            <Button variant="ghost" size="sm" render={<Link to={`/players/${player.id}`}/>}>
              <UserIcon className="size-3.5"/>
              {player.username}
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOutIcon className="size-3.5"/>
              Logout
            </Button>
          </>) : (<>
            <Button variant="ghost" size="sm" render={<Link to="/login"/>}>
              Login
            </Button>
            <Button variant="default" size="sm" render={<Link to="/register"/>}>
              Register
            </Button>
          </>)}
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden"/>}>
          <MenuIcon className="size-5"/>
        </SheetTrigger>
        <SheetContent side="right">
          <div className="flex flex-col gap-2 mt-6">
            <Button variant="ghost" render={<Link to="/" onClick={() => setOpen(false)}/>}>
              Items
            </Button>
            {player ? (<>
                <Button variant="ghost" render={<Link to={`/players/${player.id}`} onClick={() => setOpen(false)}/>}>
                  Profile
                </Button>
                <Button variant="ghost" onClick={() => { logout(); setOpen(false); }}>
                  Logout
                </Button>
              </>) : (<>
                <Button variant="ghost" render={<Link to="/login" onClick={() => setOpen(false)}/>}>
                  Login
                </Button>
                <Button variant="default" render={<Link to="/register" onClick={() => setOpen(false)}/>}>
                  Register
                </Button>
              </>)}
          </div>
        </SheetContent>
      </Sheet>
    </header>);
}
//# sourceMappingURL=NavBar.js.map
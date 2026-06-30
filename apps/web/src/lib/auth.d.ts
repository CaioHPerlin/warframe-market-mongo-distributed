import { type ReactNode } from "react";
type Player = {
    id: string;
    username: string;
    platform: string;
    createdAt?: string;
};
type AuthContext = {
    player: Player | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, platform: string) => Promise<void>;
    logout: () => Promise<void>;
};
export declare function AuthProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export declare function useAuth(): AuthContext;
export {};
//# sourceMappingURL=auth.d.ts.map
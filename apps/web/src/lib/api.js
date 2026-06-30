const BASE = "";
async function request(path, init) {
    const res = await fetch(`${BASE}${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", ...init?.headers },
        ...init,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || "Request failed");
    }
    return res.json();
}
export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
    put: (path, body) => request(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
    delete: (path) => request(path, { method: "DELETE" }),
};
//# sourceMappingURL=api.js.map
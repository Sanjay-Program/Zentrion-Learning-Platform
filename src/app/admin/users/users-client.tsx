"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/webclient";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
} from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

interface AdminUser {
  id: number;
  email: string;
  displayName: string;
  isSuperuser: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  roles: { key: string }[];
}

interface RoleOption {
  key: string;
}

/** Searchable user table with inline role editing. */
export function UsersClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [allRoles, setAllRoles] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [roleSelection, setRoleSelection] = useState<string[]>([]);

  const load = async (query = search) => {
    setBusy(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("search", query.trim());
      const res = await apiFetch<{ users: AdminUser[] }>(
        `/api/v1/admin/users?${params.toString()}`,
      );
      setUsers(res.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load("");
    // Fetch the full role list from the roles API (falls back to known roles).
    apiFetch<{ roles: RoleOption[] }>("/api/v1/roles")
      .then((res) => setAllRoles(res.roles.map((r) => r.key)))
      .catch(() =>
        setAllRoles([
          "learner",
          "instructor",
          "reviewer",
          "support_agent",
          "finance_operator",
          "content_moderator",
          "security_admin",
          "admin",
        ]),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchSubmit = (e: FormEvent) => {
    e.preventDefault();
    void load();
  };

  const startEdit = (user: AdminUser) => {
    setEditing(user.id);
    setRoleSelection(user.roles.map((r) => r.key));
  };

  const toggleRole = (key: string) => {
    setRoleSelection((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const saveRoles = async (userId: number) => {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/v1/admin/users/${userId}/roles`, {
        method: "PUT",
        body: JSON.stringify({ roles: roleSelection }),
      });
      await load();
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update roles");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <form onSubmit={searchSubmit} className="flex gap-2" style={{ marginBottom: "var(--space-6)" }}>
        <Field label="Search" htmlFor="admin-user-search">
          <Input
            id="admin-user-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or email…"
          />
        </Field>
        <Button type="submit" disabled={busy}>Search</Button>
      </form>

      {error && (
        <p role="alert" style={{ color: "var(--danger)", marginBottom: "var(--space-4)" }}>
          {error}
        </p>
      )}

      {users.length === 0 && !busy ? (
        <Card>
          <EmptyState title="No users found" description="Try a different search." />
        </Card>
      ) : (
        <Card raised style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Roles</th>
                <th>Last login</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <p className="font-semibold" style={{ margin: 0 }}>{u.displayName}</p>
                    <p className="text-muted text-sm" style={{ margin: 0 }}>{u.email}</p>
                    {u.isSuperuser && <Badge tone="danger">superuser</Badge>}
                  </td>
                  <td>
                    {editing === u.id ? (
                      <div className="flex gap-2 flex-wrap">
                        {allRoles.map((key) => (
                          <label
                            key={key}
                            className="badge"
                            style={{
                              cursor: "pointer",
                              border: "1px solid var(--border)",
                              padding: "var(--space-1) var(--space-3)",
                              fontWeight: roleSelection.includes(key) ? 700 : 400,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={roleSelection.includes(key)}
                              onChange={() => toggleRole(key)}
                              style={{ marginRight: "var(--space-2)" }}
                            />
                            {key}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        {u.roles.length === 0 ? (
                          <span className="text-muted text-sm">no roles</span>
                        ) : (
                          u.roles.map((r) => <Badge key={r.key}>{r.key}</Badge>)
                        )}
                      </div>
                    )}
                  </td>
                  <td className="text-sm">
                    {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "—"}
                  </td>
                  <td className="text-sm">{formatDateTime(u.createdAt)}</td>
                  <td>
                    {editing === u.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => void saveRoles(u.id)} disabled={busy}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => startEdit(u)}>
                        Edit roles
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

"use client";

import {
  getIdTokenResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { firebaseAuth } from "../lib/firebase";
import { isAdminRole, type AdminRole } from "../lib/authz";

type AuthContextValue = {
  user: User | null;
  role: AdminRole | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, async (nextUser) => {
      setLoading(true);
      setError(null);

      if (!nextUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const token = await getIdTokenResult(nextUser, true);
        const tokenRole = typeof token.claims.role === "string" ? token.claims.role : undefined;

        if (!isAdminRole(tokenRole)) {
          await firebaseSignOut(firebaseAuth);
          setUser(null);
          setRole(null);
          setError("This account is authenticated but is not authorized for the Skill Saga Admin Console.");
          setLoading(false);
          return;
        }

        setUser(nextUser);
        setRole(tokenRole);
      } catch {
        await firebaseSignOut(firebaseAuth);
        setUser(null);
        setRole(null);
        setError("We could not verify your administrator authorization. Please try again.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      loading,
      error,
      clearError: () => setError(null),
      signIn: async (email, password) => {
        setError(null);
        const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const token = await getIdTokenResult(credential.user, true);
        const tokenRole = typeof token.claims.role === "string" ? token.claims.role : undefined;

        if (!isAdminRole(tokenRole)) {
          await firebaseSignOut(firebaseAuth);
          throw new Error(
            "Your account is valid, but it does not have an authorized admin role yet."
          );
        }
      },
      signOut: async () => {
        await firebaseSignOut(firebaseAuth);
      },
    }),
    [user, role, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export function AdminGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading, error } = useAuth();

  if (pathname === "/login") return <>{children}</>;

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) {
    return (
      <main className="auth-loading">
        <section>
          <strong>Skill Saga Admin</strong>
          <p>Verifying administrator access…</p>
        </section>
      </main>
    );
  }

  if (!user || !role) {
    return (
      <main className="auth-loading">
        <section>
          <strong>Administrator access required</strong>
          <p>{error ?? "Redirecting to sign in…"}</p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}

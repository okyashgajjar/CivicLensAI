import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, setAuthToken } from '../api/client';

export type Role = 'user' | 'authority';

export interface RoleInfo {
  readonly id: Role;
  readonly label: string;
  readonly icon: string;
  readonly description: string;
}

export const ROLES: readonly RoleInfo[] = [
  {
    id: 'user',
    label: 'Citizen',
    icon: 'person',
    description: 'Report issues and track fixes in your community.',
  },
  {
    id: 'authority',
    label: 'Authority',
    icon: 'account_balance',
    description: 'Manage the report queue and dispatch response crews.',
  },
];

interface AuthContextValue {
  readonly role: Role | null;
  readonly roleInfo: RoleInfo | null;
  readonly credential: string | null;
  readonly token: string | null;
  readonly login: (nextRole: Role, nextToken: string, nextEmail: string) => void;
  readonly logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ROLE_KEY = 'civiclens.role';
const CREDENTIAL_KEY = 'civiclens.credential';
const TOKEN_KEY = 'civiclens.token';

function readStoredRole(): Role | null {
  const stored = localStorage.getItem(ROLE_KEY);
  return stored === 'user' || stored === 'authority' ? stored : null;
}

function readStoredCredential(): string | null {
  return localStorage.getItem(CREDENTIAL_KEY);
}

function readStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

interface AuthProviderProps {
  readonly children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [role, setRole] = useState<Role | null>(readStoredRole);
  const [credential, setCredential] = useState<string | null>(readStoredCredential);
  const [token, setToken] = useState<string | null>(readStoredToken);

  useEffect(() => {
    const storedToken = readStoredToken();
    if (!storedToken) return;
    setAuthToken(storedToken);
    api
      .me()
      .then(() => {
        // Token is valid; nothing else to restore.
      })
      .catch((error: unknown) => {
        if (error instanceof Error && 'status' in error && (error as { status: number }).status === 401) {
          localStorage.removeItem(ROLE_KEY);
          localStorage.removeItem(CREDENTIAL_KEY);
          localStorage.removeItem(TOKEN_KEY);
          setAuthToken(null);
          setRole(null);
          setCredential(null);
          setToken(null);
        }
      });
  }, []);

  const login = (nextRole: Role, nextToken: string, nextEmail: string) => {
    localStorage.setItem(ROLE_KEY, nextRole);
    localStorage.setItem(CREDENTIAL_KEY, nextEmail);
    localStorage.setItem(TOKEN_KEY, nextToken);
    setAuthToken(nextToken);
    setRole(nextRole);
    setCredential(nextEmail);
    setToken(nextToken);
  };

  const logout = () => {
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(CREDENTIAL_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setRole(null);
    setCredential(null);
    setToken(null);
  };

  const roleInfo = role ? (ROLES.find((info) => info.id === role) ?? null) : null;

  return (
    <AuthContext.Provider value={{ role, roleInfo, credential, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

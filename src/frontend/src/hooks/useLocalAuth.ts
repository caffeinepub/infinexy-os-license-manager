import type { Identity } from "@icp-sdk/core/agent";
import { Ed25519KeyIdentity } from "@icp-sdk/core/identity";
import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ACCOUNTS_KEY = "infinexy_accounts_v1";
const SESSION_KEY = "infinexy_session_v1";

type StoredAccount = {
  username: string;
  passwordHash: string;
  encryptedKey: string;
  iv: string;
  salt: string;
};

type Session = {
  username: string;
  seedHex: string;
};

async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
  const raw = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    raw,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function toHex(buf: ArrayBuffer | Uint8Array): string {
  return Array.from(buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return arr;
}

function toBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array([...atob(b64)].map((c) => c.charCodeAt(0)));
}

function getAccounts(): StoredAccount[] {
  try {
    return JSON.parse(
      localStorage.getItem(ACCOUNTS_KEY) || "[]",
    ) as StoredAccount[];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function saveSession(session: Session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function identityFromSeedHex(seedHex: string): Ed25519KeyIdentity {
  return Ed25519KeyIdentity.generate(fromHex(seedHex));
}

export type LocalAuthStatus =
  | "initializing"
  | "idle"
  | "logging-in"
  | "success"
  | "loginError";

export type LocalAuthContext = {
  identity?: Identity;
  username?: string;
  loginStatus: LocalAuthStatus;
  isInitializing: boolean;
  isLoginIdle: boolean;
  isLoggingIn: boolean;
  isLoginSuccess: boolean;
  isLoginError: boolean;
  loginError?: Error;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  clear: () => void;
};

const LocalAuthReactContext = createContext<LocalAuthContext | undefined>(
  undefined,
);

export function useLocalAuth(): LocalAuthContext {
  const ctx = useContext(LocalAuthReactContext);
  if (!ctx) throw new Error("LocalAuthProvider missing");
  return ctx;
}

export const useInternetIdentity = useLocalAuth;

export function LocalAuthProvider({
  children,
}: PropsWithChildren<{ children: ReactNode }>) {
  const [identity, setIdentity] = useState<Ed25519KeyIdentity | undefined>();
  const [username, setUsername] = useState<string | undefined>();
  const [loginStatus, setLoginStatus] =
    useState<LocalAuthStatus>("initializing");
  const [loginError, setLoginError] = useState<Error | undefined>();

  useEffect(() => {
    const session = loadSession();
    if (session) {
      try {
        const id = identityFromSeedHex(session.seedHex);
        setIdentity(id);
        setUsername(session.username);
        setLoginStatus("success");
      } catch {
        clearSession();
        setLoginStatus("idle");
      }
    } else {
      setLoginStatus("idle");
    }
  }, []);

  const register = useCallback(async (uname: string, password: string) => {
    setLoginStatus("logging-in");
    setLoginError(undefined);
    try {
      const accounts = getAccounts();
      if (
        accounts.find((a) => a.username.toLowerCase() === uname.toLowerCase())
      ) {
        throw new Error("Username already taken");
      }

      // Generate a random 32-byte seed for the Ed25519 keypair
      const seed = crypto.getRandomValues(new Uint8Array(32));
      const seedHex = toHex(seed);
      const keypair = Ed25519KeyIdentity.generate(seed);

      // Encrypt seed with password-derived key
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const aesKey = await deriveKey(password, salt);
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv as Uint8Array<ArrayBuffer> },
        aesKey,
        seed,
      );

      const hash = await hashPassword(password);

      const account: StoredAccount = {
        username: uname,
        passwordHash: hash,
        encryptedKey: toBase64(encrypted),
        iv: toBase64(iv),
        salt: toBase64(salt),
      };

      accounts.push(account);
      saveAccounts(accounts);
      saveSession({ username: uname, seedHex });

      setIdentity(keypair);
      setUsername(uname);
      setLoginStatus("success");
    } catch (e) {
      const err = e instanceof Error ? e : new Error("Registration failed");
      setLoginError(err);
      setLoginStatus("loginError");
    }
  }, []);

  const login = useCallback(async (uname: string, password: string) => {
    setLoginStatus("logging-in");
    setLoginError(undefined);
    try {
      const accounts = getAccounts();
      const account = accounts.find(
        (a) => a.username.toLowerCase() === uname.toLowerCase(),
      );
      if (!account) throw new Error("Username not found");

      const hash = await hashPassword(password);
      if (hash !== account.passwordHash) throw new Error("Incorrect password");

      const salt = fromBase64(account.salt);
      const iv = fromBase64(account.iv);
      const encryptedBytes = fromBase64(account.encryptedKey);
      const aesKey = await deriveKey(password, salt);
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        aesKey,
        encryptedBytes,
      );

      const seedHex = toHex(decrypted);
      const id = identityFromSeedHex(seedHex);

      saveSession({ username: uname, seedHex });
      setIdentity(id);
      setUsername(uname);
      setLoginStatus("success");
    } catch (e) {
      const err = e instanceof Error ? e : new Error("Login failed");
      setLoginError(err);
      setLoginStatus("loginError");
    }
  }, []);

  const clear = useCallback(() => {
    clearSession();
    setIdentity(undefined);
    setUsername(undefined);
    setLoginStatus("idle");
    setLoginError(undefined);
  }, []);

  const value = useMemo<LocalAuthContext>(
    () => ({
      identity,
      username,
      loginStatus,
      isInitializing: loginStatus === "initializing",
      isLoginIdle: loginStatus === "idle",
      isLoggingIn: loginStatus === "logging-in",
      isLoginSuccess: loginStatus === "success",
      isLoginError: loginStatus === "loginError",
      loginError,
      login,
      register,
      clear,
    }),
    [identity, username, loginStatus, loginError, login, register, clear],
  );

  return createElement(LocalAuthReactContext.Provider, { value, children });
}

export const InternetIdentityProvider = LocalAuthProvider;

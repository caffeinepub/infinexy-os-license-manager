import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Loader2, Monitor, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useLocalAuth } from "../hooks/useLocalAuth";

export function AuthPage() {
  const { login, register, isLoggingIn, loginError } = useLocalAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    void login(username, password);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || password !== confirmPassword) return;
    void register(username, password);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.24 0.028 220) 0%, oklch(0.18 0.02 220) 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md px-6"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(0.56 0.18 253)" }}
            >
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-white leading-tight">
                Infinexy Solution
              </h1>
              <p className="text-xs" style={{ color: "oklch(0.65 0.012 220)" }}>
                OS License Manager
              </p>
            </div>
          </div>
          <p
            className="text-sm mt-2"
            style={{ color: "oklch(0.65 0.012 220)" }}
          >
            Manage your software licenses securely
          </p>
        </div>

        {/* Auth Card */}
        <div
          className="rounded-xl p-6 border"
          style={{
            background: "oklch(0.28 0.025 220)",
            borderColor: "oklch(0.35 0.02 220)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v);
              setUsername("");
              setPassword("");
              setConfirmPassword("");
            }}
          >
            <TabsList
              className="w-full mb-6"
              style={{ background: "oklch(0.22 0.025 220)" }}
              data-ocid="auth.tab"
            >
              <TabsTrigger
                value="login"
                className="flex-1 text-sm"
                data-ocid="auth.login_tab"
                style={{
                  color:
                    activeTab === "login"
                      ? "oklch(0.97 0.005 220)"
                      : "oklch(0.65 0.012 220)",
                }}
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="flex-1 text-sm"
                data-ocid="auth.create_tab"
                style={{
                  color:
                    activeTab === "create"
                      ? "oklch(0.97 0.005 220)"
                      : "oklch(0.65 0.012 220)",
                }}
              >
                Create Account
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="login-username"
                    className="text-sm"
                    style={{ color: "oklch(0.85 0.01 220)" }}
                  >
                    Username
                  </Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    data-ocid="auth.input"
                    className="border text-sm"
                    style={{
                      background: "oklch(0.22 0.025 220)",
                      borderColor: "oklch(0.38 0.022 220)",
                      color: "oklch(0.95 0.005 220)",
                    }}
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="login-password"
                    className="text-sm"
                    style={{ color: "oklch(0.85 0.01 220)" }}
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      data-ocid="auth.input"
                      className="border text-sm pr-10"
                      style={{
                        background: "oklch(0.22 0.025 220)",
                        borderColor: "oklch(0.38 0.022 220)",
                        color: "oklch(0.95 0.005 220)",
                      }}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "oklch(0.55 0.01 220)" }}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                {loginError && (
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.65 0.22 29)" }}
                    data-ocid="auth.error_state"
                  >
                    {loginError.message}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={isLoggingIn || !username || !password}
                  data-ocid="auth.submit_button"
                  style={{ background: "oklch(0.56 0.18 253)", color: "white" }}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" /> Login Securely
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Create Account Tab */}
            <TabsContent value="create">
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="create-username"
                    className="text-sm"
                    style={{ color: "oklch(0.85 0.01 220)" }}
                  >
                    Username
                  </Label>
                  <Input
                    id="create-username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    data-ocid="auth.input"
                    className="border text-sm"
                    style={{
                      background: "oklch(0.22 0.025 220)",
                      borderColor: "oklch(0.38 0.022 220)",
                      color: "oklch(0.95 0.005 220)",
                    }}
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="create-password"
                    className="text-sm"
                    style={{ color: "oklch(0.85 0.01 220)" }}
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="create-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      data-ocid="auth.input"
                      className="border text-sm pr-10"
                      style={{
                        background: "oklch(0.22 0.025 220)",
                        borderColor: "oklch(0.38 0.022 220)",
                        color: "oklch(0.95 0.005 220)",
                      }}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "oklch(0.55 0.01 220)" }}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="create-confirm"
                    className="text-sm"
                    style={{ color: "oklch(0.85 0.01 220)" }}
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="create-confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      data-ocid="auth.input"
                      className="border text-sm pr-10"
                      style={{
                        background: "oklch(0.22 0.025 220)",
                        borderColor: "oklch(0.38 0.022 220)",
                        color: "oklch(0.95 0.005 220)",
                      }}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "oklch(0.55 0.01 220)" }}
                      tabIndex={-1}
                    >
                      {showConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {password &&
                    confirmPassword &&
                    password !== confirmPassword && (
                      <p
                        className="text-xs"
                        style={{ color: "oklch(0.65 0.22 29)" }}
                        data-ocid="auth.error_state"
                      >
                        Passwords do not match
                      </p>
                    )}
                </div>
                {loginError && (
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.65 0.22 29)" }}
                    data-ocid="auth.error_state"
                  >
                    {loginError.message}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={
                    isLoggingIn ||
                    !username ||
                    !password ||
                    (!!password &&
                      !!confirmPassword &&
                      password !== confirmPassword)
                  }
                  data-ocid="auth.submit_button"
                  style={{ background: "oklch(0.56 0.18 253)", color: "white" }}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating
                      Account...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" /> Create Account
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p
          className="text-center text-xs mt-6"
          style={{ color: "oklch(0.50 0.01 220)" }}
        >
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}

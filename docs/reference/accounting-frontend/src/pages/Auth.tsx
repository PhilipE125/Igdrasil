import { useMemo, useState } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Shield } from "lucide-react";

type AuthMode = "login" | "signup";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const authError = error as { message?: unknown; code?: unknown; status?: unknown };
    const message = authError.message;
    const code = typeof authError.code === "string" ? authError.code.toLowerCase() : "";
    if (typeof message === "string") {
      const lowerMessage = message.toLowerCase();
      if (code === "email_not_confirmed" || lowerMessage.includes("email not confirmed")) {
        return "E-posten är inte verifierad ännu. Öppna verifieringslänken i din inkorg och försök igen.";
      }
      if (lowerMessage.includes("invalid login credentials")) {
        return "Ogiltiga inloggningsuppgifter. Kontrollera e-post/lösenord, eller logga in med Google om kontot skapades via Google.";
      }
      return message;
    }
  }
  return "Ett oväntat fel uppstod. Försök igen.";
}

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const { signIn, signUp, resendSignupVerification, signInWithGoogle, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const mode = useMemo<AuthMode>(
    () => (searchParams.get("mode") === "signup" ? "signup" : "login"),
    [searchParams],
  );
  const isLogin = mode === "login";

  if (!authLoading && user) {
    return <Navigate to="/" replace />;
  }

  const setMode = (nextMode: AuthMode) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextMode === "signup") {
      nextParams.set("mode", "signup");
    } else {
      nextParams.delete("mode");
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        navigate("/");
      } else {
        const signupResult = await signUp(email, password);
        if (signupResult.emailConfirmationRequired) {
          setVerificationPending(true);
          toast({
            title: "Bekräfta din e-post",
            description: "Vi har skickat en bekräftelselänk. Öppna länken och logga sedan in.",
          });
          setMode("login");
          setPassword("");
          return;
        }
        navigate(signupResult.needsOnboarding ? "/onboarding" : "/");
      }
    } catch (error: unknown) {
      toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (error: unknown) {
      toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleBankID = () => {
    toast({ title: "BankID", description: "BankID-inloggning kommer snart!" });
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast({ title: "E-post saknas", description: "Ange samma e-postadress som du registrerade med.", variant: "destructive" });
      return;
    }
    setResendingVerification(true);
    try {
      await resendSignupVerification(email);
      toast({
        title: "Verifieringsmail skickat igen",
        description: "Kontrollera inkorg, spam och kampanjer. Avsändaren kan visas som Supabase/Auth.",
      });
    } catch (error: unknown) {
      toast({ title: "Kunde inte skicka igen", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="flex flex-col gap-6 w-full max-w-3xl">
        <Card className="overflow-hidden">
          <CardContent className="grid p-0 md:grid-cols-2">
            {/* ── Left column: form ── */}
            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="font-bold tracking-tight text-3xl text-balance">Igdrasil</h1>
                  <p className="text-balance text-muted-foreground">
                    {isLogin ? "Logga in på ditt konto" : "Skapa ett nytt konto"}
                  </p>
                </div>

                {/* Social login buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full gap-2" onClick={handleGoogle}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" className="w-full gap-2" onClick={handleBankID}>
                    <Shield className="h-5 w-5" />
                    BankID
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-card px-2 text-muted-foreground">
                    eller med e-post
                  </span>
                </div>

                {/* Email/password form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-post</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="namn@företag.se"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Lösenord</Label>
                      {isLogin && (
                        <button
                          type="button"
                          className="ml-auto text-sm underline-offset-2 hover:underline text-muted-foreground"
                          onClick={() => toast({ title: "Återställ lösenord", description: "Funktionen kommer snart." })}
                        >
                          Glömt lösenord?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={isLogin ? 1 : 8}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? "Dölj lösenord" : "Visa lösenord"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {!isLogin && password.length > 0 && password.length < 8 && (
                      <p className="text-xs text-destructive">Lösenordet måste vara minst 8 tecken.</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Laddar…" : isLogin ? "Logga in" : "Skapa konto"}
                  </Button>
                </form>

                {/* Verification banner */}
                {verificationPending && (
                  <div className="rounded-md border border-border bg-muted/30 p-3 text-sm" aria-live="polite">
                    <p className="text-foreground">Verifieringsmail kan ibland hamna i spam eller kampanjer.</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={handleResendVerification} disabled={resendingVerification}>
                        {resendingVerification ? "Skickar…" : "Skicka verifieringsmail igen"}
                      </Button>
                      <span className="text-xs text-muted-foreground">E-post: {email || "(ange e-post ovan)"}</span>
                    </div>
                  </div>
                )}

                {/* Toggle login/signup */}
                <div className="text-center text-sm">
                  {isLogin ? "Har du inget konto?" : "Har du redan ett konto?"}{" "}
                  <button
                    type="button"
                    className="underline underline-offset-4 hover:text-primary"
                    onClick={() => setMode(isLogin ? "signup" : "login")}
                  >
                    {isLogin ? "Skapa konto" : "Logga in"}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Right column: brand image ── */}
            <div className="relative hidden bg-muted md:block">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                <div className="text-6xl">🌳</div>
                <h2 className="font-bold tracking-tight text-2xl text-foreground">Igdrasil</h2>
                <p className="text-center text-sm text-muted-foreground max-w-[200px]">
                  Automatiserad bokföring med AI
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
          Genom att fortsätta godkänner du våra{" "}
          <a href="#">Användarvillkor</a> och{" "}
          <a href="#">Integritetspolicy</a>.
        </div>
      </div>

    </div>
  );
};

export default Auth;

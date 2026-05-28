import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/lib/auth";
import { useSetRole, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Briefcase, Building, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { RoleInputRole } from "@workspace/api-client-react";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const apiBase = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

async function apiFetch(path: string, body: object) {
  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

type ForgotStep = "email" | "code" | "done";

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<ForgotStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/forgot-password", { email });
      if (data.demo && data.code) {
        setDemoCode(data.code);
        toast.info("SMTP not configured", { description: `Your reset code is: ${data.code}` });
      } else {
        toast.success("Code sent", { description: "Check your email for the 6-digit code." });
      }
      setStep("code");
    } catch (e: any) {
      toast.error("Error", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword) return;
    setLoading(true);
    try {
      await apiFetch("/api/auth/reset-password", { code, password: newPassword });
      toast.success("Password reset", { description: "You can now sign in with your new password." });
      setStep("done");
    } catch (e: any) {
      toast.error("Invalid code", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6 text-green-600" />
        </div>
        <p className="font-semibold text-primary">Password updated successfully</p>
        <Button className="w-full" onClick={onBack}>Back to Sign In</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-3 h-3" /> Back to Sign In
      </button>

      <div>
        <h3 className="font-semibold text-primary">Reset your password</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {step === "email" ? "Enter your email to receive a reset code." : "Enter the 6-digit code and your new password."}
        </p>
      </div>

      {step === "email" && (
        <div className="space-y-3">
          <div>
            <Label>Email address</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1"
            />
          </div>
          <Button className="w-full bg-primary text-primary-foreground h-11" onClick={handleRequestCode} disabled={loading || !email}>
            {loading ? "Sending…" : "Send Reset Code"}
          </Button>
        </div>
      )}

      {step === "code" && (
        <div className="space-y-3">
          {demoCode && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <p className="text-xs text-amber-700 mb-1">SMTP not configured — your code:</p>
              <p className="text-2xl font-bold tracking-widest text-amber-800">{demoCode}</p>
            </div>
          )}
          <div>
            <Label>6-digit reset code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="mt-1 text-center text-xl tracking-widest font-mono"
            />
          </div>
          <div>
            <Label>New password</Label>
            <div className="relative mt-1">
              <Input
                type={showPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button className="w-full bg-primary text-primary-foreground h-11" onClick={handleResetPassword} disabled={loading || !code || newPassword.length < 6}>
            {loading ? "Resetting…" : "Reset Password"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AuthPage() {
  const { user, login, register } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const defaultTab = params.get("tab") || "login";
  const queryClient = useQueryClient();

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const setRoleMutation = useSetRole();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      await login(data);
      setLocation("/dashboard");
    } catch {
      toast.error("Authentication Failed", { description: "Invalid email or password." });
    }
  };

  const onRegister = async (data: z.infer<typeof registerSchema>) => {
    try {
      await register(data);
    } catch {
      toast.error("Registration Failed", { description: "Could not create account." });
    }
  };

  const handleSetRole = (role: RoleInputRole) => {
    setRoleMutation.mutate({ data: { role } }, {
      onSuccess: (response) => {
        const r = response as any;
        if (r.token) localStorage.setItem("token", r.token);
        const updatedUser = r.user || r;
        queryClient.setQueryData(getGetMeQueryKey(), updatedUser);
        setLocation("/dashboard");
      },
      onError: () => toast.error("Error", { description: "Could not set role. Please try again." }),
    });
  };

  if (user && !user.role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-primary">Select Your Role</h1>
            <p className="text-muted-foreground mt-2">How will you use Veritas Infrastructure?</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:border-primary transition-colors border-2" onClick={() => handleSetRole(RoleInputRole.professional)}>
              <CardHeader>
                <Briefcase className="w-8 h-8 text-primary mb-2" />
                <CardTitle>I am a Professional</CardTitle>
                <CardDescription>Apply for a Trust Passport and access enterprise opportunities.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:border-primary transition-colors border-2" onClick={() => handleSetRole(RoleInputRole.client)}>
              <CardHeader>
                <Building className="w-8 h-8 text-primary mb-2" />
                <CardTitle>I am a Client</CardTitle>
                <CardDescription>Hire verified global talent backed by institutional guarantees.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (user && user.role) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center pb-8">
          <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-primary">Veritas Infrastructure</CardTitle>
          <CardDescription>Institutional-grade talent platform</CardDescription>
        </CardHeader>
        <CardContent>
          {showForgot ? (
            <ForgotPasswordForm onBack={() => setShowForgot(false)} />
          ) : (
            <Tabs defaultValue={defaultTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField control={loginForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <Label>Email</Label>
                        <FormControl><Input {...field} type="email" placeholder="corporate@example.com" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={loginForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <Label>Password</Label>
                        <div className="relative">
                          <FormControl>
                            <Input {...field} type={showLoginPassword ? "text" : "password"} className="pr-10" />
                          </FormControl>
                          <button type="button" onClick={() => setShowLoginPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors" tabIndex={-1}>
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="text-right">
                      <button type="button" onClick={() => setShowForgot(true)}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <Button type="submit" className="w-full bg-primary text-primary-foreground h-11 text-base">Sign In</Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <FormField control={registerForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <Label>Full Legal Name</Label>
                        <FormControl><Input {...field} placeholder="John Doe" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={registerForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <Label>Email</Label>
                        <FormControl><Input {...field} type="email" placeholder="corporate@example.com" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={registerForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <Label>Password</Label>
                        <div className="relative">
                          <FormControl>
                            <Input {...field} type={showRegisterPassword ? "text" : "password"} className="pr-10" />
                          </FormControl>
                          <button type="button" onClick={() => setShowRegisterPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors" tabIndex={-1}>
                            {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-primary text-primary-foreground h-11 text-base">Create Account</Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

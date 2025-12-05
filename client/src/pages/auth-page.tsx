import { useState, useEffect, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logoUrl from "@/assets/logo.png";
import heroImage from "@assets/generated_images/luxury_living_room_interior_for_hero_background.png";
import { Loader2, Check, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { user, loginMutation, registerMutation } = useAuth();

  const isTrialFlow = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return params.get('trial') === 'true';
  }, [searchString]);

  const [justRegistered, setJustRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState(isTrialFlow ? "register" : "login");

  // Update active tab when trial param changes (e.g., navigating from another page)
  useEffect(() => {
    if (isTrialFlow) {
      setActiveTab("register");
    }
  }, [isTrialFlow]);

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    username: "", 
    password: "", 
    confirmPassword: "",
    email: "", 
    name: "" 
  });

  useEffect(() => {
    if (user && isTrialFlow && registerMutation.isSuccess) {
      setJustRegistered(true);
    } else if (user && !justRegistered) {
      setLocation("/dashboard");
    }
  }, [user, setLocation, isTrialFlow, registerMutation.isSuccess, justRegistered]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      return;
    }
    registerMutation.mutate({
      username: registerData.username,
      password: registerData.password,
      email: registerData.email || undefined,
      name: registerData.name || undefined,
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Auth forms */}
      <div className="flex flex-col justify-center px-4 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <img src={logoUrl} alt="AgentAssets" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-secondary">Welcome to AgentAssets</h1>
            <p className="text-muted-foreground">Create beautiful property websites in minutes</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input 
                        id="login-username"
                        data-testid="input-login-username"
                        placeholder="Enter your username"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input 
                        id="login-password"
                        data-testid="input-login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      data-testid="button-login"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : "Login"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              {/* Trial messaging banner */}
              {isTrialFlow && !justRegistered && (
                <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Start Your 7-Day Free Trial</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Create your account below to get 1 free site credit. No credit card required!
                  </p>
                </div>
              )}

              {/* Success message after registration */}
              {justRegistered && (
                <div className="p-6 bg-gradient-to-br from-primary/5 to-teal-50 border border-primary/20 rounded-xl text-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-2">Welcome to AgentAssets!</h3>
                  <p className="text-muted-foreground mb-6">
                    Your trial account is ready. You have <span className="font-semibold text-primary">1 free site credit</span> to create your first property website.
                  </p>
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 text-white group">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-4">
                    Click "Create New Site" to build your first property website
                  </p>
                </div>
              )}

              {!justRegistered && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    {isTrialFlow 
                      ? "Fill in your details to start your free trial" 
                      : "Sign up to start creating property websites"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <Input 
                        id="register-name"
                        data-testid="input-register-name"
                        placeholder="John Doe"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input 
                        id="register-email"
                        data-testid="input-register-email"
                        type="email"
                        placeholder="john@example.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input 
                        id="register-username"
                        data-testid="input-register-username"
                        placeholder="Choose a username"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input 
                        id="register-password"
                        data-testid="input-register-password"
                        type="password"
                        placeholder="Choose a password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm">Confirm Password</Label>
                      <Input 
                        id="register-confirm"
                        data-testid="input-register-confirm"
                        type="password"
                        placeholder="Confirm your password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                      />
                      {registerData.password && registerData.confirmPassword && registerData.password !== registerData.confirmPassword && (
                        <p className="text-sm text-destructive">Passwords do not match</p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      data-testid="button-register"
                      disabled={registerMutation.isPending || (registerData.password !== registerData.confirmPassword)}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex relative bg-secondary">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <h2 className="text-4xl font-bold mb-6 font-serif">
            Single Property Sites<br/>That Don't Suck!
          </h2>
          <p className="text-xl mb-8 text-white/80">
            Create stunning, customized property websites to showcase your listings.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-primary" />
              <span>Professional templates</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-primary" />
              <span>Custom branding & colors</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-primary" />
              <span>Video tour integration</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-primary" />
              <span>Custom domain support</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-primary" />
              <span>Analytics dashboard</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

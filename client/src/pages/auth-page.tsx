import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logoUrl from "@/assets/logo.png";
import heroImage from "@assets/generated_images/luxury_living_room_interior_for_hero_background.png";
import { Loader2, Check } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    username: "", 
    password: "", 
    confirmPassword: "",
    email: "", 
    name: "" 
  });

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

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

          <Tabs defaultValue="login" className="w-full">
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
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Sign up to start creating property websites</CardDescription>
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

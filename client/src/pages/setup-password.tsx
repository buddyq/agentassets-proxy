import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Lock, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';

export default function SetupPasswordPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const token = new URLSearchParams(search).get('token');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [inviteInfo, setInviteInfo] = useState<{
    name: string;
    email: string;
    brokerageName: string;
  } | null>(null);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. Please check your email for the correct link.');
      setLoading(false);
      return;
    }
    
    fetch(`/api/auth/invite/verify?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setInviteInfo(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to verify invitation. Please try again.');
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/auth/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        toast.error(data.error);
      } else {
        setSuccess(true);
        setUsername(data.username);
        toast.success('Account set up successfully!');
      }
    } catch {
      toast.error('Failed to set up account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Invalid Invitation</CardTitle>
            <CardDescription className="text-base mt-2">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              If you believe this is an error, please contact your brokerage administrator.
            </p>
            <Button variant="outline" onClick={() => setLocation('/')}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-teal-50/30 p-4">
        <Card className="w-full max-w-md border-2 border-primary/20">
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">You're All Set!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your account has been set up successfully. You can now log in and start creating property websites.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Your username</p>
              <p className="font-mono font-medium text-lg">{username}</p>
            </div>
            <Button className="w-full" size="lg" onClick={() => setLocation('/auth')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-teal-50/30 p-4">
      <Card className="w-full max-w-md border-2 border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome to AgentAssets!</CardTitle>
          <CardDescription className="text-base mt-2">
            {inviteInfo?.brokerageName && (
              <>You've been invited to join <span className="font-semibold text-foreground">{inviteInfo.brokerageName}</span>. </>
            )}
            Set up your password to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <div className="grid gap-2">
                <div>
                  <span className="text-sm text-muted-foreground">Name: </span>
                  <span className="font-medium">{inviteInfo?.name}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email: </span>
                  <span className="font-medium">{inviteInfo?.email}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                  data-testid="input-confirm-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={submitting}
              data-testid="button-setup-account"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Set Up My Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

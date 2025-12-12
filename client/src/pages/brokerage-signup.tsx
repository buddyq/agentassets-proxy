import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useBrokerage, useBrokerageCheckout } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Users, Check, ArrowRight, Loader2 } from 'lucide-react';

export default function BrokerageSignup() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [brokerageName, setBrokerageName] = useState('');
  
  const { data: brokerageData, isLoading: brokerageLoading } = useBrokerage();
  const brokerageCheckout = useBrokerageCheckout();

  const canceled = new URLSearchParams(searchString).get('canceled') === 'true';

  useEffect(() => {
    if (canceled) {
      toast.error('Checkout was canceled. You can try again when ready.');
    }
  }, [canceled]);

  useEffect(() => {
    if (brokerageData?.brokerage) {
      setLocation('/brokerage');
    }
  }, [brokerageData, setLocation]);

  if (authLoading || brokerageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation('/auth?redirect=/brokerage/signup');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerageName.trim()) {
      toast.error('Please enter your brokerage name');
      return;
    }

    try {
      const result = await brokerageCheckout.mutateAsync({ brokerageName: brokerageName.trim() });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start checkout');
    }
  };

  const features = [
    'Manage up to 15 agents included',
    'Custom brokerage branding',
    'Agent groups and teams',
    'Exclusive custom templates',
    'Property oversight dashboard',
    'Centralized billing management',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-brokerage-signup-title">
            Brokerage Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empower your team with centralized property site management, custom branding, and exclusive templates.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border-2 border-primary/20">
            <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
              Most Popular
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Brokerage Plan
              </CardTitle>
              <CardDescription>
                Everything you need to manage your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$249</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Includes 15 agent seats
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="p-4 bg-muted/50 rounded-lg mb-6">
                <p className="text-sm font-medium mb-2">Additional Seats</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>First 100 extra agents: $10/agent/mo</li>
                  <li>100+ extra agents: $5/agent/mo</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Enter your brokerage name to begin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="brokerage-name">Brokerage Name</Label>
                  <Input
                    id="brokerage-name"
                    value={brokerageName}
                    onChange={(e) => setBrokerageName(e.target.value)}
                    placeholder="ABC Realty"
                    required
                    data-testid="input-brokerage-name"
                  />
                  <p className="text-sm text-muted-foreground">
                    This will be displayed on your team's property sites
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={brokerageCheckout.isPending}
                  data-testid="button-start-subscription"
                >
                  {brokerageCheckout.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Start Subscription
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  You'll be redirected to Stripe to complete your subscription. 
                  Cancel anytime from your account settings.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

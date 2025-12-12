import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useBrokerage, useBrokerageRegister } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Building2, Users, Check, ArrowRight, Loader2, Mail, Phone, User, Sparkles } from 'lucide-react';

const agentCountRanges = [
  { value: '1-15', label: '1-15 agents' },
  { value: '16-50', label: '16-50 agents' },
  { value: '51-100', label: '51-100 agents' },
  { value: '101-250', label: '101-250 agents' },
  { value: '251-500', label: '251-500 agents' },
  { value: '500+', label: '500+ agents' },
];

export default function BrokerageSignup() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  
  const [brokerageName, setBrokerageName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [plannedAgentCount, setPlannedAgentCount] = useState('');
  
  const { data: brokerageData, isLoading: brokerageLoading } = useBrokerage();
  const brokerageRegister = useBrokerageRegister();

  const canceled = new URLSearchParams(searchString).get('canceled') === 'true';

  useEffect(() => {
    if (canceled) {
      toast.error('Registration was canceled. You can try again when ready.');
    }
  }, [canceled]);

  useEffect(() => {
    if (brokerageData?.brokerage) {
      setLocation('/brokerage');
    }
  }, [brokerageData, setLocation]);

  useEffect(() => {
    if (user) {
      if (user.name) setContactName(user.name);
      if (user.email) setContactEmail(user.email);
      if (user.phone) setContactPhone(user.phone);
    }
  }, [user]);

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
    if (!contactName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!contactEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!plannedAgentCount) {
      toast.error('Please select the number of agents you plan to have');
      return;
    }

    try {
      await brokerageRegister.mutateAsync({ 
        brokerageName: brokerageName.trim(),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim() || undefined,
        plannedAgentCount,
      });
      toast.success('Welcome! Your brokerage trial has started.');
      setLocation('/brokerage');
    } catch (error: any) {
      toast.error(error.message || 'Failed to register brokerage');
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
            Start Your Brokerage Trial
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get 7 days free to explore all brokerage features. No credit card required.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="relative overflow-hidden border-2 border-primary/20">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              7-Day Free Trial
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
                  After your 7-day free trial
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

              <div className="p-4 bg-muted/50 rounded-lg">
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
              <CardTitle>Create Your Brokerage Account</CardTitle>
              <CardDescription>
                Tell us about yourself and your brokerage to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="brokerage-name">Brokerage Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="brokerage-name"
                      value={brokerageName}
                      onChange={(e) => setBrokerageName(e.target.value)}
                      placeholder="ABC Realty"
                      className="pl-10"
                      required
                      data-testid="input-brokerage-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-name">Your Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="contact-name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="John Smith"
                      className="pl-10"
                      required
                      data-testid="input-contact-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="john@abcrealty.com"
                      className="pl-10"
                      required
                      data-testid="input-contact-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone (optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="contact-phone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="(512) 555-0123"
                      className="pl-10"
                      data-testid="input-contact-phone"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planned-agents">
                    How many agents do you plan to have in your brokerage by the end of this year?
                  </Label>
                  <Select value={plannedAgentCount} onValueChange={setPlannedAgentCount}>
                    <SelectTrigger id="planned-agents" data-testid="select-planned-agents">
                      <SelectValue placeholder="Select a range" />
                    </SelectTrigger>
                    <SelectContent>
                      {agentCountRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={brokerageRegister.isPending}
                  data-testid="button-start-trial"
                >
                  {brokerageRegister.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Your Account...
                    </>
                  ) : (
                    <>
                      Start Free Trial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  No credit card required. Your trial includes all features for 7 days.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

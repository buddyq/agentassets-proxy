import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { 
  useBrokerage,
  useAllGroupMemberships, 
  useBrokerageMembers, 
  useBrokerageGroups, 
  useBrokerageSites,
  useAddBrokerageMember,
  useRemoveBrokerageMember,
  useUpdateBrokerageMember,
  useCreateBrokerageGroup,
  useDeleteBrokerageGroup,
  useAddUserToGroup,
  useRemoveUserFromGroup,
  useGroupMembers,
  useDeleteBrokerageSite,
  useConfirmBrokerageSubscription,
  useBrokerageTemplates,
  useUpdateBrokerageTemplate,
  useTemplateGroupAssignments,
  useAssignTemplateToGroup,
  useRemoveTemplateFromGroup,
  useLayouts,
  useUpdateBrokerage,
  type BrokerageMember,
  type BrokerageGroup,
  type BrokerageSite,
  type BrokerageTemplate
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Users, 
  Building2, 
  FolderOpen, 
  Search, 
  Plus, 
  MoreVertical, 
  UserMinus, 
  Shield, 
  ExternalLink,
  Trash2,
  UserPlus,
  Globe,
  Home,
  Sparkles,
  ArrowRight,
  Settings,
  CheckCircle2,
  Clock,
  Palette,
  LayoutTemplate,
  CheckCircle,
  Circle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

function AddAgentDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const addMember = useAddBrokerageMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMember.mutateAsync({ name, email, phone: phone || undefined });
      toast.success('Agent added successfully');
      setOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add agent');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-agent">
          <Plus className="w-4 h-4 mr-2" />
          Add Agent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
          <DialogDescription>
            Add a new agent to your brokerage. They will receive an invitation to join.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                required
                data-testid="input-agent-name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                data-testid="input-agent-email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(512) 555-0123"
                data-testid="input-agent-phone"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addMember.isPending} data-testid="button-submit-agent">
              {addMember.isPending ? 'Adding...' : 'Add Agent'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateGroupDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createGroup = useCreateBrokerageGroup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGroup.mutateAsync({ name, description: description || undefined });
      toast.success('Group created successfully');
      setOpen(false);
      setName('');
      setDescription('');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create group');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-group">
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a group to organize agents and manage template access.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Luxury Team"
                required
                data-testid="input-group-name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="group-description">Description (optional)</Label>
              <Input
                id="group-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Agents specializing in luxury properties"
                data-testid="input-group-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createGroup.isPending} data-testid="button-submit-group">
              {createGroup.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AgentMemberCard({ member, onRemove, onPromote, userGroups }: { 
  member: BrokerageMember; 
  onRemove: () => void;
  onPromote: () => void;
  userGroups: BrokerageGroup[];
}) {
  const initials = member.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow" data-testid={`card-agent-${member.id}`}>
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={member.user?.profileImageUrl || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium" data-testid={`text-agent-name-${member.id}`}>
              {member.user?.name || 'Unknown'}
            </span>
            {member.role === 'admin' && (
              <Badge variant="secondary" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}
            <Badge variant={member.status === 'active' ? 'default' : 'outline'} className="text-xs">
              {member.status}
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">{member.user?.email}</span>
          {userGroups.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {userGroups.map(group => (
                <span key={group.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                  <FolderOpen className="w-3 h-3" />
                  {group.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" data-testid={`button-agent-menu-${member.id}`}>
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {member.role !== 'admin' && (
            <DropdownMenuItem onClick={onPromote}>
              <Shield className="w-4 h-4 mr-2" />
              Make Admin
            </DropdownMenuItem>
          )}
          {member.role !== 'admin' && (
            <DropdownMenuItem onClick={onRemove} className="text-destructive">
              <UserMinus className="w-4 h-4 mr-2" />
              Remove
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function GroupCard({ group, members, onDelete, onManageMembers }: {
  group: BrokerageGroup;
  members: BrokerageMember[];
  onDelete: () => void;
  onManageMembers: () => void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  return (
    <Card data-testid={`card-group-${group.id}`} className="transition-all hover:shadow-md hover:border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{group.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid={`button-group-menu-${group.id}`}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {group.description && (
          <CardDescription>{group.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{group.memberCount || 0} members</span>
          </div>
          <Button 
            size="sm" 
            onClick={onManageMembers}
            className="bg-primary hover:bg-primary/90"
            data-testid={`button-manage-group-${group.id}`}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </div>
      </CardContent>
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{group.name}"? This will remove all agents from this group. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                onDelete();
                setShowDeleteDialog(false);
              }}
            >
              Delete Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function SiteCard({ site, onDelete }: { site: BrokerageSite; onDelete: () => void }) {
  const siteUrl = site.customDomain 
    ? `https://${site.customDomain}`
    : site.subdomain 
      ? `https://${site.subdomain}.agentassets.com`
      : null;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg" data-testid={`card-site-${site.id}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{site.address || site.title || 'Untitled Property'}</span>
          <Badge variant={site.status === 'published' ? 'default' : 'secondary'}>
            {site.status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {site.agent?.name || 'Unknown Agent'}
          </span>
          {siteUrl && (
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {site.subdomain || site.customDomain}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {siteUrl && (
          <Button variant="ghost" size="icon" asChild>
            <a href={siteUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-site-menu-${site.id}`}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Site
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function BrokerageDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [siteSearch, setSiteSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [processingSuccess, setProcessingSuccess] = useState(false);
  
  const { data: brokerageData, isLoading: brokerageLoading, refetch: refetchBrokerage } = useBrokerage();
  const confirmSubscription = useConfirmBrokerageSubscription();

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const success = params.get('success') === 'true';
    const sessionId = params.get('session_id');
    
    if (success && sessionId && !processingSuccess && !brokerageData?.brokerage) {
      setProcessingSuccess(true);
      confirmSubscription.mutateAsync(sessionId)
        .then(() => {
          toast.success('Welcome! Your brokerage has been created successfully.');
          refetchBrokerage();
          window.history.replaceState({}, '', '/brokerage');
        })
        .catch((error) => {
          toast.error(error.message || 'Failed to confirm subscription');
          setProcessingSuccess(false);
        });
    }
  }, [searchString, processingSuccess, brokerageData, confirmSubscription, refetchBrokerage]);
  const { data: members = [], refetch: refetchMembers } = useBrokerageMembers();
  const { data: groups = [], refetch: refetchGroups } = useBrokerageGroups();
  const { data: sites = [] } = useBrokerageSites(siteSearch || undefined);
  const { data: groupMembers = [] } = useGroupMembers(selectedGroup || '');
  
  const removeMember = useRemoveBrokerageMember();
  const updateMember = useUpdateBrokerageMember();
  const deleteGroup = useDeleteBrokerageGroup();
  const deleteSite = useDeleteBrokerageSite();
  const addToGroup = useAddUserToGroup();
  const removeFromGroup = useRemoveUserFromGroup();
  const updateBrokerage = useUpdateBrokerage();
  
  const [brokerageNameEdit, setBrokerageNameEdit] = useState('');
  
  useEffect(() => {
    if (brokerageData?.brokerage?.name) {
      setBrokerageNameEdit(brokerageData.brokerage.name);
    }
  }, [brokerageData?.brokerage?.name]);
  
  const { data: brokerageTemplates = [], refetch: refetchTemplates } = useBrokerageTemplates();
  const { data: allLayouts = [] } = useLayouts({ preset: true });
  const { data: allGroupMemberships = [] } = useAllGroupMemberships();
  const updateTemplate = useUpdateBrokerageTemplate();
  const assignToGroup = useAssignTemplateToGroup();
  const removeFromGroupMutation = useRemoveTemplateFromGroup();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { data: templateGroupAssignments = [] } = useTemplateGroupAssignments(selectedTemplate || '');

  if (authLoading || brokerageLoading || processingSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <div className="text-muted-foreground">
          {processingSuccess ? 'Setting up your brokerage...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation('/');
    return null;
  }

  const membership = brokerageData?.membership;
  const brokerage = brokerageData?.brokerage;

  if (!membership || !brokerage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
        <Building2 className="w-16 h-16 text-primary" />
        <h1 className="text-2xl font-bold">Start Your Brokerage</h1>
        <p className="text-muted-foreground max-w-md">
          Create a brokerage account to manage your team's property sites, custom templates, and more.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => setLocation('/brokerage/signup')} data-testid="button-start-brokerage">
            <Building2 className="w-4 h-4 mr-2" />
            Get Started
          </Button>
          <Button variant="outline" onClick={() => setLocation('/dashboard')}>
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (membership.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
        <Building2 className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Admin Access Required</h1>
        <p className="text-muted-foreground max-w-md">
          You need to be a brokerage admin to access this page. Contact your brokerage administrator for access.
        </p>
        <Button variant="outline" onClick={() => setLocation('/dashboard')}>
          <Home className="w-4 h-4 mr-2" />
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const handleRemoveAgent = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this agent?')) return;
    try {
      await removeMember.mutateAsync(memberId);
      toast.success('Agent removed');
      refetchMembers();
      refetchBrokerage();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove agent');
    }
  };

  const handlePromoteAgent = async (memberId: string) => {
    try {
      await updateMember.mutateAsync({ memberId, updates: { role: 'admin' } });
      toast.success('Agent promoted to admin');
      refetchMembers();
    } catch (error) {
      toast.error('Failed to promote agent');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteGroup.mutateAsync(groupId);
      toast.success('Group deleted');
      refetchGroups();
    } catch (error) {
      toast.error('Failed to delete group');
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm('Are you sure you want to delete this site?')) return;
    try {
      await deleteSite.mutateAsync(siteId);
      toast.success('Site deleted');
    } catch (error) {
      toast.error('Failed to delete site');
    }
  };

  const activeMembers = members.filter(m => m.status === 'active' || m.status === 'invited');
  const usedSeats = brokerageData?.memberCount || 0;
  const totalSeats = brokerageData?.totalSeats || 15;
  
  // Calculate trial days remaining
  const trialEndsAt = brokerage.trialEndsAt ? new Date(brokerage.trialEndsAt) : null;
  const now = new Date();
  const trialDaysRemaining = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const isOnTrial = brokerage.status === 'trial' && trialDaysRemaining > 0;

  // Onboarding steps using server-side milestone tracking
  const onboardingSteps = [
    { 
      id: 'invite', 
      title: 'Invite Your First Agent', 
      description: 'Add team members to start building property sites together.',
      icon: UserPlus,
      completed: brokerage.hasAddedFirstAgent || activeMembers.length > 1,
      action: () => document.querySelector('[data-testid="button-add-agent"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    },
    { 
      id: 'group', 
      title: 'Create a Team Group', 
      description: 'Organize agents into groups for custom templates and permissions.',
      icon: FolderOpen,
      completed: brokerage.hasCreatedFirstGroup || groups.length > 0,
      action: () => {
        const groupsTab = document.querySelector('[data-testid="tab-groups"]') as HTMLElement;
        groupsTab?.click();
      }
    },
    { 
      id: 'template', 
      title: 'Explore Custom Templates', 
      description: 'Browse exclusive brokerage templates for your team.',
      icon: Palette,
      completed: brokerage.hasExploredTemplates || false,
      action: async () => {
        try {
          await fetch('/api/brokerage/onboarding/templates-explored', {
            method: 'POST',
            credentials: 'include',
          });
        } catch (e) {
          // Silently ignore - not critical
        }
        setLocation('/themes');
      }
    },
  ];

  const completedSteps = onboardingSteps.filter(s => s.completed).length;
  const progressPercent = (completedSteps / onboardingSteps.length) * 100;
  
  // Show onboarding until all steps are complete or explicitly dismissed
  const showOnboarding = completedSteps < onboardingSteps.length && !brokerage.onboardingCompletedAt;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Brokerage Sub-header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation('/dashboard')}>
                <Home className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{brokerage.name}</h1>
                <p className="text-sm text-muted-foreground">Brokerage Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOnTrial && (
                <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-200">
                  <Clock className="w-3 h-3 mr-1" />
                  {trialDaysRemaining} days left in trial
                </Badge>
              )}
              <Badge variant="outline" className="text-sm">
                {usedSeats} / {totalSeats} seats used
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 flex-1">
        {showOnboarding && (
          <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-white to-teal-50/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="pb-2 relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Welcome to Your Brokerage!</CardTitle>
                  <CardDescription className="text-base">
                    Let's get you set up in just a few steps
                  </CardDescription>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Getting started progress</span>
                  <span className="font-medium text-primary">{completedSteps} of {onboardingSteps.length} complete</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                {onboardingSteps.map((step, index) => (
                  <Card 
                    key={step.id} 
                    className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 ${step.completed ? 'bg-primary/5 border-primary/30' : 'hover:border-primary/50'}`}
                    onClick={step.action}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${step.completed ? 'bg-primary text-white' : 'bg-muted'}`}>
                          {step.completed ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <step.icon className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Step {index + 1}</span>
                            {step.completed && <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Done</Badge>}
                          </div>
                          <h4 className="font-semibold mt-1">{step.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        </div>
                        {!step.completed && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList>
            <TabsTrigger value="agents" className="flex items-center gap-2" data-testid="tab-agents">
              <Users className="w-4 h-4" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2" data-testid="tab-properties">
              <Building2 className="w-4 h-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2" data-testid="tab-groups">
              <FolderOpen className="w-4 h-4" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="layouts" className="flex items-center gap-2" data-testid="tab-layouts">
              <LayoutTemplate className="w-4 h-4" />
              Layouts
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2" data-testid="tab-settings">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Team Members</h2>
                <p className="text-sm text-muted-foreground">
                  Manage agents in your brokerage ({usedSeats} of {totalSeats} seats)
                </p>
              </div>
              <AddAgentDialog onSuccess={() => { refetchMembers(); refetchBrokerage(); }} />
            </div>
            
            <Separator />

            <div className="grid gap-3">
              {activeMembers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No agents yet. Add your first team member!</p>
                </div>
              ) : (
                activeMembers.map(member => {
                  const memberGroupIds = allGroupMemberships
                    .filter(m => m.userId === member.userId)
                    .map(m => m.groupId);
                  const memberGroups = groups.filter(g => memberGroupIds.includes(g.id));
                  return (
                    <AgentMemberCard
                      key={member.id}
                      member={member}
                      onRemove={() => handleRemoveAgent(member.id)}
                      onPromote={() => handlePromoteAgent(member.id)}
                      userGroups={memberGroups}
                    />
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">All Properties</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage all property sites across your brokerage
                </p>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by address, domain, or agent..."
                value={siteSearch}
                onChange={(e) => setSiteSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-sites"
              />
            </div>
            
            <Separator />

            <div className="grid gap-3">
              {sites.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No property sites found.</p>
                </div>
              ) : (
                sites.map(site => (
                  <SiteCard
                    key={site.id}
                    site={site}
                    onDelete={() => handleDeleteSite(site.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Agent Groups</h2>
                <p className="text-sm text-muted-foreground">
                  Organize agents into groups for template access and permissions
                </p>
              </div>
              <CreateGroupDialog onSuccess={refetchGroups} />
            </div>
            
            <Separator />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groups.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No groups yet. Create a group to organize your agents!</p>
                </div>
              ) : (
                groups.map(group => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    members={activeMembers}
                    onDelete={() => handleDeleteGroup(group.id)}
                    onManageMembers={() => setSelectedGroup(group.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="layouts" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Exclusive Layouts</h2>
                <p className="text-sm text-muted-foreground">
                  Manage which layouts are available to your agents
                </p>
              </div>
            </div>
            
            <Separator />

            {brokerageTemplates.filter(t => t.templateType === 'layout').length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <LayoutTemplate className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No exclusive layouts assigned yet.</p>
                <p className="text-sm mt-2">Contact AgentAssets support to get custom layouts for your brokerage.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {brokerageTemplates.filter(t => t.templateType === 'layout').map(template => {
                  const layout = allLayouts.find(l => l.id === template.templateId);
                  return (
                    <Card key={template.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <LayoutTemplate className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{layout?.name || 'Unknown Layout'}</h3>
                              <p className="text-sm text-muted-foreground">{layout?.description || 'Exclusive brokerage layout'}</p>
                              {template.assignedGroups && template.assignedGroups.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-1 mt-2">
                                  <span className="text-xs text-muted-foreground mr-1">Assigned to Group(s):</span>
                                  {template.assignedGroups.map(groupId => {
                                    const group = groups.find(g => g.id === groupId);
                                    return group ? (
                                      <span key={groupId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                        <FolderOpen className="w-3 h-3" />
                                        {group.name}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground mt-2">Available to all agents</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTemplate(template.id)}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Assign to Groups
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Brokerage Settings</h2>
              <p className="text-sm text-muted-foreground">
                Update your brokerage information
              </p>
            </div>
            
            <Separator />

            <Card>
              <CardHeader>
                <CardTitle>Brokerage Information</CardTitle>
                <CardDescription>
                  This name will appear on all property sites created by your agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="brokerage-name">Brokerage Name</Label>
                  <Input
                    id="brokerage-name"
                    value={brokerageNameEdit}
                    onChange={(e) => setBrokerageNameEdit(e.target.value)}
                    placeholder="Your Brokerage Name"
                    data-testid="input-brokerage-name-edit"
                  />
                </div>
                <Button 
                  onClick={async () => {
                    if (!brokerageNameEdit.trim()) {
                      toast.error('Please enter a brokerage name');
                      return;
                    }
                    try {
                      await updateBrokerage.mutateAsync({ name: brokerageNameEdit.trim() });
                      toast.success('Brokerage name updated');
                      refetchBrokerage();
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to update brokerage');
                    }
                  }}
                  disabled={updateBrokerage.isPending || brokerageNameEdit === brokerage?.name}
                  data-testid="button-save-brokerage-settings"
                >
                  {updateBrokerage.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Layout to Groups</DialogTitle>
            <DialogDescription>
              Select which groups can access this layout. If no groups are selected, all agents can use it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[300px] overflow-y-auto">
            {groups.map(group => {
              const isAssigned = templateGroupAssignments.some(a => a.groupId === group.id);
              return (
                <label
                  key={group.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    isAssigned ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    checked={isAssigned}
                    onCheckedChange={async (checked) => {
                      try {
                        if (checked) {
                          await assignToGroup.mutateAsync({ 
                            templateId: selectedTemplate!, 
                            groupId: group.id 
                          });
                        } else {
                          await removeFromGroupMutation.mutateAsync({ 
                            templateId: selectedTemplate!, 
                            groupId: group.id 
                          });
                        }
                        refetchTemplates();
                      } catch (error: any) {
                        toast.error(error.message);
                      }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{group.name}</span>
                  </div>
                </label>
              );
            })}
            {groups.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No groups created yet. Create groups in the Agents tab first.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedGroup} onOpenChange={(open) => !open && setSelectedGroup(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Group Members</DialogTitle>
            <DialogDescription>
              Add or remove agents from this group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <h4 className="text-sm font-medium">Available Agents</h4>
            <div className="grid gap-2 max-h-[300px] overflow-y-auto">
              {activeMembers.map(member => {
                const isInGroup = groupMembers.some((gm: any) => gm.userId === member.userId);
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="text-xs">
                          {member.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{member.user?.name}</div>
                        <div className="text-xs text-muted-foreground">{member.user?.email || 'No email'}</div>
                      </div>
                    </div>
                    {isInGroup ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await removeFromGroup.mutateAsync({ groupId: selectedGroup!, userId: member.userId });
                          toast.success('Removed from group');
                        }}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            await addToGroup.mutateAsync({ groupId: selectedGroup!, userId: member.userId });
                            toast.success('Added to group');
                          } catch (error: any) {
                            toast.error(error.message);
                          }
                        }}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedGroup(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}

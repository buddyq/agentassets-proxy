import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { 
  useBrokerage, 
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
  type BrokerageMember,
  type BrokerageGroup,
  type BrokerageSite
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
  Home
} from 'lucide-react';

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

function AgentMemberCard({ member, onRemove, onPromote }: { 
  member: BrokerageMember; 
  onRemove: () => void;
  onPromote: () => void;
}) {
  const initials = member.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg" data-testid={`card-agent-${member.id}`}>
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
  return (
    <Card data-testid={`card-group-${group.id}`}>
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
              <DropdownMenuItem onClick={onManageMembers}>
                <UserPlus className="w-4 h-4 mr-2" />
                Manage Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{group.memberCount || 0} members</span>
        </div>
      </CardContent>
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
    if (!confirm('Are you sure you want to delete this group?')) return;
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

  const activeMembers = members.filter(m => m.status === 'active');
  const usedSeats = brokerageData?.memberCount || 0;
  const totalSeats = brokerageData?.totalSeats || 15;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
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
              <Badge variant="outline" className="text-sm">
                {usedSeats} / {totalSeats} seats used
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
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
                activeMembers.map(member => (
                  <AgentMemberCard
                    key={member.id}
                    member={member}
                    onRemove={() => handleRemoveAgent(member.id)}
                    onPromote={() => handlePromoteAgent(member.id)}
                  />
                ))
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
        </Tabs>
      </main>

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
                  <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {member.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{member.user?.name}</span>
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
    </div>
  );
}

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSites, useDeleteSite, useUpdateSite, useThemes, useLeads, useLayouts } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Plus, ExternalLink, Trash2, Globe, BarChart3, Users, MousePointerClick, TrendingUp, Pencil, MessageSquare, Mail, Phone, Calendar, ChevronRight, LayoutDashboard, UserCircle, Image, FileText, Share2, ArrowRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, subDays, isPast } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Lead } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: sites = [] } = useSites();
  const { data: themes = [] } = useThemes();
  const { data: layouts = [] } = useLayouts();
  const { data: leads = [] } = useLeads();
  const deleteSiteMutation = useDeleteSite();
  const updateSiteMutation = useUpdateSite();
  const { toast } = useToast();

  const getThemeName = (id: string) => themes.find(t => t.id === id)?.name || 'Unknown Theme';
  const getLayoutName = (id: string | null) => id ? layouts.find(l => l.id === id)?.name || 'Unknown Layout' : 'N/A';
  const getSiteName = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    return site?.title || site?.address || "Unknown Property";
  };

  // Domain Dialog State
  const [domainDialogOpen, setDomainDialogOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [domainInput, setDomainInput] = useState("");

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);

  // Analytics Dialog State
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [selectedSiteForAnalytics, setSelectedSiteForAnalytics] = useState<string | null>(null);

  // Lead Detail Dialog State
  const [leadDetailOpen, setLeadDetailOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Welcome Guide State
  const [welcomeGuideDismissed, setWelcomeGuideDismissed] = useState(() => {
    return localStorage.getItem('welcomeGuideDismissed') === 'true';
  });

  const handleDismissWelcomeGuide = () => {
    setWelcomeGuideDismissed(true);
    localStorage.setItem('welcomeGuideDismissed', 'true');
  };

  // Check if profile is incomplete
  const isProfileIncomplete = user && (
    !user.profileImageUrl || 
    !user.logo || 
    !user.name || 
    !user.phone || 
    !user.email
  );

  const profileChecklist = user ? [
    { label: 'Profile Picture', done: !!user.profileImageUrl, icon: UserCircle },
    { label: 'Logo', done: !!user.logo, icon: Image },
    { label: 'Name', done: !!user.name, icon: FileText },
    { label: 'Phone', done: !!user.phone, icon: Phone },
    { label: 'Email', done: !!user.email, icon: Mail },
  ] : [];

  const handleOpenLeadDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setLeadDetailOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeadInitials = (lead: Lead) => {
    const first = lead.firstName?.charAt(0) || '';
    const last = lead.lastName?.charAt(0) || '';
    if (first || last) return `${first}${last}`.toUpperCase();
    if (lead.email) return lead.email.charAt(0).toUpperCase();
    return '?';
  };

  const getLeadDisplayName = (lead: Lead) => {
    const name = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
    return name || lead.email || 'Unknown';
  };

  const handleOpenDomainDialog = (siteId: string, currentDomain?: string) => {
    setSelectedSiteId(siteId);
    setDomainInput(currentDomain || "");
    setDomainDialogOpen(true);
  };

  const handleSaveDomain = () => {
    if (selectedSiteId) {
      updateSiteMutation.mutate(
        { id: selectedSiteId, updates: { customDomain: domainInput } },
        {
          onSuccess: () => {
            toast({
              title: "Domain Updated",
              description: domainInput ? `Custom domain ${domainInput} connected successfully.` : "Custom domain removed.",
            });
            setDomainDialogOpen(false);
          }
        }
      );
    }
  };

  const handleDeleteClick = (siteId: string) => {
    setSiteToDelete(siteId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (siteToDelete) {
      deleteSiteMutation.mutate(siteToDelete, {
        onSuccess: () => {
          toast({
            title: "Site Deleted",
            description: "The property site has been permanently removed.",
            variant: "destructive"
          });
          setDeleteDialogOpen(false);
          setSiteToDelete(null);
        }
      });
    }
  };

  const handleOpenAnalytics = (siteId: string) => {
    setSelectedSiteForAnalytics(siteId);
    setAnalyticsDialogOpen(true);
  };

  // Mock data generation for chart based on selected site
  const analyticsData = useMemo(() => {
    if (!selectedSiteForAnalytics) return [];
    const site = sites.find(s => s.id === selectedSiteForAnalytics);
    const baseViews = site?.stats?.views || 150;
    
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        name: format(date, 'MMM dd'),
        views: Math.floor(Math.random() * (baseViews / 2)) + 10,
      };
    });
  }, [selectedSiteForAnalytics, sites]);

  const activeSite = sites.find(s => s.id === selectedSiteForAnalytics);

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
            <p className="text-muted-foreground">Manage your property sites and view leads.</p>
          </div>
          <Link href={user && user.credits > 0 ? "/create-site" : "/credits"}>
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" />
              Create New Site
            </Button>
          </Link>
        </div>

        {/* Welcome Guide Banner */}
        {isProfileIncomplete && !welcomeGuideDismissed && (
          <Card className="mb-8 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 relative overflow-hidden">
            <button 
              onClick={handleDismissWelcomeGuide}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/50 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <span className="text-2xl">👋</span> Welcome to AgentAssets!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground">
                Before creating your first property site, we recommend completing your profile. This information will appear on all your microsites, helping potential buyers connect with you.
              </p>
              
              <div className="flex flex-wrap gap-3">
                {profileChecklist.map((item) => (
                  <div 
                    key={item.label}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                      item.done 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-white/80 text-muted-foreground border border-dashed'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.done && <span className="text-green-600">✓</span>}
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link href="/profile">
                  <Button className="gap-2">
                    Complete Your Profile
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="sites" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="sites" className="gap-2" data-testid="tab-sites">
              <LayoutDashboard className="h-4 w-4" />
              Sites
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-2" data-testid="tab-leads">
              <MessageSquare className="h-4 w-4" />
              Leads
              {leads.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">{leads.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sites">
            {sites.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No sites created yet</h3>
                <p className="text-muted-foreground mb-6">Get started by creating your first property website.</p>
                <Link href={user && user.credits > 0 ? "/create-site" : "/credits"}>
                  <Button>{user && user.credits > 0 ? "Create First Site" : "Purchase Credits"}</Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sites.map((site) => (
                  <Card key={site.id} className="overflow-hidden group hover:shadow-md transition-shadow flex flex-col">
                    <div className="h-48 bg-muted relative overflow-hidden shrink-0">
                      {(site.imageUrl || (site.photos && site.photos.length > 0)) ? (
                        <img 
                          src={site.imageUrl || site.photos![0]} 
                          alt={site.address} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/5">
                          <span className="text-muted-foreground">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge variant={site.status === 'published' ? 'default' : 'secondary'}>
                          {site.status === 'published' ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1 text-lg">{site.title || site.address}</CardTitle>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Created on {format(new Date(site.createdAt), 'MMM d, yyyy')}</p>
                        {site.expiresAt && (
                          <p className={`text-sm ${isPast(new Date(site.expiresAt)) ? 'text-red-600' : 'text-green-600'}`} data-testid={`text-expires-${site.id}`}>
                            {isPast(new Date(site.expiresAt)) ? 'Expired' : 'Expires'} on {format(new Date(site.expiresAt), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium">{site.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Layout:</span>
                          <span>{getLayoutName(site.layoutId)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Theme:</span>
                          <span>{getThemeName(site.themeId)}</span>
                        </div>
                        {site.customDomain && (
                          <div className="flex justify-between items-center pt-2 border-t mt-2">
                            <span className="text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" /> Domain:</span>
                            <a href={`https://${site.customDomain}`} target="_blank" className="font-medium text-primary hover:underline truncate max-w-[150px]" title={site.customDomain}>
                              {site.customDomain}
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 border-t bg-muted/5 p-4">
                      <div className="flex gap-2 w-full">
                        <Link href={`/edit-site/${site.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full gap-1" data-testid={`button-edit-${site.id}`}>
                            <Pencil className="h-3 w-3" /> Edit
                          </Button>
                        </Link>
                        <Link href={`/site/${site.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full gap-1" data-testid={`button-view-${site.id}`}>
                            <ExternalLink className="h-3 w-3" /> View
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(site.id)}
                          data-testid={`button-delete-${site.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2 w-full">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex-1 gap-2 text-xs h-8"
                          onClick={() => handleOpenDomainDialog(site.id, site.customDomain || undefined)}
                        >
                          <Globe className="h-3 w-3" /> {site.customDomain ? 'Manage Domain' : 'Connect Domain'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 gap-2 text-xs h-8"
                          onClick={() => handleOpenAnalytics(site.id)}
                        >
                          <BarChart3 className="h-3 w-3" /> Analytics
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leads">
            {leads.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No leads yet</h3>
                <p className="text-muted-foreground mb-6">When visitors submit the contact form on your property sites, their inquiries will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  {leads.length} lead{leads.length !== 1 ? 's' : ''} from your property sites
                </p>
                {[...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((lead) => (
                  <Card 
                    key={lead.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleOpenLeadDetail(lead)}
                    data-testid={`card-lead-${lead.id}`}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-primary font-semibold text-sm">
                                {getLeadInitials(lead)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold truncate" data-testid={`text-name-${lead.id}`}>
                                {getLeadDisplayName(lead)}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {getSiteName(lead.siteId)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 ml-4">
                          <Badge className={`${getStatusColor(lead.status)} capitalize`}>
                            {lead.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {format(new Date(lead.createdAt), "MMM d, yyyy")}
                          </span>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Domain Dialog */}
      <Dialog open={domainDialogOpen} onOpenChange={setDomainDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Custom Domain</DialogTitle>
            <DialogDescription>
              Enter the domain name you want to use for this property site (e.g., www.123mainstreet.com).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                placeholder="www.example.com"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You will need to configure your DNS settings to point to our servers.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDomainDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDomain}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property site and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Site
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Analytics Dialog */}
      <Dialog open={analyticsDialogOpen} onOpenChange={setAnalyticsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Site Analytics</DialogTitle>
            <DialogDescription>
              {activeSite?.address} - Performance over the last 7 days
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                  <MousePointerClick className="h-4 w-4" />
                  <span className="text-sm">Total Views</span>
                </div>
                <span className="text-2xl font-bold">{activeSite?.stats?.views ?? 0}</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Unique Visitors</span>
                </div>
                <span className="text-2xl font-bold">{activeSite?.stats?.uniqueVisitors ?? 0}</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Leads</span>
                </div>
                <span className="text-2xl font-bold">{activeSite?.stats?.leads ?? 0}</span>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead Detail Dialog */}
      <Dialog open={leadDetailOpen} onOpenChange={setLeadDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              Form submission from {selectedLead ? getSiteName(selectedLead.siteId) : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">
                    {getLeadInitials(selectedLead)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold" data-testid="detail-name">
                    {getLeadDisplayName(selectedLead)}
                  </h3>
                  <Badge className={`${getStatusColor(selectedLead.status)} capitalize mt-1`}>
                    {selectedLead.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <a href={`mailto:${selectedLead.email}`} className="text-primary hover:underline break-all" data-testid="detail-email">
                      {selectedLead.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Phone</p>
                    <a href={`tel:${selectedLead.phone}`} className="text-primary hover:underline" data-testid="detail-phone">
                      {selectedLead.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                    <p data-testid="detail-date">{format(new Date(selectedLead.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                </div>

                {selectedLead.message && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Message</p>
                    <p className="text-sm whitespace-pre-wrap" data-testid="detail-message">{selectedLead.message}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 gap-2" asChild>
                  <a href={`mailto:${selectedLead.email}`}>
                    <Mail className="h-4 w-4" />
                    Send Email
                  </a>
                </Button>
                <Button variant="outline" className="flex-1 gap-2" asChild>
                  <a href={`tel:${selectedLead.phone}`}>
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

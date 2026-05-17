import { Navbar } from "@/components/layout/navbar";

function formatPriceDisplay(price: string | null | undefined): string {
  if (!price) return '';
  const cleaned = price.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return price;
  return '$' + num.toLocaleString('en-US');
}
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSites, useDeleteSite, useUpdateSite, useThemes, useLeads, useLayouts, useUnpublishSite, useRepublishSite, useSitePasswords, useCheckSlugAvailability, useUpdateSiteSlug, useDailyStats, useTrafficSources, useBrokerage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Plus, ExternalLink, Trash2, Globe, BarChart3, Users, MousePointerClick, TrendingUp, Pencil, MessageSquare, Mail, Phone, Calendar, ChevronRight, LayoutDashboard, UserCircle, Image, FileText, Share2, ArrowRight, X, EyeOff, Eye, Clock, AlertTriangle, Lock, Copy, Check, Link2, Building2 } from "lucide-react";
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
  const { data: brokerageData } = useBrokerage();
  const deleteSiteMutation = useDeleteSite();
  const updateSiteMutation = useUpdateSite();
  const unpublishSiteMutation = useUnpublishSite();
  const republishSiteMutation = useRepublishSite();
  const { toast } = useToast();
  
  const isBrokerageAdmin = brokerageData?.membership?.role === 'admin';
  const isBrokerageAgent = brokerageData?.membership?.role === 'agent';

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
  
  // Slug Editor State
  const [slugDialogOpen, setSlugDialogOpen] = useState(false);
  const [slugSiteId, setSlugSiteId] = useState<string | null>(null);
  const [slugInput, setSlugInput] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugReason, setSlugReason] = useState<string | null>(null);
  const checkSlugMutation = useCheckSlugAvailability();
  const updateSlugMutation = useUpdateSiteSlug();
  
  // URL Copy State
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  // Helper to get the primary URL for a site
  const getSiteUrl = (site: { subdomain?: string | null; customDomain?: string | null }) => {
    if (site.customDomain) {
      return `https://${site.customDomain}`;
    }
    if (site.subdomain) {
      return `https://agentassets.com/p/${site.subdomain}`;
    }
    return null;
  };
  
  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({ title: "Link copied!", description: "The property site URL has been copied to your clipboard." });
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast({ title: "Failed to copy", description: "Please copy the URL manually.", variant: "destructive" });
    }
  };

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);

  // Analytics Dialog State
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [selectedSiteForAnalytics, setSelectedSiteForAnalytics] = useState<string | null>(null);
  
  // Password data for analytics dialog
  const { data: sitePasswords = [] } = useSitePasswords(selectedSiteForAnalytics || '');
  
  // Traffic sources for analytics dialog
  const { data: trafficSources = [] } = useTrafficSources(selectedSiteForAnalytics || '');

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

  // Format slug to be URL-safe (lowercase, dashes instead of spaces, remove special chars)
  // Keep trailing dashes while typing so user can type "hello-world" naturally
  const formatSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')           // spaces to dashes
      .replace(/[^a-z0-9-]/g, '')     // remove non-alphanumeric except dashes
      .replace(/-+/g, '-')            // collapse multiple dashes
      .replace(/^-/, '');             // only trim leading dashes (keep trailing while typing)
  };
  
  // Final format for saving - also trims trailing dashes
  const finalizeSlug = (text: string): string => {
    return formatSlug(text).replace(/-$/, '');
  };

  const handleOpenSlugDialog = (siteId: string, currentSlug?: string) => {
    setSlugSiteId(siteId);
    setSlugInput(currentSlug || "");
    setSlugAvailable(null);
    setSlugReason(null);
    setSlugDialogOpen(true);
  };

  const handleSlugChange = (value: string) => {
    const formattedSlug = formatSlug(value);
    setSlugInput(formattedSlug);
    setSlugAvailable(null);
    setSlugReason(null);
    
    // Debounced check - only check if valid length
    if (formattedSlug.length >= 3) {
      checkSlugMutation.mutate(
        { slug: formattedSlug, siteId: slugSiteId || undefined },
        {
          onSuccess: (result) => {
            setSlugAvailable(result.available);
            setSlugReason(result.reason);
          }
        }
      );
    }
  };

  const handleSaveSlug = () => {
    const finalSlug = finalizeSlug(slugInput);
    if (slugSiteId && finalSlug && slugAvailable) {
      updateSlugMutation.mutate(
        { id: slugSiteId, slug: finalSlug },
        {
          onSuccess: () => {
            toast({
              title: "URL Updated",
              description: `Your site is now available at agentassets.com/p/${finalSlug}`,
            });
            setSlugDialogOpen(false);
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive"
            });
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

  const handleUnpublish = (siteId: string) => {
    unpublishSiteMutation.mutate(siteId, {
      onSuccess: () => {
        toast({
          title: "Site Unpublished",
          description: "Your site has been taken offline. You can republish it anytime.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const handleRepublish = (siteId: string) => {
    republishSiteMutation.mutate(siteId, {
      onSuccess: () => {
        toast({
          title: "Site Published",
          description: "Your site is now live again!",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  // Check if user has trial credits available
  const hasTrialCredits = user && (user.trialCredits || 0) > 0 && 
    user.trialEndsAt && new Date(user.trialEndsAt) > new Date();

  // Fetch daily stats for the selected site
  const { data: dailyStats = [] } = useDailyStats(selectedSiteForAnalytics || '', 7);

  // Analytics data - show daily views for last 7 days
  const analyticsData = useMemo(() => {
    // Generate all 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = date.toISOString().split('T')[0];
      const stat = dailyStats.find(s => s.date === dateStr);
      days.push({
        name: format(date, 'MMM dd'),
        views: stat?.views || 0,
        visitors: stat?.uniqueVisitors || 0,
      });
    }
    return days;
  }, [dailyStats]);

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
          <div className="flex items-center gap-3">
            {isBrokerageAdmin && (
              <Link href="/brokerage">
                <Button size="lg" variant="outline" className="gap-2" data-testid="button-brokerage-management">
                  <Building2 className="h-4 w-4" />
                  Manage Brokerage
                </Button>
              </Link>
            )}
            {user?.accountType === 'broker' && !brokerageData?.brokerage && (
              <Link href="/brokerage">
                <Button size="lg" variant="outline" className="gap-2" data-testid="button-setup-brokerage">
                  <Building2 className="h-4 w-4" />
                  Set Up Brokerage
                </Button>
              </Link>
            )}
            <Link href={isBrokerageAgent || (user && (user.credits > 0 || hasTrialCredits)) ? "/create-site" : "/credits"}>
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                Create New Site
                {hasTrialCredits && user?.credits === 0 && !isBrokerageAgent && (
                  <Badge variant="outline" className="ml-1 bg-amber-50 text-amber-700 border-amber-200 text-xs">
                    Trial
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Incomplete Banner - Always shows when profile is incomplete */}
        {isProfileIncomplete && (
          <Card className="mb-8 border-amber-200 bg-amber-50 relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-5 w-5" /> Complete Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-amber-700">
                Your contact information will appear on all your property sites. Complete your profile to ensure potential buyers can reach you.
              </p>
              
              <div className="flex flex-wrap gap-3">
                {profileChecklist.map((item) => (
                  <div 
                    key={item.label}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                      item.done 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-white/80 text-amber-700 border border-amber-200'
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
                  <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
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
                <Link href={isBrokerageAgent || (user && (user.credits > 0 || hasTrialCredits)) ? "/create-site" : "/credits"}>
                  <Button>
                    {isBrokerageAgent || (user && (user.credits > 0 || hasTrialCredits)) ? "Create First Site" : "Purchase Credits"}
                    {hasTrialCredits && user?.credits === 0 && !isBrokerageAgent && (
                      <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200 text-xs">
                        Free Trial
                      </Badge>
                    )}
                  </Button>
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
                      <div className="absolute top-3 right-3 flex gap-1">
                        {(site as any).isTrial && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Trial
                          </Badge>
                        )}
                        <Badge variant={site.status === 'published' ? 'default' : site.status === 'unpublished' ? 'outline' : 'secondary'}>
                          {site.status === 'published' ? 'Published' : site.status === 'unpublished' ? 'Unpublished' : 'Draft'}
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
                          <span className="font-medium">{formatPriceDisplay(site.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Layout:</span>
                          <span>{getLayoutName(site.layoutId)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Theme:</span>
                          <span>{getThemeName(site.themeId)}</span>
                        </div>
                        {/* Site URL with copy button */}
                        {((site as any).subdomain || site.customDomain) && (
                          <div className="pt-2 border-t mt-2 space-y-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Link2 className="h-3 w-3" />
                              <span className="text-xs">Site URL:</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <a 
                                href={getSiteUrl(site as any) || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-primary hover:underline truncate flex-1"
                                title={getSiteUrl(site as any) || ''}
                              >
                                {site.customDomain || `agentassets.com/p/${(site as any).subdomain}`}
                              </a>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => {
                                  const url = getSiteUrl(site as any);
                                  if (url) handleCopyUrl(url);
                                }}
                                data-testid={`button-copy-url-${site.id}`}
                              >
                                {copiedUrl === getSiteUrl(site as any) ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => handleOpenSlugDialog(site.id, (site as any).subdomain)}
                                data-testid={`button-edit-url-${site.id}`}
                                title="Edit URL"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </div>
                            {site.customDomain && (site as any).subdomain && (
                              <p className="text-[10px] text-muted-foreground">
                                Also: agentassets.com/p/{(site as any).subdomain}
                              </p>
                            )}
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
                        <a 
                          href={site.customDomain ? `https://${site.customDomain}` : `/p/${(site as any).subdomain}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full gap-1" data-testid={`button-view-${site.id}`}>
                            <ExternalLink className="h-3 w-3" /> View
                          </Button>
                        </a>
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
                      {site.status === 'published' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 text-xs h-8 text-muted-foreground"
                          onClick={() => handleUnpublish(site.id)}
                          disabled={unpublishSiteMutation.isPending}
                          data-testid={`button-unpublish-${site.id}`}
                        >
                          <EyeOff className="h-3 w-3" /> Unpublish Site
                        </Button>
                      ) : site.status === 'unpublished' || site.status === 'draft' ? (
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full gap-2 text-xs h-8"
                          onClick={() => handleRepublish(site.id)}
                          disabled={republishSiteMutation.isPending || (site.expiresAt && isPast(new Date(site.expiresAt)))}
                          data-testid={`button-republish-${site.id}`}
                        >
                          <Eye className="h-3 w-3" /> {site.expiresAt && isPast(new Date(site.expiresAt)) ? 'Expired' : 'Publish Site'}
                        </Button>
                      ) : null}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Connect Custom Domain</DialogTitle>
            <DialogDescription>
              Connect your own domain to this property site.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                placeholder="410brookhaven.com"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
              />
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Setup Instructions
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]">1</span>
                  <div>
                    <div className="font-medium mb-1">Add these DNS records at your registrar (GoDaddy, Namecheap, etc.):</div>
                    <div className="space-y-2">
                      <div className="bg-background rounded p-2 border">
                        <div className="font-medium mb-1 text-muted-foreground">Root domain{domainInput ? ` (${domainInput.replace(/^www\./i, '')})` : ''}:</div>
                        <div className="font-mono">
                          Type: <span className="text-foreground">A</span> &nbsp;
                          Host: <span className="text-foreground">@</span> &nbsp;
                          Value: <span className="text-foreground">34.111.179.128</span>
                        </div>
                      </div>
                      <div className="bg-background rounded p-2 border">
                        <div className="font-medium mb-1 text-muted-foreground">www subdomain:</div>
                        <div className="font-mono">
                          Type: <span className="text-foreground">CNAME</span> &nbsp;
                          Host: <span className="text-foreground">www</span> &nbsp;
                          Value: <span className="text-foreground">{domainInput ? domainInput.replace(/^www\./i, '') : 'yourdomain.com'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]">2</span>
                  <div>
                    <div className="font-medium mb-1">Save this form — AgentAssets will be notified to activate your domain.</div>
                    <div className="text-muted-foreground">After DNS propagates (usually a few minutes, up to 24 hrs) and we activate the domain on our end, your site will be live at your custom URL with SSL automatically enabled.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDomainDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDomain}>Save Domain</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Slug Editor Dialog */}
      <Dialog open={slugDialogOpen} onOpenChange={setSlugDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Site URL</DialogTitle>
            <DialogDescription>
              Customize the URL path for your property site. This is the link you'll share with potential buyers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="slug">URL Path</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">agentassets.com/p/</span>
                <div className="flex-1 relative">
                  <Input
                    id="slug"
                    placeholder="your-property-name"
                    value={slugInput}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    data-testid="input-slug"
                    className={
                      slugAvailable === true ? "border-green-500 pr-10" :
                      slugAvailable === false ? "border-red-500 pr-10" : ""
                    }
                  />
                  {slugAvailable === true && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {slugAvailable === false && (
                    <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              {slugAvailable === true && (
                <p className="text-xs text-green-600">This URL is available!</p>
              )}
              {slugReason && (
                <p className="text-xs text-red-600">{slugReason}</p>
              )}
              {slugInput.length > 0 && slugInput.length < 3 && (
                <p className="text-xs text-muted-foreground">URL must be at least 3 characters</p>
              )}
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">URL Formatting Tips</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>Use lowercase letters, numbers, and dashes only</li>
                <li>Spaces are automatically converted to dashes</li>
                <li>Example: <span className="font-mono text-foreground">123-main-street</span> or <span className="font-mono text-foreground">luxury-downtown-condo</span></li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlugDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveSlug} 
              disabled={!slugAvailable || !slugInput || updateSlugMutation.isPending}
              data-testid="button-save-slug"
            >
              {updateSlugMutation.isPending ? "Saving..." : "Save URL"}
            </Button>
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
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                  <MousePointerClick className="h-4 w-4" />
                  <span className="text-sm">Views</span>
                </div>
                <span className="text-2xl font-bold">{activeSite?.stats?.views ?? 0}</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Visitors</span>
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
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm">Conversion</span>
                </div>
                <span className="text-2xl font-bold">
                  {activeSite?.stats?.uniqueVisitors && activeSite.stats.uniqueVisitors > 0
                    ? `${((activeSite.stats.leads / activeSite.stats.uniqueVisitors) * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
            </div>

            {/* Password Usage Section */}
            {sitePasswords.length > 0 && (
              <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
                  <Lock className="h-4 w-4" />
                  Password Usage
                </div>
                <div className="space-y-2">
                  {sitePasswords.map((pw) => (
                    <div key={pw.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{pw.label || "Unnamed Password"}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{pw.usageCount} use{pw.usageCount !== 1 ? 's' : ''}</span>
                        {pw.lastUsedAt && (
                          <span className="text-xs text-muted-foreground">
                            Last: {format(new Date(pw.lastUsedAt), "MMM d")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                  Total password uses: {sitePasswords.reduce((sum, pw) => sum + pw.usageCount, 0)}
                </div>
              </div>
            )}

            {/* Traffic Sources */}
            {trafficSources.length > 0 && (
              <div className="mb-6 p-4 bg-muted/30 border rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Globe className="h-4 w-4" />
                  Traffic Sources
                </div>
                <div className="space-y-2">
                  {(() => {
                    const totalVisitors = trafficSources.reduce((sum, s) => sum + s.count, 0);
                    const sourceLabels: Record<string, string> = {
                      direct: 'Direct',
                      social: 'Social Media',
                      search: 'Search Engines',
                      referral: 'Referrals'
                    };
                    const sourceColors: Record<string, string> = {
                      direct: 'bg-blue-500',
                      social: 'bg-pink-500',
                      search: 'bg-green-500',
                      referral: 'bg-purple-500'
                    };
                    return trafficSources.map((source) => {
                      const percentage = totalVisitors > 0 ? (source.count / totalVisitors) * 100 : 0;
                      return (
                        <div key={source.id} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${sourceColors[source.source] || 'bg-gray-400'}`} />
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span>{sourceLabels[source.source] || source.source}</span>
                              <span className="font-medium">{source.count} ({percentage.toFixed(0)}%)</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                              <div 
                                className={`h-full ${sourceColors[source.source] || 'bg-gray-400'} rounded-full transition-all`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="views" name="Page Views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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

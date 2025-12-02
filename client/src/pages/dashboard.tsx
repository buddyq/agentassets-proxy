import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TEMPLATES } from "@/lib/store";
import { useSites, useDeleteSite, useUpdateSite, useThemes, useAddPhotoToSite, useRemovePhotoFromSite, getUploadUrl } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Plus, ExternalLink, Trash2, Globe, BarChart3, Users, MousePointerClick, TrendingUp, Image, X, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, subDays } from "date-fns";
import { ObjectUploader } from "@/components/ObjectUploader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  const deleteSiteMutation = useDeleteSite();
  const updateSiteMutation = useUpdateSite();
  const addPhotoMutation = useAddPhotoToSite();
  const removePhotoMutation = useRemovePhotoFromSite();
  const { toast } = useToast();

  const getThemeName = (id: string) => themes.find(t => t.id === id)?.name || 'Unknown Theme';
  const getTemplateName = (id: string) => TEMPLATES.find(t => t.id === id)?.name || 'Unknown Template';

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

  // Photos Dialog State
  const [photosDialogOpen, setPhotosDialogOpen] = useState(false);
  const [selectedSiteForPhotos, setSelectedSiteForPhotos] = useState<string | null>(null);

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

  const handleOpenPhotos = (siteId: string) => {
    setSelectedSiteForPhotos(siteId);
    setPhotosDialogOpen(true);
  };

  const handlePhotoUploadComplete = (result: any) => {
    if (result.successful && result.successful.length > 0 && selectedSiteForPhotos) {
      const uploadUrl = result.successful[0].uploadURL;
      addPhotoMutation.mutate(
        { siteId: selectedSiteForPhotos, photoUrl: uploadUrl },
        {
          onSuccess: () => {
            toast({
              title: "Photo Added",
              description: "Photo has been added to your property site.",
            });
          }
        }
      );
    }
  };

  const handleRemovePhoto = (photoUrl: string) => {
    if (selectedSiteForPhotos) {
      removePhotoMutation.mutate(
        { siteId: selectedSiteForPhotos, photoUrl },
        {
          onSuccess: () => {
            toast({
              title: "Photo Removed",
              description: "Photo has been removed from your property site.",
            });
          }
        }
      );
    }
  };

  const photosSite = sites.find(s => s.id === selectedSiteForPhotos);

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
            <h1 className="text-3xl font-bold text-secondary">My Property Sites</h1>
            <p className="text-muted-foreground">Manage your listings and create new microsites.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
              <span className="text-sm text-muted-foreground block">Available Credits</span>
              <span className="text-2xl font-bold text-primary">{user?.credits ?? 0}</span>
            </div>
            <Link href={user && user.credits > 0 ? "/create-site" : "/credits"}>
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                Create New Site
              </Button>
            </Link>
          </div>
        </div>

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
                  {site.imageUrl ? (
                    <img src={site.imageUrl} alt={site.address} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
                  <p className="text-sm text-muted-foreground">Created on {format(new Date(site.createdAt), 'MMM d, yyyy')}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">{site.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Template:</span>
                      <span>{getTemplateName(site.templateId)}</span>
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={() => handleOpenPhotos(site.id)}
                    >
                      <Image className="h-3 w-3" /> Photos
                    </Button>
                    <Link href={`/site/${site.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1">
                        <ExternalLink className="h-3 w-3" /> View
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(site.id)}
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

      {/* Photos Dialog */}
      <Dialog open={photosDialogOpen} onOpenChange={setPhotosDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Photos</DialogTitle>
            <DialogDescription>
              {photosSite?.address} - Add or remove property photos
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-6">
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760}
                onGetUploadParameters={async () => {
                  const { url } = await getUploadUrl();
                  return { method: 'PUT' as const, url };
                }}
                onComplete={handlePhotoUploadComplete}
                buttonClassName="w-full"
              >
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload New Photo</span>
                </div>
              </ObjectUploader>
            </div>

            {photosSite?.photos && photosSite.photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {photosSite.photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img 
                      src={photo} 
                      alt={`Property photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      className="absolute top-2 right-2 bg-destructive text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemovePhoto(photo)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No photos uploaded yet</p>
                <p className="text-sm text-muted-foreground">Click the button above to add photos</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

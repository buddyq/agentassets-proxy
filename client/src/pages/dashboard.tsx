import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore, TEMPLATES } from "@/lib/store";
import { Link } from "wouter";
import { Plus, ExternalLink, Edit, Trash2, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { sites, user, deleteSite, themes, updateSite } = useStore();
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

  const handleOpenDomainDialog = (siteId: string, currentDomain?: string) => {
    setSelectedSiteId(siteId);
    setDomainInput(currentDomain || "");
    setDomainDialogOpen(true);
  };

  const handleSaveDomain = () => {
    if (selectedSiteId) {
      updateSite(selectedSiteId, { customDomain: domainInput });
      toast({
        title: "Domain Updated",
        description: domainInput ? `Custom domain ${domainInput} connected successfully.` : "Custom domain removed.",
      });
      setDomainDialogOpen(false);
    }
  };

  const handleDeleteClick = (siteId: string) => {
    setSiteToDelete(siteId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (siteToDelete) {
      deleteSite(siteToDelete);
      toast({
        title: "Site Deleted",
        description: "The property site has been permanently removed.",
        variant: "destructive"
      });
      setDeleteDialogOpen(false);
      setSiteToDelete(null);
    }
  };

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
              <span className="text-2xl font-bold text-primary">{user.credits}</span>
            </div>
            <Link href="/create-site">
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
            <Link href="/create-site">
              <Button>Create First Site</Button>
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
                  <CardTitle className="line-clamp-1 text-lg">{site.address}</CardTitle>
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
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Edit className="h-3 w-3" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <ExternalLink className="h-3 w-3" /> View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(site.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full gap-2 text-xs h-8"
                    onClick={() => handleOpenDomainDialog(site.id, site.customDomain)}
                  >
                    <Globe className="h-3 w-3" /> {site.customDomain ? 'Manage Domain' : 'Connect Domain'}
                  </Button>
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
            <Button onClick={handleSaveDomain}>Save Domain</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your property site
              and remove your data from our servers.
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

      <Footer />
    </div>
  );
}

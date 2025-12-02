import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Theme, Layout } from "@shared/schema";
import { useThemes, useCreateTheme, useUpdateTheme, useDeleteTheme, useLayouts, useCreateLayout, useUpdateLayout, useDeleteLayout } from "@/lib/api";
import { Plus, Palette, Trash2, Shield, Pencil, LayoutTemplate } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { data: themes = [] } = useThemes();
  const { data: layouts = [] } = useLayouts({ preset: true });
  const createThemeMutation = useCreateTheme();
  const updateThemeMutation = useUpdateTheme();
  const deleteThemeMutation = useDeleteTheme();
  const createLayoutMutation = useCreateLayout();
  const updateLayoutMutation = useUpdateLayout();
  const deleteLayoutMutation = useDeleteLayout();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLayoutDialogOpen, setIsLayoutDialogOpen] = useState(false);
  const [isLayoutEditDialogOpen, setIsLayoutEditDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [editingLayout, setEditingLayout] = useState<Layout | null>(null);
  const { toast } = useToast();

  const [newThemeName, setNewThemeName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");

  const [editName, setEditName] = useState("");
  const [editPrimaryColor, setEditPrimaryColor] = useState("#000000");
  const [editSecondaryColor, setEditSecondaryColor] = useState("#ffffff");
  const [editBackgroundColor, setEditBackgroundColor] = useState("#ffffff");
  const [editTextColor, setEditTextColor] = useState("#000000");

  const [newLayoutName, setNewLayoutName] = useState("");
  const [newLayoutDescription, setNewLayoutDescription] = useState("");
  const [newLayoutHeroStyle, setNewLayoutHeroStyle] = useState<"fullscreen" | "split" | "minimal" | "slider">("fullscreen");
  const [newLayoutGalleryStyle, setNewLayoutGalleryStyle] = useState<"grid" | "masonry" | "carousel" | "lightbox">("grid");
  const [newLayoutTypographyScale, setNewLayoutTypographyScale] = useState<"compact" | "normal" | "spacious">("normal");

  const [editLayoutName, setEditLayoutName] = useState("");
  const [editLayoutDescription, setEditLayoutDescription] = useState("");
  const [editLayoutHeroStyle, setEditLayoutHeroStyle] = useState<"fullscreen" | "split" | "minimal" | "slider">("fullscreen");
  const [editLayoutGalleryStyle, setEditLayoutGalleryStyle] = useState<"grid" | "masonry" | "carousel" | "lightbox">("grid");
  const [editLayoutTypographyScale, setEditLayoutTypographyScale] = useState<"compact" | "normal" | "spacious">("normal");

  const handleCreatePreset = () => {
    if (!newThemeName) return;
    
    createThemeMutation.mutate(
      {
        name: newThemeName,
        type: 'preset',
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          background: backgroundColor,
          text: textColor
        },
        logoUrl: null
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setNewThemeName("");
          setPrimaryColor("#000000");
          setSecondaryColor("#ffffff");
          setBackgroundColor("#ffffff");
          setTextColor("#000000");
          toast({
            title: "Global Theme Created",
            description: "New preset theme added to the library for all users.",
          });
        }
      }
    );
  };

  const handleEditTheme = (theme: Theme) => {
    setEditingTheme(theme);
    setEditName(theme.name);
    setEditPrimaryColor(theme.colors.primary);
    setEditSecondaryColor(theme.colors.secondary);
    setEditBackgroundColor(theme.colors.background);
    setEditTextColor(theme.colors.text);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingTheme || !editName) return;

    updateThemeMutation.mutate(
      {
        id: editingTheme.id,
        updates: {
          name: editName,
          colors: {
            primary: editPrimaryColor,
            secondary: editSecondaryColor,
            background: editBackgroundColor,
            text: editTextColor
          }
        }
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setEditingTheme(null);
          toast({
            title: "Theme Updated",
            description: "Global theme has been updated successfully.",
          });
        }
      }
    );
  };

  const handleDeleteTheme = (themeId: string) => {
    if (confirm("Are you sure you want to delete this theme? This action cannot be undone.")) {
      deleteThemeMutation.mutate(themeId, {
        onSuccess: () => {
          toast({
            title: "Theme Deleted",
            description: "Global theme has been removed.",
          });
        }
      });
    }
  };

  const handleCreateLayout = () => {
    if (!newLayoutName) return;
    
    createLayoutMutation.mutate(
      {
        name: newLayoutName,
        description: newLayoutDescription || null,
        type: 'preset',
        thumbnailUrl: null,
        structure: {
          heroStyle: newLayoutHeroStyle,
          galleryStyle: newLayoutGalleryStyle,
          detailsStyle: 'sidebar' as const,
          typography: {
            headingFont: 'Inter',
            bodyFont: 'Inter',
            headingWeight: '700',
            scale: newLayoutTypographyScale
          },
          sections: ['hero', 'details', 'description', 'gallery', 'video', 'contact']
        }
      },
      {
        onSuccess: () => {
          setIsLayoutDialogOpen(false);
          setNewLayoutName("");
          setNewLayoutDescription("");
          setNewLayoutHeroStyle("fullscreen");
          setNewLayoutGalleryStyle("grid");
          setNewLayoutTypographyScale("normal");
          toast({
            title: "Layout Created",
            description: "New global layout added to the library.",
          });
        }
      }
    );
  };

  const handleEditLayout = (layout: Layout) => {
    setEditingLayout(layout);
    setEditLayoutName(layout.name);
    setEditLayoutDescription(layout.description || "");
    setEditLayoutHeroStyle(layout.structure?.heroStyle || "fullscreen");
    setEditLayoutGalleryStyle(layout.structure?.galleryStyle || "grid");
    setEditLayoutTypographyScale(layout.structure?.typography?.scale || "normal");
    setIsLayoutEditDialogOpen(true);
  };

  const handleSaveLayoutEdit = () => {
    if (!editingLayout || !editLayoutName) return;

    updateLayoutMutation.mutate(
      {
        id: editingLayout.id,
        updates: {
          name: editLayoutName,
          description: editLayoutDescription || null,
          structure: {
            heroStyle: editLayoutHeroStyle,
            galleryStyle: editLayoutGalleryStyle,
            detailsStyle: editingLayout.structure?.detailsStyle || 'sidebar',
            typography: {
              headingFont: editingLayout.structure?.typography?.headingFont || 'Inter',
              bodyFont: editingLayout.structure?.typography?.bodyFont || 'Inter',
              headingWeight: editingLayout.structure?.typography?.headingWeight || '700',
              scale: editLayoutTypographyScale
            },
            sections: editingLayout.structure?.sections || ['hero', 'details', 'description', 'gallery', 'video', 'contact']
          }
        }
      },
      {
        onSuccess: () => {
          setIsLayoutEditDialogOpen(false);
          setEditingLayout(null);
          toast({
            title: "Layout Updated",
            description: "Global layout has been updated successfully.",
          });
        }
      }
    );
  };

  const handleDeleteLayout = (layoutId: string) => {
    if (confirm("Are you sure you want to delete this layout? This action cannot be undone.")) {
      deleteLayoutMutation.mutate(layoutId, {
        onSuccess: () => {
          toast({
            title: "Layout Deleted",
            description: "Global layout has been removed.",
          });
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-full">
                    <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-secondary">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage global assets and system-wide settings.</p>
                </div>
            </div>
        </div>

        <Tabs defaultValue="themes" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="themes" className="gap-2">
              <Palette className="h-4 w-4" />
              Color Themes
            </TabsTrigger>
            <TabsTrigger value="layouts" className="gap-2">
              <LayoutTemplate className="h-4 w-4" />
              Layouts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="themes">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-secondary">Global Theme Library</h2>
                <p className="text-muted-foreground">Add and edit themes that will be available to all agents.</p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-secondary hover:bg-secondary/90" data-testid="button-add-theme">
                <Plus className="h-4 w-4" />
                Add Global Preset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Global Theme Preset</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Theme Name</Label>
                  <Input 
                    id="name" 
                    value={newThemeName} 
                    onChange={(e) => setNewThemeName(e.target.value)}
                    placeholder="e.g., Corporate Blue 2025" 
                    data-testid="input-theme-name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="primary">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="primary" 
                        type="color" 
                        className="w-12 h-10 p-1" 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                      />
                      <Input 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="uppercase"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="secondary">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="secondary" 
                        type="color" 
                        className="w-12 h-10 p-1" 
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                      />
                      <Input 
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="uppercase"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="background">Background Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="background" 
                        type="color" 
                        className="w-12 h-10 p-1" 
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                      />
                      <Input 
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="uppercase"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="text">Text Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="text" 
                        type="color" 
                        className="w-12 h-10 p-1" 
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                      />
                      <Input 
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="uppercase"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-2">Preview</p>
                  <div className="flex gap-2">
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg border shadow-sm mb-1" 
                        style={{ backgroundColor: primaryColor }}
                      />
                      <span className="text-xs text-muted-foreground">Primary</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg border shadow-sm mb-1" 
                        style={{ backgroundColor: secondaryColor }}
                      />
                      <span className="text-xs text-muted-foreground">Secondary</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg border shadow-sm mb-1" 
                        style={{ backgroundColor: backgroundColor }}
                      />
                      <span className="text-xs text-muted-foreground">Background</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg border shadow-sm mb-1" 
                        style={{ backgroundColor: textColor }}
                      />
                      <span className="text-xs text-muted-foreground">Text</span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreatePreset} disabled={!newThemeName} data-testid="button-create-theme">Create Preset</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Global Theme</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Theme Name</Label>
                <Input 
                  id="edit-name" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g., Corporate Blue 2025" 
                  data-testid="input-edit-theme-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-primary">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="edit-primary" 
                      type="color" 
                      className="w-12 h-10 p-1" 
                      value={editPrimaryColor}
                      onChange={(e) => setEditPrimaryColor(e.target.value)}
                    />
                    <Input 
                      value={editPrimaryColor}
                      onChange={(e) => setEditPrimaryColor(e.target.value)}
                      className="uppercase"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-secondary">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="edit-secondary" 
                      type="color" 
                      className="w-12 h-10 p-1" 
                      value={editSecondaryColor}
                      onChange={(e) => setEditSecondaryColor(e.target.value)}
                    />
                    <Input 
                      value={editSecondaryColor}
                      onChange={(e) => setEditSecondaryColor(e.target.value)}
                      className="uppercase"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-background">Background Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="edit-background" 
                      type="color" 
                      className="w-12 h-10 p-1" 
                      value={editBackgroundColor}
                      onChange={(e) => setEditBackgroundColor(e.target.value)}
                    />
                    <Input 
                      value={editBackgroundColor}
                      onChange={(e) => setEditBackgroundColor(e.target.value)}
                      className="uppercase"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-text">Text Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="edit-text" 
                      type="color" 
                      className="w-12 h-10 p-1" 
                      value={editTextColor}
                      onChange={(e) => setEditTextColor(e.target.value)}
                    />
                    <Input 
                      value={editTextColor}
                      onChange={(e) => setEditTextColor(e.target.value)}
                      className="uppercase"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Preview</p>
                <div className="flex gap-2">
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-lg border shadow-sm mb-1" 
                      style={{ backgroundColor: editPrimaryColor }}
                    />
                    <span className="text-xs text-muted-foreground">Primary</span>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-lg border shadow-sm mb-1" 
                      style={{ backgroundColor: editSecondaryColor }}
                    />
                    <span className="text-xs text-muted-foreground">Secondary</span>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-lg border shadow-sm mb-1" 
                      style={{ backgroundColor: editBackgroundColor }}
                    />
                    <span className="text-xs text-muted-foreground">Background</span>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-lg border shadow-sm mb-1" 
                      style={{ backgroundColor: editTextColor }}
                    />
                    <span className="text-xs text-muted-foreground">Text</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={!editName} data-testid="button-save-theme">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {themes.filter(t => t.type === 'preset').map((theme) => (
            <Card key={theme.id} className="overflow-hidden border-2 border-secondary/20" data-testid={`card-theme-${theme.id}`}>
              <CardHeader className="pb-2 bg-secondary/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="h-4 w-4" style={{ color: theme.colors.primary }} />
                    {theme.name}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEditTheme(theme)}
                      data-testid={`button-edit-theme-${theme.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTheme(theme.id)}
                      data-testid={`button-delete-theme-${theme.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex gap-2 mb-2">
                  <div className="text-center">
                    <div 
                      className="w-10 h-10 rounded-lg border shadow-sm" 
                      style={{ backgroundColor: theme.colors.primary }}
                      title="Primary"
                    />
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-10 h-10 rounded-lg border shadow-sm" 
                      style={{ backgroundColor: theme.colors.secondary }}
                      title="Secondary"
                    />
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-10 h-10 rounded-lg border shadow-sm" 
                      style={{ backgroundColor: theme.colors.background }}
                      title="Background"
                    />
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-10 h-10 rounded-lg border shadow-sm" 
                      style={{ backgroundColor: theme.colors.text }}
                      title="Text"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Available to all users</p>
              </CardContent>
            </Card>
          ))}
        </div>
          </TabsContent>

          <TabsContent value="layouts">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-secondary">Global Layout Library</h2>
                <p className="text-muted-foreground">Add and edit layouts that will be available to all agents.</p>
              </div>
              
              <Dialog open={isLayoutDialogOpen} onOpenChange={setIsLayoutDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-secondary hover:bg-secondary/90" data-testid="button-add-layout">
                    <Plus className="h-4 w-4" />
                    Add Global Layout
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Global Layout</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="layout-name">Layout Name</Label>
                      <Input 
                        id="layout-name" 
                        value={newLayoutName} 
                        onChange={(e) => setNewLayoutName(e.target.value)}
                        placeholder="e.g., Modern Split" 
                        data-testid="input-layout-name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="layout-description">Description</Label>
                      <Textarea 
                        id="layout-description" 
                        value={newLayoutDescription} 
                        onChange={(e) => setNewLayoutDescription(e.target.value)}
                        placeholder="Describe this layout..." 
                        data-testid="input-layout-description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Hero Style</Label>
                        <Select value={newLayoutHeroStyle} onValueChange={(v) => setNewLayoutHeroStyle(v as "fullscreen" | "split" | "minimal" | "slider")}>
                          <SelectTrigger data-testid="select-hero-style">
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fullscreen">Fullscreen</SelectItem>
                            <SelectItem value="split">Split</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                            <SelectItem value="slider">Slider</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Gallery Style</Label>
                        <Select value={newLayoutGalleryStyle} onValueChange={(v) => setNewLayoutGalleryStyle(v as "grid" | "masonry" | "carousel" | "lightbox")}>
                          <SelectTrigger data-testid="select-gallery-style">
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">Grid</SelectItem>
                            <SelectItem value="masonry">Masonry</SelectItem>
                            <SelectItem value="carousel">Carousel</SelectItem>
                            <SelectItem value="lightbox">Lightbox</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Typography Scale</Label>
                      <Select value={newLayoutTypographyScale} onValueChange={(v) => setNewLayoutTypographyScale(v as "compact" | "normal" | "spacious")}>
                        <SelectTrigger data-testid="select-typography-scale">
                          <SelectValue placeholder="Select scale" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="spacious">Spacious</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsLayoutDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateLayout} disabled={!newLayoutName} data-testid="button-create-layout">Create Layout</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Dialog open={isLayoutEditDialogOpen} onOpenChange={setIsLayoutEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Global Layout</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-layout-name">Layout Name</Label>
                    <Input 
                      id="edit-layout-name" 
                      value={editLayoutName} 
                      onChange={(e) => setEditLayoutName(e.target.value)}
                      placeholder="e.g., Modern Split" 
                      data-testid="input-edit-layout-name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-layout-description">Description</Label>
                    <Textarea 
                      id="edit-layout-description" 
                      value={editLayoutDescription} 
                      onChange={(e) => setEditLayoutDescription(e.target.value)}
                      placeholder="Describe this layout..." 
                      data-testid="input-edit-layout-description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Hero Style</Label>
                      <Select value={editLayoutHeroStyle} onValueChange={(v) => setEditLayoutHeroStyle(v as "fullscreen" | "split" | "minimal" | "slider")}>
                        <SelectTrigger data-testid="select-edit-hero-style">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fullscreen">Fullscreen</SelectItem>
                          <SelectItem value="split">Split</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="slider">Slider</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Gallery Style</Label>
                      <Select value={editLayoutGalleryStyle} onValueChange={(v) => setEditLayoutGalleryStyle(v as "grid" | "masonry" | "carousel" | "lightbox")}>
                        <SelectTrigger data-testid="select-edit-gallery-style">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grid</SelectItem>
                          <SelectItem value="masonry">Masonry</SelectItem>
                          <SelectItem value="carousel">Carousel</SelectItem>
                          <SelectItem value="lightbox">Lightbox</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Typography Scale</Label>
                    <Select value={editLayoutTypographyScale} onValueChange={(v) => setEditLayoutTypographyScale(v as "compact" | "normal" | "spacious")}>
                      <SelectTrigger data-testid="select-edit-typography-scale">
                        <SelectValue placeholder="Select scale" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="spacious">Spacious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsLayoutEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveLayoutEdit} disabled={!editLayoutName} data-testid="button-save-layout">Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {layouts.map((layout) => (
                <Card key={layout.id} className="overflow-hidden border-2 border-secondary/20" data-testid={`card-layout-${layout.id}`}>
                  <CardHeader className="pb-2 bg-secondary/5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <LayoutTemplate className="h-4 w-4 text-primary" />
                        {layout.name}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEditLayout(layout)}
                          data-testid={`button-edit-layout-${layout.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteLayout(layout.id)}
                          data-testid={`button-delete-layout-${layout.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-3">{layout.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        {layout.structure?.heroStyle}
                      </span>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        {layout.structure?.galleryStyle}
                      </span>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        {layout.structure?.typography?.scale}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Available to all users</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

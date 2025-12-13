import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Theme } from "@shared/schema";
import { useThemes, useCreateTheme, useDeleteTheme, useUpdateTheme } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Palette, Trash2, Check, Edit2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Themes() {
  const { user } = useAuth();
  const { data: presetThemes = [] } = useThemes({ preset: true });
  const { data: userThemes = [] } = useThemes({ userId: user?.id });
  const createThemeMutation = useCreateTheme();
  const updateThemeMutation = useUpdateTheme();
  const deleteThemeMutation = useDeleteTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const { toast } = useToast();

  // Form State
  const [newThemeName, setNewThemeName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");

  const handleCreateTheme = () => {
    if (!newThemeName) return;
    
    createThemeMutation.mutate(
      {
        name: newThemeName,
        type: 'custom',
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          background: backgroundColor,
          text: textColor
        }
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
          toast({
            title: "Theme Created",
            description: "Your new custom theme has been saved.",
            variant: "success",
          });
        }
      }
    );
  };

  const handleEditTheme = (theme: Theme) => {
    setSelectedThemeId(theme.id);
    setNewThemeName(theme.name);
    setPrimaryColor(theme.colors.primary);
    setSecondaryColor(theme.colors.secondary);
    setBackgroundColor(theme.colors.background);
    setTextColor(theme.colors.text);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!newThemeName || !selectedThemeId) return;
    
    updateThemeMutation.mutate(
      {
        id: selectedThemeId,
        updates: {
          name: newThemeName,
          colors: {
            primary: primaryColor,
            secondary: secondaryColor,
            background: backgroundColor,
            text: textColor
          }
        }
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
          setIsEditMode(false);
          setSelectedThemeId(null);
          toast({
            title: "Theme Updated",
            description: "Your custom theme has been updated.",
            variant: "success",
          });
        }
      }
    );
  };

  const resetForm = () => {
    setNewThemeName("");
    setPrimaryColor("#000000");
    setSecondaryColor("#ffffff");
    setBackgroundColor("#ffffff");
    setTextColor("#000000");
    setIsEditMode(false);
    setSelectedThemeId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Theme Library</h1>
            <p className="text-muted-foreground">Manage your brand colors and logos.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Theme
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Edit Theme' : 'Create Custom Theme'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Theme Name</Label>
                  <Input 
                    id="name" 
                    value={newThemeName} 
                    onChange={(e) => setNewThemeName(e.target.value)}
                    placeholder="e.g., Luxury Brand 2025" 
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
                  <div className="flex gap-3">
                    <div className="text-center">
                      <div 
                        className="w-10 h-10 rounded-lg border shadow-sm mb-1" 
                        style={{ backgroundColor: primaryColor }}
                      />
                      <span className="text-xs text-muted-foreground">Primary</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-10 h-10 rounded-lg border shadow-sm mb-1" 
                        style={{ backgroundColor: secondaryColor }}
                      />
                      <span className="text-xs text-muted-foreground">Secondary</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-10 h-10 rounded-lg border shadow-sm mb-1" 
                        style={{ backgroundColor: backgroundColor }}
                      />
                      <span className="text-xs text-muted-foreground">Background</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-10 h-10 rounded-lg border shadow-sm mb-1" 
                        style={{ backgroundColor: textColor }}
                      />
                      <span className="text-xs text-muted-foreground">Text</span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>Cancel</Button>
                <Button onClick={isEditMode ? handleSaveEdit : handleCreateTheme} disabled={!newThemeName}>
                  {isEditMode ? 'Save Changes' : 'Create Theme'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* My Custom Themes */}
        {userThemes.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              My Custom Themes
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userThemes.map((theme) => (
                <Card key={theme.id} className="overflow-hidden border-primary/20">
                  <CardHeader className="pb-2 bg-primary/5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Palette className="h-4 w-4" style={{ color: theme.colors.primary }} />
                        {theme.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex gap-2 mb-4">
                      <div 
                        className="w-10 h-10 rounded-lg border shadow-sm" 
                        style={{ backgroundColor: theme.colors.primary }}
                        title="Primary"
                      />
                      <div 
                        className="w-10 h-10 rounded-lg border shadow-sm" 
                        style={{ backgroundColor: theme.colors.secondary }}
                        title="Secondary"
                      />
                      <div 
                        className="w-10 h-10 rounded-lg border shadow-sm" 
                        style={{ backgroundColor: theme.colors.background }}
                        title="Background"
                      />
                      <div 
                        className="w-10 h-10 rounded-lg border shadow-sm" 
                        style={{ backgroundColor: theme.colors.text }}
                        title="Text"
                      />
                    </div>
                    {theme.logoUrl && (
                      <div className="h-8 flex items-center">
                        <img src={theme.logoUrl} alt={`${theme.name} logo`} className="max-h-full max-w-full object-contain" />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-3 gap-2 flex">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 hover:bg-primary/10 hover:border-primary/50"
                      onClick={() => handleEditTheme(theme)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      onClick={() => {
                        deleteThemeMutation.mutate(theme.id, {
                          onSuccess: () => {
                            toast({
                              title: "Theme Deleted",
                              description: `${theme.name} has been removed.`,
                              variant: "success",
                            });
                          }
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Preset Themes */}
        {presetThemes.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-6 text-muted-foreground">Preset Themes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {presetThemes.map((theme) => (
                <Card key={theme.id} className="overflow-hidden opacity-75">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Palette className="h-4 w-4" style={{ color: theme.colors.primary }} />
                        {theme.name}
                      </CardTitle>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Preset</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <div 
                        className="w-10 h-10 rounded-lg border shadow-sm" 
                        style={{ backgroundColor: theme.colors.primary }}
                        title="Primary"
                      />
                      <div 
                        className="w-10 h-10 rounded-lg border shadow-sm" 
                        style={{ backgroundColor: theme.colors.secondary }}
                        title="Secondary"
                      />
                      <div 
                        className="w-10 h-10 rounded-lg border shadow-sm" 
                        style={{ backgroundColor: theme.colors.background }}
                        title="Background"
                      />
                      <div 
                        className="w-10 h-10 rounded-lg border shadow-sm" 
                        style={{ backgroundColor: theme.colors.text }}
                        title="Text"
                      />
                    </div>
                    {theme.logoUrl && (
                      <div className="h-8 flex items-center">
                        <img src={theme.logoUrl} alt={`${theme.name} logo`} className="max-h-full max-w-full object-contain" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

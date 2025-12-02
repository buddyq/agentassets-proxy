import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Theme } from "@shared/schema";
import { useThemes, useCreateTheme } from "@/lib/api";
import { Plus, Palette, Trash2, Check, Upload, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Themes() {
  const { data: themes = [] } = useThemes();
  const createThemeMutation = useCreateTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // New Theme State
  const [newThemeName, setNewThemeName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  const handleCreateTheme = () => {
    if (!newThemeName) return;
    
    createThemeMutation.mutate(
      {
        name: newThemeName,
        type: 'custom',
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          background: '#ffffff',
          text: '#000000'
        },
        logoUrl: logoUrl || null
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
          toast({
            title: "Theme Created",
            description: "Your new custom theme has been saved.",
          });
        }
      }
    );
  };

  const resetForm = () => {
    setNewThemeName("");
    setPrimaryColor("#000000");
    setSecondaryColor("#ffffff");
    setLogoUrl(undefined);
  };

  // Mock logo upload
  const handleLogoUpload = () => {
    setLogoUrl("https://via.placeholder.com/150x50?text=LOGO");
    toast({
      title: "Logo Uploaded",
      description: "Logo successfully attached to this theme.",
    });
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
                <DialogTitle>Create Custom Theme</DialogTitle>
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
                
                <div className="grid gap-2">
                  <Label>Logo (Optional)</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    {logoUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={logoUrl} alt="Logo preview" className="max-h-12" />
                        <Button variant="ghost" size="sm" onClick={() => setLogoUrl(undefined)}>Remove</Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                        <Button variant="outline" size="sm" onClick={handleLogoUpload}>
                          <Upload className="h-4 w-4 mr-2" /> Upload Logo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-2">Preview</p>
                  <div className="flex gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg border shadow-sm" 
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div 
                      className="w-12 h-12 rounded-lg border shadow-sm" 
                      style={{ backgroundColor: secondaryColor }}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateTheme} disabled={!newThemeName}>Create Theme</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {themes.map((theme) => (
            <Card key={theme.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="h-4 w-4" style={{ color: theme.colors.primary }} />
                    {theme.name}
                  </CardTitle>
                  {theme.type === 'preset' && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Preset</span>
                  )}
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
              {theme.type === 'custom' && (
                <CardFooter className="border-t pt-4">
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 w-full">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_USER_ID } from "@/lib/store";
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
        logoUrl: logoUrl || null,
        userId: DEMO_USER_ID
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
    // In a real app, this would upload to a server
    // Here we just simulate a success
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
                        className="uppercase font-mono"
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
                        className="uppercase font-mono"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label>Brand Logo</Label>
                  <div 
                    className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={handleLogoUpload}
                  >
                    {logoUrl ? (
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium text-primary">Logo Uploaded</span>
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={(e) => { e.stopPropagation(); setLogoUrl(undefined); }}>Remove</Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Click to upload logo</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="p-4 rounded border bg-muted/20 mt-2">
                  <Label className="mb-2 block text-xs font-medium uppercase text-muted-foreground">Preview</Label>
                  <div className="h-32 rounded flex flex-col overflow-hidden border shadow-sm bg-white">
                    <div className="h-12 flex items-center px-4 justify-between border-b">
                      <div className="font-bold flex items-center gap-2" style={{ color: primaryColor }}>
                         {logoUrl && <div className="h-6 w-6 bg-current rounded-full opacity-20"></div>}
                         <span>BRAND</span>
                      </div>
                      <div className="flex gap-3 text-xs font-medium" style={{ color: secondaryColor }}>
                        <span>Home</span>
                        <span>About</span>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center text-white relative" style={{ backgroundColor: primaryColor }}>
                      <div className="z-10 font-medium">Hero Section</div>
                      <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateTheme} disabled={!newThemeName}>Save Theme</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5" /> Your Custom Themes
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {themes.filter(t => t.type === 'custom').length === 0 ? (
               <div className="col-span-full text-muted-foreground text-sm italic p-8 border border-dashed rounded flex flex-col items-center justify-center gap-2">
                 <Palette className="h-8 w-8 text-muted-foreground/50" />
                 No custom themes created yet.
               </div>
            ) : (
              themes.filter(t => t.type === 'custom').map(theme => (
                <ThemeCard key={theme.id} theme={theme} />
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">Preset Library</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {themes.filter(t => t.type === 'preset').map(theme => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ThemeCard({ theme }: { theme: Theme }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-24 w-full flex flex-col border-b">
        <div className="h-1/2 w-full flex items-center px-3 justify-between bg-white">
          <div className="flex items-center gap-1">
             {theme.logoUrl && <div className="h-3 w-3 rounded-full bg-gray-200"></div>}
             <div className="h-3 w-12 rounded-sm" style={{ backgroundColor: theme.colors.primary }}></div>
          </div>
          <div className="h-2 w-16 rounded-sm bg-gray-100"></div>
        </div>
        <div className="h-1/2 w-full flex items-center justify-center" style={{ backgroundColor: theme.colors.primary }}>
          <span className="text-[10px] text-white opacity-80">Hero Area</span>
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base flex justify-between items-center">
          {theme.name}
          {theme.type === 'custom' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">Custom</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex gap-2 mt-2">
          <div className="h-6 w-6 rounded-full border shadow-sm" style={{ backgroundColor: theme.colors.primary }} title="Primary" />
          <div className="h-6 w-6 rounded-full border shadow-sm" style={{ backgroundColor: theme.colors.secondary }} title="Secondary" />
          <div className="h-6 w-6 rounded-full border shadow-sm" style={{ backgroundColor: theme.colors.background }} title="Background" />
        </div>
      </CardContent>
    </Card>
  );
}

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore, Theme } from "@/lib/store";
import { Plus, Palette, Trash2, Shield, Lock } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const { themes, addTheme, deleteSite } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // New Theme State
  const [newThemeName, setNewThemeName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");

  const handleCreatePreset = () => {
    if (!newThemeName) return;
    
    addTheme({
      name: newThemeName,
      type: 'preset', // This makes it a global/admin theme
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        background: '#ffffff',
        text: '#000000'
      }
    });
    
    setIsDialogOpen(false);
    setNewThemeName("");
    toast({
      title: "Global Theme Created",
      description: "New preset theme added to the library for all users.",
    });
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

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-secondary">Global Theme Library</h2>
            <p className="text-muted-foreground">Add themes that will be available to all agents.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-secondary hover:bg-secondary/90">
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
                
                <div className="p-4 rounded border bg-muted/20 mt-2">
                  <Label className="mb-2 block">Preview</Label>
                  <div className="h-24 rounded flex flex-col overflow-hidden border shadow-sm">
                    <div className="h-12 flex items-center px-4 justify-between" style={{ backgroundColor: '#ffffff' }}>
                      <div className="font-bold" style={{ color: primaryColor }}>Brand Logo</div>
                      <div className="text-sm" style={{ color: secondaryColor }}>Nav Link</div>
                    </div>
                    <div className="flex-1 flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                      Hero Section
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreatePreset}>Save Global Preset</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {themes.filter(t => t.type === 'preset').map(theme => (
              <ThemeCard key={theme.id} theme={theme} isAdmin />
            ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ThemeCard({ theme, isAdmin }: { theme: Theme, isAdmin?: boolean }) {
  return (
    <Card className="relative group">
      {isAdmin && (
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="destructive" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4" />
              </Button>
          </div>
      )}
      <div className="h-24 w-full flex flex-col border-b">
        <div className="h-1/2 w-full flex items-center px-3 justify-between bg-white">
          <div className="h-3 w-12 rounded-sm" style={{ backgroundColor: theme.colors.primary }}></div>
          <div className="h-2 w-16 rounded-sm bg-gray-100"></div>
        </div>
        <div className="h-1/2 w-full flex items-center justify-center" style={{ backgroundColor: theme.colors.primary }}>
          <span className="text-[10px] text-white opacity-80">Hero Area</span>
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
            {theme.name}
            {isAdmin && <Lock className="h-3 w-3 text-muted-foreground" />}
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

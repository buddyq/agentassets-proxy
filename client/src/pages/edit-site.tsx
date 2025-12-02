import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TEMPLATES } from "@/lib/store";
import { useSite, useUpdateSite, useThemes, useAddPhotoToSite, useRemovePhotoFromSite, useReorderPhotos, getUploadUrl } from "@/lib/api";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Check, ChevronRight, ChevronLeft, Layout, PaintBucket, Save, Image, X, GripVertical, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ObjectUploader } from "@/components/ObjectUploader";

const STEPS = [
  { id: 1, name: "Property Details", icon: Layout },
  { id: 2, name: "Photos", icon: Image },
  { id: 3, name: "Choose Template", icon: Layout },
  { id: 4, name: "Branding", icon: PaintBucket },
  { id: 5, name: "Review", icon: Save },
];

export default function EditSite() {
  const params = useParams<{ id: string }>();
  const siteId = params.id;
  
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { data: site, isLoading: isLoadingSite } = useSite(siteId);
  const { data: themes = [] } = useThemes();
  const updateSiteMutation = useUpdateSite();
  const addPhotoMutation = useAddPhotoToSite();
  const removePhotoMutation = useRemovePhotoFromSite();
  const reorderPhotosMutation = useReorderPhotos();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    address: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    description: "",
    videoUrl: "",
    templateId: TEMPLATES[0].id,
    themeId: "",
  });

  const [draggedPhoto, setDraggedPhoto] = useState<number | null>(null);

  useEffect(() => {
    if (site) {
      setFormData({
        title: site.title || "",
        address: site.address || "",
        price: site.price || "",
        bedrooms: site.bedrooms?.toString() || "",
        bathrooms: site.bathrooms?.toString() || "",
        sqft: site.sqft?.toString() || "",
        description: site.description || "",
        videoUrl: site.videoUrl || "",
        templateId: site.templateId || TEMPLATES[0].id,
        themeId: site.themeId || themes[0]?.id || "",
      });
    }
  }, [site, themes]);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = () => {
    if (!siteId) return;

    updateSiteMutation.mutate(
      {
        id: siteId,
        updates: {
          title: formData.title || null,
          address: formData.address,
          price: formData.price,
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          sqft: parseInt(formData.sqft) || 0,
          description: formData.description || null,
          videoUrl: formData.videoUrl || null,
          templateId: formData.templateId,
          themeId: formData.themeId,
        }
      },
      {
        onSuccess: () => {
          toast({
            title: "Site Updated!",
            description: "Your changes have been saved.",
          });
          setLocation("/dashboard");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update site. Please try again.",
          });
        }
      }
    );
  };

  const handlePhotoUploadComplete = (result: { successful: Array<{ uploadURL: string }> }) => {
    if (result.successful && result.successful.length > 0 && siteId) {
      result.successful.forEach((upload, index) => {
        setTimeout(() => {
          addPhotoMutation.mutate(
            { siteId, photoUrl: upload.uploadURL },
            {
              onSuccess: () => {
                if (index === result.successful.length - 1) {
                  toast({
                    title: "Photos Added",
                    description: `${result.successful.length} photo(s) added to your property site.`,
                  });
                }
              }
            }
          );
        }, index * 200);
      });
    }
  };

  const handleRemovePhoto = (photoUrl: string) => {
    if (siteId) {
      removePhotoMutation.mutate(
        { siteId, photoUrl },
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

  const handleDragStart = (index: number) => {
    setDraggedPhoto(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedPhoto === null || draggedPhoto === index || !site?.photos) return;

    const photos = [...site.photos];
    const draggedItem = photos[draggedPhoto];
    photos.splice(draggedPhoto, 1);
    photos.splice(index, 0, draggedItem);

    if (siteId) {
      reorderPhotosMutation.mutate({ siteId, photos });
    }
    setDraggedPhoto(index);
  };

  const handleDragEnd = () => {
    setDraggedPhoto(null);
  };

  const handleToggleHeroPhoto = (photoUrl: string) => {
    if (!site || !siteId) return;
    
    const currentHeroPhotos = site.heroPhotos || [];
    const isHero = currentHeroPhotos.includes(photoUrl);
    
    let newHeroPhotos: string[];
    if (isHero) {
      newHeroPhotos = currentHeroPhotos.filter(p => p !== photoUrl);
    } else {
      if (currentHeroPhotos.length >= 4) {
        toast({
          variant: "destructive",
          title: "Maximum Hero Photos",
          description: "You can select up to 4 photos for the hero slider.",
        });
        return;
      }
      newHeroPhotos = [...currentHeroPhotos, photoUrl];
    }

    updateSiteMutation.mutate(
      { id: siteId, heroPhotos: newHeroPhotos },
      {
        onSuccess: () => {
          toast({
            title: isHero ? "Hero Photo Removed" : "Hero Photo Added",
            description: isHero 
              ? "Photo removed from hero slider." 
              : `Photo added to hero slider (${newHeroPhotos.length}/4).`,
          });
        }
      }
    );
  };

  const selectedTemplate = TEMPLATES.find(t => t.id === formData.templateId);
  const selectedTheme = themes.find(t => t.id === formData.themeId);

  if (isLoadingSite) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/10">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading site...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/10">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Site Not Found</h2>
            <p className="text-muted-foreground mb-4">The site you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation("/dashboard")}>Back to Dashboard</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-secondary mb-2">Edit Site</h1>
            <p className="text-muted-foreground">Update your property site details</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-300" 
                style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              />
              
              {STEPS.map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-2 bg-muted/10 p-2 rounded-lg backdrop-blur-sm">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      step >= s.id 
                        ? "bg-primary border-primary text-white" 
                        : "bg-white border-muted text-muted-foreground"
                    }`}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs font-medium ${step >= s.id ? "text-primary" : "text-muted-foreground"}`}>
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Property Title</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g., Retro Mid-Mod in Westlake" 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      data-testid="input-title"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address">Property Address</Label>
                    <Input 
                      id="address" 
                      placeholder="123 Main St, Beverly Hills, CA" 
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      data-testid="input-address"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="price">Price</Label>
                    <Input 
                      id="price" 
                      placeholder="$1,250,000" 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      data-testid="input-price"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input 
                        id="bedrooms" 
                        type="number" 
                        value={formData.bedrooms}
                        onChange={e => setFormData({...formData, bedrooms: e.target.value})}
                        data-testid="input-bedrooms"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input 
                        id="bathrooms" 
                        type="number" 
                        value={formData.bathrooms}
                        onChange={e => setFormData({...formData, bathrooms: e.target.value})}
                        data-testid="input-bathrooms"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sqft">Square Feet</Label>
                      <Input 
                        id="sqft" 
                        type="number" 
                        value={formData.sqft}
                        onChange={e => setFormData({...formData, sqft: e.target.value})}
                        data-testid="input-sqft"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      rows={4} 
                      placeholder="Describe this property..."
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      data-testid="input-description"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="videoUrl">Video URL (YouTube/Vimeo)</Label>
                    <Input 
                      id="videoUrl" 
                      placeholder="https://youtube.com/watch?v=..." 
                      value={formData.videoUrl}
                      onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                      data-testid="input-video-url"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Property Photos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ObjectUploader
                    maxNumberOfFiles={20}
                    maxFileSize={10485760}
                    variant="dropzone"
                    onGetUploadParameters={async () => {
                      const { url } = await getUploadUrl();
                      return { method: 'PUT' as const, url };
                    }}
                    onComplete={handlePhotoUploadComplete}
                  />

                  {site.photos && site.photos.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Drag photos to rearrange their order. The first photo will be the main image.</p>
                        <p className="text-sm text-muted-foreground">Click the <Star className="inline h-3 w-3" /> star to select photos for the hero slider (up to 4).</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {site.photos.map((photo, index) => {
                          const isHero = site.heroPhotos?.includes(photo) || false;
                          const heroIndex = site.heroPhotos?.indexOf(photo) ?? -1;
                          return (
                            <div 
                              key={photo}
                              draggable
                              onDragStart={() => handleDragStart(index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDragEnd={handleDragEnd}
                              className={`relative aspect-square rounded-lg overflow-hidden group cursor-grab active:cursor-grabbing ${
                                draggedPhoto === index ? 'opacity-50 ring-2 ring-primary' : ''
                              } ${isHero ? 'ring-2 ring-yellow-500' : ''}`}
                            >
                              <div className="absolute top-2 left-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <GripVertical className="h-4 w-4" />
                              </div>
                              <img 
                                src={photo} 
                                alt={`Property photo ${index + 1}`}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {index === 0 ? 'Main Photo' : `Photo ${index + 1}`}
                              </div>
                              {isHero && (
                                <div className="absolute bottom-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded font-medium">
                                  Hero #{heroIndex + 1}
                                </div>
                              )}
                              <div className="absolute top-2 right-2 flex gap-1 z-10">
                                <button
                                  type="button"
                                  className={`p-1.5 rounded-full transition-opacity z-10 ${
                                    isHero 
                                      ? 'bg-yellow-500 text-black opacity-100' 
                                      : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                                  }`}
                                  onClick={() => handleToggleHeroPhoto(photo)}
                                  data-testid={`button-toggle-hero-${index}`}
                                  title={isHero ? 'Remove from hero slider' : 'Add to hero slider'}
                                >
                                  <Star className={`h-4 w-4 ${isHero ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                  type="button"
                                  className="bg-destructive text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                  onClick={() => handleRemovePhoto(photo)}
                                  data-testid={`button-remove-photo-${index}`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {site.heroPhotos && site.heroPhotos.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            Hero Slider Photos ({site.heroPhotos.length}/4)
                          </h4>
                          <p className="text-sm text-yellow-700">These photos will rotate in the hero section of your property site.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 bg-muted/30 rounded-lg">
                      <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No photos uploaded yet</p>
                      <p className="text-sm text-muted-foreground">Use the dropzone above to add photos</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Choose a Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={formData.templateId} 
                    onValueChange={(v) => setFormData({...formData, templateId: v})}
                    className="grid md:grid-cols-3 gap-4"
                  >
                    {TEMPLATES.map((template) => (
                      <Label 
                        key={template.id}
                        htmlFor={`edit-${template.id}`}
                        className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                          formData.templateId === template.id 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-muted hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={template.id} id={`edit-${template.id}`} className="sr-only" />
                        <div className="h-40 bg-muted">
                          <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium flex items-center gap-2">
                            {template.name}
                            {formData.templateId === template.id && <Check className="h-4 w-4 text-primary" />}
                          </h3>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Choose a Theme</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={formData.themeId} 
                    onValueChange={(v) => setFormData({...formData, themeId: v})}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
                  >
                    {themes.map((theme) => (
                      <Label 
                        key={theme.id}
                        htmlFor={`edit-theme-${theme.id}`}
                        className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                          formData.themeId === theme.id 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-muted hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={theme.id} id={`edit-theme-${theme.id}`} className="sr-only" />
                        <div 
                          className="h-24 relative"
                          style={{ backgroundColor: theme.colors.background }}
                        >
                          <div 
                            className="absolute top-3 left-3 right-3 h-8 rounded"
                            style={{ backgroundColor: theme.colors.primary }}
                          />
                          <div 
                            className="absolute bottom-3 left-3 w-16 h-3 rounded"
                            style={{ backgroundColor: theme.colors.secondary }}
                          />
                          <div 
                            className="absolute bottom-3 right-3 w-8 h-3 rounded"
                            style={{ backgroundColor: theme.colors.text, opacity: 0.3 }}
                          />
                        </div>
                        <div className="p-4 bg-white">
                          <h3 className="font-medium flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full border" 
                                style={{ backgroundColor: theme.colors.primary }}
                              />
                              {theme.name}
                            </span>
                            {formData.themeId === theme.id && <Check className="h-4 w-4 text-primary" />}
                          </h3>
                          {theme.type === 'custom' && (
                            <span className="text-xs text-muted-foreground">Custom Theme</span>
                          )}
                          <div className="flex gap-1 mt-2">
                            <div 
                              className="w-5 h-5 rounded border shadow-sm" 
                              style={{ backgroundColor: theme.colors.primary }}
                              title="Primary"
                            />
                            <div 
                              className="w-5 h-5 rounded border shadow-sm" 
                              style={{ backgroundColor: theme.colors.secondary }}
                              title="Secondary"
                            />
                            <div 
                              className="w-5 h-5 rounded border shadow-sm" 
                              style={{ backgroundColor: theme.colors.background }}
                              title="Background"
                            />
                            <div 
                              className="w-5 h-5 rounded border shadow-sm" 
                              style={{ backgroundColor: theme.colors.text }}
                              title="Text"
                            />
                          </div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {step === 5 && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Review Your Changes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div>
                          <span className="text-muted-foreground block">Property Title</span>
                          <span className="font-medium">{formData.title || formData.address}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Address</span>
                          <span className="font-medium">{formData.address}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Price</span>
                          <span className="font-medium">{formData.price}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Specs</span>
                          <span className="font-medium">{formData.bedrooms} BD | {formData.bathrooms} BA | {formData.sqft} SqFt</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Photos</span>
                          <span className="font-medium">{site.photos?.length || 0} photos</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Template</span>
                          <span className="font-medium">{selectedTemplate?.name}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Theme</span>
                          <span className="font-medium">{selectedTheme?.name}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className="sticky top-24">
                    <CardHeader>
                      <CardTitle>Save Changes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Review your changes and click save when ready. No credits will be charged for editing existing sites.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full gap-2" 
                        size="lg" 
                        onClick={handleSave}
                        disabled={updateSiteMutation.isPending}
                        data-testid="button-save-changes"
                      >
                        <Save className="h-4 w-4" />
                        {updateSiteMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              {step < 5 && (
                <Button onClick={handleNext} disabled={!formData.address && step === 1}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

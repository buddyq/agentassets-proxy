import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSite, useUpdateSite, useThemes, useLayouts, useAddPhotoToSite, useRemovePhotoFromSite, useReorderPhotos, getUploadUrl, normalizeObjectUrl } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Check, ChevronRight, ChevronLeft, Layout, PaintBucket, Save, Image, X, GripVertical, Star, LayoutGrid, Plus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { CustomDetail, HeroSlide, SiteDocument } from "@shared/schema";
import { FileText, Download, Trash2 } from "lucide-react";

const ALL_STEPS = [
  { id: 1, name: "Property Details", icon: Layout },
  { id: 2, name: "Photos", icon: Image },
  { id: 3, name: "Layout", icon: LayoutGrid },
  { id: 4, name: "Layout Options", icon: Settings, layoutSpecific: true },
  { id: 5, name: "Color Theme", icon: PaintBucket },
  { id: 6, name: "Review", icon: Save },
];

const LAYOUTS_WITH_OPTIONS = ['layout-shoalwood', 'layout-modern'];
const ALWAYS_SHOW_STEP_4 = true; // Always show step 4 for logo branding option

export default function EditSite() {
  const params = useParams<{ id: string }>();
  const siteId = params.id;
  
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: site, isLoading: isLoadingSite } = useSite(siteId);
  const { data: themes = [] } = useThemes();
  const { data: layouts = [] } = useLayouts({ preset: true });
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
    yearBuilt: "",
    stories: "",
    description: "",
    descriptionImage: "",
    videoUrl: "",
    layoutId: "",
    themeId: "",
    logo: "", // Site-specific logo override
    heroLogo: "", // Hero-specific logo for Modern layout
    heroSlides: [] as HeroSlide[], // Up to 3 slides for Modern layout
  });

  const [customDetails, setCustomDetails] = useState<CustomDetail[]>([]);
  const [documents, setDocuments] = useState<SiteDocument[]>([]);
  const [newDocName, setNewDocName] = useState("");
  const [pendingDocUrl, setPendingDocUrl] = useState<string | null>(null);
  const [draggedPhoto, setDraggedPhoto] = useState<number | null>(null);

  const addCustomDetail = () => {
    setCustomDetails([...customDetails, { label: '', value: '' }]);
  };
  
  const removeCustomDetail = (index: number) => {
    setCustomDetails(customDetails.filter((_, i) => i !== index));
  };
  
  const updateCustomDetail = (index: number, field: 'label' | 'value', value: string) => {
    const updated = [...customDetails];
    updated[index] = { ...updated[index], [field]: value };
    setCustomDetails(updated);
  };

  useEffect(() => {
    if (site) {
      setFormData({
        title: site.title || "",
        address: site.address || "",
        price: site.price || "",
        bedrooms: site.bedrooms?.toString() || "",
        bathrooms: site.bathrooms?.toString() || "",
        sqft: site.sqft?.toString() || "",
        yearBuilt: site.yearBuilt || "",
        stories: site.stories || "",
        description: site.description || "",
        descriptionImage: site.descriptionImage || "",
        videoUrl: site.videoUrl || "",
        layoutId: site.layoutId || layouts[0]?.id || "",
        themeId: site.themeId || themes[0]?.id || "",
        logo: site.logo || "",
        heroLogo: site.heroLogo || "",
        heroSlides: site.heroSlides || [],
      });
      setCustomDetails(site.customDetails || []);
      setDocuments(site.documents || []);
    }
  }, [site, themes, layouts]);

  const hasLayoutSpecificOptions = LAYOUTS_WITH_OPTIONS.includes(formData.layoutId);
  const hasLayoutOptions = hasLayoutSpecificOptions || ALWAYS_SHOW_STEP_4;
  
  const visibleSteps = ALL_STEPS.filter(s => !s.layoutSpecific || hasLayoutOptions);

  const handleNext = () => {
    let nextStep = step + 1;
    if (nextStep === 4 && !hasLayoutOptions) {
      nextStep = 5;
    }
    if (nextStep <= 6) setStep(nextStep);
  };

  const handleBack = () => {
    let prevStep = step - 1;
    if (prevStep === 4 && !hasLayoutOptions) {
      prevStep = 3;
    }
    if (prevStep >= 1) setStep(prevStep);
  };

  const handleSave = () => {
    if (!siteId) return;

    const validCustomDetails = customDetails.filter(d => d.label.trim() && d.value.trim());
    const validDocuments = documents.filter(d => d.name.trim() && d.url.trim());

    updateSiteMutation.mutate(
      {
        id: siteId,
        updates: {
          title: formData.title || null,
          address: formData.address,
          price: formData.price,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          sqft: formData.sqft ? parseInt(formData.sqft) : null,
          yearBuilt: formData.yearBuilt || null,
          stories: formData.stories || null,
          description: formData.description || null,
          descriptionImage: formData.descriptionImage || null,
          videoUrl: formData.videoUrl || null,
          layoutId: formData.layoutId,
          themeId: formData.themeId,
          customDetails: validCustomDetails,
          logo: formData.logo || null,
          heroLogo: formData.heroLogo || null,
          heroSlides: formData.heroSlides,
          documents: validDocuments,
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
      { id: siteId, updates: { heroPhotos: newHeroPhotos } },
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

  const selectedLayout = layouts.find(l => l.id === formData.layoutId);
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
              {visibleSteps.map((s, index) => {
                const isActive = step >= s.id;
                const isCompleted = step > s.id;
                return (
                  <div key={s.id} className="flex flex-col items-center gap-2 relative">
                    {/* Connecting line - only between steps, centered to circles */}
                    {index < visibleSteps.length - 1 && (
                      <div 
                        className="absolute top-5 left-1/2 h-0.5 -z-10"
                        style={{ 
                          width: `calc(100% + ${100 / (visibleSteps.length - 1)}vw - 2.5rem)`,
                          maxWidth: '200px'
                        }}
                      >
                        <div className="w-full h-full bg-gray-300" />
                        <div 
                          className={`absolute top-0 left-0 h-full bg-primary transition-all duration-300 ${isCompleted ? 'w-full' : 'w-0'}`}
                        />
                      </div>
                    )}
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border-4 border-white shadow-sm cursor-pointer ${
                        isActive 
                          ? "bg-primary text-white" 
                          : "bg-muted text-muted-foreground"
                      }`}
                      onClick={() => setStep(s.id)}
                    >
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {s.name}
                    </span>
                  </div>
                );
              })}
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input 
                        id="bedrooms" 
                        type="number" 
                        placeholder="e.g., 3"
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
                        placeholder="e.g., 2"
                        value={formData.bathrooms}
                        onChange={e => setFormData({...formData, bathrooms: e.target.value})}
                        data-testid="input-bathrooms"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="yearBuilt">Year Built</Label>
                      <Input 
                        id="yearBuilt" 
                        placeholder="e.g., 1985"
                        value={formData.yearBuilt}
                        onChange={e => setFormData({...formData, yearBuilt: e.target.value})}
                        data-testid="input-year-built"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="stories">Stories</Label>
                      <Input 
                        id="stories" 
                        placeholder="e.g., 2"
                        value={formData.stories}
                        onChange={e => setFormData({...formData, stories: e.target.value})}
                        data-testid="input-stories"
                      />
                    </div>
                  </div>

                  {/* Custom Details Section */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Label className="text-base">Custom Details</Label>
                        <p className="text-sm text-muted-foreground">Add any additional property details</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addCustomDetail}
                        data-testid="button-add-custom-detail"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Detail
                      </Button>
                    </div>
                    
                    {customDetails.length > 0 && (
                      <div className="space-y-3">
                        {customDetails.map((detail, index) => (
                          <div key={index} className="flex gap-3 items-start">
                            <div className="flex-1 grid gap-2">
                              <Input 
                                placeholder="Label (e.g., Lot Size)"
                                value={detail.label}
                                onChange={e => updateCustomDetail(index, 'label', e.target.value)}
                                data-testid={`input-custom-label-${index}`}
                              />
                            </div>
                            <div className="flex-1 grid gap-2">
                              <Input 
                                placeholder="Value (e.g., 0.25 acre)"
                                value={detail.value}
                                onChange={e => updateCustomDetail(index, 'value', e.target.value)}
                                data-testid={`input-custom-value-${index}`}
                              />
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeCustomDetail(index)}
                              className="text-muted-foreground hover:text-destructive"
                              data-testid={`button-remove-custom-detail-${index}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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
                  <CardTitle>Choose a Layout</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Layouts define the structure and typography of your property site.
                  </p>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={formData.layoutId} 
                    onValueChange={(v) => setFormData({...formData, layoutId: v})}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
                  >
                    {layouts.map((layout) => (
                      <Label 
                        key={layout.id}
                        htmlFor={`edit-layout-${layout.id}`}
                        className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                          formData.layoutId === layout.id 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-muted hover:border-primary/50"
                        }`}
                        data-testid={`edit-layout-option-${layout.id}`}
                      >
                        <RadioGroupItem value={layout.id} id={`edit-layout-${layout.id}`} className="sr-only" />
                        <div className="h-32 bg-gradient-to-br from-muted to-muted/50 p-4 flex flex-col justify-end">
                          <div className="flex gap-1 mb-2">
                            {layout.structure?.heroStyle === 'fullscreen' && (
                              <div className="w-full h-6 bg-primary/20 rounded" />
                            )}
                            {layout.structure?.heroStyle === 'split' && (
                              <>
                                <div className="w-1/2 h-6 bg-primary/20 rounded" />
                                <div className="w-1/2 h-6 bg-muted-foreground/10 rounded" />
                              </>
                            )}
                            {layout.structure?.heroStyle === 'minimal' && (
                              <div className="w-2/3 h-4 bg-primary/20 rounded mx-auto" />
                            )}
                            {layout.structure?.heroStyle === 'slider' && (
                              <>
                                <div className="w-1/4 h-6 bg-primary/30 rounded" />
                                <div className="w-1/4 h-6 bg-primary/20 rounded" />
                                <div className="w-1/4 h-6 bg-primary/10 rounded" />
                                <div className="w-1/4 h-6 bg-primary/5 rounded" />
                              </>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <div className="w-1/3 h-3 bg-muted-foreground/20 rounded" />
                            <div className="w-1/4 h-3 bg-muted-foreground/10 rounded" />
                          </div>
                        </div>
                        <div className="p-4 bg-white">
                          <h3 className="font-medium flex items-center justify-between">
                            {layout.name}
                            {formData.layoutId === layout.id && <Check className="h-4 w-4 text-primary" />}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">{layout.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                              {layout.structure?.heroStyle}
                            </span>
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                              {layout.structure?.galleryStyle}
                            </span>
                          </div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Layout Options */}
            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customize Your Site</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Customize the branding, layout options, and documents for your property site.
                  </p>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="branding" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="branding" data-testid="tab-branding">
                        <Settings className="h-4 w-4 mr-2" />
                        Branding & Options
                      </TabsTrigger>
                      <TabsTrigger value="documents" data-testid="tab-documents">
                        <FileText className="h-4 w-4 mr-2" />
                        Documents {documents.length > 0 && `(${documents.length})`}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="branding" className="space-y-6">
                      {/* Site Logo Override */}
                      <div className="grid gap-2">
                    <Label>Site Logo (Optional)</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      {user?.logo 
                        ? "Your default logo will be used. Upload a different logo here to override it for this site only."
                        : "Upload a logo for this property site. You can set a default logo in your dashboard."
                      }
                    </p>
                    {user?.logo && !formData.logo && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg mb-2">
                        <img 
                          src={user.logo} 
                          alt="Default logo" 
                          className="h-10 max-w-[100px] object-contain"
                        />
                        <span className="text-sm text-muted-foreground">Your default logo (will be used unless overridden)</span>
                      </div>
                    )}
                    {formData.logo ? (
                      <div className="relative inline-block">
                        <div className="p-4 bg-muted/30 rounded-lg inline-block">
                          <img 
                            src={formData.logo} 
                            alt="Site logo" 
                            className="max-h-16 max-w-[200px] object-contain"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, logo: ""})}
                          className="absolute -top-2 -right-2 bg-destructive text-white p-1.5 rounded-full shadow-md"
                          data-testid="button-remove-site-logo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={5242880}
                        variant="dropzone"
                        onGetUploadParameters={async () => {
                          const { url } = await getUploadUrl();
                          return { method: 'PUT' as const, url };
                        }}
                        onComplete={(result) => {
                          if (result.successful && result.successful.length > 0) {
                            const normalizedUrl = normalizeObjectUrl(result.successful[0].uploadURL);
                            setFormData({...formData, logo: normalizedUrl});
                          }
                        }}
                      />
                    )}
                  </div>

                  {/* Layout-specific options */}
                  {formData.layoutId === 'layout-shoalwood' && (
                    <div className="border-t pt-6">
                      <div className="grid gap-2">
                        <Label>Description Image (Optional)</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Add a portrait-style image to display alongside your property description. Vertical/portrait orientation works best.
                        </p>
                        {formData.descriptionImage ? (
                          <div className="relative w-48 aspect-[3/4] rounded-lg overflow-hidden border group">
                            <img 
                              src={formData.descriptionImage} 
                              alt="Description" 
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, descriptionImage: ""})}
                              className="absolute top-2 right-2 bg-destructive text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              data-testid="button-remove-description-image"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            variant="dropzone"
                            onGetUploadParameters={async () => {
                              const { url } = await getUploadUrl();
                              return { method: 'PUT' as const, url };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const normalizedUrl = normalizeObjectUrl(result.successful[0].uploadURL);
                                setFormData({...formData, descriptionImage: normalizedUrl});
                              }
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Modern Layout Options */}
                  {formData.layoutId === 'layout-modern' && (
                    <div className="border-t pt-6 space-y-6">
                      {/* Hero Logo for Modern Layout */}
                      <div className="grid gap-2">
                        <Label>Hero Logo (Optional)</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload a logo specifically for the hero section. Use a PNG with transparent background for best results. 
                          If not uploaded, your default logo will be used.
                        </p>
                        {formData.heroLogo ? (
                          <div className="relative inline-block">
                            <div className="p-4 bg-slate-900 rounded-lg inline-block">
                              <img 
                                src={formData.heroLogo} 
                                alt="Hero logo" 
                                className="max-h-16 max-w-[200px] object-contain"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, heroLogo: ""})}
                              className="absolute -top-2 -right-2 bg-destructive text-white p-1.5 rounded-full shadow-md"
                              data-testid="button-remove-hero-logo"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={5242880}
                            variant="dropzone"
                            onGetUploadParameters={async () => {
                              const { url } = await getUploadUrl();
                              return { method: 'PUT' as const, url };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const normalizedUrl = normalizeObjectUrl(result.successful[0].uploadURL);
                                setFormData({...formData, heroLogo: normalizedUrl});
                              }
                            }}
                          />
                        )}
                      </div>

                      {/* Description Image for Modern Layout */}
                      <div className="grid gap-2">
                        <Label>Description Image (Optional)</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Add a vertical portrait image to display next to your property description. Portrait orientation works best.
                        </p>
                        {formData.descriptionImage ? (
                          <div className="relative w-48 aspect-[3/4] rounded-lg overflow-hidden border group">
                            <img 
                              src={formData.descriptionImage} 
                              alt="Description" 
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, descriptionImage: ""})}
                              className="absolute top-2 right-2 bg-destructive text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              data-testid="button-remove-description-image-modern"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            variant="dropzone"
                            onGetUploadParameters={async () => {
                              const { url } = await getUploadUrl();
                              return { method: 'PUT' as const, url };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const normalizedUrl = normalizeObjectUrl(result.successful[0].uploadURL);
                                setFormData({...formData, descriptionImage: normalizedUrl});
                              }
                            }}
                          />
                        )}
                      </div>

                      {/* Hero Slides */}
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Hero Slides</Label>
                            <p className="text-sm text-muted-foreground">
                              Add up to 3 slides with title and subtitle. Each slide will fade into the next.
                            </p>
                          </div>
                          {formData.heroSlides.length < 3 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newSlide: HeroSlide = { title: '', subtitle: '', backgroundImage: '' };
                                setFormData({...formData, heroSlides: [...formData.heroSlides, newSlide]});
                              }}
                              data-testid="button-add-hero-slide"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Slide
                            </Button>
                          )}
                        </div>

                        {formData.heroSlides.length === 0 && (
                          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                            <p className="text-muted-foreground mb-4">No hero slides added yet</p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const newSlide: HeroSlide = { title: '', subtitle: '', backgroundImage: '' };
                                setFormData({...formData, heroSlides: [newSlide]});
                              }}
                              data-testid="button-add-first-hero-slide"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add First Slide
                            </Button>
                          </div>
                        )}

                        {formData.heroSlides.map((slide, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-muted/20">
                            <div className="flex items-center justify-between mb-4">
                              <span className="font-medium text-sm">Slide {index + 1}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  const updated = formData.heroSlides.filter((_, i) => i !== index);
                                  setFormData({...formData, heroSlides: updated});
                                }}
                                data-testid={`button-remove-hero-slide-${index}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor={`edit-slide-title-${index}`}>Title</Label>
                                <Input
                                  id={`edit-slide-title-${index}`}
                                  placeholder="e.g., Stunning Modern Home"
                                  value={slide.title}
                                  onChange={(e) => {
                                    const updated = [...formData.heroSlides];
                                    updated[index] = { ...updated[index], title: e.target.value };
                                    setFormData({...formData, heroSlides: updated});
                                  }}
                                  data-testid={`input-slide-title-${index}`}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`edit-slide-subtitle-${index}`}>Subtitle</Label>
                                <Input
                                  id={`edit-slide-subtitle-${index}`}
                                  placeholder="e.g., Experience luxury living at its finest"
                                  value={slide.subtitle}
                                  onChange={(e) => {
                                    const updated = [...formData.heroSlides];
                                    updated[index] = { ...updated[index], subtitle: e.target.value };
                                    setFormData({...formData, heroSlides: updated});
                                  }}
                                  data-testid={`input-slide-subtitle-${index}`}
                                />
                              </div>
                              {site?.photos && site.photos.length > 0 && (
                                <div className="grid gap-2">
                                  <Label>Background Image</Label>
                                  <div className="grid grid-cols-4 gap-2">
                                    {site.photos.map((photo, photoIndex) => (
                                      <div
                                        key={photoIndex}
                                        className={`relative aspect-video rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                                          slide.backgroundImage === photo
                                            ? 'border-primary ring-2 ring-primary/20'
                                            : 'border-transparent hover:border-primary/50'
                                        }`}
                                        onClick={() => {
                                          const updated = [...formData.heroSlides];
                                          updated[index] = { ...updated[index], backgroundImage: photo };
                                          setFormData({...formData, heroSlides: updated});
                                        }}
                                        data-testid={`select-slide-bg-${index}-${photoIndex}`}
                                      >
                                        <img
                                          src={photo}
                                          alt={`Photo ${photoIndex + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                        {slide.backgroundImage === photo && (
                                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                            <Check className="h-6 w-6 text-white drop-shadow-lg" />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        <p className="text-xs text-muted-foreground">
                          Each slide includes an automatic "Have a look" button that scrolls to the property details.
                        </p>
                      </div>
                    </div>
                  )}

                    </TabsContent>

                    <TabsContent value="documents" className="space-y-6">
                      {/* Documents Section */}
                      <div className="grid gap-4">
                        <div>
                          <Label className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Property Documents
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Upload documents like floor plans, disclosures, or brochures. Visitors can download these from your property site.
                          </p>
                        </div>

                    {/* Document Upload */}
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Input
                          placeholder="Document name (e.g., Floor Plan, Property Disclosure)"
                          value={newDocName}
                          onChange={(e) => setNewDocName(e.target.value)}
                          className="flex-1"
                          data-testid="input-document-name"
                        />
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={52428800}
                          onGetUploadParameters={async () => {
                            const { url } = await getUploadUrl();
                            return { method: 'PUT' as const, url };
                          }}
                          onComplete={(result) => {
                            if (result.successful && result.successful.length > 0) {
                              const normalizedUrl = normalizeObjectUrl(result.successful[0].uploadURL);
                              if (newDocName.trim()) {
                                setDocuments([...documents, { name: newDocName.trim(), url: normalizedUrl }]);
                                setNewDocName("");
                                toast({
                                  title: "Document Uploaded",
                                  description: `"${newDocName.trim()}" has been added.`,
                                });
                              } else {
                                setPendingDocUrl(normalizedUrl);
                                toast({
                                  title: "Enter Document Name",
                                  description: "Please enter a name for the document, then click Add.",
                                });
                              }
                            }
                          }}
                          buttonClassName="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Upload Document
                        </ObjectUploader>
                      </div>

                      {pendingDocUrl && (
                        <div className="flex gap-3 items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <FileText className="h-5 w-5 text-yellow-600" />
                          <span className="text-sm flex-1">Document uploaded. Enter a name:</span>
                          <Input
                            placeholder="Document name"
                            value={newDocName}
                            onChange={(e) => setNewDocName(e.target.value)}
                            className="w-48"
                            data-testid="input-pending-document-name"
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              if (newDocName.trim() && pendingDocUrl) {
                                setDocuments([...documents, { name: newDocName.trim(), url: pendingDocUrl }]);
                                setNewDocName("");
                                setPendingDocUrl(null);
                              }
                            }}
                            disabled={!newDocName.trim()}
                            data-testid="button-add-pending-document"
                          >
                            Add
                          </Button>
                        </div>
                      )}

                      {/* Document List */}
                      {documents.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Uploaded Documents ({documents.length})</Label>
                          <div className="border rounded-lg divide-y">
                            {documents.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-3 hover:bg-muted/30" data-testid={`document-item-${index}`}>
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-primary" />
                                  <span className="font-medium">{doc.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                  >
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" data-testid={`button-download-document-${index}`}>
                                      <Download className="h-4 w-4" />
                                    </a>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => {
                                      setDocuments(documents.filter((_, i) => i !== index));
                                      toast({
                                        title: "Document Removed",
                                        description: `"${doc.name}" has been removed.`,
                                      });
                                    }}
                                    data-testid={`button-remove-document-${index}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Color Theme */}
            {step === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>Choose a Color Theme</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Color themes control the color palette of your site. They work with any layout.
                  </p>
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

            {/* Step 6: Review */}
            {step === 6 && (
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
                          <span className="text-muted-foreground block">Layout</span>
                          <span className="font-medium">{selectedLayout?.name}</span>
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
              
              <div className="flex gap-3">
                {step < 6 && (
                  <Button 
                    variant="outline"
                    onClick={handleSave}
                    disabled={updateSiteMutation.isPending}
                    data-testid="button-save-inline"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateSiteMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                )}
                {step < 6 && (
                  <Button onClick={handleNext} disabled={!formData.address && step === 1}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

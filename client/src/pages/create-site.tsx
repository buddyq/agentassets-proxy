import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSite, useUpdateCredits, useThemes, useLayouts, getUploadUrl, normalizeObjectUrl } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Check, ChevronRight, ChevronLeft, Layout, PaintBucket, CreditCard, LayoutGrid, Plus, X, Image, GripVertical, Star, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { CustomDetail, HeroSlide } from "@shared/schema";

const ALL_STEPS = [
  { id: 1, name: "Property Details", icon: Layout },
  { id: 2, name: "Photos", icon: Image },
  { id: 3, name: "Choose Layout", icon: LayoutGrid },
  { id: 4, name: "Layout Options", icon: Settings, layoutSpecific: true },
  { id: 5, name: "Color Theme", icon: PaintBucket },
  { id: 6, name: "Review", icon: CreditCard },
];

const LAYOUTS_WITH_OPTIONS = ['layout-shoalwood', 'layout-modern'];
const ALWAYS_SHOW_STEP_4 = true; // Always show step 4 for logo branding option

export default function CreateSite() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { user, isLoading: isLoadingUser } = useAuth();
  const { data: themes = [] } = useThemes();
  const { data: layouts = [] } = useLayouts({ preset: true });
  const createSiteMutation = useCreateSite();
  const updateCreditsMutation = useUpdateCredits();
  const { toast } = useToast();

  // Redirect to credits page if user has no credits
  useEffect(() => {
    if (!isLoadingUser && user && user.credits < 1) {
      toast({
        variant: "destructive",
        title: "No Credits Available",
        description: "Please purchase credits to create a new site.",
      });
      setLocation("/credits");
    }
  }, [user, isLoadingUser, setLocation, toast]);

  // Form State
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
    layoutId: '',
    themeId: '',
    logo: '', // Site-specific logo override
    heroLogo: '', // Hero-specific logo for Modern layout (PNG recommended)
    heroSlides: [] as HeroSlide[], // Up to 3 slides with title/subtitle for Modern layout
  });
  
  // Custom details state
  const [customDetails, setCustomDetails] = useState<CustomDetail[]>([]);
  
  // Photo state
  const [photos, setPhotos] = useState<string[]>([]);
  const [heroPhotos, setHeroPhotos] = useState<string[]>([]);
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
  
  const handlePhotoUploadComplete = (result: { successful: Array<{ uploadURL: string }> }) => {
    if (result.successful && result.successful.length > 0) {
      const newPhotos = result.successful.map(upload => upload.uploadURL);
      setPhotos(prev => [...prev, ...newPhotos]);
      toast({
        title: "Photos Added",
        description: `${newPhotos.length} photo(s) added to your property site.`,
      });
    }
  };
  
  const handleRemovePhoto = (photoUrl: string) => {
    setPhotos(photos.filter(p => p !== photoUrl));
    setHeroPhotos(heroPhotos.filter(p => p !== photoUrl));
  };
  
  const handleDragStart = (index: number) => {
    setDraggedPhoto(index);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedPhoto === null || draggedPhoto === index) return;
    
    const newPhotos = [...photos];
    const draggedItem = newPhotos[draggedPhoto];
    newPhotos.splice(draggedPhoto, 1);
    newPhotos.splice(index, 0, draggedItem);
    setPhotos(newPhotos);
    setDraggedPhoto(index);
  };
  
  const handleDragEnd = () => {
    setDraggedPhoto(null);
  };
  
  const handleToggleHeroPhoto = (photoUrl: string) => {
    const isHero = heroPhotos.includes(photoUrl);
    
    if (isHero) {
      setHeroPhotos(heroPhotos.filter(p => p !== photoUrl));
    } else {
      if (heroPhotos.length >= 4) {
        toast({
          variant: "destructive",
          title: "Maximum Hero Photos",
          description: "You can select up to 4 photos for the hero slider.",
        });
        return;
      }
      setHeroPhotos([...heroPhotos, photoUrl]);
    }
  };
  
  // Set default layoutId and themeId once data loads
  useEffect(() => {
    if (layouts.length > 0 && !formData.layoutId) {
      setFormData(prev => ({ ...prev, layoutId: layouts[0].id }));
    }
  }, [layouts, formData.layoutId]);
  
  useEffect(() => {
    if (themes.length > 0 && !formData.themeId) {
      setFormData(prev => ({ ...prev, themeId: themes[0].id }));
    }
  }, [themes, formData.themeId]);

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

  const handlePublish = () => {
    if (!user || user.credits < 1) {
      toast({
        variant: "destructive",
        title: "Insufficient Credits",
        description: "Please purchase more credits to publish this site.",
      });
      return;
    }

    const validCustomDetails = customDetails.filter(d => d.label.trim() && d.value.trim());
    
    createSiteMutation.mutate(
      {
        title: formData.title || null,
        address: formData.address,
        price: formData.price,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        sqft: formData.sqft ? parseInt(formData.sqft) : null,
        yearBuilt: formData.yearBuilt || null,
        stories: formData.stories || null,
        lotSize: null,
        description: formData.description || null,
        descriptionImage: formData.descriptionImage || null,
        imageUrl: null,
        videoUrl: formData.videoUrl || null,
        layoutId: formData.layoutId,
        templateId: null,
        themeId: formData.themeId,
        customDomain: null,
        customDetails: validCustomDetails,
        status: 'published',
        photos: photos,
        heroPhotos: heroPhotos,
        heroSlides: formData.heroSlides,
        heroLogo: formData.heroLogo || null,
        logo: formData.logo || null,
        stats: { views: 0, uniqueVisitors: 0, leads: 0 }
      },
      {
        onSuccess: () => {
          updateCreditsMutation.mutate(user.credits - 1);
          toast({
            title: "Site Published!",
            description: "Your new property site is live.",
          });
          setLocation("/dashboard");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create site. Please try again.",
          });
        }
      }
    );
  };

  const selectedLayout = layouts.find(l => l.id === formData.layoutId);
  const selectedTheme = themes.find(t => t.id === formData.themeId);

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-5xl mx-auto">
          {/* Progress Steps */}
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
                        <div className="w-full h-full bg-muted" />
                        <div 
                          className={`absolute top-0 left-0 h-full bg-primary transition-all duration-300 ${isCompleted ? 'w-full' : 'w-0'}`}
                        />
                      </div>
                    )}
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border-4 border-white shadow-sm ${
                        isActive 
                          ? "bg-primary text-white" 
                          : "bg-muted text-muted-foreground"
                      }`}
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
            {/* Step 1: Property Details */}
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
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address">Property Address</Label>
                    <Input 
                      id="address" 
                      placeholder="123 Main St, Beverly Hills, CA" 
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="price">Price</Label>
                    <Input 
                      id="price" 
                      placeholder="$1,250,000" 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
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
                    />
                  </div>

                  {formData.layoutId === 'layout-shoalwood' && (
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
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="videoUrl">Video URL (YouTube/Vimeo)</Label>
                    <Input 
                      id="videoUrl" 
                      placeholder="https://youtube.com/watch?v=..." 
                      value={formData.videoUrl}
                      onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Photos */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Property Photos</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Upload photos of your property. You can add more photos later from the edit page.
                  </p>
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

                  {photos.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Drag photos to rearrange their order. The first photo will be the main image.</p>
                        <p className="text-sm text-muted-foreground">Click the <Star className="inline h-3 w-3" /> star to select photos for the hero slider (up to 4).</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {photos.map((photo, index) => {
                          const isHero = heroPhotos.includes(photo);
                          const heroIndex = heroPhotos.indexOf(photo);
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
                      {heroPhotos.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            Hero Slider Photos ({heroPhotos.length}/4)
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

            {/* Step 3: Choose Layout */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Choose a Layout</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Layouts define the structure and typography of your property site. You can pick any color theme in the next step.
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
                        htmlFor={`layout-${layout.id}`}
                        className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                          formData.layoutId === layout.id 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-muted hover:border-primary/50"
                        }`}
                        data-testid={`layout-option-${layout.id}`}
                      >
                        <RadioGroupItem value={layout.id} id={`layout-${layout.id}`} className="sr-only" />
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
                  <CardTitle>Layout Options & Branding</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Customize the branding and options for your property site.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
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

                      {/* Hero Slides */}
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Hero Slides</Label>
                            <p className="text-sm text-muted-foreground">
                              Add up to 3 slides with title and subtitle. Each slide will fade into the next. 
                              Background images are selected from your uploaded photos.
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
                                <Label htmlFor={`slide-title-${index}`}>Title</Label>
                                <Input
                                  id={`slide-title-${index}`}
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
                                <Label htmlFor={`slide-subtitle-${index}`}>Subtitle</Label>
                                <Input
                                  id={`slide-subtitle-${index}`}
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
                              {photos.length > 0 && (
                                <div className="grid gap-2">
                                  <Label>Background Image</Label>
                                  <div className="grid grid-cols-4 gap-2">
                                    {photos.map((photo, photoIndex) => (
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
                        htmlFor={`theme-${theme.id}`}
                        className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                          formData.themeId === theme.id 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-muted hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={theme.id} id={`theme-${theme.id}`} className="sr-only" />
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
                      <CardTitle>Review Your Site</CardTitle>
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
                          <span className="text-muted-foreground block">Details</span>
                          <div className="font-medium space-y-1">
                            {formData.bedrooms && <span className="block">{formData.bedrooms} Bedrooms</span>}
                            {formData.bathrooms && <span className="block">{formData.bathrooms} Bathrooms</span>}
                            {formData.yearBuilt && <span className="block">Built in {formData.yearBuilt}</span>}
                            {formData.stories && <span className="block">{formData.stories} Stories</span>}
                            {customDetails.filter(d => d.label && d.value).map((d, i) => (
                              <span key={i} className="block">{d.label}: {d.value}</span>
                            ))}
                            {!formData.bedrooms && !formData.bathrooms && !formData.yearBuilt && !formData.stories && customDetails.filter(d => d.label && d.value).length === 0 && (
                              <span className="text-muted-foreground italic">No details added</span>
                            )}
                          </div>
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
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Single Property Site</span>
                        <span className="font-medium">1 Credit</span>
                      </div>
                      <div className="border-t pt-4 flex justify-between items-center">
                        <span className="font-bold">Total</span>
                        <span className="font-bold text-primary">1 Credit</span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                        Your current balance: <span className="font-bold text-foreground">{user?.credits ?? 0} Credits</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full gap-2" size="lg" onClick={handlePublish} disabled={!user || user.credits < 1}>
                        <CreditCard className="h-4 w-4" />
                        {!user || user.credits < 1 ? "Insufficient Credits" : "Publish Site"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              {step < 6 && (
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

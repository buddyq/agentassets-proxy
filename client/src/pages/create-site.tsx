import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSite, useUpdateCredits, useThemes, useLayouts, getUploadUrl, normalizeObjectUrl, useBrokerage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Check, ChevronRight, ChevronLeft, Layout, PaintBucket, CreditCard, LayoutGrid, Plus, X, Image, Image as ImageIcon, GripVertical, Star, Settings, FileText, AlertTriangle, UserCircle, Phone, Mail, ExternalLink, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Lock, BarChart3 } from "lucide-react";
import type { CustomDetail, HeroSlide, OpenHouseEvent, HeroTransitionType } from "@shared/schema";
import { heroTransitionTypes } from "@shared/schema";
import { parseVideoUrl } from "@/lib/utils";

const FEATURE_SUGGESTIONS = [
  'Community Clubhouse',
  'City Lights Views',
  'Beach Access',
  'Gated Community',
  'Great Schools',
  'Hardwood Floors',
  'Community Pool',
  'Frameless Glass Showers',
  'Heated Floors',
  'Heated Pool',
  'Ocean Views',
  'New Construction',
  'Large Lot',
  'Large Kitchen',
  'Oversized Windows',
  'Pool',
  'Shopping Nearby',
  'Walk-In Closets',
  'Stainless Steel Appliances',
];

const ALL_STEPS = [
  { id: 1, name: "Property Details", icon: Layout },
  { id: 2, name: "Photos", icon: Image },
  { id: 3, name: "Choose Layout", icon: LayoutGrid },
  { id: 4, name: "Layout Options", icon: Settings, layoutSpecific: true },
  { id: 5, name: "Color Theme", icon: PaintBucket },
  { id: 6, name: "Review", icon: CreditCard },
];

const LAYOUTS_WITH_OPTIONS = ['layout-shoalwood', 'layout-modern', 'layout-magazine'];
const ALWAYS_SHOW_STEP_4 = true; // Always show step 4 for logo branding option

export default function CreateSite() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { user, isLoading: isLoadingUser } = useAuth();
  const { data: brokerage } = useBrokerage();
  const { data: themes = [] } = useThemes({ forUser: true });
  
  // Check for admin mode via URL query param (allows testing disabled layouts)
  const isAdminMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('admin') === 'true';
  
  // Only show enabled layouts to regular users, show all to admin
  // Use forUser: true to include brokerage group-assigned templates
  const { data: layouts = [] } = useLayouts({ forUser: true });
  const createSiteMutation = useCreateSite();
  const updateCreditsMutation = useUpdateCredits();
  const { toast } = useToast();

  // Check if user has trial credits available
  const hasTrialCredits = user && (user.trialCredits || 0) > 0 && 
    user.trialEndsAt && new Date(user.trialEndsAt) > new Date();

  // Check if profile is incomplete
  const isProfileIncomplete = user && (
    !user.profileImageUrl || 
    !user.logo || 
    !user.name || 
    !user.phone || 
    !user.email
  );

  const profileChecklist = user ? [
    { label: 'Profile Picture', done: !!user.profileImageUrl, icon: UserCircle },
    { label: 'Logo', done: !!user.logo, icon: Image },
    { label: 'Name', done: !!user.name, icon: FileText },
    { label: 'Phone', done: !!user.phone, icon: Phone },
    { label: 'Email', done: !!user.email, icon: Mail },
  ] : [];

  // Check if user is a brokerage member (has unlimited credits)
  const isBrokerageAgent = !!brokerage;

  // Redirect to credits page if user has no credits (regular or trial) and is not a brokerage agent
  useEffect(() => {
    if (!isLoadingUser && user && user.credits < 1 && !hasTrialCredits && !isBrokerageAgent) {
      toast({
        variant: "destructive",
        title: "No Credits Available",
        description: "Please purchase credits to create a new site.",
      });
      setLocation("/credits");
    }
  }, [user, isLoadingUser, setLocation, toast, hasTrialCredits, isBrokerageAgent]);

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
    invertLogo: false, // Invert logo for dark hero backgrounds
    // Magazine layout fields
    buyerAgentComp: '', // e.g., "3% Buyers Agent Compensation"
    openHouses: [] as OpenHouseEvent[], // Open house schedule
    brochureUrl: '', // Link to property brochure PDF
    contentGridImage1: '', // Image for content grid position 2 (top right)
    contentGridImage2: '', // Image for content grid position 3 (bottom left)
    features: '' as string, // Comma-separated feature tags
    heroTransition: 'slide' as HeroTransitionType, // Hero slider transition effect
    // SEO fields
    seoTitle: '',
    seoDescription: '',
    seoImage: '',
    customGaId: '',
  });
  
  // Custom details state
  const [customDetails, setCustomDetails] = useState<CustomDetail[]>([]);
  
  // Documents state (for property documents)
  type SiteDocument = { name: string; url: string };
  const [documents, setDocuments] = useState<SiteDocument[]>([]);
  const [newDocName, setNewDocName] = useState("");
  const [pendingDocUrl, setPendingDocUrl] = useState<string | null>(null);
  
  // Photo state
  const [photos, setPhotos] = useState<string[]>([]);
  const [heroPhotos, setHeroPhotos] = useState<string[]>([]);
  const [draggedPhoto, setDraggedPhoto] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const scrollIntervalRef = useRef<number | null>(null);
  
  // Auto-scroll during drag
  const handleDragScroll = useCallback((e: React.DragEvent) => {
    const scrollThreshold = 100;
    const scrollSpeed = 15;
    const viewportHeight = window.innerHeight;
    const mouseY = e.clientY;
    
    if (scrollIntervalRef.current) {
      cancelAnimationFrame(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    
    if (mouseY < scrollThreshold) {
      const scroll = () => {
        window.scrollBy(0, -scrollSpeed);
        scrollIntervalRef.current = requestAnimationFrame(scroll);
      };
      scrollIntervalRef.current = requestAnimationFrame(scroll);
    } else if (mouseY > viewportHeight - scrollThreshold) {
      const scroll = () => {
        window.scrollBy(0, scrollSpeed);
        scrollIntervalRef.current = requestAnimationFrame(scroll);
      };
      scrollIntervalRef.current = requestAnimationFrame(scroll);
    }
  }, []);
  
  const stopDragScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      cancelAnimationFrame(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);
  
  // Image picker sheet state
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<'contentGridImage1' | 'contentGridImage2' | null>(null);
  
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
      const newPhotos = result.successful.map(upload => normalizeObjectUrl(upload.uploadURL));
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
  
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedPhoto(index);
    setDropTarget(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    handleDragScroll(e);
    if (draggedPhoto === null) return;
    setDropTarget(index);
  };
  
  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    stopDragScroll();
    
    if (draggedPhoto === null || draggedPhoto === index) {
      setDraggedPhoto(null);
      setDropTarget(null);
      return;
    }

    const newPhotos = [...photos];
    const draggedItem = newPhotos[draggedPhoto];
    newPhotos.splice(draggedPhoto, 1);
    newPhotos.splice(index, 0, draggedItem);
    setPhotos(newPhotos);
    setDraggedPhoto(null);
    setDropTarget(null);
  };
  
  const handleDragEnd = () => {
    setDraggedPhoto(null);
    setDropTarget(null);
    stopDragScroll();
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
    const hasCredits = user && user.credits >= 1;
    const canUseTrial = hasTrialCredits;
    
    // Brokerage agents have unlimited credits, skip credit check for them
    if (!user || (!hasCredits && !canUseTrial && !isBrokerageAgent)) {
      toast({
        variant: "destructive",
        title: "Insufficient Credits",
        description: "Please purchase more credits to publish this site.",
      });
      return;
    }

    // Determine if we're using trial credit (use trial only if no regular credits)
    const useTrialCredit = !hasCredits && canUseTrial;

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
        heroTransition: formData.heroTransition,
        heroLogo: formData.heroLogo || null,
        invertLogo: formData.invertLogo,
        logo: formData.logo || null,
        stats: { views: 0, uniqueVisitors: 0, leads: 0 },
        documents: documents,
        // SEO fields
        seoTitle: formData.seoTitle || null,
        seoDescription: formData.seoDescription || null,
        seoImage: formData.seoImage || null,
        customGaId: formData.customGaId || null,
        // Magazine layout fields
        buyerAgentComp: formData.buyerAgentComp || null,
        openHouses: formData.openHouses,
        brochureUrl: formData.brochureUrl || null,
        contentGridImage1: formData.contentGridImage1 || null,
        contentGridImage2: formData.contentGridImage2 || null,
        features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(f => f) : [],
        // Trial credit flag
        useTrialCredit,
      } as any,
      {
        onSuccess: () => {
          // Credits are decremented on the backend, no need to do it here
          const message = useTrialCredit 
            ? "Your trial site is live! It will expire in 7 days unless you purchase a plan."
            : "Your new property site is live.";
          toast({
            title: "Site Published!",
            description: message,
          });
          setLocation("/dashboard");
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error?.message || "Failed to create site. Please try again.",
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
            {/* Step 1: Property Details */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Enter the basic information about your property listing.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* ===== BASIC INFO SECTION ===== */}
                  <div className="rounded-xl border p-6 space-y-4 bg-[#ffffff]">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Layout className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Basic Info</h3>
                    </div>
                    <div className="space-y-4 bg-[#f3faf9] rounded-xl p-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Property Title</Label>
                        <Input 
                          id="title" 
                          className="bg-[#ffffff]"
                          placeholder="e.g., Retro Mid-Mod in Westlake" 
                          value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="address">Property Address</Label>
                        <Input 
                          id="address" 
                          className="bg-[#ffffff]"
                          placeholder="123 Main St, Beverly Hills, CA" 
                          value={formData.address}
                          onChange={e => setFormData({...formData, address: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="price">Price</Label>
                        <Input 
                          id="price" 
                          className="bg-[#ffffff]"
                          placeholder="$1,250,000" 
                          value={formData.price}
                          onChange={e => setFormData({...formData, price: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ===== PROPERTY SPECS SECTION ===== */}
                  <div className="rounded-xl border p-6 space-y-4 bg-[#ffffff]">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <LayoutGrid className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Property Specs</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-[#f3faf9] rounded-xl p-4">
                      <div className="grid gap-2">
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input 
                          id="bedrooms" 
                          className="bg-[#ffffff]"
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
                          className="bg-[#ffffff]"
                          type="number" 
                          placeholder="e.g., 2"
                          value={formData.bathrooms}
                          onChange={e => setFormData({...formData, bathrooms: e.target.value})}
                          data-testid="input-bathrooms"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sqft">Square Feet</Label>
                        <Input 
                          id="sqft" 
                          className="bg-[#ffffff]"
                          type="number" 
                          placeholder="e.g., 2400"
                          value={formData.sqft}
                          onChange={e => setFormData({...formData, sqft: e.target.value})}
                          data-testid="input-sqft"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="yearBuilt">Year Built</Label>
                        <Input 
                          id="yearBuilt" 
                          className="bg-[#ffffff]"
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
                          className="bg-[#ffffff]"
                          placeholder="e.g., 2"
                          value={formData.stories}
                          onChange={e => setFormData({...formData, stories: e.target.value})}
                          data-testid="input-stories"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ===== CUSTOM DETAILS SECTION ===== */}
                  <div className="rounded-xl border p-6 space-y-4 bg-[#ffffff]">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">Custom Details</h3>
                      </div>
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={addCustomDetail}
                        data-testid="button-add-custom-detail"
                        className="bg-primary text-white hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Detail
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Add any additional property details like lot size, HOA fees, etc.</p>
                    {customDetails.length > 0 ? (
                      <div className="space-y-3 bg-[#f3faf9] rounded-xl p-4">
                        {customDetails.map((detail, index) => (
                          <div key={index} className="flex gap-3 items-center">
                            <div className="flex-1">
                              <Input 
                                className="bg-[#ffffff]"
                                placeholder="Label (e.g., Lot Size)"
                                value={detail.label}
                                onChange={e => updateCustomDetail(index, 'label', e.target.value)}
                                data-testid={`input-custom-label-${index}`}
                              />
                            </div>
                            <div className="flex-1">
                              <Input 
                                className="bg-[#ffffff]"
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
                              className="text-muted-foreground hover:text-destructive flex-shrink-0"
                              data-testid={`button-remove-custom-detail-${index}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center bg-[#f3faf9]">
                        <p className="text-muted-foreground text-sm mb-4">No custom details added yet.</p>
                        <Button 
                          type="button" 
                          onClick={addCustomDetail}
                          className="bg-primary text-white hover:bg-primary/90"
                          data-testid="button-add-first-custom-detail"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Your First Detail
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* ===== DESCRIPTION SECTION ===== */}
                  <div className="rounded-xl border p-6 space-y-4 bg-[#ffffff]">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Description</h3>
                    </div>
                    <div className="bg-[#f3faf9] rounded-xl p-4">
                      <Textarea 
                        id="description" 
                        className="bg-[#ffffff] min-h-[120px]"
                        rows={4} 
                        placeholder="Describe this property... Include details about the home's features, neighborhood, and what makes it special."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* ===== FEATURES SECTION ===== */}
                  <div className="rounded-xl border p-6 space-y-4 bg-[#ffffff]">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Star className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Features & Amenities</h3>
                    </div>
                    <div className="space-y-4 bg-[#f3faf9] rounded-xl p-4">
                      <p className="text-sm text-muted-foreground">Enter features separated by commas, or click suggestions below.</p>
                      <Input 
                        id="features" 
                        className="bg-[#ffffff]"
                        placeholder="e.g., Pool, Ocean Views, Hardwood Floors" 
                        value={formData.features}
                        onChange={e => setFormData({...formData, features: e.target.value})}
                        data-testid="input-features"
                      />
                      {FEATURE_SUGGESTIONS.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {FEATURE_SUGGESTIONS.map((feature) => (
                            <button
                              key={feature}
                              type="button"
                              onClick={() => {
                                const features = formData.features ? formData.features.split(',').map(f => f.trim()) : [];
                                if (!features.includes(feature)) {
                                  features.push(feature);
                                  setFormData({...formData, features: features.join(', ')});
                                }
                              }}
                              className="px-3 py-1 bg-white hover:bg-primary hover:text-white rounded-full text-xs transition-colors cursor-pointer border"
                              data-testid={`button-feature-suggestion-${feature}`}
                            >
                              + {feature}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ===== MEDIA SECTION ===== */}
                  <div className="rounded-xl border p-6 space-y-4 bg-[#ffffff]">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <ExternalLink className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Media</h3>
                    </div>
                    <div className="bg-[#f3faf9] rounded-xl p-4 space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="videoUrl">Video URL (YouTube/Vimeo)</Label>
                        <Input 
                          id="videoUrl" 
                          className="bg-[#ffffff]"
                          placeholder="https://youtube.com/watch?v=..." 
                          value={formData.videoUrl}
                          onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                        />
                        <p className="text-xs text-muted-foreground">Add a video tour of the property (optional)</p>
                      </div>
                      {(() => {
                        const videoInfo = parseVideoUrl(formData.videoUrl);
                        if (videoInfo) {
                          return (
                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground mb-2">Video Preview:</p>
                              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                                <iframe
                                  src={videoInfo.embedUrl}
                                  title="Video preview"
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
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
                    maxNumberOfFiles={60}
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
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDrop={(e) => handleDrop(e, index)}
                              onDragEnd={handleDragEnd}
                              className={`relative aspect-square rounded-lg overflow-hidden group cursor-grab active:cursor-grabbing ${
                                draggedPhoto === index ? 'opacity-50' : ''
                              } ${dropTarget === index && draggedPhoto !== null && draggedPhoto !== index ? 'ring-2 ring-primary ring-offset-2' : ''} ${isHero ? 'ring-2 ring-yellow-500' : ''}`}
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
                        className={`cursor-pointer rounded-b-xl border-2 overflow-hidden transition-all ${
                          formData.layoutId === layout.id 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-muted hover:border-primary/50"
                        }`}
                        data-testid={`layout-option-${layout.id}`}
                      >
                        <RadioGroupItem value={layout.id} id={`layout-${layout.id}`} className="sr-only" />
                        <div className="bg-muted/30 overflow-hidden">
                          {layout.thumbnailUrl ? (
                            <img 
                              src={layout.thumbnailUrl} 
                              alt={`${layout.name} layout preview`}
                              className="w-full"
                            />
                          ) : (
                            <div className="h-32 p-4 flex flex-col justify-end">
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
                          )}
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
                          {layout.sampleSiteSlug && (
                            <a
                              href={`/p/${layout.sampleSiteSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              data-testid={`view-sample-${layout.id}`}
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Sample
                            </a>
                          )}
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
                <CardContent>
                  <Tabs defaultValue="branding" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="branding" data-testid="tab-branding">
                        <Settings className="h-4 w-4 mr-2" />
                        Branding
                      </TabsTrigger>
                      <TabsTrigger value="seo" data-testid="tab-seo">
                        <Search className="h-4 w-4 mr-2" />
                        SEO
                      </TabsTrigger>
                      <TabsTrigger value="documents" data-testid="tab-documents">
                        <FileText className="h-4 w-4 mr-2" />
                        Documents {documents.length > 0 && `(${documents.length})`}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="branding" className="space-y-6">
                      {/* ===== SITE LOGO ===== */}
                      <div className="rounded-xl border p-6 space-y-4 bg-[#ffffff]">
                        <div className="flex items-center gap-2 pb-2 border-b">
                          <Star className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-lg">Site Logo</h3>
                        </div>
                    <div className="bg-[#f3faf9] rounded-xl p-6 flex flex-col items-center gap-4">
                      <p className="text-sm font-medium text-muted-foreground">Current Logo</p>
                      <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center p-3">
                        {(formData.logo || user?.logo) ? (
                          <img 
                            src={formData.logo || user?.logo || ''} 
                            alt="Current logo" 
                            className="max-h-12 max-w-12 object-contain"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                        )}
                      </div>
                      {formData.logo ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFormData({...formData, logo: ""})}
                          className="w-full max-w-xs"
                          data-testid="button-remove-site-logo"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove Custom Logo
                        </Button>
                      ) : (
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={5242880}
                          variant="button"
                          buttonClassName="w-full max-w-xs bg-primary text-primary-foreground hover:bg-primary/90"
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
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload New Logo
                        </ObjectUploader>
                      )}
                      <p className="text-sm text-muted-foreground">or drag and drop your logo here</p>
                    </div>
                  </div>

                  {/* ===== HERO SECTION ===== */}
                  <div className="rounded-xl border p-6 space-y-6 bg-[#ffffff]">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <LayoutGrid className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Hero Section</h3>
                    </div>

                    {/* Hero Logo */}
                    <div className="grid gap-3">
                      <Label>Hero Logo</Label>
                      <p className="text-sm text-muted-foreground">
                        Upload a logo specifically for the hero section. Use a PNG with transparent background for best results.
                      </p>
                      <div className="rounded-xl p-6 flex flex-col items-center gap-4 bg-[#f3faf9]">
                        <p className="text-sm font-medium text-muted-foreground">Current Hero Logo</p>
                        <div className="w-24 h-16 rounded-lg bg-slate-800 shadow-lg flex items-center justify-center p-2">
                          {formData.heroLogo ? (
                            <img 
                              src={formData.heroLogo} 
                              alt="Hero logo" 
                              className="max-h-12 max-w-20 object-contain"
                            />
                          ) : (formData.logo || user?.logo) ? (
                            <img 
                              src={formData.logo || user?.logo || ''} 
                              alt="Using site logo" 
                              className="max-h-12 max-w-20 object-contain opacity-50"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-white/30" />
                          )}
                        </div>
                        {!formData.heroLogo && (formData.logo || user?.logo) && (
                          <p className="text-xs text-muted-foreground">Using your site logo (upload to override)</p>
                        )}
                        {formData.heroLogo ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormData({...formData, heroLogo: ""})}
                            className="w-full max-w-xs"
                            data-testid="button-remove-hero-logo"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove Hero Logo
                          </Button>
                        ) : (
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={5242880}
                            variant="button"
                            buttonClassName="w-full max-w-xs bg-primary text-primary-foreground hover:bg-primary/90"
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
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Hero Logo
                          </ObjectUploader>
                        )}
                      </div>
                  
                      {/* Invert Logo Toggle */}
                      <div className="flex items-center justify-between p-4 bg-[#f3faf9] rounded-lg">
                        <div className="space-y-0.5">
                          <Label htmlFor="invert-logo">Invert Logo for Dark Backgrounds</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable this if your logo is dark and you want it to appear white on dark hero sections.
                          </p>
                        </div>
                        <Switch
                          id="invert-logo"
                          checked={formData.invertLogo}
                          onCheckedChange={(checked) => setFormData({...formData, invertLogo: checked})}
                          data-testid="switch-invert-logo"
                        />
                      </div>
                    </div>

                    {/* Hero Transition Effect */}
                    <div className="grid gap-2 pt-4 border-t">
                      <Label>Hero Transition Effect</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Choose how your hero images transition between slides.
                      </p>
                      <RadioGroup
                        value={formData.heroTransition}
                        onValueChange={(value) => setFormData({...formData, heroTransition: value as HeroTransitionType})}
                        className="grid grid-cols-2 gap-3"
                      >
                        {[
                          { value: 'slide', label: 'Slide', description: 'Classic horizontal sliding effect' },
                          { value: 'crossfade', label: 'Crossfade', description: 'Smooth fade between images' },
                          { value: 'kenburns', label: 'Ken Burns', description: 'Gentle zoom with fade transition' },
                          { value: 'liquid-webgl', label: 'Liquid Wipe', description: 'Premium WebGL distortion effect' },
                        ].map((option) => (
                          <Label
                            key={option.value}
                            htmlFor={`transition-${option.value}`}
                            className={`flex flex-col cursor-pointer rounded-lg border-2 p-4 transition-all ${
                              formData.heroTransition === option.value
                                ? 'border-primary bg-primary/5'
                                : 'border-muted bg-gray-50 hover:border-muted-foreground/50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value={option.value} id={`transition-${option.value}`} />
                              <span className="font-medium">{option.label}</span>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1 ml-6">{option.description}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Hero Slides - for Modern Layout */}
                    {formData.layoutId === 'layout-modern' && (
                      <div className="grid gap-4 pt-4 border-t">
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
                          <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                            <p className="text-muted-foreground mb-3">No hero slides added yet</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
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
                          <div key={index} className="border rounded-lg p-4 bg-[#f3faf9]">
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
                            <div className="grid gap-3">
                              <Input
                                className="bg-[#ffffff]"
                                placeholder="Title (e.g., Stunning Modern Home)"
                                value={slide.title}
                                onChange={(e) => {
                                  const updated = [...formData.heroSlides];
                                  updated[index] = { ...updated[index], title: e.target.value };
                                  setFormData({...formData, heroSlides: updated});
                                }}
                                data-testid={`input-slide-title-${index}`}
                              />
                              <Input
                                className="bg-[#ffffff]"
                                placeholder="Subtitle (e.g., Experience luxury living)"
                                value={slide.subtitle}
                                onChange={(e) => {
                                  const updated = [...formData.heroSlides];
                                  updated[index] = { ...updated[index], subtitle: e.target.value };
                                  setFormData({...formData, heroSlides: updated});
                                }}
                                data-testid={`input-slide-subtitle-${index}`}
                              />
                              {photos.length > 0 && (
                                <div className="grid gap-2">
                                  <Label className="text-sm text-muted-foreground">Background Image</Label>
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
                      </div>
                    )}
                  </div>

                  {/* ===== LAYOUT IMAGES SECTION ===== */}
                  {(formData.layoutId === 'layout-shoalwood' || formData.layoutId === 'layout-modern') && (
                    <div className="rounded-xl border bg-card p-6 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-semibold text-lg">Layout Images</h3>
                          <p className="text-sm text-muted-foreground">The layout you chose has additional images.</p>
                        </div>
                      </div>

                      {/* Description Image */}
                      <div className="flex items-center gap-4 p-3 rounded-lg bg-[#f3faf9]">
                        <div className="flex-shrink-0">
                          {formData.descriptionImage ? (
                            <div className="w-16 h-20 rounded overflow-hidden border">
                              <img src={formData.descriptionImage} alt="Description" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-16 h-20 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Description Image</p>
                          <p className="text-xs text-muted-foreground">Portrait image next to description</p>
                        </div>
                        {formData.descriptionImage ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData({...formData, descriptionImage: ""})}
                            className="text-muted-foreground hover:text-destructive"
                            data-testid="button-remove-description-image"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        ) : (
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            variant="button"
                            buttonClassName="text-sm"
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
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </ObjectUploader>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ===== MAGAZINE LAYOUT OPTIONS ===== */}
                  {formData.layoutId === 'layout-magazine' && (
                    <div className="rounded-xl border bg-card p-6 space-y-6">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <Settings className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">Layout Options</h3>
                      </div>
                      {/* Buyer Agent Compensation */}
                      <div className="grid gap-2">
                        <Label htmlFor="buyerAgentComp">Buyer Agent Compensation (Optional)</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Text displayed above the price in the hero section, e.g., "3% Buyers Agent Compensation"
                        </p>
                        <Input
                          id="buyerAgentComp"
                          placeholder="e.g., 3% Buyers Agent Compensation"
                          value={formData.buyerAgentComp}
                          onChange={(e) => setFormData({...formData, buyerAgentComp: e.target.value})}
                          data-testid="input-buyer-agent-comp"
                        />
                      </div>

                      {/* Brochure Upload */}
                      <div className="grid gap-2">
                        <Label>Brochure (Optional)</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload a downloadable brochure PDF for this property.
                        </p>
                        {formData.brochureUrl ? (
                          <div className="flex items-center gap-3 p-3 bg-[#f3faf9] rounded-lg">
                            <FileText className="h-8 w-8 text-primary" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">Brochure uploaded</p>
                              <a 
                                href={formData.brochureUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:underline"
                              >
                                View brochure
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, brochureUrl: ''})}
                              className="bg-destructive text-white p-1.5 rounded-full"
                              data-testid="button-remove-brochure"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={20971520}
                            variant="dropzone"
                            onGetUploadParameters={async () => {
                              const { url } = await getUploadUrl();
                              return { method: 'PUT' as const, url };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const normalizedUrl = normalizeObjectUrl(result.successful[0].uploadURL);
                                setFormData({...formData, brochureUrl: normalizedUrl});
                              }
                            }}
                          />
                        )}
                      </div>

                      {/* Open Houses */}
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Open House Schedule</Label>
                            <p className="text-sm text-muted-foreground">
                              Add open house events for this property.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newEvent: OpenHouseEvent = { label: '', date: '', startTime: '', endTime: '' };
                              setFormData({...formData, openHouses: [...formData.openHouses, newEvent]});
                            }}
                            data-testid="button-add-open-house"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Open House
                          </Button>
                        </div>

                        {formData.openHouses.length === 0 && (
                          <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                            <p className="text-muted-foreground mb-4">No open houses scheduled yet</p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const newEvent: OpenHouseEvent = { label: '', date: '', startTime: '', endTime: '' };
                                setFormData({...formData, openHouses: [newEvent]});
                              }}
                              data-testid="button-add-first-open-house"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add First Open House
                            </Button>
                          </div>
                        )}

                        {formData.openHouses.map((oh, ohIndex) => (
                          <div key={ohIndex} className="border rounded-lg p-4 bg-[#f3faf9]">
                            <div className="flex items-center justify-between mb-4">
                              <span className="font-medium text-sm">Open House {ohIndex + 1}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  const updated = formData.openHouses.filter((_, i) => i !== ohIndex);
                                  setFormData({...formData, openHouses: updated});
                                }}
                                data-testid={`button-remove-open-house-${ohIndex}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor={`oh-label-${ohIndex}`}>Label (Optional)</Label>
                                <Input
                                  id={`oh-label-${ohIndex}`}
                                  className="bg-[#ffffff]"
                                  placeholder="e.g., Broker Open"
                                  value={oh.label || ''}
                                  onChange={(e) => {
                                    const updated = [...formData.openHouses];
                                    updated[ohIndex] = { ...updated[ohIndex], label: e.target.value };
                                    setFormData({...formData, openHouses: updated});
                                  }}
                                  data-testid={`input-oh-label-${ohIndex}`}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`oh-date-${ohIndex}`}>Date</Label>
                                <Input
                                  id={`oh-date-${ohIndex}`}
                                  className="bg-[#ffffff]"
                                  type="date"
                                  value={oh.date}
                                  onChange={(e) => {
                                    const updated = [...formData.openHouses];
                                    updated[ohIndex] = { ...updated[ohIndex], date: e.target.value };
                                    setFormData({...formData, openHouses: updated});
                                  }}
                                  data-testid={`input-oh-date-${ohIndex}`}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`oh-start-${ohIndex}`}>Start Time</Label>
                                <Input
                                  id={`oh-start-${ohIndex}`}
                                  className="bg-[#ffffff]"
                                  type="time"
                                  value={oh.startTime}
                                  onChange={(e) => {
                                    const updated = [...formData.openHouses];
                                    updated[ohIndex] = { ...updated[ohIndex], startTime: e.target.value };
                                    setFormData({...formData, openHouses: updated});
                                  }}
                                  data-testid={`input-oh-start-${ohIndex}`}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`oh-end-${ohIndex}`}>End Time</Label>
                                <Input
                                  id={`oh-end-${ohIndex}`}
                                  className="bg-[#ffffff]"
                                  type="time"
                                  value={oh.endTime}
                                  onChange={(e) => {
                                    const updated = [...formData.openHouses];
                                    updated[ohIndex] = { ...updated[ohIndex], endTime: e.target.value };
                                    setFormData({...formData, openHouses: updated});
                                  }}
                                  data-testid={`input-oh-end-${ohIndex}`}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Content Grid Images */}
                      {photos.length > 0 && (
                        <div className="grid gap-4">
                          <div>
                            <Label>Content Section Images</Label>
                            <p className="text-sm text-muted-foreground">
                              Select images from your gallery to display in the content section grid.
                            </p>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Grid Image 1 (Top Right) */}
                            <div className="border rounded-lg p-4 space-y-3 bg-[#f3faf9]">
                              <Label className="text-sm font-medium">Top Right Image</Label>
                              {formData.contentGridImage1 ? (
                                <div className="space-y-3">
                                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                    <img
                                      src={formData.contentGridImage1}
                                      alt="Selected top right"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setImagePickerTarget('contentGridImage1');
                                        setImagePickerOpen(true);
                                      }}
                                      data-testid="button-change-grid-image-1"
                                    >
                                      Change
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setFormData({...formData, contentGridImage1: ''})}
                                      className="text-muted-foreground"
                                      data-testid="button-clear-grid-image-1"
                                    >
                                      Clear
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full h-24 border-dashed"
                                  onClick={() => {
                                    setImagePickerTarget('contentGridImage1');
                                    setImagePickerOpen(true);
                                  }}
                                  data-testid="button-select-grid-image-1"
                                >
                                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Image className="h-6 w-6" />
                                    <span>Select Image</span>
                                  </div>
                                </Button>
                              )}
                            </div>

                            {/* Grid Image 2 (Bottom Left) */}
                            <div className="border rounded-lg p-4 space-y-3 bg-[#f3faf9]">
                              <Label className="text-sm font-medium">Bottom Left Image</Label>
                              {formData.contentGridImage2 ? (
                                <div className="space-y-3">
                                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                    <img
                                      src={formData.contentGridImage2}
                                      alt="Selected bottom left"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setImagePickerTarget('contentGridImage2');
                                        setImagePickerOpen(true);
                                      }}
                                      data-testid="button-change-grid-image-2"
                                    >
                                      Change
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setFormData({...formData, contentGridImage2: ''})}
                                      className="text-muted-foreground"
                                      data-testid="button-clear-grid-image-2"
                                    >
                                      Clear
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full h-24 border-dashed"
                                  onClick={() => {
                                    setImagePickerTarget('contentGridImage2');
                                    setImagePickerOpen(true);
                                  }}
                                  data-testid="button-select-grid-image-2"
                                >
                                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Image className="h-6 w-6" />
                                    <span>Select Image</span>
                                  </div>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Image Picker Sheet */}
                      <Sheet open={imagePickerOpen} onOpenChange={setImagePickerOpen}>
                        <SheetContent side="right" className="w-full sm:max-w-md">
                          <SheetHeader>
                            <SheetTitle>
                              Select {imagePickerTarget === 'contentGridImage1' ? 'Top Right' : 'Bottom Left'} Image
                            </SheetTitle>
                          </SheetHeader>
                          <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                            <div className="grid grid-cols-2 gap-3">
                              {photos.map((photo, photoIndex) => {
                                const isSelected = imagePickerTarget === 'contentGridImage1' 
                                  ? formData.contentGridImage1 === photo
                                  : formData.contentGridImage2 === photo;
                                return (
                                  <div
                                    key={photoIndex}
                                    className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:opacity-90 ${
                                      isSelected 
                                        ? 'border-primary ring-2 ring-primary/20' 
                                        : 'border-transparent hover:border-primary/50'
                                    }`}
                                    onClick={() => {
                                      if (imagePickerTarget) {
                                        setFormData({...formData, [imagePickerTarget]: photo});
                                        setImagePickerOpen(false);
                                        setImagePickerTarget(null);
                                      }
                                    }}
                                    data-testid={`picker-image-${photoIndex}`}
                                  >
                                    <img
                                      src={photo}
                                      alt={`Photo ${photoIndex + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    {isSelected && (
                                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                        <Check className="h-8 w-8 text-white drop-shadow-lg" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        </SheetContent>
                      </Sheet>
                    </div>
                  )}
                    </TabsContent>

                    <TabsContent value="seo" className="space-y-6">
                      {/* ===== SEO SECTION ===== */}
                      <div className="rounded-xl border p-6 space-y-4 bg-[#ffffff]">
                        <div className="flex items-center gap-2 pb-2 border-b">
                          <Search className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-lg">Search Engine Optimization</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Customize how your property site appears in search results and when shared on social media.
                        </p>

                        <div className="bg-[#f3faf9] rounded-xl p-4 space-y-6">
                          {/* SEO Title */}
                          <div className="grid gap-2">
                            <Label htmlFor="seoTitle">SEO Title</Label>
                            <p className="text-sm text-muted-foreground">
                              The title that appears in search results and browser tabs. If empty, we'll use your property title.
                            </p>
                            <Input
                              id="seoTitle"
                              className="bg-[#ffffff]"
                              placeholder={formData.title || formData.address || "e.g., Stunning 4BR Home in Austin Heights"}
                              value={formData.seoTitle}
                              onChange={(e) => setFormData({...formData, seoTitle: e.target.value})}
                              maxLength={60}
                              data-testid="input-seo-title"
                            />
                            <span className="text-xs text-muted-foreground">{formData.seoTitle.length}/60 characters</span>
                          </div>

                          {/* SEO Description */}
                          <div className="grid gap-2">
                            <Label htmlFor="seoDescription">SEO Description</Label>
                            <p className="text-sm text-muted-foreground">
                              A brief description that appears under the title in search results. For best results, aim for 150-160 characters.
                            </p>
                            <Textarea
                              id="seoDescription"
                              className="bg-[#ffffff]"
                              placeholder="e.g., Beautiful 4 bedroom, 3 bathroom home featuring a pool, updated kitchen, and stunning views. Listed at $850,000."
                              value={formData.seoDescription}
                              onChange={(e) => setFormData({...formData, seoDescription: e.target.value})}
                              maxLength={160}
                              rows={3}
                              data-testid="input-seo-description"
                            />
                            <span className="text-xs text-muted-foreground">{formData.seoDescription.length}/160 characters (optimal: 150-160)</span>
                          </div>

                          {/* SEO Image Picker */}
                          <div className="grid gap-2">
                            <Label>Image Shown When Shared</Label>
                            <p className="text-sm text-muted-foreground">
                              Select an image from your gallery that will be displayed when your site is shared on social media.
                            </p>
                            
                            {formData.seoImage ? (
                              <div className="relative w-full max-w-md">
                                <div className="aspect-[1200/630] rounded-lg overflow-hidden border bg-white">
                                  <img 
                                    src={formData.seoImage} 
                                    alt="SEO preview" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setImagePickerTarget('seoImage' as any);
                                      setImagePickerOpen(true);
                                    }}
                                    data-testid="button-change-seo-image"
                                  >
                                    Change Image
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground"
                                    onClick={() => setFormData({...formData, seoImage: ""})}
                                    data-testid="button-remove-seo-image"
                                  >
                                    Clear
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-4 gap-2">
                                {photos.length > 0 ? photos.slice(0, 8).map((photo, idx) => (
                                  <div
                                    key={idx}
                                    className="aspect-video rounded-md overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all"
                                    onClick={() => setFormData({...formData, seoImage: photo})}
                                    data-testid={`seo-image-option-${idx}`}
                                  >
                                    <img src={photo} alt={`Option ${idx + 1}`} className="w-full h-full object-cover" />
                                  </div>
                                )) : (
                                  <div className="col-span-4 border-2 border-dashed border-muted rounded-lg p-6 text-center bg-white">
                                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                                    <p className="text-muted-foreground text-sm">Add photos in Step 2 to select a share image</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Custom Google Analytics */}
                          <div className="grid gap-2 border-t pt-6">
                            <Label htmlFor="customGaId" className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Custom Google Analytics
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Add your own Google Analytics measurement ID to track visitors on this property site separately.
                            </p>
                            <Input
                              id="customGaId"
                              className="bg-[#ffffff]"
                              placeholder="G-XXXXXXXXXX"
                              value={formData.customGaId}
                              onChange={(e) => setFormData({...formData, customGaId: e.target.value})}
                              data-testid="input-custom-ga-id"
                            />
                            <span className="text-xs text-muted-foreground">
                              Enter your GA4 Measurement ID (found in Google Analytics → Admin → Data Streams)
                            </span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="documents" className="space-y-6">
                      {/* ===== DOCUMENTS SECTION ===== */}
                      <div className="rounded-xl border p-6 space-y-4 bg-[#ffffff]">
                        <div className="flex items-center gap-2 pb-2 border-b">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-lg">Property Documents</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Upload documents like floor plans, disclosures, or brochures. Visitors can download these from your property site.
                        </p>

                        <div className="bg-[#f3faf9] rounded-xl p-4 space-y-4">
                          {/* Document Upload */}
                          <div className="flex gap-3">
                            <Input
                              placeholder="Document name (e.g., Floor Plan, Property Disclosure)"
                              value={newDocName}
                              onChange={(e) => setNewDocName(e.target.value)}
                              className="flex-1 bg-[#ffffff]"
                              data-testid="input-document-name"
                            />
                            <ObjectUploader
                              maxNumberOfFiles={1}
                              maxFileSize={52428800}
                              allowedFileTypes={['application/pdf', 'image/*']}
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
                              buttonClassName="gap-2 bg-primary text-white hover:bg-primary/90"
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
                                className="w-48 bg-[#ffffff]"
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
                          {documents.length > 0 ? (
                            <div className="space-y-2">
                              <Label className="text-sm text-muted-foreground">Uploaded Documents ({documents.length})</Label>
                              <div className="border rounded-lg divide-y bg-white">
                                {documents.map((doc, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 hover:bg-muted/30" data-testid={`document-item-${index}`}>
                                    <div className="flex items-center gap-3">
                                      <FileText className="h-5 w-5 text-primary" />
                                      <span className="font-medium">{doc.name}</span>
                                    </div>
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
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center bg-white">
                              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                              <p className="text-muted-foreground text-sm">No documents uploaded yet.</p>
                              <p className="text-muted-foreground text-xs mt-1">Enter a document name and click Upload to add one.</p>
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
              <div className="space-y-6">
                {/* Profile Incomplete Warning */}
                {isProfileIncomplete && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-amber-100">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-amber-800 mb-1">Complete Your Profile</h3>
                          <p className="text-sm text-amber-700 mb-3">
                            Your contact information will appear on your property site. Complete your profile to ensure buyers can reach you.
                          </p>
                          <div className="flex flex-wrap gap-3 mb-3">
                            {profileChecklist.map((item) => (
                              <div key={item.label} className="flex items-center gap-1.5 text-sm">
                                {item.done ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <X className="h-4 w-4 text-amber-600" />
                                )}
                                <span className={item.done ? 'text-green-700' : 'text-amber-700'}>{item.label}</span>
                              </div>
                            ))}
                          </div>
                          <Link href="/profile">
                            <Button variant="outline" size="sm" className="border-amber-300 hover:bg-amber-100">
                              Complete Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                      
                      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded space-y-1">
                        <div>Your current balance: <span className="font-bold text-foreground">{user?.credits ?? 0} Credits</span></div>
                        {hasTrialCredits && (
                          <div className="text-primary">
                            Trial Credit Available! <span className="font-bold">1 Free Site</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full gap-2" size="lg" onClick={handlePublish} disabled={!user || (user.credits < 1 && !hasTrialCredits)}>
                        <CreditCard className="h-4 w-4" />
                        {!user || (user.credits < 1 && !hasTrialCredits) ? "Insufficient Credits" : hasTrialCredits && user.credits < 1 ? "Use Trial Credit" : "Publish Site"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
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

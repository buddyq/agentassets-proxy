import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSite, useUpdateCredits, useThemes, useLayouts } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Check, ChevronRight, ChevronLeft, Layout, PaintBucket, CreditCard, LayoutGrid, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { CustomDetail } from "@shared/schema";

const STEPS = [
  { id: 1, name: "Property Details", icon: Layout },
  { id: 2, name: "Choose Layout", icon: LayoutGrid },
  { id: 3, name: "Color Theme", icon: PaintBucket },
  { id: 4, name: "Review", icon: CreditCard },
];

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
    videoUrl: "",
    layoutId: '',
    themeId: '',
  });
  
  // Custom details state
  const [customDetails, setCustomDetails] = useState<CustomDetail[]>([]);
  
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

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
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
        imageUrl: null,
        videoUrl: formData.videoUrl || null,
        layoutId: formData.layoutId,
        templateId: null,
        themeId: formData.themeId,
        customDomain: null,
        customDetails: validCustomDetails,
        status: 'published',
        photos: [],
        heroPhotos: [],
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

            {/* Step 2: Choose Layout */}
            {step === 2 && (
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

            {/* Step 3: Color Theme */}
            {step === 3 && (
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

            {/* Step 4: Review */}
            {step === 4 && (
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
              
              {step < 4 && (
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

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore, TEMPLATES } from "@/lib/store";
import { useState } from "react";
import { useLocation } from "wouter";
import { Check, ChevronRight, ChevronLeft, Upload, Layout, PaintBucket, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STEPS = [
  { id: 1, name: "Property Details", icon: Layout },
  { id: 2, name: "Choose Template", icon: Layout },
  { id: 3, name: "Branding", icon: PaintBucket },
  { id: 4, name: "Review", icon: CreditCard },
];

export default function CreateSite() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { addSite, themes, user, deductCredit } = useStore();
  const { toast } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    address: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    description: "",
    videoUrl: "",
    templateId: TEMPLATES[0].id,
    themeId: themes[0].id,
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePublish = () => {
    if (user.credits < 1) {
      toast({
        variant: "destructive",
        title: "Insufficient Credits",
        description: "Please purchase more credits to publish this site.",
      });
      return;
    }

    const success = deductCredit();
    if (success) {
      addSite({
        address: formData.address,
        price: formData.price,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        sqft: parseInt(formData.sqft) || 0,
        description: formData.description,
        imageUrl: "", // Mock placeholder would go here
        videoUrl: formData.videoUrl,
        templateId: formData.templateId,
        themeId: formData.themeId,
        status: 'published'
      });
      
      toast({
        title: "Site Published!",
        description: "Your new property site is live.",
      });
      
      setLocation("/dashboard");
    }
  };

  const selectedTemplate = TEMPLATES.find(t => t.id === formData.templateId);
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
                    <Label htmlFor="address">Property Address</Label>
                    <Input 
                      id="address" 
                      placeholder="123 Main St, Beverly Hills, CA" 
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price</Label>
                      <Input 
                        id="price" 
                        placeholder="$1,250,000" 
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sqft">Square Feet</Label>
                      <Input 
                        id="sqft" 
                        type="number" 
                        placeholder="2500" 
                        value={formData.sqft}
                        onChange={e => setFormData({...formData, sqft: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="beds">Bedrooms</Label>
                      <Select 
                        value={formData.bedrooms} 
                        onValueChange={v => setFormData({...formData, bedrooms: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="baths">Bathrooms</Label>
                      <Select 
                        value={formData.bathrooms} 
                        onValueChange={v => setFormData({...formData, bathrooms: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe the property..." 
                      className="h-32"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="videoUrl">Video URL (YouTube or Vimeo)</Label>
                    <Input 
                      id="videoUrl" 
                      placeholder="https://www.youtube.com/watch?v=..." 
                      value={formData.videoUrl}
                      onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Property Photos</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Drag and drop photos here, or click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">(Mock upload - no file will be stored)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Choose Template */}
            {step === 2 && (
              <div className="grid md:grid-cols-3 gap-6">
                {TEMPLATES.map((template) => (
                  <div 
                    key={template.id}
                    className={`cursor-pointer group relative rounded-xl overflow-hidden border-2 transition-all ${
                      formData.templateId === template.id 
                        ? "border-primary ring-2 ring-primary/20 shadow-lg" 
                        : "border-transparent hover:border-primary/50"
                    }`}
                    onClick={() => setFormData({...formData, templateId: template.id})}
                  >
                    <div className="aspect-[4/3] relative">
                      <img 
                        src={template.thumbnailUrl} 
                        alt={template.name} 
                        className="w-full h-full object-cover"
                      />
                      {formData.templateId === template.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-white rounded-full p-2">
                            <Check className="h-6 w-6" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-white">
                      <h3 className="font-bold text-lg">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Branding */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Choose Theme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <RadioGroup 
                      value={formData.themeId} 
                      onValueChange={v => setFormData({...formData, themeId: v})}
                      className="grid md:grid-cols-2 gap-4"
                    >
                      {themes.map((theme) => (
                        <div key={theme.id}>
                          <RadioGroupItem value={theme.id} id={theme.id} className="peer sr-only" />
                          <Label
                            htmlFor={theme.id}
                            className="flex items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex gap-1">
                                <div className="h-8 w-8 rounded-full border" style={{ backgroundColor: theme.colors.primary }} />
                                <div className="h-8 w-8 rounded-full border -ml-4" style={{ backgroundColor: theme.colors.secondary }} />
                              </div>
                              <div>
                                <div className="font-semibold">{theme.name}</div>
                                <div className="text-xs text-muted-foreground capitalize">{theme.type} Theme</div>
                              </div>
                            </div>
                            {formData.themeId === theme.id && <Check className="h-4 w-4 text-primary" />}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  {/* Live Preview */}
                  <div className="mt-8 border rounded-xl overflow-hidden shadow-lg">
                    <div className="bg-muted p-2 text-xs text-center border-b">Theme Preview</div>
                    {selectedTheme && selectedTemplate && (
                      <div className="relative aspect-video bg-white">
                        {/* Mock Preview of Selected Template with Theme Colors */}
                         <div className="absolute inset-0 flex flex-col">
                           <div className="h-12 flex items-center justify-between px-8" style={{ backgroundColor: 'white', borderBottom: `1px solid ${selectedTheme.colors.secondary}20` }}>
                             <div className="font-bold text-lg" style={{ color: selectedTheme.colors.primary }}>AGENCY LOGO</div>
                             <div className="flex gap-4 text-sm font-medium" style={{ color: selectedTheme.colors.secondary }}>
                               <span>Home</span>
                               <span>Details</span>
                               <span>Contact</span>
                             </div>
                           </div>
                           <div className="flex-1 relative">
                              <img src={selectedTemplate.thumbnailUrl} className="w-full h-full object-cover opacity-50" />
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                <h1 className="text-3xl font-bold mb-2 text-shadow" style={{ color: selectedTheme.colors.primary }}>{formData.address || "123 Property Address"}</h1>
                                <p className="text-xl font-medium text-shadow" style={{ color: selectedTheme.colors.secondary }}>{formData.price || "$1,000,000"}</p>
                                <Button className="mt-4" style={{ backgroundColor: selectedTheme.colors.primary }}>Schedule Viewing</Button>
                              </div>
                           </div>
                         </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Review Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
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
                        Your current balance: <span className="font-bold text-foreground">{user.credits} Credits</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full gap-2" size="lg" onClick={handlePublish} disabled={user.credits < 1}>
                        <CreditCard className="h-4 w-4" />
                        {user.credits < 1 ? "Insufficient Credits" : "Publish Site"}
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

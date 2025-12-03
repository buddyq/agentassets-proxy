import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateUserProfile, getUploadUrl, normalizeObjectUrl } from "@/lib/api";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Youtube, Facebook, Linkedin, X, Image, Trash2 } from "lucide-react";
import { useNavigate } from "wouter";

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const updateProfileMutation = useUpdateUserProfile();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    brokerage: user?.brokerage || "",
    teamName: user?.teamName || "",
    address: user?.address || "",
    logo: user?.logo || null as string | null,
    profileImageUrl: user?.profileImageUrl || null as string | null,
    socialMedia: {
      instagram: user?.socialMedia?.instagram || "",
      youtube: user?.socialMedia?.youtube || "",
      facebook: user?.socialMedia?.facebook || "",
      linkedin: user?.socialMedia?.linkedin || "",
      x: user?.socialMedia?.x || "",
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialMediaChange = (platform: keyof typeof formData.socialMedia, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleProfileImageUpload = (result: { successful?: { uploadURL: string }[] }) => {
    if (result.successful && result.successful.length > 0) {
      const normalizedUrl = normalizeObjectUrl(result.successful[0].uploadURL);
      setFormData(prev => ({
        ...prev,
        profileImageUrl: normalizedUrl
      }));
      toast({
        title: "Profile Image Uploaded",
        description: "Your profile photo has been updated.",
      });
    }
  };

  const handleLogoUpload = (result: { successful?: { uploadURL: string }[] }) => {
    if (result.successful && result.successful.length > 0) {
      const normalizedUrl = normalizeObjectUrl(result.successful[0].uploadURL);
      setFormData(prev => ({
        ...prev,
        logo: normalizedUrl
      }));
      toast({
        title: "Logo Uploaded",
        description: "Your default logo has been updated.",
      });
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo: null
    }));
  };

  const handleRemoveProfileImage = () => {
    setFormData(prev => ({
      ...prev,
      profileImageUrl: null
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "Profile Updated",
          description: "Your agent information has been saved.",
        });
        navigate("/dashboard");
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update profile.",
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">Agent Profile</h1>
          <p className="text-muted-foreground">Manage your agent information and branding</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {formData.profileImageUrl ? (
                  <div className="relative">
                    <img 
                      src={formData.profileImageUrl} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveProfileImage}
                      className="absolute top-0 right-0 bg-destructive text-white rounded-full p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <ObjectUploader 
                    onUploadComplete={handleProfileImageUpload}
                    folder="profile-images"
                  >
                    <Button type="button" variant="outline">
                      {formData.profileImageUrl ? "Change Photo" : "Upload Photo"}
                    </Button>
                  </ObjectUploader>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo Section */}
          <Card>
            <CardHeader>
              <CardTitle>Default Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {formData.logo ? (
                  <div className="relative">
                    <img 
                      src={formData.logo} 
                      alt="Logo" 
                      className="h-16 w-auto max-w-[120px] object-contain border rounded"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute top-0 right-0 bg-destructive text-white rounded-full p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-16 w-32 bg-muted rounded flex items-center justify-center">
                    <Image className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <ObjectUploader 
                    onUploadComplete={handleLogoUpload}
                    folder="logos"
                  >
                    <Button type="button" variant="outline">
                      {formData.logo ? "Change Logo" : "Upload Logo"}
                    </Button>
                  </ObjectUploader>
                  <p className="text-xs text-muted-foreground mt-2">This logo will appear on all your property sites</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    data-testid="input-phone"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  data-testid="input-email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brokerage">Brokerage</Label>
                  <Input
                    id="brokerage"
                    name="brokerage"
                    value={formData.brokerage}
                    onChange={handleInputChange}
                    data-testid="input-brokerage"
                  />
                </div>
                <div>
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    data-testid="input-teamName"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  data-testid="input-address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media Section */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Instagram className="h-4 w-4 text-pink-600" />
                  <Input
                    placeholder="Instagram URL"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                    className="flex-1"
                    data-testid="input-instagram"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Youtube className="h-4 w-4 text-red-600" />
                  <Input
                    placeholder="YouTube URL"
                    value={formData.socialMedia.youtube}
                    onChange={(e) => handleSocialMediaChange('youtube', e.target.value)}
                    className="flex-1"
                    data-testid="input-youtube"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  <Input
                    placeholder="Facebook URL"
                    value={formData.socialMedia.facebook}
                    onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                    className="flex-1"
                    data-testid="input-facebook"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Linkedin className="h-4 w-4 text-blue-700" />
                  <Input
                    placeholder="LinkedIn URL"
                    value={formData.socialMedia.linkedin}
                    onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                    className="flex-1"
                    data-testid="input-linkedin"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <X className="h-4 w-4 text-black" />
                  <Input
                    placeholder="X (Twitter) URL"
                    value={formData.socialMedia.x}
                    onChange={(e) => handleSocialMediaChange('x', e.target.value)}
                    className="flex-1"
                    data-testid="input-x"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button type="submit" size="lg" disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
              {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate("/dashboard")} data-testid="button-cancel">
              Cancel
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

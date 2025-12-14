import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateUserProfile, useChangePassword, getUploadUrl, normalizeObjectUrl, useBrokerage } from "@/lib/api";
import { ObjectUploader } from "@/components/ObjectUploader";
import { ImageCropper } from "@/components/ImageCropper";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Youtube, Facebook, Linkedin, X, Image, Trash2, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { useLocation } from "wouter";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const updateProfileMutation = useUpdateUserProfile();
  const changePasswordMutation = useChangePassword();
  const { data: brokerageData } = useBrokerage();
  
  const isBrokerageAdmin = brokerageData?.membership?.role === 'admin';

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState<string | null>(null);
  const [isUploadingCroppedImage, setIsUploadingCroppedImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
        brokerage: user.brokerage || "",
        teamName: user.teamName || "",
        address: user.address || "",
        logo: user.logo || null,
        profileImageUrl: user.profileImageUrl || null,
        socialMedia: {
          instagram: user.socialMedia?.instagram || "",
          youtube: user.socialMedia?.youtube || "",
          facebook: user.socialMedia?.facebook || "",
          linkedin: user.socialMedia?.linkedin || "",
          x: user.socialMedia?.x || "",
        },
      });
    }
  }, [user]);

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
        variant: "success",
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImageForCrop(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCroppedImage = async (blob: Blob) => {
    setIsUploadingCroppedImage(true);
    try {
      const { url } = await getUploadUrl();
      const response = await fetch(url, { 
        method: 'PUT', 
        body: blob,
        headers: { 'Content-Type': 'image/jpeg' }
      });
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }
      const normalizedUrl = normalizeObjectUrl(url);
      setFormData(prev => ({ ...prev, profileImageUrl: normalizedUrl }));
      toast({
        title: "Profile Image Uploaded",
        description: "Your profile photo has been updated.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error uploading cropped image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload your profile photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingCroppedImage(false);
      setSelectedImageForCrop(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "Profile Updated",
          description: "Your agent information has been saved.",
          variant: "success",
        });
        setLocation("/dashboard");
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

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate(
      { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword },
      {
        onSuccess: () => {
          toast({
            title: "Password Changed",
            description: "Your password has been updated successfully.",
            variant: "success",
          });
          setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to change password.",
            variant: "destructive",
          });
        }
      }
    );
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

        {/* Setup Guide */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Profile Setup Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground">
              Complete your profile to ensure your information displays correctly on your property microsites. Nothing is required, but we highly recommend filling out these sections:
            </p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Profile Picture</h4>
                  <p className="text-xs text-muted-foreground">Appears as your profile avatar on property sites and contact forms</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Default Logo</h4>
                  <p className="text-xs text-muted-foreground">Displays in the navigation and hero section of all your property sites</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Basic Information</h4>
                  <p className="text-xs text-muted-foreground">Name, phone, email, and office details shown on your property sites</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Social Media</h4>
                  <p className="text-xs text-muted-foreground">Links to your social profiles appear in the contact section</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    data-testid="input-profile-image"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingCroppedImage}
                    data-testid="button-upload-profile-image"
                  >
                    {isUploadingCroppedImage ? "Uploading..." : formData.profileImageUrl ? "Change Photo" : "Upload Photo"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedImageForCrop && (
            <ImageCropper
              imageSrc={selectedImageForCrop}
              open={cropperOpen}
              onClose={() => {
                setCropperOpen(false);
                setSelectedImageForCrop(null);
              }}
              onCropComplete={handleCroppedImage}
              aspectRatio={1}
              cropShape="round"
            />
          )}

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
                    onGetUploadParameters={getUploadUrl}
                    onComplete={handleLogoUpload}
                    buttonClassName="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {formData.logo ? "Change Logo" : "Upload Logo"}
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
              {!isBrokerageAdmin && (
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
              )}
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
            <Button type="button" variant="outline" size="lg" onClick={() => setLocation("/dashboard")} data-testid="button-cancel">
              Cancel
            </Button>
          </div>
        </form>

        {/* Change Password Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  data-testid="input-current-password"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="At least 8 characters"
                  data-testid="input-new-password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  data-testid="input-confirm-password"
                />
              </div>
              <Button 
                type="submit" 
                disabled={changePasswordMutation.isPending || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                data-testid="button-change-password"
              >
                {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

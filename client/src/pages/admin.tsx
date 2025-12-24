import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Theme, Layout, Coupon, User } from "@shared/schema";
import { 
  useThemes, useCreateTheme, useUpdateTheme, useDeleteTheme, 
  useLayouts, useCreateLayout, useUpdateLayout, useDeleteLayout,
  useAdminCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon,
  useAdminUsers, useAdminUpdateUserCredits, useAdminDeleteUser, useAdminUpdateUserProfile,
  useAdminBrokerages, useAdminBrokerageTemplates, useAdminAssignTemplateToBrokerage, useAdminRemoveTemplateFromBrokerage,
  useAdminAllBrokerageTemplates,
  useAdminStats,
  useAdminSampleSites,
  useCaptureScreenshot,
  useCreateSampleSite,
  type BrokerageWithOwner, type BrokerageTemplate
} from "@/lib/api";
import { Plus, Palette, Trash2, Shield, Pencil, LayoutTemplate, Ticket, Users, CreditCard, Gift, Clock, Hash, Calendar, Loader2, Building2, Check, Infinity, TrendingUp, Eye, FileText, ArrowUpRight, Globe, Camera, Link, Image } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: themes = [] } = useThemes();
  const { data: layouts = [] } = useLayouts({ preset: true });
  const { data: coupons = [], isError: couponsError } = useAdminCoupons();
  const { data: users = [], isError: usersError } = useAdminUsers();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: sampleSites = [], refetch: refetchSampleSites } = useAdminSampleSites();
  const captureScreenshotMutation = useCaptureScreenshot();
  const createSampleSiteMutation = useCreateSampleSite();
  const createThemeMutation = useCreateTheme();
  const updateThemeMutation = useUpdateTheme();
  const deleteThemeMutation = useDeleteTheme();
  const createLayoutMutation = useCreateLayout();
  const updateLayoutMutation = useUpdateLayout();
  const deleteLayoutMutation = useDeleteLayout();
  const createCouponMutation = useCreateCoupon();
  const updateCouponMutation = useUpdateCoupon();
  const deleteCouponMutation = useDeleteCoupon();
  const updateUserCreditsMutation = useAdminUpdateUserCredits();
  const updateUserProfileMutation = useAdminUpdateUserProfile();
  const deleteUserMutation = useAdminDeleteUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUserProfileDialogOpen, setIsUserProfileDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLayoutDialogOpen, setIsLayoutDialogOpen] = useState(false);
  const [isLayoutEditDialogOpen, setIsLayoutEditDialogOpen] = useState(false);
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const [isCouponEditDialogOpen, setIsCouponEditDialogOpen] = useState(false);
  const [isUserCreditsDialogOpen, setIsUserCreditsDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [editingLayout, setEditingLayout] = useState<Layout | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingUser, setEditingUser] = useState<Omit<User, 'password'> | null>(null);
  const { toast } = useToast();
  
  // Brokerage template management
  const { data: brokerages = [] } = useAdminBrokerages();
  const [selectedBrokerageId, setSelectedBrokerageId] = useState<string>("");
  const { data: brokerageTemplates = [], refetch: refetchBrokerageTemplates } = useAdminBrokerageTemplates(selectedBrokerageId);
  const { data: allBrokerageTemplates = [], refetch: refetchAllBrokerageTemplates } = useAdminAllBrokerageTemplates();
  const assignTemplateMutation = useAdminAssignTemplateToBrokerage();
  const removeTemplateMutation = useAdminRemoveTemplateFromBrokerage();
  const [isAssignLayoutDialogOpen, setIsAssignLayoutDialogOpen] = useState(false);
  const [selectedLayoutToAssign, setSelectedLayoutToAssign] = useState<string>("");
  
  const [couponCode, setCouponCode] = useState("");
  const [couponDescription, setCouponDescription] = useState("");
  const [couponType, setCouponType] = useState<string>("free_credits");
  const [couponValue, setCouponValue] = useState<number>(1);
  const [couponMaxUses, setCouponMaxUses] = useState<number | null>(null);
  const [couponExpiresAt, setCouponExpiresAt] = useState<string>("");
  const [couponIsActive, setCouponIsActive] = useState(true);
  const [editCouponCode, setEditCouponCode] = useState("");
  const [editCouponDescription, setEditCouponDescription] = useState("");
  const [editCouponType, setEditCouponType] = useState<string>("free_credits");
  const [editCouponValue, setEditCouponValue] = useState<number>(1);
  const [editCouponMaxUses, setEditCouponMaxUses] = useState<number | null>(null);
  const [editCouponExpiresAt, setEditCouponExpiresAt] = useState<string>("");
  const [editCouponIsActive, setEditCouponIsActive] = useState(true);
  const [newCreditsAmount, setNewCreditsAmount] = useState<number>(0);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserPhone, setEditUserPhone] = useState("");
  const [editUserBrokerage, setEditUserBrokerage] = useState("");
  const [editUserTeamName, setEditUserTeamName] = useState("");
  const [editUserAddress, setEditUserAddress] = useState("");
  const [editUserCredits, setEditUserCredits] = useState<number>(0);
  const [editUserIsAdmin, setEditUserIsAdmin] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [editName, setEditName] = useState("");
  const [editPrimaryColor, setEditPrimaryColor] = useState("#000000");
  const [editSecondaryColor, setEditSecondaryColor] = useState("#ffffff");
  const [editBackgroundColor, setEditBackgroundColor] = useState("#ffffff");
  const [editTextColor, setEditTextColor] = useState("#000000");
  const [newLayoutName, setNewLayoutName] = useState("");
  const [newLayoutDescription, setNewLayoutDescription] = useState("");
  const [newLayoutHeroStyle, setNewLayoutHeroStyle] = useState<"fullscreen" | "split" | "minimal" | "slider">("fullscreen");
  const [newLayoutGalleryStyle, setNewLayoutGalleryStyle] = useState<"grid" | "masonry" | "carousel" | "lightbox">("grid");
  const [newLayoutTypographyScale, setNewLayoutTypographyScale] = useState<"compact" | "normal" | "spacious">("normal");
  const [editLayoutName, setEditLayoutName] = useState("");
  const [editLayoutDescription, setEditLayoutDescription] = useState("");
  const [editLayoutHeroStyle, setEditLayoutHeroStyle] = useState<"fullscreen" | "split" | "minimal" | "slider">("fullscreen");
  const [editLayoutGalleryStyle, setEditLayoutGalleryStyle] = useState<"grid" | "masonry" | "carousel" | "lightbox">("grid");
  const [editLayoutTypographyScale, setEditLayoutTypographyScale] = useState<"compact" | "normal" | "spacious">("normal");
  
  // Sample Site Manager state
  const [capturingScreenshotForLayout, setCapturingScreenshotForLayout] = useState<string | null>(null);
  const [creatingSampleSiteForLayout, setCreatingSampleSiteForLayout] = useState<string | null>(null);
  const [linkSampleSiteDialogOpen, setLinkSampleSiteDialogOpen] = useState(false);
  const [selectedLayoutForLink, setSelectedLayoutForLink] = useState<Layout | null>(null);
  const [sampleSiteSlugInput, setSampleSiteSlugInput] = useState("");
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user || !user.isAdmin) {
    return <Redirect to="/" />;
  }

  const handleCreatePreset = () => {
    if (!newThemeName) return;
    
    createThemeMutation.mutate(
      {
        name: newThemeName,
        type: 'preset',
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          background: backgroundColor,
          text: textColor
        },
        logoUrl: null
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setNewThemeName("");
          setPrimaryColor("#000000");
          setSecondaryColor("#ffffff");
          setBackgroundColor("#ffffff");
          setTextColor("#000000");
          toast({
            title: "Global Theme Created",
            description: "New preset theme added to the library for all users.",
          });
        }
      }
    );
  };

  const handleEditTheme = (theme: Theme) => {
    setEditingTheme(theme);
    setEditName(theme.name);
    setEditPrimaryColor(theme.colors.primary);
    setEditSecondaryColor(theme.colors.secondary);
    setEditBackgroundColor(theme.colors.background);
    setEditTextColor(theme.colors.text);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingTheme || !editName) return;

    updateThemeMutation.mutate(
      {
        id: editingTheme.id,
        updates: {
          name: editName,
          colors: {
            primary: editPrimaryColor,
            secondary: editSecondaryColor,
            background: editBackgroundColor,
            text: editTextColor
          }
        }
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setEditingTheme(null);
          toast({
            title: "Theme Updated",
            description: "Global theme has been updated successfully.",
          });
        }
      }
    );
  };

  const handleDeleteTheme = (themeId: string) => {
    if (confirm("Are you sure you want to delete this theme? This action cannot be undone.")) {
      deleteThemeMutation.mutate(themeId, {
        onSuccess: () => {
          toast({
            title: "Theme Deleted",
            description: "Global theme has been removed.",
          });
        }
      });
    }
  };

  const handleCreateLayout = () => {
    if (!newLayoutName) return;
    
    createLayoutMutation.mutate(
      {
        name: newLayoutName,
        description: newLayoutDescription || null,
        type: 'preset',
        enabled: true,
        thumbnailUrl: null,
        sampleSiteSlug: null,
        structure: {
          heroStyle: newLayoutHeroStyle,
          galleryStyle: newLayoutGalleryStyle,
          detailsStyle: 'sidebar' as const,
          typography: {
            headingFont: 'Inter',
            bodyFont: 'Inter',
            headingWeight: '700',
            scale: newLayoutTypographyScale
          },
          sections: ['hero', 'details', 'description', 'gallery', 'video', 'contact']
        }
      },
      {
        onSuccess: () => {
          setIsLayoutDialogOpen(false);
          setNewLayoutName("");
          setNewLayoutDescription("");
          setNewLayoutHeroStyle("fullscreen");
          setNewLayoutGalleryStyle("grid");
          setNewLayoutTypographyScale("normal");
          toast({
            title: "Layout Created",
            description: "New global layout added to the library.",
          });
        }
      }
    );
  };

  const handleEditLayout = (layout: Layout) => {
    setEditingLayout(layout);
    setEditLayoutName(layout.name);
    setEditLayoutDescription(layout.description || "");
    setEditLayoutHeroStyle(layout.structure?.heroStyle || "fullscreen");
    setEditLayoutGalleryStyle(layout.structure?.galleryStyle || "grid");
    setEditLayoutTypographyScale(layout.structure?.typography?.scale || "normal");
    setIsLayoutEditDialogOpen(true);
  };

  const handleSaveLayoutEdit = () => {
    if (!editingLayout || !editLayoutName) return;

    updateLayoutMutation.mutate(
      {
        id: editingLayout.id,
        updates: {
          name: editLayoutName,
          description: editLayoutDescription || null,
          structure: {
            heroStyle: editLayoutHeroStyle,
            galleryStyle: editLayoutGalleryStyle,
            detailsStyle: editingLayout.structure?.detailsStyle || 'sidebar',
            typography: {
              headingFont: editingLayout.structure?.typography?.headingFont || 'Inter',
              bodyFont: editingLayout.structure?.typography?.bodyFont || 'Inter',
              headingWeight: editingLayout.structure?.typography?.headingWeight || '700',
              scale: editLayoutTypographyScale
            },
            sections: editingLayout.structure?.sections || ['hero', 'details', 'description', 'gallery', 'video', 'contact']
          }
        }
      },
      {
        onSuccess: () => {
          setIsLayoutEditDialogOpen(false);
          setEditingLayout(null);
          toast({
            title: "Layout Updated",
            description: "Global layout has been updated successfully.",
          });
        }
      }
    );
  };

  const handleDeleteLayout = (layoutId: string) => {
    if (confirm("Are you sure you want to delete this layout? This action cannot be undone.")) {
      deleteLayoutMutation.mutate(layoutId, {
        onSuccess: () => {
          toast({
            title: "Layout Deleted",
            description: "Global layout has been removed.",
          });
        }
      });
    }
  };

  // Coupon handlers
  const handleCreateCoupon = () => {
    if (!couponCode) return;
    
    createCouponMutation.mutate(
      {
        code: couponCode,
        description: couponDescription || null,
        type: couponType,
        value: couponValue,
        maxUses: couponMaxUses,
        minPurchase: null,
        isActive: couponIsActive ? 'true' : 'false',
        expiresAt: couponExpiresAt ? new Date(couponExpiresAt) : null
      },
      {
        onSuccess: () => {
          setIsCouponDialogOpen(false);
          setCouponCode("");
          setCouponDescription("");
          setCouponType("free_credits");
          setCouponValue(1);
          setCouponMaxUses(null);
          setCouponExpiresAt("");
          setCouponIsActive(true);
          toast({
            title: "Coupon Created",
            description: "New coupon has been added successfully.",
          });
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setEditCouponCode(coupon.code);
    setEditCouponDescription(coupon.description || "");
    setEditCouponType(coupon.type);
    setEditCouponValue(coupon.value);
    setEditCouponMaxUses(coupon.maxUses);
    setEditCouponExpiresAt(coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : "");
    setEditCouponIsActive(coupon.isActive === 'true');
    setIsCouponEditDialogOpen(true);
  };

  const handleSaveCouponEdit = () => {
    if (!editingCoupon || !editCouponCode) return;

    updateCouponMutation.mutate(
      {
        id: editingCoupon.id,
        updates: {
          code: editCouponCode,
          description: editCouponDescription || null,
          type: editCouponType,
          value: editCouponValue,
          maxUses: editCouponMaxUses,
          isActive: editCouponIsActive ? 'true' : 'false',
          expiresAt: editCouponExpiresAt ? new Date(editCouponExpiresAt) : null
        }
      },
      {
        onSuccess: () => {
          setIsCouponEditDialogOpen(false);
          setEditingCoupon(null);
          toast({
            title: "Coupon Updated",
            description: "Coupon has been updated successfully.",
          });
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleDeleteCoupon = (couponId: string) => {
    if (confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) {
      deleteCouponMutation.mutate(couponId, {
        onSuccess: () => {
          toast({
            title: "Coupon Deleted",
            description: "Coupon has been removed.",
          });
        }
      });
    }
  };

  const handleEditUserCredits = (user: Omit<User, 'password'>) => {
    setEditingUser(user);
    setNewCreditsAmount(user.credits);
    setIsUserCreditsDialogOpen(true);
  };

  const handleSaveUserCredits = () => {
    if (!editingUser) return;

    updateUserCreditsMutation.mutate(
      {
        id: editingUser.id,
        credits: newCreditsAmount
      },
      {
        onSuccess: () => {
          setIsUserCreditsDialogOpen(false);
          setEditingUser(null);
          toast({
            title: "Credits Updated",
            description: `User now has ${newCreditsAmount} credits.`,
          });
        }
      }
    );
  };

  const handleEditUserProfile = (user: Omit<User, 'password'>) => {
    setEditingUser(user);
    setEditUserName(user.name || "");
    setEditUserEmail(user.email || "");
    setEditUserPhone(user.phone || "");
    setEditUserBrokerage(user.brokerage || "");
    setEditUserTeamName(user.teamName || "");
    setEditUserAddress(user.address || "");
    setEditUserCredits(user.credits);
    setEditUserIsAdmin(user.isAdmin || false);
    setIsUserProfileDialogOpen(true);
  };

  const handleSaveUserProfile = () => {
    if (!editingUser) return;

    // Only send fields that have actually changed to avoid overwriting concurrent changes
    const updates: Record<string, any> = {};
    
    if (editUserName !== (editingUser.name || "")) {
      updates.name = editUserName || undefined;
    }
    if (editUserEmail !== (editingUser.email || "")) {
      updates.email = editUserEmail || undefined;
    }
    if (editUserPhone !== (editingUser.phone || "")) {
      updates.phone = editUserPhone || null;
    }
    if (editUserBrokerage !== (editingUser.brokerage || "")) {
      updates.brokerage = editUserBrokerage || null;
    }
    if (editUserTeamName !== (editingUser.teamName || "")) {
      updates.teamName = editUserTeamName || null;
    }
    if (editUserAddress !== (editingUser.address || "")) {
      updates.address = editUserAddress || null;
    }
    if (editUserCredits !== editingUser.credits) {
      updates.credits = editUserCredits;
    }
    if (editUserIsAdmin !== (editingUser.isAdmin || false)) {
      updates.isAdmin = editUserIsAdmin;
    }

    // If no changes, just close the dialog
    if (Object.keys(updates).length === 0) {
      setIsUserProfileDialogOpen(false);
      setEditingUser(null);
      return;
    }

    updateUserProfileMutation.mutate(
      {
        id: editingUser.id,
        updates
      },
      {
        onSuccess: () => {
          setIsUserProfileDialogOpen(false);
          setEditingUser(null);
          toast({
            title: "Profile Updated",
            description: "User profile has been updated successfully.",
          });
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    );
  };

  const getCouponTypeLabel = (type: string) => {
    switch (type) {
      case 'free_credits': return 'Free Credits';
      case 'first_site_free': return 'First Site Free';
      case 'percentage_off': return 'Percentage Off';
      case 'fixed_amount_off': return 'Fixed Amount Off';
      default: return type;
    }
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

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="brokerages" className="gap-2">
              <Building2 className="h-4 w-4" />
              Brokerages
            </TabsTrigger>
            <TabsTrigger value="themes" className="gap-2">
              <Palette className="h-4 w-4" />
              Themes
            </TabsTrigger>
            <TabsTrigger value="layouts" className="gap-2">
              <LayoutTemplate className="h-4 w-4" />
              Layouts
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-2">
              <Ticket className="h-4 w-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="sample-sites" className="gap-2">
              <Eye className="h-4 w-4" />
              Sample Sites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Users</CardDescription>
                      <CardTitle className="text-3xl flex items-center gap-2">
                        {stats.users.total}
                        <Badge className="text-xs font-normal bg-primary/10 text-primary hover:bg-primary/20">
                          +{stats.users.new7d} this week
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{stats.users.individualAccounts} individual</span>
                        <span>{stats.users.brokerAccounts} broker</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Sites</CardDescription>
                      <CardTitle className="text-3xl flex items-center gap-2">
                        {stats.sites.total}
                        <Badge className="text-xs font-normal bg-primary/10 text-primary hover:bg-primary/20">
                          +{stats.sites.new7d} this week
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {stats.sites.published} published</span>
                        <span>{stats.sites.draft} draft</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Brokerages</CardDescription>
                      <CardTitle className="text-3xl flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                        {stats.brokerages?.total || 0}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Active brokerage accounts
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Account Breakdown</CardDescription>
                      <CardTitle className="text-3xl flex items-center gap-2">
                        {stats.users.total > 0 ? Math.round((stats.users.brokerAccounts / stats.users.total) * 100) : 0}%
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        broker accounts ({stats.users.brokerAccounts} of {stats.users.total})
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Users */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Recent Signups
                      </CardTitle>
                      <CardDescription>Latest users to join the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.recentUsers.slice(0, 5).map((user) => (
                          <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <p className="font-medium">{user.name || user.username}</p>
                              <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={user.accountType === 'broker' ? 'default' : 'outline'} className="text-xs">
                                {user.accountType}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '-'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Performing Sites */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Top Performing Sites
                      </CardTitle>
                      <CardDescription>Sites with the most page views</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.topSitesByViews.length === 0 ? (
                          <p className="text-muted-foreground text-sm">No published sites yet</p>
                        ) : (
                          stats.topSitesByViews.map((site) => (
                            <div key={site.id} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div>
                                <p className="font-medium">{site.title || site.subdomain}</p>
                                <p className="text-sm text-muted-foreground">{site.address}</p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 text-sm font-medium">
                                  <Eye className="h-3 w-3" />
                                  {((site.stats as any)?.views || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {((site.stats as any)?.leads || 0)} leads
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Sites */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Recent Sites Created
                    </CardTitle>
                    <CardDescription>Latest property sites created on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Site</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Address</th>
                            <th className="px-4 py-2 text-center text-sm font-medium text-muted-foreground">Status</th>
                            <th className="px-4 py-2 text-center text-sm font-medium text-muted-foreground">Views</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Created</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {stats.recentSites.slice(0, 5).map((site) => (
                            <tr key={site.id} className="hover:bg-muted/25">
                              <td className="px-4 py-3">
                                <a 
                                  href={`/p/${site.subdomain}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="font-medium hover:text-primary flex items-center gap-1"
                                >
                                  {site.title || site.subdomain}
                                  <ArrowUpRight className="h-3 w-3" />
                                </a>
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">{site.address}</td>
                              <td className="px-4 py-3 text-center">
                                <Badge variant={site.status === 'published' ? 'default' : 'secondary'}>
                                  {site.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-center text-sm">
                                {((site.stats as any)?.views || 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">
                                {site.createdAt ? format(new Date(site.createdAt), 'MMM d, yyyy') : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Failed to load statistics
              </div>
            )}
          </TabsContent>

          <TabsContent value="themes">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-secondary">Global Theme Library</h2>
                <p className="text-muted-foreground">Add and edit themes that will be available to all agents.</p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-secondary hover:bg-secondary/90" data-testid="button-add-theme">
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
                    data-testid="input-theme-name"
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="background">Background Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="background" 
                        type="color" 
                        className="w-12 h-10 p-1" 
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                      />
                      <Input 
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="uppercase"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="text">Text Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="text" 
                        type="color" 
                        className="w-12 h-10 p-1" 
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                      />
                      <Input 
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="uppercase"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-2">Preview</p>
                  <div className="flex gap-2">
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg border shadow-sm mb-1" 
                        style={{ backgroundColor: primaryColor }}
                      />
                      <span className="text-xs text-muted-foreground">Primary</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg border shadow-sm mb-1" 
                        style={{ backgroundColor: secondaryColor }}
                      />
                      <span className="text-xs text-muted-foreground">Secondary</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg border shadow-sm mb-1" 
                        style={{ backgroundColor: backgroundColor }}
                      />
                      <span className="text-xs text-muted-foreground">Background</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-lg border shadow-sm mb-1" 
                        style={{ backgroundColor: textColor }}
                      />
                      <span className="text-xs text-muted-foreground">Text</span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreatePreset} disabled={!newThemeName} data-testid="button-create-theme">Create Preset</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Global Theme</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Theme Name</Label>
                <Input 
                  id="edit-name" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g., Corporate Blue 2025" 
                  data-testid="input-edit-theme-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-primary">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="edit-primary" 
                      type="color" 
                      className="w-12 h-10 p-1" 
                      value={editPrimaryColor}
                      onChange={(e) => setEditPrimaryColor(e.target.value)}
                    />
                    <Input 
                      value={editPrimaryColor}
                      onChange={(e) => setEditPrimaryColor(e.target.value)}
                      className="uppercase"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-secondary">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="edit-secondary" 
                      type="color" 
                      className="w-12 h-10 p-1" 
                      value={editSecondaryColor}
                      onChange={(e) => setEditSecondaryColor(e.target.value)}
                    />
                    <Input 
                      value={editSecondaryColor}
                      onChange={(e) => setEditSecondaryColor(e.target.value)}
                      className="uppercase"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-background">Background Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="edit-background" 
                      type="color" 
                      className="w-12 h-10 p-1" 
                      value={editBackgroundColor}
                      onChange={(e) => setEditBackgroundColor(e.target.value)}
                    />
                    <Input 
                      value={editBackgroundColor}
                      onChange={(e) => setEditBackgroundColor(e.target.value)}
                      className="uppercase"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-text">Text Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="edit-text" 
                      type="color" 
                      className="w-12 h-10 p-1" 
                      value={editTextColor}
                      onChange={(e) => setEditTextColor(e.target.value)}
                    />
                    <Input 
                      value={editTextColor}
                      onChange={(e) => setEditTextColor(e.target.value)}
                      className="uppercase"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Preview</p>
                <div className="flex gap-2">
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-lg border shadow-sm mb-1" 
                      style={{ backgroundColor: editPrimaryColor }}
                    />
                    <span className="text-xs text-muted-foreground">Primary</span>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-lg border shadow-sm mb-1" 
                      style={{ backgroundColor: editSecondaryColor }}
                    />
                    <span className="text-xs text-muted-foreground">Secondary</span>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-lg border shadow-sm mb-1" 
                      style={{ backgroundColor: editBackgroundColor }}
                    />
                    <span className="text-xs text-muted-foreground">Background</span>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-12 h-12 rounded-lg border shadow-sm mb-1" 
                      style={{ backgroundColor: editTextColor }}
                    />
                    <span className="text-xs text-muted-foreground">Text</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={!editName} data-testid="button-save-theme">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {themes.filter(t => t.type === 'preset').map((theme) => (
            <Card key={theme.id} className="overflow-hidden border-2 border-secondary/20" data-testid={`card-theme-${theme.id}`}>
              <CardHeader className="pb-2 bg-secondary/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="h-4 w-4" style={{ color: theme.colors.primary }} />
                    {theme.name}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEditTheme(theme)}
                      data-testid={`button-edit-theme-${theme.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTheme(theme.id)}
                      data-testid={`button-delete-theme-${theme.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex gap-2 mb-2">
                  <div className="text-center">
                    <div 
                      className="w-10 h-10 rounded-lg border shadow-sm" 
                      style={{ backgroundColor: theme.colors.primary }}
                      title="Primary"
                    />
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-10 h-10 rounded-lg border shadow-sm" 
                      style={{ backgroundColor: theme.colors.secondary }}
                      title="Secondary"
                    />
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-10 h-10 rounded-lg border shadow-sm" 
                      style={{ backgroundColor: theme.colors.background }}
                      title="Background"
                    />
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-10 h-10 rounded-lg border shadow-sm" 
                      style={{ backgroundColor: theme.colors.text }}
                      title="Text"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Available to all users</p>
              </CardContent>
            </Card>
          ))}
        </div>
          </TabsContent>

          <TabsContent value="layouts">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-secondary">Global Layout Library</h2>
                <p className="text-muted-foreground">Add and edit layouts that will be available to all agents.</p>
              </div>
              
              <Dialog open={isLayoutDialogOpen} onOpenChange={setIsLayoutDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-secondary hover:bg-secondary/90" data-testid="button-add-layout">
                    <Plus className="h-4 w-4" />
                    Add Global Layout
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Global Layout</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="layout-name">Layout Name</Label>
                      <Input 
                        id="layout-name" 
                        value={newLayoutName} 
                        onChange={(e) => setNewLayoutName(e.target.value)}
                        placeholder="e.g., Modern Split" 
                        data-testid="input-layout-name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="layout-description">Description</Label>
                      <Textarea 
                        id="layout-description" 
                        value={newLayoutDescription} 
                        onChange={(e) => setNewLayoutDescription(e.target.value)}
                        placeholder="Describe this layout..." 
                        data-testid="input-layout-description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Hero Style</Label>
                        <Select value={newLayoutHeroStyle} onValueChange={(v) => setNewLayoutHeroStyle(v as "fullscreen" | "split" | "minimal" | "slider")}>
                          <SelectTrigger data-testid="select-hero-style">
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fullscreen">Fullscreen</SelectItem>
                            <SelectItem value="split">Split</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                            <SelectItem value="slider">Slider</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Gallery Style</Label>
                        <Select value={newLayoutGalleryStyle} onValueChange={(v) => setNewLayoutGalleryStyle(v as "grid" | "masonry" | "carousel" | "lightbox")}>
                          <SelectTrigger data-testid="select-gallery-style">
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">Grid</SelectItem>
                            <SelectItem value="masonry">Masonry</SelectItem>
                            <SelectItem value="carousel">Carousel</SelectItem>
                            <SelectItem value="lightbox">Lightbox</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Typography Scale</Label>
                      <Select value={newLayoutTypographyScale} onValueChange={(v) => setNewLayoutTypographyScale(v as "compact" | "normal" | "spacious")}>
                        <SelectTrigger data-testid="select-typography-scale">
                          <SelectValue placeholder="Select scale" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="spacious">Spacious</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsLayoutDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateLayout} disabled={!newLayoutName} data-testid="button-create-layout">Create Layout</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Dialog open={isLayoutEditDialogOpen} onOpenChange={setIsLayoutEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Global Layout</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-layout-name">Layout Name</Label>
                    <Input 
                      id="edit-layout-name" 
                      value={editLayoutName} 
                      onChange={(e) => setEditLayoutName(e.target.value)}
                      placeholder="e.g., Modern Split" 
                      data-testid="input-edit-layout-name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-layout-description">Description</Label>
                    <Textarea 
                      id="edit-layout-description" 
                      value={editLayoutDescription} 
                      onChange={(e) => setEditLayoutDescription(e.target.value)}
                      placeholder="Describe this layout..." 
                      data-testid="input-edit-layout-description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Hero Style</Label>
                      <Select value={editLayoutHeroStyle} onValueChange={(v) => setEditLayoutHeroStyle(v as "fullscreen" | "split" | "minimal" | "slider")}>
                        <SelectTrigger data-testid="select-edit-hero-style">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fullscreen">Fullscreen</SelectItem>
                          <SelectItem value="split">Split</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="slider">Slider</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Gallery Style</Label>
                      <Select value={editLayoutGalleryStyle} onValueChange={(v) => setEditLayoutGalleryStyle(v as "grid" | "masonry" | "carousel" | "lightbox")}>
                        <SelectTrigger data-testid="select-edit-gallery-style">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grid</SelectItem>
                          <SelectItem value="masonry">Masonry</SelectItem>
                          <SelectItem value="carousel">Carousel</SelectItem>
                          <SelectItem value="lightbox">Lightbox</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Typography Scale</Label>
                    <Select value={editLayoutTypographyScale} onValueChange={(v) => setEditLayoutTypographyScale(v as "compact" | "normal" | "spacious")}>
                      <SelectTrigger data-testid="select-edit-typography-scale">
                        <SelectValue placeholder="Select scale" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="spacious">Spacious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsLayoutEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveLayoutEdit} disabled={!editLayoutName} data-testid="button-save-layout">Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {layouts.map((layout) => (
                <Card key={layout.id} className={`overflow-hidden border-2 ${layout.enabled ? 'border-secondary/20' : 'border-muted/40 opacity-60'}`} data-testid={`card-layout-${layout.id}`}>
                  {layout.thumbnailUrl && (
                    <div className="h-32 bg-muted overflow-hidden">
                      <img 
                        src={layout.thumbnailUrl} 
                        alt={`${layout.name} preview`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2 bg-secondary/5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <LayoutTemplate className="h-4 w-4 text-primary" />
                        {layout.name}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEditLayout(layout)}
                          data-testid={`button-edit-layout-${layout.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteLayout(layout.id)}
                          data-testid={`button-delete-layout-${layout.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-3">{layout.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        {layout.structure?.heroStyle}
                      </span>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        {layout.structure?.galleryStyle}
                      </span>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        {layout.structure?.typography?.scale}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={layout.enabled === true}
                          onCheckedChange={(checked) => {
                            updateLayoutMutation.mutate({
                              id: layout.id,
                              updates: { enabled: checked }
                            }, {
                              onSuccess: () => {
                                toast({
                                  title: checked ? "Layout Enabled" : "Layout Disabled",
                                  description: checked 
                                    ? `${layout.name} is now visible to users.`
                                    : `${layout.name} is now hidden from users.`
                                });
                              }
                            });
                          }}
                          data-testid={`switch-layout-enabled-${layout.id}`}
                        />
                        <Label className="text-sm text-muted-foreground">
                          {layout.enabled ? 'Visible to users' : 'Hidden from users'}
                        </Label>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <Label className="text-xs text-muted-foreground mb-2 block">Assign to Brokerage</Label>
                      <Select
                        value={(() => {
                          const assignment = allBrokerageTemplates.find(bt => bt.templateId === layout.id && bt.templateType === 'layout');
                          return assignment ? assignment.brokerageId : 'all-users';
                        })()}
                        onValueChange={(value) => {
                          const existingAssignment = allBrokerageTemplates.find(bt => bt.templateId === layout.id && bt.templateType === 'layout');
                          if (value === 'all-users') {
                            if (existingAssignment) {
                              removeTemplateMutation.mutate(
                                { brokerageId: existingAssignment.brokerageId, templateId: existingAssignment.id },
                                {
                                  onSuccess: () => {
                                    toast({ title: "Layout unassigned", description: `${layout.name} is now available to all users.` });
                                    refetchAllBrokerageTemplates();
                                  },
                                  onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
                                }
                              );
                            }
                          } else {
                            if (existingAssignment) {
                              removeTemplateMutation.mutate(
                                { brokerageId: existingAssignment.brokerageId, templateId: existingAssignment.id },
                                {
                                  onSuccess: () => {
                                    assignTemplateMutation.mutate(
                                      { brokerageId: value, templateType: 'layout', templateId: layout.id },
                                      {
                                        onSuccess: () => {
                                          const brokerage = brokerages.find(b => b.id === value);
                                          toast({ title: "Layout assigned", description: `${layout.name} assigned to ${brokerage?.name || 'brokerage'}.` });
                                          refetchAllBrokerageTemplates();
                                        },
                                        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
                                      }
                                    );
                                  }
                                }
                              );
                            } else {
                              assignTemplateMutation.mutate(
                                { brokerageId: value, templateType: 'layout', templateId: layout.id },
                                {
                                  onSuccess: () => {
                                    const brokerage = brokerages.find(b => b.id === value);
                                    toast({ title: "Layout assigned", description: `${layout.name} assigned to ${brokerage?.name || 'brokerage'}.` });
                                    refetchAllBrokerageTemplates();
                                  },
                                  onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
                                }
                              );
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue placeholder="All Users" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-users">All Users</SelectItem>
                          {brokerages.map((brokerage) => (
                            <SelectItem key={brokerage.id} value={brokerage.id}>
                              {brokerage.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-secondary">Coupon Management</h2>
                <p className="text-muted-foreground">Create and manage promotional codes and specials.</p>
              </div>
              
              <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-secondary hover:bg-secondary/90" data-testid="button-add-coupon">
                    <Plus className="h-4 w-4" />
                    Create Coupon
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Coupon</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="coupon-code">Coupon Code</Label>
                      <Input 
                        id="coupon-code" 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g., WELCOME10" 
                        data-testid="input-coupon-code"
                      />
                      <p className="text-xs text-muted-foreground">Will be converted to uppercase automatically</p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="coupon-description">Description</Label>
                      <Textarea 
                        id="coupon-description" 
                        value={couponDescription} 
                        onChange={(e) => setCouponDescription(e.target.value)}
                        placeholder="e.g., Welcome offer for new users" 
                        data-testid="input-coupon-description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Coupon Type</Label>
                        <Select value={couponType} onValueChange={setCouponType}>
                          <SelectTrigger data-testid="select-coupon-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free_credits">Free Credits</SelectItem>
                            <SelectItem value="first_site_free">First Site Free</SelectItem>
                            <SelectItem value="percentage_off">Percentage Off</SelectItem>
                            <SelectItem value="fixed_amount_off">Fixed Amount Off</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="coupon-value">
                          {couponType === 'free_credits' ? 'Credits to Give' : 
                           couponType === 'first_site_free' ? 'Value (1)' :
                           couponType === 'percentage_off' ? 'Percentage' : 'Amount (cents)'}
                        </Label>
                        <Input 
                          id="coupon-value" 
                          type="number" 
                          value={couponValue} 
                          onChange={(e) => setCouponValue(parseInt(e.target.value) || 0)}
                          min={1}
                          data-testid="input-coupon-value"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="coupon-max-uses">Max Uses (optional)</Label>
                        <Input 
                          id="coupon-max-uses" 
                          type="number" 
                          value={couponMaxUses ?? ""} 
                          onChange={(e) => setCouponMaxUses(e.target.value ? parseInt(e.target.value) : null)}
                          placeholder="Unlimited" 
                          min={1}
                          data-testid="input-coupon-max-uses"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="coupon-expires">Expires On (optional)</Label>
                        <Input 
                          id="coupon-expires" 
                          type="date" 
                          value={couponExpiresAt} 
                          onChange={(e) => setCouponExpiresAt(e.target.value)}
                          data-testid="input-coupon-expires"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="coupon-active" 
                        checked={couponIsActive} 
                        onCheckedChange={setCouponIsActive}
                        data-testid="switch-coupon-active"
                      />
                      <Label htmlFor="coupon-active">Coupon is active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCouponDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateCoupon} disabled={!couponCode} data-testid="button-create-coupon">Create Coupon</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Edit Coupon Dialog */}
            <Dialog open={isCouponEditDialogOpen} onOpenChange={setIsCouponEditDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Coupon</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-coupon-code">Coupon Code</Label>
                    <Input 
                      id="edit-coupon-code" 
                      value={editCouponCode} 
                      onChange={(e) => setEditCouponCode(e.target.value.toUpperCase())}
                      data-testid="input-edit-coupon-code"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-coupon-description">Description</Label>
                    <Textarea 
                      id="edit-coupon-description" 
                      value={editCouponDescription} 
                      onChange={(e) => setEditCouponDescription(e.target.value)}
                      data-testid="input-edit-coupon-description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Coupon Type</Label>
                      <Select value={editCouponType} onValueChange={setEditCouponType}>
                        <SelectTrigger data-testid="select-edit-coupon-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free_credits">Free Credits</SelectItem>
                          <SelectItem value="first_site_free">First Site Free</SelectItem>
                          <SelectItem value="percentage_off">Percentage Off</SelectItem>
                          <SelectItem value="fixed_amount_off">Fixed Amount Off</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-coupon-value">Value</Label>
                      <Input 
                        id="edit-coupon-value" 
                        type="number" 
                        value={editCouponValue} 
                        onChange={(e) => setEditCouponValue(parseInt(e.target.value) || 0)}
                        min={1}
                        data-testid="input-edit-coupon-value"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-coupon-max-uses">Max Uses</Label>
                      <Input 
                        id="edit-coupon-max-uses" 
                        type="number" 
                        value={editCouponMaxUses ?? ""} 
                        onChange={(e) => setEditCouponMaxUses(e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="Unlimited" 
                        min={1}
                        data-testid="input-edit-coupon-max-uses"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-coupon-expires">Expires On</Label>
                      <Input 
                        id="edit-coupon-expires" 
                        type="date" 
                        value={editCouponExpiresAt} 
                        onChange={(e) => setEditCouponExpiresAt(e.target.value)}
                        data-testid="input-edit-coupon-expires"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      id="edit-coupon-active" 
                      checked={editCouponIsActive} 
                      onCheckedChange={setEditCouponIsActive}
                      data-testid="switch-edit-coupon-active"
                    />
                    <Label htmlFor="edit-coupon-active">Coupon is active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCouponEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveCouponEdit} disabled={!editCouponCode} data-testid="button-save-coupon">Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Coupons Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.length === 0 ? (
                <Card className="col-span-full p-8 text-center">
                  <Ticket className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">No Coupons Yet</h3>
                  <p className="text-muted-foreground text-sm">Create your first coupon to get started.</p>
                </Card>
              ) : (
                coupons.map((coupon) => (
                  <Card key={coupon.id} className="overflow-hidden" data-testid={`card-coupon-${coupon.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gift className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg font-mono">{coupon.code}</CardTitle>
                        </div>
                        <Badge variant={coupon.isActive === 'true' ? 'default' : 'secondary'}>
                          {coupon.isActive === 'true' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <CardDescription>{coupon.description || 'No description'}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-muted-foreground" />
                          <span>{getCouponTypeLabel(coupon.type)}</span>
                          <span className="font-semibold">
                            {coupon.type === 'free_credits' ? `${coupon.value} credits` :
                             coupon.type === 'first_site_free' ? '1 free site' :
                             coupon.type === 'percentage_off' ? `${coupon.value}% off` :
                             `$${(coupon.value / 100).toFixed(2)} off`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span>Uses: {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ' (unlimited)'}</span>
                        </div>
                        {coupon.expiresAt && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Expires: {format(new Date(coupon.expiresAt), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleEditCoupon(coupon)}
                          data-testid={`button-edit-coupon-${coupon.id}`}
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          data-testid={`button-delete-coupon-${coupon.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-secondary">User Management</h2>
                <p className="text-muted-foreground">View all users and manage their credits.</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/admin/send-analytics-emails', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ force: true })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        toast({
                          title: "Test Email Sent",
                          description: "Check your inbox for the analytics email!",
                        });
                      } else {
                        toast({
                          title: "Error",
                          description: data.error || "Failed to send test email",
                          variant: "destructive"
                        });
                      }
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to send test email",
                        variant: "destructive"
                      });
                    }
                  }}
                  data-testid="button-test-analytics-email"
                >
                  Test Email (Send to Me)
                </Button>
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/admin/send-analytics-emails', {
                        method: 'POST',
                        credentials: 'include'
                      });
                      const data = await res.json();
                      if (res.ok) {
                        toast({
                          title: "Analytics Emails Sent",
                          description: `Sent: ${data.sent}, Failed: ${data.failed}, Skipped: ${data.skipped}`,
                        });
                      } else {
                        toast({
                          title: "Error",
                          description: data.error || "Failed to send analytics emails",
                          variant: "destructive"
                        });
                      }
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to send analytics emails",
                        variant: "destructive"
                      });
                    }
                  }}
                  data-testid="button-send-analytics-emails"
                >
                  Send to All Users
                </Button>
              </div>
            </div>

            {/* Edit User Credits Dialog */}
            <Dialog open={isUserCreditsDialogOpen} onOpenChange={setIsUserCreditsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adjust User Credits</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  {editingUser && (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="font-medium">{editingUser.name || editingUser.username || 'Unknown User'}</p>
                        <p className="text-sm text-muted-foreground">{editingUser.email}</p>
                        <p className="text-sm text-muted-foreground">Current credits: {editingUser.credits}</p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-credits">New Credit Amount</Label>
                        <Input 
                          id="new-credits" 
                          type="number" 
                          value={newCreditsAmount} 
                          onChange={(e) => setNewCreditsAmount(parseInt(e.target.value) || 0)}
                          min={0}
                          data-testid="input-new-credits"
                        />
                        <p className="text-xs text-muted-foreground">
                          {newCreditsAmount > editingUser.credits 
                            ? `Adding ${newCreditsAmount - editingUser.credits} credits` 
                            : newCreditsAmount < editingUser.credits 
                              ? `Removing ${editingUser.credits - newCreditsAmount} credits`
                              : 'No change'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUserCreditsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveUserCredits} data-testid="button-save-credits">Save Credits</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* User Profile Edit Dialog */}
            <Dialog open={isUserProfileDialogOpen} onOpenChange={setIsUserProfileDialogOpen}>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit User Profile</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  {editingUser && (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg flex items-center gap-4">
                        {editingUser.profileImageUrl ? (
                          <img 
                            src={editingUser.profileImageUrl} 
                            alt={editingUser.name || 'User'} 
                            className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-xl font-bold">
                            {(editingUser.name || editingUser.username || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{editingUser.name || editingUser.username || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground">@{editingUser.username}</p>
                        </div>
                      </div>
                      
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-user-name">Name</Label>
                          <Input 
                            id="edit-user-name" 
                            value={editUserName} 
                            onChange={(e) => setEditUserName(e.target.value)}
                            placeholder="Full name"
                            data-testid="input-edit-user-name"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="edit-user-email">Email</Label>
                          <Input 
                            id="edit-user-email" 
                            type="email"
                            value={editUserEmail} 
                            onChange={(e) => setEditUserEmail(e.target.value)}
                            placeholder="Email address"
                            data-testid="input-edit-user-email"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="edit-user-phone">Phone</Label>
                          <Input 
                            id="edit-user-phone" 
                            value={editUserPhone} 
                            onChange={(e) => setEditUserPhone(e.target.value)}
                            placeholder="Phone number"
                            data-testid="input-edit-user-phone"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="edit-user-brokerage">Brokerage</Label>
                          <Input 
                            id="edit-user-brokerage" 
                            value={editUserBrokerage} 
                            onChange={(e) => setEditUserBrokerage(e.target.value)}
                            placeholder="Brokerage name"
                            data-testid="input-edit-user-brokerage"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="edit-user-team">Team Name</Label>
                          <Input 
                            id="edit-user-team" 
                            value={editUserTeamName} 
                            onChange={(e) => setEditUserTeamName(e.target.value)}
                            placeholder="Team name"
                            data-testid="input-edit-user-team"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="edit-user-address">Address</Label>
                          <Input 
                            id="edit-user-address" 
                            value={editUserAddress} 
                            onChange={(e) => setEditUserAddress(e.target.value)}
                            placeholder="Business address"
                            data-testid="input-edit-user-address"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="edit-user-credits">Credits</Label>
                          <Input 
                            id="edit-user-credits" 
                            type="number"
                            value={editUserCredits} 
                            onChange={(e) => setEditUserCredits(parseInt(e.target.value) || 0)}
                            min={0}
                            data-testid="input-edit-user-credits"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label htmlFor="edit-user-admin">Admin Access</Label>
                            <p className="text-sm text-muted-foreground">Grant admin privileges</p>
                          </div>
                          <Switch
                            id="edit-user-admin"
                            checked={editUserIsAdmin}
                            onCheckedChange={setEditUserIsAdmin}
                            data-testid="switch-edit-user-admin"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUserProfileDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleSaveUserProfile} 
                    disabled={updateUserProfileMutation.isPending}
                    data-testid="button-save-user-profile"
                  >
                    {updateUserProfileMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Users Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Credits</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Joined</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="hover:bg-muted/25" data-testid={`row-user-${user.id}`}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                                  ) : (
                                    <Users className="h-5 w-5 text-primary" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">{user.name || 'No name'}</p>
                                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">{user.email || '-'}</td>
                            <td className="px-4 py-3 text-center">
                              {user.accountType === 'broker' ? (
                                <Badge variant="default" className="gap-1">
                                  <Infinity className="h-3 w-3" />
                                  Unlimited
                                </Badge>
                              ) : (
                                <Badge variant={user.credits > 0 ? 'default' : 'secondary'} className="gap-1">
                                  <CreditCard className="h-3 w-3" />
                                  {user.credits}
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant={user.accountType === 'broker' ? 'default' : 'outline'} className="capitalize">
                                {user.accountType === 'broker' ? (
                                  <><Building2 className="h-3 w-3 mr-1" />Broker</>
                                ) : (
                                  'Individual'
                                )}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '-'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-1"
                                  onClick={() => handleEditUserProfile(user)}
                                  data-testid={`button-edit-profile-${user.id}`}
                                >
                                  <Pencil className="h-3 w-3" />
                                  Edit
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="gap-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                      data-testid={`button-delete-user-${user.id}`}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete <strong>{user.name || user.username}</strong>? This will permanently remove the user and all their data including sites, themes, and leads. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel data-testid={`button-cancel-delete-${user.id}`}>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => {
                                          deleteUserMutation.mutate(user.id, {
                                            onSuccess: () => {
                                              toast({
                                                title: "User Deleted",
                                                description: `${user.name || user.username} has been deleted.`,
                                              });
                                            },
                                            onError: () => {
                                              toast({
                                                title: "Error",
                                                description: "Failed to delete user. Please try again.",
                                                variant: "destructive"
                                              });
                                            }
                                          });
                                        }}
                                        data-testid={`button-confirm-delete-${user.id}`}
                                      >
                                        Delete User
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="brokerages">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-secondary">Brokerage Layout Management</h2>
                <p className="text-muted-foreground">Assign exclusive layouts to brokerages for their agents to use.</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Select a Brokerage</CardTitle>
                <CardDescription>Choose a brokerage to manage its assigned layouts</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedBrokerageId} onValueChange={setSelectedBrokerageId}>
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Select a brokerage..." />
                  </SelectTrigger>
                  <SelectContent>
                    {brokerages.map((brokerage) => (
                      <SelectItem key={brokerage.id} value={brokerage.id}>
                        {brokerage.name} {brokerage.ownerEmail && `(${brokerage.ownerEmail})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedBrokerageId && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Assigned Layouts</h3>
                      <Dialog open={isAssignLayoutDialogOpen} onOpenChange={setIsAssignLayoutDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Assign Layout
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Layout to Brokerage</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <Label>Select Layout</Label>
                            <Select value={selectedLayoutToAssign} onValueChange={setSelectedLayoutToAssign}>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Choose a layout..." />
                              </SelectTrigger>
                              <SelectContent>
                                {layouts.filter(l => !brokerageTemplates.some(bt => bt.templateId === l.id && bt.templateType === 'layout')).map((layout) => (
                                  <SelectItem key={layout.id} value={layout.id}>
                                    {layout.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter>
                            <Button
                              disabled={!selectedLayoutToAssign || assignTemplateMutation.isPending}
                              onClick={() => {
                                assignTemplateMutation.mutate(
                                  { brokerageId: selectedBrokerageId, templateType: 'layout', templateId: selectedLayoutToAssign },
                                  {
                                    onSuccess: () => {
                                      toast({ title: "Layout assigned", description: "The layout has been assigned to the brokerage." });
                                      setIsAssignLayoutDialogOpen(false);
                                      setSelectedLayoutToAssign("");
                                      refetchBrokerageTemplates();
                                    },
                                    onError: (err) => {
                                      toast({ title: "Error", description: err.message, variant: "destructive" });
                                    }
                                  }
                                );
                              }}
                            >
                              {assignTemplateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign Layout"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {brokerageTemplates.filter(t => t.templateType === 'layout').length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border rounded-lg">
                        No layouts assigned to this brokerage yet.
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left px-4 py-3 font-medium">Layout Name</th>
                              <th className="text-left px-4 py-3 font-medium">Assigned</th>
                              <th className="text-right px-4 py-3 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {brokerageTemplates.filter(t => t.templateType === 'layout').map((template) => {
                              const layout = layouts.find(l => l.id === template.templateId);
                              return (
                                <tr key={template.id} className="border-t">
                                  <td className="px-4 py-3">
                                    {layout?.name || 'Unknown Layout'}
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground text-sm">
                                    {template.createdAt ? format(new Date(template.createdAt), 'MMM d, yyyy') : 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Remove Layout?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will remove the layout from this brokerage. Agents will no longer have access to it.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-600 hover:bg-red-700"
                                            onClick={() => {
                                              removeTemplateMutation.mutate(
                                                { brokerageId: selectedBrokerageId, templateId: template.id },
                                                {
                                                  onSuccess: () => {
                                                    toast({ title: "Layout removed", description: "The layout has been removed from the brokerage." });
                                                    refetchBrokerageTemplates();
                                                  },
                                                  onError: (err) => {
                                                    toast({ title: "Error", description: err.message, variant: "destructive" });
                                                  }
                                                }
                                              );
                                            }}
                                          >
                                            Remove
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sample-sites">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-secondary">Sample Site Manager</h2>
                <p className="text-muted-foreground">Manage sample sites and thumbnails for layout previews. Users see these when choosing a layout.</p>
              </div>
            </div>

            {/* Link Sample Site Dialog */}
            <Dialog open={linkSampleSiteDialogOpen} onOpenChange={setLinkSampleSiteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Link Sample Site to {selectedLayoutForLink?.name}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sample-site-slug">Sample Site Subdomain</Label>
                    <Input 
                      id="sample-site-slug" 
                      value={sampleSiteSlugInput} 
                      onChange={(e) => setSampleSiteSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="e.g., sample-modern" 
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter the subdomain of an existing site to use as the sample for this layout.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setLinkSampleSiteDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={() => {
                      if (selectedLayoutForLink && sampleSiteSlugInput) {
                        updateLayoutMutation.mutate(
                          { id: selectedLayoutForLink.id, updates: { sampleSiteSlug: sampleSiteSlugInput } },
                          {
                            onSuccess: () => {
                              setLinkSampleSiteDialogOpen(false);
                              setSampleSiteSlugInput("");
                              setSelectedLayoutForLink(null);
                              refetchSampleSites();
                              toast({
                                title: "Sample Site Linked",
                                description: `Layout now uses "${sampleSiteSlugInput}" as its sample site.`,
                              });
                            }
                          }
                        );
                      }
                    }}
                    disabled={!sampleSiteSlugInput}
                  >
                    Link Sample Site
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {layouts.map((layout) => {
                const sampleSite = sampleSites.find(s => s.layout.id === layout.id);
                const hasSampleSite = !!sampleSite?.site;
                const hasSlug = !!layout.sampleSiteSlug;
                const isCapturing = capturingScreenshotForLayout === layout.id;
                
                return (
                  <Card key={layout.id} className="overflow-hidden">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {layout.thumbnailUrl ? (
                        <img 
                          src={layout.thumbnailUrl} 
                          alt={layout.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Image className="h-12 w-12 opacity-30" />
                        </div>
                      )}
                      {isCapturing && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-white text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                            <p className="text-sm">Capturing screenshot...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{layout.name}</CardTitle>
                        {layout.enabled ? (
                          <Badge variant="default" className="bg-green-600">Enabled</Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {layout.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0 space-y-3">
                      {/* Sample Site Status */}
                      <div className="flex items-center gap-2 text-sm">
                        {hasSlug ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-muted-foreground">Sample site:</span>
                            <Badge variant="outline" className="font-mono text-xs">{layout.sampleSiteSlug}</Badge>
                          </>
                        ) : (
                          <>
                            <span className="h-4 w-4 rounded-full bg-orange-200" />
                            <span className="text-muted-foreground">No sample site linked</span>
                          </>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        {hasSlug && hasSampleSite ? (
                          <>
                            <a 
                              href={`/p/${layout.sampleSiteSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" size="sm" className="w-full gap-1.5">
                                <Eye className="h-3.5 w-3.5" />
                                Preview
                              </Button>
                            </a>
                            <a href={`/edit-site/${sampleSite.site!.id}`}>
                              <Button variant="outline" size="sm" className="w-full gap-1.5">
                                <Pencil className="h-3.5 w-3.5" />
                                Edit Site
                              </Button>
                            </a>
                          </>
                        ) : hasSlug && !hasSampleSite ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full gap-1.5"
                              onClick={() => {
                                setSelectedLayoutForLink(layout);
                                setSampleSiteSlugInput(layout.sampleSiteSlug || "");
                                setLinkSampleSiteDialogOpen(true);
                              }}
                            >
                              <Link className="h-3.5 w-3.5" />
                              Re-link
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="w-full gap-1.5 text-orange-700"
                              disabled
                            >
                              Site Missing
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="w-full gap-1.5"
                              disabled={creatingSampleSiteForLayout === layout.id}
                              onClick={async () => {
                                setCreatingSampleSiteForLayout(layout.id);
                                try {
                                  const result = await createSampleSiteMutation.mutateAsync({ layoutId: layout.id });
                                  toast({
                                    title: result.screenshotCaptured ? "Sample Site Created" : "Sample Site Created (No Screenshot)",
                                    description: result.screenshotCaptured 
                                      ? `Created "${result.site.subdomain}" with auto-captured thumbnail.`
                                      : `Created "${result.site.subdomain}" - add photos and capture screenshot manually.`,
                                  });
                                  refetchSampleSites();
                                } catch (error) {
                                  toast({
                                    title: "Creation Failed",
                                    description: "Could not create sample site. Try again.",
                                    variant: "destructive",
                                  });
                                } finally {
                                  setCreatingSampleSiteForLayout(null);
                                }
                              }}
                            >
                              {creatingSampleSiteForLayout === layout.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Plus className="h-3.5 w-3.5" />
                              )}
                              {creatingSampleSiteForLayout === layout.id ? 'Creating...' : 'Create Sample Site'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full gap-1.5"
                              onClick={() => {
                                setSelectedLayoutForLink(layout);
                                setSampleSiteSlugInput("");
                                setLinkSampleSiteDialogOpen(true);
                              }}
                            >
                              <Link className="h-3.5 w-3.5" />
                              Link Existing
                            </Button>
                          </>
                        )}
                      </div>
                      
                      {/* Screenshot Capture */}
                      {hasSlug && hasSampleSite && (
                        <Button 
                          variant="secondary"
                          size="sm"
                          className="w-full gap-1.5"
                          disabled={isCapturing}
                          onClick={async () => {
                            setCapturingScreenshotForLayout(layout.id);
                            try {
                              const result = await captureScreenshotMutation.mutateAsync({ 
                                siteSlug: layout.sampleSiteSlug! 
                              });
                              // Update the layout with the new thumbnail
                              await updateLayoutMutation.mutateAsync({
                                id: layout.id,
                                updates: { thumbnailUrl: result.screenshotPath }
                              });
                              toast({
                                title: "Screenshot Captured",
                                description: "Layout thumbnail has been updated.",
                              });
                            } catch (error) {
                              toast({
                                title: "Screenshot Failed",
                                description: "Could not capture screenshot. Try again.",
                                variant: "destructive",
                              });
                            } finally {
                              setCapturingScreenshotForLayout(null);
                            }
                          }}
                        >
                          {isCapturing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Camera className="h-3.5 w-3.5" />
                          )}
                          {isCapturing ? 'Capturing...' : 'Capture Screenshot'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {layouts.length === 0 && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <LayoutTemplate className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No layouts found. Create layouts in the Layouts tab first.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

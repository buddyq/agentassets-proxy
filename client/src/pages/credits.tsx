import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateCredits, usePartnerDiscount } from "@/lib/api";
import { CreditCard, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PACKAGES = [
  { id: 'starter', name: 'Starter', credits: 1, price: 29 },
  { id: 'growth', name: 'Growth', credits: 5, price: 125, popular: true },
  { id: 'agency', name: 'Agency', credits: 10, price: 200 },
];

export default function Credits() {
  const { user } = useAuth();
  const updateCreditsMutation = useUpdateCredits();
  const { data: partnerData } = usePartnerDiscount();
  const { toast } = useToast();
  
  const discountPercent = partnerData?.discount || 0;

  const handlePurchase = (pkg: typeof PACKAGES[0]) => {
    if (!user) return;
    updateCreditsMutation.mutate(
      user.credits + pkg.credits,
      {
        onSuccess: () => {
          toast({
            title: "Purchase Successful",
            description: `Added ${pkg.credits} credits to your account.`,
          });
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-secondary mb-2">Purchase Credits</h1>
            <p className="text-muted-foreground">
              Credits never expire. Use them whenever you have a new listing.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-medium text-lg">Current Balance</h2>
              <p className="text-muted-foreground text-sm">Available credits to use</p>
            </div>
            <div className="text-3xl font-bold text-primary">
              {user?.credits ?? 0} <span className="text-base font-normal text-muted-foreground">credits</span>
            </div>
          </div>

          {discountPercent > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 shadow-sm border border-amber-200 mb-8 flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">ATXPocket Partner Discount Active</h3>
                <p className="text-amber-700 text-sm">You receive {discountPercent}% off all credit packages as an ATXPocket member!</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {PACKAGES.map((pkg) => {
              const discountedPrice = discountPercent > 0 
                ? Math.round(pkg.price * (1 - discountPercent / 100)) 
                : pkg.price;
              const pricePerCredit = Math.round(discountedPrice / pkg.credits);
              
              return (
                <Card key={pkg.id} className={`relative overflow-hidden transition-all hover:shadow-lg ${pkg.popular ? 'border-primary ring-1 ring-primary/20 shadow-md' : ''}`}>
                  {pkg.popular && (
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-primary" />
                  )}
                  {discountPercent > 0 && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{discountPercent}%
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {pkg.name}
                      {pkg.popular && <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-1 rounded-full">Popular</span>}
                    </CardTitle>
                    <div className="mt-2">
                      {discountPercent > 0 ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-amber-600">${discountedPrice}</span>
                          <span className="text-lg text-muted-foreground line-through">${pkg.price}</span>
                        </div>
                      ) : (
                        <span className="text-3xl font-bold">${pkg.price}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Credits</span>
                        <span className="font-medium">{pkg.credits}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Price per credit</span>
                        <span className={`font-medium ${discountPercent > 0 ? 'text-amber-600' : ''}`}>${pricePerCredit}</span>
                      </div>
                      {discountPercent > 0 && (
                        <div className="flex justify-between text-amber-600">
                          <span className="text-sm">You save</span>
                          <span className="font-medium text-sm">${pkg.price - discountedPrice}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className={`w-full ${pkg.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                      onClick={() => handlePurchase(pkg)}
                    >
                      <CreditCard className="mr-2 h-4 w-4" /> Purchase
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
            <p>Secure payment processing. All major credit cards accepted. 30-day money back guarantee on unused credits.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

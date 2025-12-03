import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLeads } from "@/lib/api";
import { useSites } from "@/lib/api";
import { format } from "date-fns";
import { Mail, Phone, MessageSquare, Calendar } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Leads() {
  const { data: leads = [] } = useLeads();
  const { data: sites = [] } = useSites();
  const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>(undefined);

  const getSiteName = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    return site?.title || site?.address || "Unknown Property";
  };

  const filteredLeads = selectedSiteId 
    ? leads.filter(lead => lead.siteId === selectedSiteId)
    : leads;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-secondary mb-2">Leads</h1>
            <p className="text-muted-foreground">View all inquiries from your property websites</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter by Property</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedSiteId || ""} onValueChange={(value) => setSelectedSiteId(value || undefined)}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Properties</SelectItem>
                  {sites.map(site => (
                    <SelectItem key={site.id} value={site.id}>
                      {getSiteName(site.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {filteredLeads.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No leads yet. Check back when visitors submit the contact form on your property sites.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              <div className="text-sm text-muted-foreground mb-2">
                {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} found
              </div>
              {filteredLeads.map(lead => (
                <Card key={lead.id} className="hover:shadow-md transition-shadow" data-testid={`card-lead-${lead.id}`}>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-4" data-testid={`text-name-${lead.id}`}>
                          {lead.firstName} {lead.lastName}
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-primary" />
                            <a href={`mailto:${lead.email}`} className="text-primary hover:underline break-all" data-testid={`link-email-${lead.id}`}>
                              {lead.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-primary" />
                            <a href={`tel:${lead.phone}`} className="text-primary hover:underline" data-testid={`link-phone-${lead.id}`}>
                              {lead.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground" data-testid={`text-date-${lead.id}`}>
                              {format(new Date(lead.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex flex-col justify-between h-full">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2">PROPERTY</p>
                            <p className="text-sm font-medium mb-4" data-testid={`text-property-${lead.id}`}>
                              {getSiteName(lead.siteId)}
                            </p>
                            <p className="text-xs font-semibold text-muted-foreground mb-2">STATUS</p>
                            <Badge className={`${getStatusColor(lead.status)} capitalize`} data-testid={`badge-status-${lead.id}`}>
                              {lead.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    {lead.message && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">MESSAGE</p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-message-${lead.id}`}>
                          {lead.message}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

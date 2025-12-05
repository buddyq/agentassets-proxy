import { useSiteBySlug } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import SiteView from "./site-view";

interface SlugSiteViewProps {
  slug: string;
}

export default function SlugSiteView({ slug }: SlugSiteViewProps) {
  const queryClient = useQueryClient();
  const { data: site, isLoading, error } = useSiteBySlug(slug);

  useEffect(() => {
    if (site) {
      queryClient.setQueryData(['site', site.id], site);
    }
  }, [site, queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Site Not Found</h1>
          <p className="text-muted-foreground mb-4">The property site you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return <SiteView siteId={site.id} />;
}

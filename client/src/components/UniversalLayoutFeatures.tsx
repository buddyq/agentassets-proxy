import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, FileText, Layers, Images, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export type LayoutFeatureKey = 'documents' | 'floorPlans' | 'photoGalleries' | 'additionalAgent';

export interface LayoutFeatureConfig {
  documents: boolean;
  floorPlans: boolean;
  photoGalleries: boolean;
  additionalAgent: boolean;
}

interface FeatureDefinition {
  key: LayoutFeatureKey;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const AVAILABLE_FEATURES: FeatureDefinition[] = [
  {
    key: 'documents',
    label: 'Documents',
    description: 'Add downloadable documents like brochures, disclosures, and floor plan PDFs',
    icon: FileText,
  },
  {
    key: 'floorPlans',
    label: 'Floor Plans',
    description: 'Upload floor plan images to display in a dedicated section',
    icon: Layers,
  },
  {
    key: 'photoGalleries',
    label: 'Additional Photo Galleries',
    description: 'Create multiple themed photo galleries (e.g., Exterior, Interior, Neighborhood)',
    icon: Images,
  },
  {
    key: 'additionalAgent',
    label: 'Additional Listing Agent',
    description: 'Add a co-listing agent or team member to the property listing',
    icon: UserPlus,
  },
];

interface UniversalLayoutFeaturesProps {
  enabledFeatures: LayoutFeatureConfig;
  onFeatureToggle: (feature: LayoutFeatureKey, enabled: boolean) => void;
  children?: {
    documents?: React.ReactNode;
    floorPlans?: React.ReactNode;
    photoGalleries?: React.ReactNode;
    additionalAgent?: React.ReactNode;
  };
}

export function UniversalLayoutFeatures({
  enabledFeatures,
  onFeatureToggle,
  children,
}: UniversalLayoutFeaturesProps) {
  const [expandedFeatures, setExpandedFeatures] = useState<Record<LayoutFeatureKey, boolean>>({
    documents: true,
    floorPlans: true,
    photoGalleries: true,
    additionalAgent: true,
  });

  const toggleExpanded = (key: LayoutFeatureKey) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const enabledCount = Object.values(enabledFeatures).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b">
          <div>
            <h3 className="font-semibold text-lg">Universal Layout Features</h3>
            <p className="text-sm text-muted-foreground">
              Select additional features to include on your property listing
            </p>
          </div>
          {enabledCount > 0 && (
            <span className="text-sm text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
              {enabledCount} feature{enabledCount !== 1 ? 's' : ''} enabled
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {AVAILABLE_FEATURES.map((feature) => {
            const Icon = feature.icon;
            const isEnabled = enabledFeatures[feature.key];
            
            return (
              <label
                key={feature.key}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                  isEnabled 
                    ? "border-primary bg-primary/5" 
                    : "border-muted hover:border-muted-foreground/30"
                )}
                data-testid={`feature-toggle-${feature.key}`}
              >
                <Checkbox
                  checked={isEnabled}
                  onCheckedChange={(checked) => onFeatureToggle(feature.key, !!checked)}
                  className="mt-0.5"
                  data-testid={`checkbox-${feature.key}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className={cn(
                      "h-4 w-4",
                      isEnabled ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "font-medium",
                      isEnabled ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {feature.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {Object.entries(enabledFeatures).some(([key, enabled]) => enabled && children?.[key as LayoutFeatureKey]) && (
        <div className="space-y-4">
          {AVAILABLE_FEATURES.map((feature) => {
            const Icon = feature.icon;
            const isEnabled = enabledFeatures[feature.key];
            const content = children?.[feature.key];

            if (!isEnabled || !content) return null;

            return (
              <Collapsible
                key={feature.key}
                open={expandedFeatures[feature.key]}
                onOpenChange={() => toggleExpanded(feature.key)}
              >
                <div className="rounded-xl border bg-card overflow-hidden">
                  <CollapsibleTrigger className="w-full" data-testid={`feature-section-trigger-${feature.key}`}>
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium">{feature.label} Options</h4>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                      <ChevronDown className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform",
                        expandedFeatures[feature.key] && "rotate-180"
                      )} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 pt-0 border-t" data-testid={`feature-section-content-${feature.key}`}>
                      <div className="pt-4">
                        {content}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { AVAILABLE_FEATURES };

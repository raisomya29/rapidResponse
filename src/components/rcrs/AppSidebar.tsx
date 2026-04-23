import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Building2,
  Brain,
  Radio,
  Hospital,
  Navigation,
  Ambulance,
  TrendingUp,
  Shield,
  Siren,
} from "lucide-react";

export type ViewKey =
  | "overview"
  | "monitor"
  | "triage"
  | "feed"
  | "hospitals"
  | "navigation"
  | "emergency"
  | "analytics";

interface Item {
  key: ViewKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  tone?: "default" | "emergency";
}

const PRIMARY: Item[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard, hint: "Full dashboard" },
  { key: "monitor", label: "3D Live Monitor", icon: Building2, hint: "Building" },
  { key: "triage", label: "AI Triage", icon: Brain, hint: "Symptoms" },
];

const RESPONSE: Item[] = [
  { key: "feed", label: "Incident Feed", icon: Radio, hint: "Live events" },
  { key: "hospitals", label: "Nearby Hospitals", icon: Hospital, hint: "Contacts" },
  { key: "navigation", label: "Navigation", icon: Navigation, hint: "Safe route" },
  { key: "emergency", label: "Emergency Dispatch", icon: Ambulance, hint: "Critical only", tone: "emergency" },
];

const INSIGHTS: Item[] = [
  { key: "analytics", label: "Cases & Analytics", icon: TrendingUp, hint: "History" },
];

interface Props {
  active: ViewKey;
  onSelect: (k: ViewKey) => void;
  emergency: boolean;
  onSOS: () => void;
}

export function AppSidebar({ active, onSelect, emergency, onSOS }: Props) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const renderItem = (item: Item) => {
    const isActive = active === item.key;
    const Icon = item.icon;
    const toneActive =
      item.tone === "emergency"
        ? "bg-emergency/15 text-emergency border-emergency/40"
        : "bg-primary/15 text-primary border-primary/40";
    return (
      <SidebarMenuItem key={item.key}>
        <SidebarMenuButton
          asChild
          tooltip={collapsed ? item.label : undefined}
          isActive={isActive}
        >
          <button
            type="button"
            onClick={() => onSelect(item.key)}
            className={`w-full flex items-center gap-2 rounded-md border transition ${
              isActive
                ? toneActive
                : "border-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Icon
              className={`h-4 w-4 flex-none ${
                isActive
                  ? item.tone === "emergency"
                    ? "text-emergency"
                    : "text-primary"
                  : ""
              }`}
            />
            {!collapsed && (
              <span className="flex-1 text-left text-sm truncate">{item.label}</span>
            )}
            {!collapsed && item.hint && (
              <span className="font-mono text-[9px] tracking-widest text-muted-foreground">
                {item.hint.toUpperCase()}
              </span>
            )}
          </button>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/60">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div
            className="w-8 h-8 rounded-lg grid place-items-center bg-primary/15 border border-primary/40"
            style={{ boxShadow: "var(--glow-active)" }}
          >
            <Shield className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display font-bold text-sm tracking-wide truncate">
                RCRS
              </p>
              <p className="font-mono text-[9px] tracking-widest text-muted-foreground truncate">
                CRISIS RESPONSE
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Workspace</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{PRIMARY.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Response</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{RESPONSE.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Insights</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{INSIGHTS.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <button
          type="button"
          onClick={onSOS}
          className={`mx-2 mb-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 font-semibold text-emergency-foreground bg-emergency hover:brightness-110 transition relative overflow-hidden ${
            emergency ? "animate-pulse-emergency" : ""
          }`}
          style={{ boxShadow: "var(--glow-emergency)" }}
          aria-label="Trigger SOS"
        >
          <Siren className="w-4 h-4" />
          {!collapsed && <span className="font-display tracking-widest">SOS</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;

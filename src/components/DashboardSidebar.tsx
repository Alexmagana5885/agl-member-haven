import { useState } from "react";
import {
  Home,
  CalendarDays,
  PenSquare,
  MessageSquare,
  Users,
  CreditCard,
  FileText,
  UserCircle,
  Mail,
  Phone,
  MessageCircle,
  LogOut,
  ShieldCheck,
  ChevronDown,
  History,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
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

const mainNav = [
  { title: "Home", url: "/", icon: Home },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Payment Invoices", url: "/payment-invoices", icon: FileText },
  { title: "User Information", url: "/user-info", icon: UserCircle },
];

const adminNav = [
  { title: "Planned Events", url: "/planned-events", icon: CalendarDays },
  { title: "Past Events", url: "/past-events", icon: History },
  { title: "New Blog", url: "/new-blog", icon: PenSquare },
  { title: "Members", url: "/members", icon: Users },
  { title: "Member Payments", url: "/member-payments", icon: CreditCard },
];

const contactNav = [
  { title: "Email Us", url: "mailto:info@agl.org", icon: Mail, external: true },
  { title: "Call Us", url: "tel:+1234567890", icon: Phone, external: true },
  { title: "Chat on WhatsApp", url: "https://wa.me/1234567890", icon: MessageCircle, external: true },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent font-display text-lg font-bold text-sidebar-accent-foreground">
            A
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display text-sm font-bold text-sidebar-primary">AGL</span>
              <span className="text-xs text-sidebar-muted">Govt Librarians</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-xs uppercase tracking-wider">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Admin dropdown */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Admin"
                  onClick={() => setAdminOpen(!adminOpen)}
                  className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin</span>
                  {!collapsed && (
                    <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${adminOpen ? "rotate-180" : ""}`} />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {adminOpen && !collapsed && adminNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors pl-8"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-xs uppercase tracking-wider">
            Contact Us
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contactNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              className="text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

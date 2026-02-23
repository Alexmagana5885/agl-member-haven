import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Send,
  MapPin,
  Tag,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const mainNav = [
  { title: "Home", url: "/", icon: Home },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Payment Invoices", url: "/payment-invoices", icon: FileText },
  { title: "User Information", url: "/user-info", icon: UserCircle },
];

const contactNav = [
  { title: "Email Us", url: "mailto:info@agl.org", icon: Mail, external: true },
  { title: "Call Us", url: "tel:+1234567890", icon: Phone, external: true },
  { title: "Chat on WhatsApp", url: "https://wa.me/1234567890", icon: MessageCircle, external: true },
];

type AdminDialog = "planned-event" | "past-event" | "new-blog" | "send-message" | null;

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [adminOpen, setAdminOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<AdminDialog>(null);
  const navigate = useNavigate();

  const adminItems = [
    { title: "Planned Events", icon: CalendarDays, action: () => setActiveDialog("planned-event") },
    { title: "Past Events", icon: History, action: () => setActiveDialog("past-event") },
    { title: "New Blog", icon: PenSquare, action: () => setActiveDialog("new-blog") },
    { title: "Send Message", icon: Send, action: () => setActiveDialog("send-message") },
    { title: "Members", icon: Users, action: () => navigate("/members") },
    { title: "Member Payments", icon: CreditCard, action: () => navigate("/member-payments") },
  ];

  return (
    <>
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

                {adminOpen && !collapsed && adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      onClick={item.action}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors pl-8 cursor-pointer"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
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

      {/* Create Planned Event Dialog */}
      <Dialog open={activeDialog === "planned-event"} onOpenChange={(open) => { if (!open) setActiveDialog(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <CalendarDays className="h-5 w-5 text-primary" /> Create Planned Event
            </DialogTitle>
            <DialogDescription>Add a new upcoming event for members.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Event Title</Label>
              <Input placeholder="Enter event title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Event Type</Label>
                <Input placeholder="e.g. Conference, Workshop" />
              </div>
              <div className="space-y-1.5">
                <Label>Event Date</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Venue</Label>
              <Input placeholder="Enter venue" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Describe the event" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Objectives</Label>
              <Textarea placeholder="Event objectives" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Why Attend</Label>
              <Input placeholder="Reasons to attend" />
            </div>
            <div className="space-y-1.5">
              <Label>Subthemes (comma-separated)</Label>
              <Input placeholder="e.g. AI, Digital Literacy" />
            </div>
            <div className="space-y-1.5">
              <Label>Registration Amount (Ksh)</Label>
              <Input type="number" placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Publish Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Past Event Dialog */}
      <Dialog open={activeDialog === "past-event"} onOpenChange={(open) => { if (!open) setActiveDialog(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <History className="h-5 w-5 text-primary" /> Add Past Event
            </DialogTitle>
            <DialogDescription>Record a past event.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Event Title</Label>
              <Input placeholder="Enter event title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Event Type</Label>
                <Input placeholder="e.g. Symposium, Forum" />
              </div>
              <div className="space-y-1.5">
                <Label>Event Date</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Venue</Label>
              <Input placeholder="Enter venue" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Describe the event" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Attendees</Label>
              <Input placeholder="e.g. 350+" />
            </div>
            <div className="space-y-1.5">
              <Label>Highlights</Label>
              <Textarea placeholder="Key highlights of the event" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Save Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Blog Dialog */}
      <Dialog open={activeDialog === "new-blog"} onOpenChange={(open) => { if (!open) setActiveDialog(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <PenSquare className="h-5 w-5 text-primary" /> Create New Blog
            </DialogTitle>
            <DialogDescription>Write and publish a new blog post.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Blog Title</Label>
              <Input placeholder="Enter blog title" />
            </div>
            <div className="space-y-1.5">
              <Label>Author</Label>
              <Input placeholder="Author name" />
            </div>
            <div className="space-y-1.5">
              <Label>Short Description</Label>
              <Textarea placeholder="Brief summary of the blog" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Full Content</Label>
              <Textarea placeholder="Write the full blog content here..." rows={6} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Publish Blog</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={activeDialog === "send-message"} onOpenChange={(open) => { if (!open) setActiveDialog(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Send className="h-5 w-5 text-primary" /> Send Message
            </DialogTitle>
            <DialogDescription>Send a message to members.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Recipient</Label>
              <Input placeholder="All members or specific email" />
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input placeholder="Message subject" />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea placeholder="Type your message here..." rows={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

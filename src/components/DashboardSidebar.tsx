import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import {
  createPlannedEvent,
  createPastEvent,
  createBlog,
  sendMessage as sendMessageApi,
  type PlannedEventPayload,
  type PastEventPayload,
  type BlogPayload,
  type MessagePayload,
} from "@/services/api";
import AGLlogo from "@/components/payments/AGLlogo.png";

// Interface for user session data
interface UserSession {
  id: string;
  email: string;
  type: string;
  name: string;
  is_official: boolean;
  member_type: string;
}

const mainNav = [
  { title: "Home", url: "/dashboard", icon: Home },
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

const emptyPlannedEvent: PlannedEventPayload = { title: "", type: "", date: "", venue: "", description: "", objectives: "", whyAttend: "", subthemes: "", regAmount: "" };
const emptyPastEvent: PastEventPayload = { title: "", type: "", date: "", venue: "", description: "", attendees: "", highlights: "" };
const emptyBlog: BlogPayload = { title: "", author: "", shortDescription: "", content: "" };
const emptyMessage: MessagePayload = { recipient: "", subject: "", message: "" };

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [adminOpen, setAdminOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<AdminDialog>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isOfficial, setIsOfficial] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is official on mount
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        if (data.status === "success" && data.user) {
          setIsOfficial(data.user.is_official || false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };
    checkUserSession();
  }, []);

  const [plannedEvent, setPlannedEvent] = useState(emptyPlannedEvent);
  const [pastEvent, setPastEvent] = useState(emptyPastEvent);
  const [blog, setBlog] = useState(emptyBlog);
  const [message, setMessage] = useState(emptyMessage);

  const closeDialog = () => {
    setActiveDialog(null);
    setPlannedEvent(emptyPlannedEvent);
    setPastEvent(emptyPastEvent);
    setBlog(emptyBlog);
    setMessage(emptyMessage);
  };

  const handleSubmit = async (fn: () => Promise<unknown>, successMsg: string) => {
    setSubmitting(true);
    try {
      await fn();
      toast({ title: "Success", description: successMsg });
      closeDialog();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Admin items - only for officials (Send Message removed from here)
  const adminItems = [
    { title: "Planned Events", icon: CalendarDays, action: () => setActiveDialog("planned-event") },
    { title: "Past Events", icon: History, action: () => setActiveDialog("past-event") },
    { title: "New Blog", icon: PenSquare, action: () => setActiveDialog("new-blog") },
    { title: "Members", icon: Users, action: () => navigate("/members") },
    { title: "Member Payments", icon: CreditCard, action: () => navigate("/member-payments") },
    { title: "Member Premiums Payments", icon: CreditCard, action: () => navigate("/member-Premiums-payments") },
  ];

  // Main navigation with Send Message added for all members
  const mainNavWithSend = [
    { title: "Home", url: "/dashboard", icon: Home },
    { title: "Send Message", url: "/messages?compose=true", icon: Send },
    { title: "Messages", url: "/messages", icon: MessageSquare },
    { title: "Payment Invoices", url: "/payment-invoices", icon: FileText },
    { title: "User Information", url: "/user-info", icon: UserCircle },
  ];

  return (
    <>
      <Sidebar collapsible="icon" className="border-r-0">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <img src={AGLlogo} alt="AGL Logo" className="h-10 w-10 shrink-0 rounded-lg object-contain" />
            {!collapsed && (
              <span className="font-display text-sm font-bold text-sidebar-primary">AGL</span>
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
                {mainNavWithSend.map((item) => (
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

                {/* Admin dropdown - only visible to officials */}
                {isOfficial && (
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
                )}

                {isOfficial && adminOpen && !collapsed && adminItems.map((item) => (
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
                onClick={() => {
                  sessionStorage.clear();
                  localStorage.clear();
                  navigate("/");
                }}
                className="text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Create Planned Event Dialog */}
      <Dialog open={activeDialog === "planned-event"} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <CalendarDays className="h-5 w-5 text-primary" /> Create Planned Event
            </DialogTitle>
            <DialogDescription>Add a new upcoming event for members.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 overflow-y-auto flex-1 pr-2">
            <div className="space-y-1.5">
              <Label>Event Title</Label>
              <Input placeholder="Enter event title" value={plannedEvent.title} onChange={(e) => setPlannedEvent({ ...plannedEvent, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Event Type</Label>
                <Input placeholder="e.g. Conference, Workshop" value={plannedEvent.type} onChange={(e) => setPlannedEvent({ ...plannedEvent, type: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Event Date</Label>
                <Input type="date" value={plannedEvent.date} onChange={(e) => setPlannedEvent({ ...plannedEvent, date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Venue</Label>
              <Input placeholder="Enter venue" value={plannedEvent.venue} onChange={(e) => setPlannedEvent({ ...plannedEvent, venue: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Describe the event" rows={2} value={plannedEvent.description} onChange={(e) => setPlannedEvent({ ...plannedEvent, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Objectives</Label>
              <Textarea placeholder="Event objectives" rows={2} value={plannedEvent.objectives} onChange={(e) => setPlannedEvent({ ...plannedEvent, objectives: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Why Attend</Label>
              <Input placeholder="Reasons to attend" value={plannedEvent.whyAttend} onChange={(e) => setPlannedEvent({ ...plannedEvent, whyAttend: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Subthemes (comma-separated)</Label>
              <Input placeholder="e.g. AI, Digital Literacy" value={plannedEvent.subthemes} onChange={(e) => setPlannedEvent({ ...plannedEvent, subthemes: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Registration Amount (Ksh)</Label>
              <Input type="number" placeholder="0" value={plannedEvent.regAmount} onChange={(e) => setPlannedEvent({ ...plannedEvent, regAmount: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={submitting}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={submitting} onClick={() => handleSubmit(() => createPlannedEvent(plannedEvent), "Planned event created successfully")}>
              {submitting ? "Publishing..." : "Publish Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Past Event Dialog */}
      <Dialog open={activeDialog === "past-event"} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <History className="h-5 w-5 text-primary" /> Add Past Event
            </DialogTitle>
            <DialogDescription>Record a past event.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 overflow-y-auto flex-1 pr-2">
            <div className="space-y-1.5">
              <Label>Event Title</Label>
              <Input placeholder="Enter event title" value={pastEvent.title} onChange={(e) => setPastEvent({ ...pastEvent, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Event Type</Label>
                <Input placeholder="e.g. Symposium, Forum" value={pastEvent.type} onChange={(e) => setPastEvent({ ...pastEvent, type: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Event Date</Label>
                <Input type="date" value={pastEvent.date} onChange={(e) => setPastEvent({ ...pastEvent, date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Venue</Label>
              <Input placeholder="Enter venue" value={pastEvent.venue} onChange={(e) => setPastEvent({ ...pastEvent, venue: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Describe the event" rows={2} value={pastEvent.description} onChange={(e) => setPastEvent({ ...pastEvent, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Attendees</Label>
              <Input placeholder="e.g. 350+" value={pastEvent.attendees} onChange={(e) => setPastEvent({ ...pastEvent, attendees: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Highlights</Label>
              <Textarea placeholder="Key highlights of the event" rows={2} value={pastEvent.highlights} onChange={(e) => setPastEvent({ ...pastEvent, highlights: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={submitting}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={submitting} onClick={() => handleSubmit(() => createPastEvent(pastEvent), "Past event saved successfully")}>
              {submitting ? "Saving..." : "Save Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Blog Dialog */}
      <Dialog open={activeDialog === "new-blog"} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <PenSquare className="h-5 w-5 text-primary" /> Create New Blog
            </DialogTitle>
            <DialogDescription>Write and publish a new blog post.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 overflow-y-auto flex-1 pr-2">
            <div className="space-y-1.5">
              <Label>Blog Title</Label>
              <Input placeholder="Enter blog title" value={blog.title} onChange={(e) => setBlog({ ...blog, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Author</Label>
              <Input placeholder="Author name" value={blog.author} onChange={(e) => setBlog({ ...blog, author: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Short Description</Label>
              <Textarea placeholder="Brief summary of the blog" rows={2} value={blog.shortDescription} onChange={(e) => setBlog({ ...blog, shortDescription: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Full Content</Label>
              <Textarea placeholder="Write the full blog content here..." rows={6} value={blog.content} onChange={(e) => setBlog({ ...blog, content: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={submitting}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={submitting} onClick={() => handleSubmit(() => createBlog(blog), "Blog published successfully")}>
              {submitting ? "Publishing..." : "Publish Blog"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={activeDialog === "send-message"} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Send className="h-5 w-5 text-primary" /> Send Message
            </DialogTitle>
            <DialogDescription>Send a message to members.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 overflow-y-auto flex-1 pr-2">
            <div className="space-y-1.5">
              <Label>Recipient</Label>
              <Input placeholder="All members or specific email" value={message.recipient} onChange={(e) => setMessage({ ...message, recipient: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input placeholder="Message subject" value={message.subject} onChange={(e) => setMessage({ ...message, subject: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea placeholder="Type your message here..." rows={5} value={message.message} onChange={(e) => setMessage({ ...message, message: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={submitting}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={submitting} onClick={() => handleSubmit(() => sendMessageApi(message), "Message sent successfully")}>
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

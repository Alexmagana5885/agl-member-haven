import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, CalendarDays, PenSquare, MessageSquare, Users, CreditCard, FileText, UserCircle,
  Mail, Phone, MessageCircle, LogOut, ShieldCheck, ChevronDown, History, Send, MapPin, Tag,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import {
  createPlannedEvent, createPastEvent, createBlog, sendMessage as sendMessageApi,
  type PlannedEventPayload, type PastEventPayload, type BlogPayload, type MessagePayload,
} from "@/services/api";
import AGLlogo from "@/components/payments/AGLlogo.png";

interface UserSession {
  id: string; email: string; type: string; name: string; is_official: boolean; member_type: string;
}

const mainNavWithSend = [
  { title: "Home", url: "/dashboard", icon: Home },
{ title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Online Payments", url: "/online-payments", icon: CreditCard },
  { title: "Payment Invoices", url: "/payment-invoices", icon: FileText },
  { title: "User Information", url: "/user-info", icon: UserCircle },
];

const contactNav = [
  { title: "Email Us", url: "mailto:info@agl.org", icon: Mail, external: true },
  { title: "Call Us", url: "tel:+1234567890", icon: Phone, external: true },
  { title: "Chat on WhatsApp", url: "https://wa.me/1234567890", icon: MessageCircle, external: true },
];

type AdminDialog = "planned-event" | "past-event" | "new-blog" | "send-message" | null;

const emptyMessage: MessagePayload = {
  recipient_group: { type: "all_members" },
  subject: "",
  message: "",
};

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [adminOpen, setAdminOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<AdminDialog>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isOfficial, setIsOfficial] = useState(false);
  const [memberType, setMemberType] = useState<string | null>(null);
  const navigate = useNavigate();
  const canViewMyMembers = memberType === "organization";

  const { toast } = useToast();

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { credentials: "include" });
        const data = await response.json();
        if (data.status === "success" && data.user) {
          setIsOfficial(data.user.is_official || false);
          setMemberType(data.user.member_type ?? null);
          return;
        }

        // Session expired (server-side inactivity timeout)
        if (response.status === 401 || data?.message?.toLowerCase().includes("inactivity") || data?.message?.toLowerCase().includes("expired")) {
          sessionStorage.clear();
          localStorage.clear();
          sessionStorage.setItem("session_expired", "1");
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };
    checkUserSession();
  }, [navigate]);


  const [plannedEvent, setPlannedEvent] = useState<PlannedEventPayload>({ title: "", date: "", venue: "", description: "", regAmount: "" });
  const [pastEvent, setPastEvent] = useState<PastEventPayload>({ title: "", date: "", venue: "", description: "" });
  const [blog, setBlog] = useState<BlogPayload>({ title: "", content: "" });
  const [message, setMessage] = useState(emptyMessage);

  const closeDialog = () => {
    setActiveDialog(null);
    setPlannedEvent({ title: "", date: "", venue: "", description: "", regAmount: "" });
    setPastEvent({ title: "", date: "", venue: "", description: "" });
    setBlog({ title: "", content: "" });
    setMessage(emptyMessage);
  };

  const handleSubmit = async (
    action: () => Promise<{ success: boolean; message?: string }>,
    successMessage: string
  ) => {
    setSubmitting(true);
    try {
      const response = await action();
      if (response?.success) {
toast({ title: successMessage, variant: "default" });
        closeDialog();
      } else {
        toast({
          title: "Action failed",
          description: response?.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Unexpected error",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const adminItems = [
    { title: "Add Planned Event", icon: CalendarDays, action: () => setActiveDialog("planned-event") },
    { title: "Add Past Event", icon: History, action: () => setActiveDialog("past-event") },
    { title: "Create Blog", icon: PenSquare, action: () => setActiveDialog("new-blog") },
    { title: "Send Message", icon: Send, action: () => setActiveDialog("send-message") },
    { title: "Members", icon: Users, action: () => navigate("/members") },
    { title: "Member Payments", icon: CreditCard, action: () => navigate("/member-payments") },
    { title: "Member Premiums Payments", icon: CreditCard, action: () => navigate("/member-Premiums-payments") },
  ];

  return (
    <>
      <Sidebar className="h-full">
        <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-xs uppercase tracking-wider">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
                {mainNavWithSend.map((item) => (
                   

                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end={item.url === "/"} className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

                {isOfficial && (
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Admin" onClick={() => setAdminOpen(!adminOpen)} className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Admin</span>
                      {!collapsed && <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${adminOpen ? "rotate-180" : ""}`} />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {canViewMyMembers && !collapsed && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip="My Members"
                      onClick={() => navigate("/my-members")}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors pl-8 cursor-pointer"
                    >
                      <Users className="h-4 w-4" />
                      <span>My Members</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {isOfficial && adminOpen && !collapsed && adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton tooltip={item.title} onClick={item.action} className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors pl-8 cursor-pointer">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted text-xs uppercase tracking-wider">Contact Us</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {contactNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
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
                onClick={async () => {
                  try {
                    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                  } catch (e) {
                    // ignore
                  }
                  sessionStorage.clear();
                  localStorage.clear();
                  sessionStorage.setItem("session_expired", "1");
                  navigate("/login", { replace: true });
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
              <Label>Event Title *</Label>
              <Input placeholder="Enter event title" value={plannedEvent.title} onChange={(e) => setPlannedEvent({ ...plannedEvent, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Event Date *</Label>
                <Input type="date" value={plannedEvent.date} onChange={(e) => setPlannedEvent({ ...plannedEvent, date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Registration Amount (Ksh) *</Label>
                <Input type="number" placeholder="0" value={plannedEvent.regAmount} onChange={(e) => setPlannedEvent({ ...plannedEvent, regAmount: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Event Location/Venue *</Label>
              <Input placeholder="Enter event venue" value={plannedEvent.venue} onChange={(e) => setPlannedEvent({ ...plannedEvent, venue: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Event Description *</Label>
              <RichTextEditor value={plannedEvent.description} onChange={(val) => setPlannedEvent({ ...plannedEvent, description: val })} placeholder="Describe the event" />
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
            <DialogDescription>Record a past event with details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 overflow-y-auto flex-1 pr-2">
            <div className="space-y-1.5">
              <Label>Event Title *</Label>
              <Input placeholder="Enter event title" value={pastEvent.title} onChange={(e) => setPastEvent({ ...pastEvent, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Event Date *</Label>
                <Input type="date" value={pastEvent.date} onChange={(e) => setPastEvent({ ...pastEvent, date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Event Location/Venue *</Label>
                <Input placeholder="Enter venue" value={pastEvent.venue} onChange={(e) => setPastEvent({ ...pastEvent, venue: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Event Details/Description *</Label>
              <RichTextEditor value={pastEvent.description} onChange={(val) => setPastEvent({ ...pastEvent, description: val })} placeholder="Describe the event details" />
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
              <Label>Blog Title *</Label>
              <Input placeholder="Enter blog title" value={blog.title} onChange={(e) => setBlog({ ...blog, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Full Content *</Label>
              <RichTextEditor value={blog.content} onChange={(val) => setBlog({ ...blog, content: val })} placeholder="Write the full blog content..." />
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
              <Label>Subject</Label>
              <Input placeholder="Message subject" value={message.subject} onChange={(e) => setMessage({ ...message, subject: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <RichTextEditor value={message.message} onChange={(val) => setMessage({ ...message, message: val })} placeholder="Type your message here..." />
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

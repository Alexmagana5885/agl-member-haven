import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { CalendarDays, MapPin, Mail, Phone, UserCheck, Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { PlannedEvent } from "@/services/events";
import type { ProfileData, PlannedEventPayload } from "@/services/api";
import { getPlannedEvents, registerForEvent, getProfileData, getSessionInfo, updatePlannedEvent, deletePlannedEvent } from "@/services/api";
// import { Skeleton } from "@/components/ui/skeleton";

export function PlannedEventsSection() {
  const [events, setEvents] = useState<PlannedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [regEvent, setRegEvent] = useState<PlannedEvent | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isOfficial, setIsOfficial] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlannedEvent | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState<PlannedEventPayload>({
    title: "",
    date: "",
    venue: "",
    description: "",
    regAmount: "",
  });
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await getPlannedEvents();
        setEvents(fetchedEvents);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load planned events",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [toast]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const p = await getProfileData();
        setProfile(p);
        setEmail(p.email || "");
        setName(p.name || "");
      } catch (err) {
        // If profile can't be loaded, keep fields empty and allow manual entry.
        console.error("Failed to load profile for event registration:", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSessionInfo();
        setIsOfficial(!!session?.user?.is_official);
      } catch (err) {
        setIsOfficial(false);
      }
    };
    fetchSession();
  }, []);

  const resetEditForm = () => {
    setEditForm({
      title: "",
      date: "",
      venue: "",
      description: "",
      regAmount: "",
    });
  };

  const handleOpenEdit = (event: PlannedEvent) => {
    setEditingEvent(event);
    setEditForm({
      title: event.event_name,
      date: event.event_date ? event.event_date.slice(0, 10) : "",
      venue: event.event_location,
      description: event.event_description || "",
      regAmount: event.RegistrationAmount?.toString() || "0",
    });
  };

  const handleCloseEdit = () => {
    setEditingEvent(null);
    resetEditForm();
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;
    setEditSubmitting(true);
    try {
      await updatePlannedEvent(String(editingEvent.id), editForm);
      setEvents((prevEvents) =>
        prevEvents.map((evt) =>
          evt.id === editingEvent.id
            ? {
                ...evt,
                event_name: editForm.title,
                event_date: editForm.date,
                event_location: editForm.venue,
                event_description: editForm.description,
                RegistrationAmount: Number(editForm.regAmount || 0),
              }
            : evt,
        ),
      );
      handleCloseEdit();
      toast({ title: "Event updated successfully", variant: "default" });
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message || "Failed to update event",
        variant: "destructive",
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [pendingDeleteEventId, setPendingDeleteEventId] = useState<number | null>(null);

  const handleRequestDeleteEvent = (eventId: number) => {
    setPendingDeleteEventId(eventId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteEvent = async () => {
    if (!pendingDeleteEventId) return;
    setDeleteSubmitting(true);
    try {
      await deletePlannedEvent(String(pendingDeleteEventId));
      setEvents((prevEvents) => prevEvents.filter((evt) => evt.id !== pendingDeleteEventId));
      toast({ title: "Event deleted successfully", variant: "default" });
      setDeleteConfirmOpen(false);
      setPendingDeleteEventId(null);
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message || "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setDeleteSubmitting(false);
    }
  };


  const handleClose = () => {
    setRegEvent(null);
    // Email/Name should come from the logged-in profile session.
    // Keep them intact so reopening the dialog reuses the autofilled values.
    setContact("");
  };


  const handleRegister = async () => {
    if (!regEvent) return;
    setSubmitting(true);
    try {
      await registerForEvent({
        event_id: String(regEvent.id),
        event_name: regEvent.event_name,
        event_location: regEvent.event_location,
        event_date: regEvent.event_date,
        User_email: email,
        memberName: name,
        phone_number: contact,
        amount: regEvent.RegistrationAmount.toString(),
      } as any);

      toast({ title: "Success", description: "Registration submitted successfully" });
      handleClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Registration failed", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card hover:shadow-card-hover transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <CalendarDays className="h-5 w-5 text-accent-foreground" />
            Planned Events
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-card hover:shadow-card-hover transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <CalendarDays className="h-5 w-5 text-accent-foreground" />
            Planned Events ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No upcoming events</p>
            ) : (
              events.map((evt, i) => (
                <div key={i} className="rounded-lg border border-border p-5 hover:border-primary/30 transition-colors">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="font-display text-base font-semibold text-foreground">{evt.event_name}</h4>
                    <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">
                      Event
                    </Badge>
                  </div>

<div className="ql-editor prose prose-sm max-w-none max-h-60 overflow-auto text-sm text-muted-foreground mb-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent" dangerouslySetInnerHTML={{ __html: evt.event_description || '' }} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                    <div className="flex gap-2">
                      <CalendarDays className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">Date</p>
                        <p className="text-xs text-muted-foreground">{new Date(evt.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <MapPin className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">Venue</p>
                        <p className="text-xs text-muted-foreground">{evt.event_location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        Ksh {evt.RegistrationAmount.toLocaleString()}
                      </Badge>
                      {isOfficial && (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEdit(evt)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRequestDeleteEvent(evt.id)}
                          >

                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setRegEvent(evt)}>
                      Register for Event
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!regEvent} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <UserCheck className="h-5 w-5 text-primary" />
              Event Registration
            </DialogTitle>
            <DialogDescription>
              Register for <span className="font-semibold text-foreground">{regEvent?.event_name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Member Email
              </Label>
              <Input id="reg-email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-name" className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Name
              </Label>
              <Input id="reg-name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-contact" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
{regEvent && Number(regEvent.RegistrationAmount) > 0 ? "Phone Number to pay with" : "Phone Number"}

              </Label>
              <Input id="reg-contact" type="tel" placeholder="Enter phone number" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Registration Amount</Label>
              <Input readOnly value={`Ksh ${regEvent?.RegistrationAmount || "0"}`} className="bg-accent" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={submitting}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={submitting} onClick={handleRegister}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={(open) => { if (!open) { setDeleteConfirmOpen(false); setPendingDeleteEventId(null); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Planned Event</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteConfirmOpen(false); setPendingDeleteEventId(null); }} disabled={deleteSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDeleteEvent} disabled={deleteSubmitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingEvent} onOpenChange={(open) => { if (!open) handleCloseEdit(); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">

          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <CalendarDays className="h-5 w-5 text-primary" /> Edit Planned Event
            </DialogTitle>
            <DialogDescription>
              Update the details for the selected planned event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 overflow-y-auto flex-1 pr-2">
            <div className="space-y-1.5">
              <Label>Event Title *</Label>
              <Input
                placeholder="Enter event title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Event Date *</Label>
                <Input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Registration Amount (Ksh) *</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={editForm.regAmount}
                  onChange={(e) => setEditForm({ ...editForm, regAmount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Event Location/Venue *</Label>
              <Input
                placeholder="Enter event venue"
                value={editForm.venue}
                onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Event Description *</Label>
              <RichTextEditor
                value={editForm.description}
                onChange={(val) => setEditForm({ ...editForm, description: val })}
                placeholder="Describe the event"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseEdit}
              disabled={editSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={editSubmitting}
              onClick={handleUpdateEvent}
            >
              {editSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


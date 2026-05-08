import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CalendarDays, MapPin, Mail, Phone, UserCheck, Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { PlannedEvent, ProfileData } from "@/services/api";
import { getPlannedEvents, registerForEvent, getProfileData } from "@/services/api";
// import { Skeleton } from "@/components/ui/skeleton";

export function PlannedEventsSection() {
  const [events, setEvents] = useState<PlannedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [regEvent, setRegEvent] = useState<PlannedEvent | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
        eventTitle: regEvent.event_name, 
        email, 
        name, 
        contact, 
        regAmount: regEvent.RegistrationAmount.toString() 
      });
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
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        Ksh {evt.RegistrationAmount.toLocaleString()}
                      </Badge>
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
                {regEvent && regEvent.RegistrationAmount > 0 ? "Phone Number to pay with" : "Phone Number"}
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
    </>
  );
}


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { History, MapPin, CalendarDays, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPastEvents, getSessionInfo, updatePastEvent, deletePastEvent, type PastEventPayload } from "@/services/api";

interface PastEvent {
  id: number;
  event_name: string;
  event_description: string;
  event_location: string;
  event_date: string;
  attendees?: string;
  highlights?: string;
}

export function PastEventsSection() {
  const [events, setEvents] = useState<PastEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOfficial, setIsOfficial] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PastEvent | null>(null);
  const [editForm, setEditForm] = useState<PastEventPayload>({
    title: "",
    date: "",
    venue: "",
    description: "",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        setLoading(true);
        const data = await getPastEvents();
        setEvents(data?.events || data || []);
      } catch (err: any) {
        const msg = err.message || "Failed to load past events";
        setError(msg);
        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPastEvents();
  }, [toast]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSessionInfo();
        setIsOfficial(!!session?.user?.is_official);
      } catch {
        setIsOfficial(false);
      }
    };
    fetchSession();
  }, []);

  const handleOpenEdit = (event: PastEvent) => {
    setEditingEvent(event);
    setEditForm({
      title: event.event_name,
      date: event.event_date ? event.event_date.slice(0, 10) : "",
      venue: event.event_location,
      description: event.event_details || "",
    });
  };

  const handleCloseEdit = () => {
    setEditingEvent(null);
    setEditForm({
      title: "",
      date: "",
      venue: "",
      description: "",
    });
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;
    setEditSubmitting(true);
    try {
      await updatePastEvent(String(editingEvent.id), editForm);
      setEvents((prevEvents) =>
        prevEvents.map((evt) =>
          evt.id === editingEvent.id
            ? {
                ...evt,
                event_name: editForm.title,
                event_date: editForm.date,
                event_location: editForm.venue,
                event_details: editForm.description,
              }
            : evt,
        ),
      );
      handleCloseEdit();
      toast({ title: "Past event updated successfully", variant: "default" });
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

  const handleDeleteEvent = async (eventId: number) => {
    const confirmed = window.confirm("Delete this past event? This cannot be undone.");
    if (!confirmed) return;

    try {
      await deletePastEvent(String(eventId));
      setEvents((prevEvents) => prevEvents.filter((evt) => evt.id !== eventId));
      toast({ title: "Past event deleted successfully", variant: "default" });
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message || "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card hover:shadow-card-hover transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <History className="h-5 w-5 text-accent-foreground" />
            Past Events
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <History className="h-5 w-5 text-accent-foreground" />
          Past Events ({events.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8 text-destructive text-sm">
            {error}
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="mt-2 p-0 h-auto"
            >
              Retry
            </Button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No past events available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((evt) => (
              <div 
                key={evt.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => navigate(`/past-events/${evt.id}`)}
              >
                <div className="space-y-1 flex-1">
                  <h4 className="font-display text-sm font-semibold text-foreground">
                    {evt.event_name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {evt.event_location}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(evt.event_date)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isOfficial && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(evt);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(evt.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-accent-foreground text-xs shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/past-events/${evt.id}`);
                    }}
                  >
                    More <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <Dialog open={!!editingEvent} onOpenChange={(open) => { if (!open) handleCloseEdit(); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <History className="h-5 w-5 text-primary" /> Edit Past Event
            </DialogTitle>
            <DialogDescription>
              Update the details for the selected past event.
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
                <Label>Event Location/Venue *</Label>
                <Input
                  placeholder="Enter venue"
                  value={editForm.venue}
                  onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Event Details/Description *</Label>
              <RichTextEditor
                value={editForm.description}
                onChange={(val) => setEditForm({ ...editForm, description: val })}
                placeholder="Describe the event details"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEdit} disabled={editSubmitting}>
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
    </Card>
  );
}


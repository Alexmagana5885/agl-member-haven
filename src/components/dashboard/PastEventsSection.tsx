import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, MapPin, CalendarDays, ArrowRight, ArrowLeft, Users, FileText, Target, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getPastEvents } from "@/services/api";

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
  const [selectedEvent, setSelectedEvent] = useState<PastEvent | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getPastEvents();
        setEvents(data);
      } catch (err) {
        console.error("Failed to load past events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Detail view for a selected past event
  if (selectedEvent) {
    return (
      <Card className="shadow-card">
        <CardContent className="pt-6 space-y-4">
          <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Past Events
          </Button>

          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold text-foreground">{selectedEvent.event_name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" />{new Date(selectedEvent.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{selectedEvent.event_location}</span>
              {selectedEvent.attendees && <span className="flex items-center gap-1"><Users className="h-4 w-4" />{selectedEvent.attendees} Attendees</span>}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            <div className="flex gap-3">
              <FileText className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground mb-1">Description</p>
                <div className="ql-editor prose prose-sm max-w-none text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedEvent.event_description || '' }} />
              </div>
            </div>
            {selectedEvent.highlights && (
              <div className="flex gap-3">
                <Target className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">Highlights</p>
                  <div className="ql-editor prose prose-sm max-w-none text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedEvent.highlights }} />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <History className="h-5 w-5 text-accent-foreground" /> Past Events
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
          <History className="h-5 w-5 text-accent-foreground" /> Past Events ({events.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No past events</p>
          ) : (
            events.map((evt) => (
              <div key={evt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg bg-accent/50 p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => setSelectedEvent(evt)}>
                <div className="space-y-1">
                  <h4 className="font-display text-sm font-semibold text-foreground">{evt.event_name}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{evt.event_location}</span>
                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(evt.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <Button variant="link" size="sm" className="p-0 h-auto text-accent-foreground text-xs shrink-0">
                  More <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

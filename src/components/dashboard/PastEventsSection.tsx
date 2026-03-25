import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, MapPin, CalendarDays, ArrowRight, ArrowLeft, Users, FileText, Target, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  const [error, setError] = useState("");
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
                <Button variant="link" size="sm" className="p-0 h-auto text-accent-foreground text-xs shrink-0" onClick={() => navigate(`/past-events/${evt.id}`)}>
                  More <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


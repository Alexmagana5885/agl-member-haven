import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CalendarDays, MapPin, Users, FileText, Target, Loader2 } from "lucide-react";
import { getPastEvents } from "@/services/api";

interface PastEvent {
  id: number;
  event_name: string;
  event_description: string;
  event_location: string;
  event_date: string;
  attendees?: string;
  highlights?: string;
  type?: string;
}

const PastEventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<PastEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const data = await getPastEvents();
        setEvents(data || []);
      } catch (err) {
        console.error("Failed to load past events:", err);
        setError("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const event = events.find((item) => String(item.id) === id);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl py-10">
          <Card className="shadow-card">
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl py-8 text-center space-y-4">
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl py-8 text-center space-y-4">
          <p className="text-muted-foreground">Event not found.</p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-foreground">{event.event_name}</h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {new Date(event.event_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.event_location}
            </span>
            {event.attendees && (
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {event.attendees} Attendees
              </span>
            )}
          </div>
        </div>

        <Card className="shadow-card">
          <CardContent className="rounded-lg p-6 space-y-5 max-h-[65vh] overflow-y-auto">
            <div className="flex gap-3">
              <FileText className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground mb-1">Description</p>
                <div
                  className="ql-editor prose prose-sm max-w-none text-sm text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: event.event_description || "" }}
                />
              </div>
            </div>

            {event.highlights && (
              <div className="flex gap-3">
                <Target className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">Highlights</p>
                  <div
                    className="ql-editor prose prose-sm max-w-none text-sm text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: event.highlights }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PastEventDetail;

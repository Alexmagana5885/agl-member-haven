import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck2, MapPin, Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getProfileData, ProfileData } from "@/services/api";
import { getRegisteredEvents } from "@/services/events";
import type { PlannedEvent } from "@/services/events"; // Reuse for type safety

interface RegisteredEvent {
  id: number;
  event_name: string;
  event_location: string;
  event_date: string;
  member_name: string;
  registration_date: string;
  payment_code: string;
  invitation_card?: string;
}

export function RegisteredEventsSection() {
  const [events, setEvents] = useState<RegisteredEvent[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Step 1: Get profile to extract email
        const profileData = await getProfileData();
        setProfile(profileData);
        
        if (!profileData.email) {
          throw new Error("User email not found");
        }

        // Step 2: Get registered events for this user
        const userEvents = await getRegisteredEvents(profileData.email);
        setEvents(userEvents || []);
      } catch (err: any) {
        setError(err.message || "Failed to load registered events");
        console.error("Events fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch {
      return "Date unavailable";
    }
  };

  const handleDownloadInvitation = (invitationPath: string | undefined) => {
    if (invitationPath) {
      window.open(`/api/uploads/invitation/${invitationPath}`, "_blank");
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Loader2 className="h-5 w-5 animate-spin text-accent-foreground" />
            Registered Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <div className="flex gap-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <CalendarCheck2 className="h-5 w-5 text-accent-foreground" />
          Registered Events
          {events.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {events.length}
            </Badge>
          )}
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
            <CalendarCheck2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
<p className="text-sm">You have not registered on any event.</p>
            <p className="text-xs mt-1">Register for upcoming events to see them here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((evt) => (
              <div key={evt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4 hover:bg-accent">
                <div className="space-y-1 flex-1">
                  <h4 className="font-display text-sm font-semibold text-foreground line-clamp-2">
                    {evt.event_name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {evt.event_location}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarCheck2 className="h-3 w-3" />
                      {formatDate(evt.event_date)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Reg: {formatDate(evt.registration_date)}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center shrink-0">
                  <Badge variant="secondary" className="text-xs">
                    {evt.payment_code}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="shrink-0 border-primary text-accent-foreground hover:bg-accent"
                    onClick={() => handleDownloadInvitation(evt.invitation_card)}
                    disabled={!evt.invitation_card}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    {evt.invitation_card ? "Card" : "Pending"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CalendarDays, MapPin, Users, FileText, Image, Download, Loader2 } from "lucide-react";

import { buildAssetUrl } from "@/services/api";
import { getPastEvent } from "@/services/events";


import { useToast } from "@/hooks/use-toast";

interface PastEvent {
  id: number;
  event_name: string;
  event_details: string;
  event_location: string;
  event_date: string;
  event_image_paths?: string[];
  event_document_paths?: string[];
  created_at?: string;
  attendees?: string; // optional, not in DB
  highlights?: string; // optional, not in DB
}

const PastEventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<PastEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError("");
        const data = await getPastEvent(parseInt(id));
        const eventData = data.event || data;
        if (!eventData) {
          throw new Error("Event data not found in response");
        }
        setEvent(eventData);
      } catch (err: any) {
        console.error("Failed to load past event:", err);
        setError(err.message || "Failed to load event details.");
        toast({
          title: "Error",
          description: err.message || "Failed to load event details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, toast]);

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

  if (error || !event) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl py-8 text-center space-y-4">
          <p className="text-destructive">{error || "Event not found."}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
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
            {/* Event Details */}
            <div className="flex gap-3">
              <FileText className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground mb-1">Event Details</p>
                <div
                  className="ql-editor prose prose-sm max-w-none text-sm text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: event.event_details || "" }}
                />
              </div>
            </div>

            {/* Optional Highlights - fallback to part of details if needed */}
            {event.highlights && (
              <div className="flex gap-3">

                <FileText className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">Highlights</p>
                  <div
                    className="ql-editor prose prose-sm max-w-none text-sm text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: event.highlights || "" }}
                  />
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Images Gallery */}
        {event.event_image_paths && event.event_image_paths.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Event Images ({event.event_image_paths.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {event.event_image_paths.map((imgPath, index) => (
                  <div key={index} className="relative group">
<img
                      src={buildAssetUrl(imgPath)}
                      alt={`Event image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                    />

                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {event.event_document_paths && event.event_document_paths.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Event Documents ({event.event_document_paths.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-2">
              {event.event_document_paths.map((docPath, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full justify-start text-left flex gap-2"
                >
<a
                    href={buildAssetUrl(docPath) || docPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    📄 Document {index + 1}
                  </a>

                </Button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PastEventDetail;

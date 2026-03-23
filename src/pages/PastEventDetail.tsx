import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CalendarDays, MapPin, Users, FileText, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPastEvent } from "@/services/events";


const PastEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await getPastEvent(Number(id));
        setEvent(eventData?.event || null);
      } catch (err: any) {
        const msg = err.message || "Failed to load event details";
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

    fetchEvent();
  }, [id, toast]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl py-8 space-y-6">
          <Skeleton className="h-10 w-32" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !event) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl py-8 text-center">
          <p className="text-muted-foreground mb-4">Event not found or unavailable.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-foreground">{event.event_name}</h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" />{formatDate(event.event_date)}</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{event.event_location}</span>
            <span className="rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-accent-foreground">Past Event</span>
          </div>
        </div>

        <div className="prose prose-sm max-w-none">
          <div className="ql-editor" dangerouslySetInnerHTML={{ __html: event.event_details }} />
        </div>

        {event.event_image_paths && event.event_image_paths.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.event_image_paths.map((img: string, i: number) => (
              <img key={i} src={img} alt="" className="w-full h-48 object-cover rounded-lg" />
            ))}
          </div>
        )}

        {event.event_document_paths && event.event_document_paths.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </h4>
            {event.event_document_paths.map((doc: string, i: number) => (
              <Button key={i} variant="outline" asChild>
                <a href={doc} target="_blank" rel="noopener noreferrer" className="w-full justify-start">
                  📄 {doc.split('/').pop()}
                </a>
              </Button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PastEventDetail;

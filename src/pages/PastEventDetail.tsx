import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, MapPin, Users, FileText, Target } from "lucide-react";

const pastEvents = [
  { id: "0", title: "National Library Week Symposium 2025", venue: "KICC, Nairobi", date: "10 Nov 2025", type: "Symposium", description: "A national symposium bringing together government librarians to celebrate Library Week and discuss the role of libraries in national development.", attendees: "350+", highlights: "Keynote by PS Ministry of Education, panel discussions on digital transformation, exhibition of library innovations across counties." },
  { id: "1", title: "Records Management Training", venue: "Moi University, Eldoret", date: "22 Sep 2025", type: "Training", description: "Intensive training on modern records management practices for government information professionals.", attendees: "120", highlights: "Hands-on sessions on electronic records management, archival standards, and compliance with Kenya's Access to Information Act." },
  { id: "2", title: "Government Information Access Forum", venue: "Kenya School of Government, Nairobi", date: "5 Jul 2025", type: "Forum", description: "A forum dedicated to improving public access to government information and open data initiatives.", attendees: "200+", highlights: "Launch of the Government Open Data Portal 2.0, presentations from county governments on information access best practices." },
];

const PastEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = pastEvents.find((e) => e.id === id);

  if (!event) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl py-8 text-center">
          <p className="text-muted-foreground">Event not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-foreground">{event.title}</h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" />{event.date}</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{event.venue}</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" />{event.attendees} Attendees</span>
            <span className="rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-accent-foreground">{event.type}</span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 space-y-5">
          <div className="flex gap-3">
            <FileText className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Description</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Target className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Highlights</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{event.highlights}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PastEventDetail;

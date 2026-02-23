import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { History, MapPin, CalendarDays, ArrowRight, Users, Target, FileText } from "lucide-react";

const pastEvents = [
  { title: "National Library Week Symposium 2025", venue: "KICC, Nairobi", date: "10 Nov 2025", type: "Symposium", description: "A national symposium bringing together government librarians to celebrate Library Week and discuss the role of libraries in national development.", attendees: "350+", highlights: "Keynote by PS Ministry of Education, panel discussions on digital transformation, exhibition of library innovations across counties." },
  { title: "Records Management Training", venue: "Moi University, Eldoret", date: "22 Sep 2025", type: "Training", description: "Intensive training on modern records management practices for government information professionals.", attendees: "120", highlights: "Hands-on sessions on electronic records management, archival standards, and compliance with Kenya's Access to Information Act." },
  { title: "Government Information Access Forum", venue: "Kenya School of Government, Nairobi", date: "5 Jul 2025", type: "Forum", description: "A forum dedicated to improving public access to government information and open data initiatives.", attendees: "200+", highlights: "Launch of the Government Open Data Portal 2.0, presentations from county governments on information access best practices." },
];

export function PastEventsSection() {
  const [selectedEvent, setSelectedEvent] = useState<typeof pastEvents[0] | null>(null);

  return (
    <>
      <Card className="shadow-card hover:shadow-card-hover transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <History className="h-5 w-5 text-accent-foreground" />
            Past Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pastEvents.map((evt, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg bg-accent/50 p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => setSelectedEvent(evt)}>
                <div className="space-y-1">
                  <h4 className="font-display text-sm font-semibold text-foreground">{evt.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{evt.venue}</span>
                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{evt.date}</span>
                  </div>
                </div>
                <Button variant="link" size="sm" className="p-0 h-auto text-accent-foreground text-xs shrink-0">
                  More <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => { if (!open) setSelectedEvent(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg leading-snug">{selectedEvent?.title}</DialogTitle>
            <DialogDescription asChild>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{selectedEvent?.date}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedEvent?.venue}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{selectedEvent?.attendees} Attendees</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              <FileText className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground mb-1">Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedEvent?.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Target className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground mb-1">Highlights</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedEvent?.highlights}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

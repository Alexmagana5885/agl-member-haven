import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck2, MapPin, Download } from "lucide-react";

const events = [
  { title: "Annual Government Libraries Summit 2026", venue: "KICC, Nairobi", date: "20 Mar 2026" },
  { title: "Digital Archiving Workshop", venue: "Kenya National Library, Mombasa", date: "5 Apr 2026" },
];

export function RegisteredEventsSection() {
  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <CalendarCheck2 className="h-5 w-5 text-accent-foreground" />
          Registered Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((evt, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4">
              <div className="space-y-1">
                <h4 className="font-display text-sm font-semibold text-foreground">{evt.title}</h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{evt.venue}</span>
                  <span className="flex items-center gap-1"><CalendarCheck2 className="h-3 w-3" />{evt.date}</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="shrink-0 border-primary text-accent-foreground hover:bg-accent">
                <Download className="mr-1 h-3 w-3" />
                Invitation Card
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

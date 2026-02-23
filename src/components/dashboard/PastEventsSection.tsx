import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, MapPin, CalendarDays, ArrowRight } from "lucide-react";

const pastEvents = [
  { id: "0", title: "National Library Week Symposium 2025", venue: "KICC, Nairobi", date: "10 Nov 2025", type: "Symposium" },
  { id: "1", title: "Records Management Training", venue: "Moi University, Eldoret", date: "22 Sep 2025", type: "Training" },
  { id: "2", title: "Government Information Access Forum", venue: "Kenya School of Government, Nairobi", date: "5 Jul 2025", type: "Forum" },
];

export function PastEventsSection() {
  const navigate = useNavigate();

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <History className="h-5 w-5 text-accent-foreground" />
          Past Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pastEvents.map((evt) => (
            <div key={evt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg bg-accent/50 p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate(`/past-events/${evt.id}`)}>
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
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CalendarDays, MapPin, Target, Tag, Users, Mail, Phone, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const events = [
  {
    title: "East Africa Library Innovation Conference 2026",
    type: "Conference",
    description: "A three-day conference bringing together government librarians from across East Africa to discuss innovation, technology, and knowledge management.",
    objectives: "Foster collaboration, share best practices, explore emerging technologies for public libraries.",
    whyAttend: "Network with 500+ librarians, earn CPD points, access cutting-edge workshops.",
    subthemes: ["AI in Libraries", "Digital Literacy", "Open Data Governance", "Heritage Preservation"],
    venue: "Kenyatta International Convention Centre, Nairobi",
    date: "15-17 Jun 2026",
    regAmount: "0",
  },
  {
    title: "Data Management & Cataloguing Workshop",
    type: "Workshop",
    description: "Hands-on training on modern cataloguing standards and data management techniques for government libraries.",
    objectives: "Equip participants with practical skills in RDA cataloguing and digital asset management.",
    whyAttend: "Practical workshop with certification, small group sessions for personalized learning.",
    subthemes: ["RDA Standards", "MARC21", "Digital Repositories"],
    venue: "Kenya National Library HQ, Nairobi",
    date: "8 Aug 2026",
    regAmount: "0",
  },
];

export function PlannedEventsSection() {
  const [regEvent, setRegEvent] = useState<typeof events[0] | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  return (
    <>
      <Card className="shadow-card hover:shadow-card-hover transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <CalendarDays className="h-5 w-5 text-accent-foreground" />
            Planned Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((evt, i) => (
              <div key={i} className="rounded-lg border border-border p-5 hover:border-primary/30 transition-colors">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="font-display text-base font-semibold text-foreground">{evt.title}</h4>
                  <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">
                    {evt.type}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{evt.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                  <div className="flex gap-2">
                    <Target className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Objectives</p>
                      <p className="text-xs text-muted-foreground">{evt.objectives}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Users className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Why Attend</p>
                      <p className="text-xs text-muted-foreground">{evt.whyAttend}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {evt.subthemes.map((s) => (
                    <Badge key={s} variant="outline" className="text-[10px] px-2 py-0.5 border-primary/20 text-muted-foreground">
                      {s}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{evt.venue}</span>
                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{evt.date}</span>
                  </div>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setRegEvent(evt)}>
                    Register for Event
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!regEvent} onOpenChange={(open) => { if (!open) setRegEvent(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <UserCheck className="h-5 w-5 text-primary" />
              Event Registration
            </DialogTitle>
            <DialogDescription>
              Register for <span className="font-semibold text-foreground">{regEvent?.title}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Member Email
              </Label>
              <Input id="reg-email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-name" className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Name
              </Label>
              <Input id="reg-name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-contact" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Contact
              </Label>
              <Input id="reg-contact" type="tel" placeholder="Enter your phone number" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Registration Amount</Label>
              <Input readOnly value={`Ksh ${regEvent?.regAmount || "0"}`} className="bg-accent" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegEvent(null)}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Register</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

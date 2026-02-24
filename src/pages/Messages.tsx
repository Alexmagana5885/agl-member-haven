import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Mail, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const messages = [
  { subject: "Annual General Meeting Notice", from: "AGL Admin", date: "20 Feb 2026", preview: "Dear members, you are invited to the upcoming AGM scheduled for March 15, 2026...", read: true },
  { subject: "Membership Renewal Reminder", from: "Finance Dept", date: "15 Feb 2026", preview: "This is a reminder that your annual membership fee is due by March 31, 2026...", read: false },
  { subject: "New Library Management Workshop", from: "Events Team", date: "10 Feb 2026", preview: "We are excited to announce a hands-on workshop on modern library management systems...", read: true },
  { subject: "CPD Points Update", from: "Education Committee", date: "5 Feb 2026", preview: "Your CPD points for Q4 2025 have been updated. You currently have 45 points...", read: false },
  { subject: "Digital Literacy Program Launch", from: "AGL Admin", date: "28 Jan 2026", preview: "We are launching a new digital literacy program for government librarians across the country...", read: true },
  { subject: "Holiday Greetings", from: "AGL President", date: "24 Dec 2025", preview: "Season's greetings to all our esteemed members. Wishing you a wonderful holiday season...", read: true },
];

const MessagesPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <MessageSquare className="h-5 w-5 text-accent-foreground" />
              Messages ({messages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-4 transition-colors cursor-pointer hover:bg-accent/30 ${
                    !msg.read ? "border-primary/40 bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm truncate ${!msg.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                          {msg.subject}
                        </h4>
                        {!msg.read && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 shrink-0">New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {msg.from}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{msg.preview}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1 shrink-0">
                      <CalendarDays className="h-3 w-3" /> {msg.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MessagesPage;

import avatarImg from "@/assets/avatar-placeholder.jpg";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Mail, User } from "lucide-react";

export function ProfileSection() {
  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">
      <div className="h-24 bg-[image:var(--gradient-primary)]" />
      <CardContent className="relative pt-0 pb-6 px-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
          <img
            src={avatarImg}
            alt="Member avatar"
            className="h-24 w-24 rounded-full border-4 border-card object-cover shadow-card"
          />
          <div className="text-center sm:text-left pb-1">
            <h2 className="font-display text-xl font-bold text-foreground">John Mwangi</h2>
            <p className="text-sm text-muted-foreground">Government Librarian — Senior Member</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoItem icon={User} label="Full Name" value="John Mwangi Kamau" />
          <InfoItem icon={Mail} label="Email" value="john.mwangi@gov.ke" />
          <InfoItem icon={CalendarDays} label="Registration Date" value="15 Jan 2022" />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-accent p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-accent-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

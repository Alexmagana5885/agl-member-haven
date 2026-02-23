import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, CalendarCheck, CalendarClock, DollarSign } from "lucide-react";

export function MembershipSection() {
  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <CreditCard className="h-5 w-5 text-accent-foreground" />
          Membership & Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard icon={CalendarCheck} label="Last Payment" value="12 Dec 2025" />
          <StatCard icon={CalendarClock} label="Next Payment" value="12 Dec 2026" />
          <StatCard icon={DollarSign} label="Last Amount Paid" value="KES 5,000" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Pay Membership Fee
          </Button>
          <Button variant="outline" className="border-primary text-accent-foreground hover:bg-accent">
            Pay Membership Premium
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-accent/50 p-4 text-center">
      <Icon className="mx-auto mb-2 h-5 w-5 text-accent-foreground" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

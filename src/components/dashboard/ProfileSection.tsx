import { useEffect, useState } from "react";
import avatarImg from "@/assets/alex.jpg";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Mail, User, GraduationCap, CreditCard, CheckCircle2 } from "lucide-react";
import { getProfileData, ProfileData } from "@/services/api";

export function ProfileSection() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfileData();
      setProfile(data);
    } catch (err) {
      setError("Failed to load profile data");
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="pt-12 pb-6 px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-24 w-24 rounded-full bg-muted mx-auto sm:ml-0 mb-4" />
            <div className="h-8 bg-muted rounded w-3/4 mx-auto sm:ml-0" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card className="shadow-card">
        <CardContent className="pt-12 pb-6 px-6 text-center">
          <p className="text-destructive">{error || "Profile data unavailable"}</p>
        </CardContent>
      </Card>
    );
  }

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
            <h2 className="font-display text-xl font-bold text-foreground">
              {profile.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {profile.user_type === "individual" ? "Personal Member" : "Organization Member"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Basic Info */}
          <InfoItem icon={User} label="Full Name" value={profile.name} />
          <InfoItem icon={Mail} label="Email" value={profile.email} />
          <InfoItem icon={CalendarDays} label="Member Since" value={formatDate(profile.registration_date)} />
          
          {/* Education */}
          {profile.education && (
            <>
              <InfoItem icon={GraduationCap} label="Highest Degree" value={profile.education.highest_degree || "N/A"} />
              <div className="sm:col-span-2">
                <InfoItem icon={GraduationCap} label="Institution & Year" 
                  value={`${profile.education.institution || "N/A"} (${profile.education.graduation_year || "N/A"})`} />
              </div>
            </>
          )}

          {/* Payments */}
          <InfoItem icon={CreditCard} label="Premium Status" value={profile.payments.status} />
          <InfoItem 
            icon={profile.payments.fully_paid ? CheckCircle2 : CreditCard} 
            label="Next Payment" 
            value={formatDate(profile.payments.next_payment_date)}
            className={profile.payments.fully_paid ? "text-green-600" : ""}
          />
          <InfoItem icon={CreditCard} label="Paid This Year" value={`KES ${profile.payments.total_paid_this_year}`} />
        </div>
      </CardContent>
    </Card>
  );
}

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}

function InfoItem({ icon: Icon, label, value, className = "" }: InfoItemProps) {
  return (
    <div className={`flex items-center gap-3 rounded-lg bg-accent p-3 ${className}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}


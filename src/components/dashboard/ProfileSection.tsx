import { useEffect, useState } from "react";
import avatarImg from "@/assets/alex.jpg";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Mail, User, GraduationCap, CreditCard, CheckCircle2 } from "lucide-react";
import { getProfileData, updateProfileData, ProfileData } from "@/services/api";

export function ProfileSection() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<ProfileData>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfileData();
      setProfile(data);
      setEditedProfile({});
    } catch (err) {
      setError("Failed to load profile data");
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editing) {
      setEditing(false);
      setEditedProfile({});
    } else {
      setEditing(true);
      setEditedProfile({});
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfileData(editedProfile);
      await fetchProfile(); // Refresh
      setEditing(false);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
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

        <div className="mt-6 space-y-4">
          <div className="flex justify-end gap-2">
            <Button
              variant={editing ? "outline" : "default"}
              size="sm"
              onClick={handleEditToggle}
              disabled={saving || loading}
            >
              {editing ? "Cancel" : "Edit Profile"}
            </Button>
            {editing && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || loading}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Basic Info */}
            <EditableInfoItem
              icon={User}
              label="Full Name"
              value={editing ? editedProfile.name || profile?.name || '' : profile?.name || ''}
              editing={editing}
              onChange={(v) => handleFieldChange('name', v)}
              readOnly={false}
            />
            <EditableInfoItem
              icon={Mail}
              label="Email"
              value={editing ? editedProfile.email || profile?.email || '' : profile?.email || ''}
              editing={editing}
              onChange={(v) => handleFieldChange('email', v)}
              readOnly={false}
            />
            <InfoItem icon={CalendarDays} label="Member Since" value={formatDate(profile?.registration_date || '')} />
            
            {/* Education */}
            {profile?.education && (
              <>
                <EditableInfoItem
                  icon={GraduationCap}
                  label="Highest Degree"
                  value={(editing ? editedProfile.education?.highest_degree || profile.education.highest_degree : profile.education.highest_degree) || "N/A"}
                  editing={editing}
                  onChange={(v) => handleFieldChange('education.highest_degree', v)}
                  readOnly={false}
                />
                <div className="sm:col-span-2">
                  <EditableInfoItem
                    icon={GraduationCap}
                    label="Institution"
                    value={(editing ? editedProfile.education?.institution || profile.education.institution : profile.education.institution) || "N/A"}
                    editing={editing}
                    onChange={(v) => handleFieldChange('education.institution', v)}
                    readOnly={false}
                  />
                </div>
              </>
            )}

            {/* Payments read-only */}
            <InfoItem icon={CreditCard} label="Premium Status" value={profile?.payments.status || ''} />
            <InfoItem 
              icon={profile?.payments.fully_paid ? CheckCircle2 : CreditCard} 
              label="Next Payment" 
              value={formatDate(profile?.payments.next_payment_date || '')}
              className={profile?.payments.fully_paid ? "text-green-600" : ""}
            />
            <InfoItem icon={CreditCard} label="Paid This Year" value={`KES ${profile?.payments.total_paid_this_year || 0}`} />
          </div>
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

interface EditableInfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  readOnly: boolean;
}

function EditableInfoItem({ icon: Icon, label, value, editing, onChange, readOnly }: EditableInfoItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-accent p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {editing && !readOnly ? (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm h-8"
          />
        ) : (
          <p className="text-sm font-medium text-foreground">{value}</p>
        )}
      </div>
    </div>
  );
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


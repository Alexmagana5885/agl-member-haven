import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserCircle, Save, X, Pencil, GraduationCap, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getProfileData, ProfileData, fetchData } from "@/services/api";

const UserInformationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfileData();
      setProfile(data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load profile data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!profile) return;
    setEditData({
      name: profile.name || "",
      email: profile.email || "",
    });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({});
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/dashboard/user-info/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editData),
      });
      if (!response.ok) throw new Error("Failed to save");
      toast({ title: "Success", description: "Profile updated successfully" });
      setEditing(false);
      fetchProfile();
    } catch (err) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <UserCircle className="h-5 w-5 text-accent-foreground" />
                User Information
              </CardTitle>
              {!editing ? (
                <Button size="sm" className="gap-1.5" onClick={handleEdit}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCancel}>
                    <X className="h-3.5 w-3.5" /> Cancel
                  </Button>
                  <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave} disabled={saving}>
                    <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-muted rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded-lg" />
                  ))}
                </div>
              </div>
            ) : profile ? (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
                    {editing ? (
                      <Input value={editData.name || ""} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                    ) : (
                      <div className="p-3 rounded-lg bg-accent border">
                        <p className="font-semibold">{profile.name}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                    {editing ? (
                      <Input value={editData.email || ""} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                    ) : (
                      <div className="p-3 rounded-lg bg-accent border">
                        <p>{profile.email}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Member Since</Label>
                    <div className="p-3 rounded-lg bg-accent border">
                      <p>{new Date(profile.registration_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Membership Type</Label>
                    <div className="p-3 rounded-lg bg-accent border">
                      <p className="capitalize">{profile.user_type}</p>
                    </div>
                  </div>
                </div>

                {/* Education */}
                {profile.education && (
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" /> Education
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Highest Degree</Label>
                        <div className="p-3 rounded-lg bg-accent border">
                          <p>{profile.education.highest_degree}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Institution</Label>
                        <div className="p-3 rounded-lg bg-accent border">
                          <p>{profile.education.institution}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Graduation Year</Label>
                        <div className="p-3 rounded-lg bg-accent border">
                          <p>{profile.education.graduation_year}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payments */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Membership & Payments
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Premium Status</Label>
                      <div className={`p-3 rounded-lg border ${profile.payments.fully_paid ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                        <p className={`font-semibold ${profile.payments.fully_paid ? 'text-green-800' : 'text-orange-800'}`}>
                          {profile.payments.status}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Paid This Year</Label>
                      <div className="p-3 rounded-lg bg-accent border">
                        <p className="font-mono">KES {profile.payments.total_paid_this_year.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">/ {profile.payments.required_amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Next Payment Due</Label>
                      <div className="p-3 rounded-lg bg-accent border">
                        <p>{new Date(profile.payments.next_payment_date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No profile data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserInformationPage;

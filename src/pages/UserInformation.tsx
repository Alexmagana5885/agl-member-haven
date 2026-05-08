import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserCircle, Save, X, Pencil, GraduationCap, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import avatarImg from "@/assets/AGLlogo.png";
import { getProfileData, type ProfileData, updateProfileData, uploadProfileImage, type ProfileUpdatePayload } from "@/services/api";

const UserInformationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ProfileUpdatePayload>>({});
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

const getImageSrc = (path?: string) => {
    if (imagePreview) return imagePreview;
    if (!path) return avatarImg;
    // Strip leading 'uploads/' to avoid double path
    const cleanPath = path.replace(/^uploads[\/\\]/i, '');
    return `/uploads/${cleanPath}`;
  };

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

  const handleFieldChange = (field: keyof ProfileUpdatePayload, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    setEditing(true);
    // Start empty - only track actual changes
    setEditData({});
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({});
    setImageFile(null);
    setImagePreview('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let hasChanges = false;

      // Upload image first if selected
      if (imageFile) {
        await uploadProfileImage(imageFile);
        setImageFile(null);
        setImagePreview('');
        hasChanges = true;
      }
      
      // Update text data only if actual changes
      if (Object.keys(editData).length > 0) {
        await updateProfileData(editData);
        hasChanges = true;
      }

      if (hasChanges) {
        toast({ title: "Success", description: "Profile updated successfully" });
        setEditing(false);
        await fetchProfile();
      } else {
        toast({ title: "Info", description: "No changes to save" });
        setEditing(false);
      }
    } catch (err: any) {
      console.error("Save error:", err);
      toast({ title: "Error", description: err.message || "Failed to update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getFieldValue = (field: keyof ProfileUpdatePayload) => {
    return editData[field] ?? 
      (field === 'name' ? profile?.name : 
       field === 'email' ? profile?.email :
       field === 'highest_degree' ? profile?.education?.highest_degree :
       field === 'institution' ? profile?.education?.institution :
       field === 'graduation_year' ? profile?.education?.graduation_year?.toString() : '');
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
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
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCancel} disabled={saving}>
                    <X className="h-3.5 w-3.5" /> Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleSave}
                    disabled={saving}
                  >
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
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Profile Image */}
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs font-medium text-muted-foreground">Profile Image</Label>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent border">
                      <img 
                        src={getImageSrc(profile?.image_path)} 
                        alt="Profile" 
                        className="h-16 w-16 rounded-full object-cover flex-shrink-0"
                      />
                      {editing && (
                        <div className="space-y-2 min-w-0 flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setImageFile(file);
                                const preview = URL.createObjectURL(file);
                                setImagePreview(preview);
                              }
                            }}
                            className="text-sm"
                            disabled={saving}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
                    {editing ? (
                      <Input 
                        value={getFieldValue('name')} 
                        onChange={(e) => handleFieldChange('name', e.target.value)} 
                        disabled={saving}
                      />
                    ) : (
                      <div className="p-3 rounded-lg bg-accent border">
                        <p className="font-semibold">{profile.name}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                    {editing ? (
                      <Input 
                        value={getFieldValue('email')} 
                        onChange={(e) => handleFieldChange('email', e.target.value)} 
                        disabled={saving}
                      />
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

                {profile.education && (
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" /> Education
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Highest Degree</Label>
                        {editing ? (
                          <Input
                            value={getFieldValue('highest_degree')}
                            onChange={(e) => handleFieldChange('highest_degree', e.target.value)}
                            disabled={saving}
                          />
                        ) : (
                          <div className="p-3 rounded-lg bg-accent border">
                            <p>{profile.education.highest_degree}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Institution</Label>
                        {editing ? (
                          <Input
                            value={getFieldValue('institution')}
                            onChange={(e) => handleFieldChange('institution', e.target.value)}
                            disabled={saving}
                          />
                        ) : (
                          <div className="p-3 rounded-lg bg-accent border">
                            <p>{profile.education.institution}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Graduation Year</Label>
                        {editing ? (
                          <Input
                            type="number"
                            value={getFieldValue('graduation_year')}
                            onChange={(e) => handleFieldChange('graduation_year', e.target.value)}
                            disabled={saving}
                          />
                        ) : (
                          <div className="p-3 rounded-lg bg-accent border">
                            <p>{profile.education.graduation_year}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    Membership & Payments
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Premium Status</Label>
                      <div className={`p-3 rounded-lg border ${profile.payments.fully_paid ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`} >
                        <p className={`font-semibold ${profile.payments.fully_paid ? "text-green-800" : "text-orange-800"}`} >
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
                        <p>
                          {(() => {
                            const nextRaw = profile?.payments?.next_payment_date || "";
                            const nextDate = nextRaw ? new Date(nextRaw) : null;
                            const currentYear = new Date().getFullYear();
                            const nextYear = nextDate?.getFullYear();

                            // If premium for the current year isn't fully paid, force Next Payment Due within current year.
                            if (!profile?.payments?.fully_paid) {
                              if (nextYear !== currentYear) return "currentYear";
                            }

                            return new Date(nextRaw).toLocaleDateString("en-GB", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            });
                          })()}

                        </p>
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


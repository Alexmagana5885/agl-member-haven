import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserCircle, Save, X, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const initialUser = {
  firstName: "Alex",
  lastName: "Mwangi",
  email: "alex.mwangi@gov.ke",
  phone: "+254 712 345 678",
  idNumber: "29384756",
  department: "Kenya National Library Service",
  jobTitle: "Senior Government Librarian",
  county: "Nairobi",
  postalAddress: "P.O. Box 30573-00100, Nairobi",
  membershipNo: "AGL-2023-0142",
};

const fieldLabels: Record<string, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email Address",
  phone: "Phone Number",
  idNumber: "ID / Passport Number",
  department: "Department / Organization",
  jobTitle: "Job Title",
  county: "County",
  postalAddress: "Postal Address",
  membershipNo: "Membership Number",
};

const readOnlyFields = ["membershipNo"];

const UserInformationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialUser);

  const handleEdit = () => {
    setDraft({ ...user });
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft({ ...user });
    setEditing(false);
  };

  const handleSave = () => {
    setUser({ ...draft });
    setEditing(false);
    toast({ title: "Success", description: "User information updated successfully" });
  };

  const handleChange = (field: string, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2">
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
                  <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>
                    <Save className="h-3.5 w-3.5" /> Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(fieldLabels).map(([key, label]) => (
                <div key={key} className={`space-y-1.5 ${key === "postalAddress" ? "sm:col-span-2" : ""}`}>
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  {editing && !readOnlyFields.includes(key) ? (
                    <Input
                      value={draft[key as keyof typeof draft]}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  ) : (
                    <div className="flex h-10 items-center rounded-md border border-border bg-accent/30 px-3 text-sm text-foreground">
                      {user[key as keyof typeof user]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserInformationPage;

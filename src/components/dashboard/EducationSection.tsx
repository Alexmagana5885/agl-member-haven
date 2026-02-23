import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Building2, Calendar } from "lucide-react";

export function EducationSection() {
  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <GraduationCap className="h-5 w-5 text-accent-foreground" />
          Education Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-accent p-4">
            <GraduationCap className="h-5 w-5 text-accent-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Highest Degree</p>
              <p className="text-sm font-medium text-foreground">Master of Library Science</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-accent p-4">
            <Building2 className="h-5 w-5 text-accent-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Institution</p>
              <p className="text-sm font-medium text-foreground">University of Nairobi</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-accent p-4">
            <Calendar className="h-5 w-5 text-accent-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Graduation Year</p>
              <p className="text-sm font-medium text-foreground">2019</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

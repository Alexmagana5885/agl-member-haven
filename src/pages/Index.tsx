import { DashboardLayout } from "@/components/DashboardLayout";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { MembershipSection } from "@/components/dashboard/MembershipSection";
import { EducationSection } from "@/components/dashboard/EducationSection";
import { RegisteredEventsSection } from "@/components/dashboard/RegisteredEventsSection";
import { BlogsSection } from "@/components/dashboard/BlogsSection";
import { PlannedEventsSection } from "@/components/dashboard/PlannedEventsSection";
import { PastEventsSection } from "@/components/dashboard/PastEventsSection";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <ProfileSection />
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MembershipSection />
          <EducationSection />
        </div> */}
        <RegisteredEventsSection />
        <BlogsSection />
        <PlannedEventsSection />
        <PastEventsSection />
      </div>
    </DashboardLayout>
  );
};

export default Index;

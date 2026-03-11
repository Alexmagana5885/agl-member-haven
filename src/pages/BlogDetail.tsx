import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, User } from "lucide-react";

const blogs = [
  {
    id: "0",
    title: "The Future of Government Libraries in Africa",
    desc: "Exploring how digital transformation is reshaping public knowledge infrastructure across the continent.",
    fullContent: "Digital transformation is fundamentally changing how government libraries operate across Africa. From Kenya to South Africa, librarians are adopting new technologies to improve citizen access to information. This article explores the key trends driving this transformation, including cloud-based cataloguing systems, digital lending platforms, and AI-powered search tools. We also examine the challenges facing government libraries, such as funding constraints, digital literacy gaps, and infrastructure limitations. The future is promising, with several governments committing to increased investment in public knowledge infrastructure.",
    date: "10 Feb 2026",
    author: "Dr. Amina Osei",
  },
  {
    id: "1",
    title: "Open Data and Public Access",
    desc: "How government librarians can champion open data initiatives and improve citizen access to information.",
    fullContent: "Open data initiatives are transforming the relationship between governments and citizens. Government librarians are uniquely positioned to champion these initiatives, serving as bridges between complex government datasets and the public. This article outlines practical steps librarians can take to promote open data, including establishing data literacy programs, creating user-friendly data portals, and partnering with civil society organizations. We highlight successful case studies from Kenya, Rwanda, and Ghana where government librarians have played pivotal roles in making public data more accessible and actionable.",
    date: "28 Jan 2026",
    author: "Prof. James Kariuki",
  },
  {
    id: "2",
    title: "Preserving National Heritage",
    desc: "Best practices for digitizing and preserving rare government publications and historical documents.",
    fullContent: "The preservation of national heritage through digitization is one of the most important mandates of government libraries. This article presents best practices for digitizing rare government publications, historical documents, and archival materials. We cover the technical aspects of digitization, including scanning standards, metadata schemas, and long-term digital preservation strategies. The article also addresses the legal and ethical considerations surrounding the digitization of government records, including copyright, access restrictions, and cultural sensitivity. Practical recommendations are provided for libraries at various stages of their digitization journey.",
    date: "15 Jan 2026",
    author: "Mary Wanjiku",
  },
];

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const blog = blogs.find((b) => b.id === id);

  if (!blog) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl py-8 text-center">
          <p className="text-muted-foreground">Blog not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-foreground">{blog.title}</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" />{blog.date}</span>
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{blog.author}</span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">{blog.fullContent}</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BlogDetail;

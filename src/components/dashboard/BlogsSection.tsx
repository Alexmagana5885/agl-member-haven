import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BookOpen, ArrowRight, CalendarDays, User } from "lucide-react";

const blogs = [
  {
    title: "The Future of Government Libraries in Africa",
    desc: "Exploring how digital transformation is reshaping public knowledge infrastructure across the continent.",
    fullContent: "Digital transformation is fundamentally changing how government libraries operate across Africa. From Kenya to South Africa, librarians are adopting new technologies to improve citizen access to information. This article explores the key trends driving this transformation, including cloud-based cataloguing systems, digital lending platforms, and AI-powered search tools. We also examine the challenges facing government libraries, such as funding constraints, digital literacy gaps, and infrastructure limitations. The future is promising, with several governments committing to increased investment in public knowledge infrastructure.",
    date: "10 Feb 2026",
    author: "Dr. Amina Osei",
  },
  {
    title: "Open Data and Public Access",
    desc: "How government librarians can champion open data initiatives and improve citizen access to information.",
    fullContent: "Open data initiatives are transforming the relationship between governments and citizens. Government librarians are uniquely positioned to champion these initiatives, serving as bridges between complex government datasets and the public. This article outlines practical steps librarians can take to promote open data, including establishing data literacy programs, creating user-friendly data portals, and partnering with civil society organizations. We highlight successful case studies from Kenya, Rwanda, and Ghana where government librarians have played pivotal roles in making public data more accessible and actionable.",
    date: "28 Jan 2026",
    author: "Prof. James Kariuki",
  },
  {
    title: "Preserving National Heritage",
    desc: "Best practices for digitizing and preserving rare government publications and historical documents.",
    fullContent: "The preservation of national heritage through digitization is one of the most important mandates of government libraries. This article presents best practices for digitizing rare government publications, historical documents, and archival materials. We cover the technical aspects of digitization, including scanning standards, metadata schemas, and long-term digital preservation strategies. The article also addresses the legal and ethical considerations surrounding the digitization of government records, including copyright, access restrictions, and cultural sensitivity. Practical recommendations are provided for libraries at various stages of their digitization journey.",
    date: "15 Jan 2026",
    author: "Mary Wanjiku",
  },
];

export function BlogsSection() {
  const [selectedBlog, setSelectedBlog] = useState<typeof blogs[0] | null>(null);

  return (
    <>
      <Card className="shadow-card hover:shadow-card-hover transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <BookOpen className="h-5 w-5 text-accent-foreground" />
            Latest Blogs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {blogs.map((blog, i) => (
              <div key={i} className="group rounded-lg border border-border p-4 hover:border-primary/30 hover:shadow-card transition-all">
                <p className="text-xs text-muted-foreground mb-2">{blog.date}</p>
                <h4 className="font-display text-sm font-semibold text-foreground mb-1 line-clamp-2">{blog.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{blog.desc}</p>
                <Button variant="link" size="sm" className="p-0 h-auto text-accent-foreground text-xs" onClick={() => setSelectedBlog(blog)}>
                  Read More <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedBlog} onOpenChange={(open) => { if (!open) setSelectedBlog(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg leading-snug">{selectedBlog?.title}</DialogTitle>
            <DialogDescription asChild>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{selectedBlog?.date}</span>
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{selectedBlog?.author}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground leading-relaxed">{selectedBlog?.fullContent}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

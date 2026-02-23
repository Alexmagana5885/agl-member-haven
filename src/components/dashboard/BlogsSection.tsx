import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

const blogs = [
  { id: "0", title: "The Future of Government Libraries in Africa", desc: "Exploring how digital transformation is reshaping public knowledge infrastructure across the continent.", date: "10 Feb 2026" },
  { id: "1", title: "Open Data and Public Access", desc: "How government librarians can champion open data initiatives and improve citizen access to information.", date: "28 Jan 2026" },
  { id: "2", title: "Preserving National Heritage", desc: "Best practices for digitizing and preserving rare government publications and historical documents.", date: "15 Jan 2026" },
];

export function BlogsSection() {
  const navigate = useNavigate();

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <BookOpen className="h-5 w-5 text-accent-foreground" />
          Latest Blogs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {blogs.map((blog) => (
            <div key={blog.id} className="group rounded-lg border border-border p-4 hover:border-primary/30 hover:shadow-card transition-all">
              <p className="text-xs text-muted-foreground mb-2">{blog.date}</p>
              <h4 className="font-display text-sm font-semibold text-foreground mb-1 line-clamp-2">{blog.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{blog.desc}</p>
              <Button variant="link" size="sm" className="p-0 h-auto text-accent-foreground text-xs" onClick={() => navigate(`/blogs/${blog.id}`)}>
                Read More <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

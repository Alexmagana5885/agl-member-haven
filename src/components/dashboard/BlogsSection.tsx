import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import { getBlogs } from "@/services/events";

export function BlogsSection() {
  const [blogsData, setBlogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        const data = await getBlogs();
        setBlogsData(data);
      } catch (err) {
        setError("Failed to load blogs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBlogs();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <BookOpen className="h-5 w-5 text-accent-foreground" />
            Latest Blogs
          </CardTitle>
        </CardHeader>
        <CardContent className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <BookOpen className="h-5 w-5 text-accent-foreground" />
            Latest Blogs
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  const blogs = blogsData.slice(0, 3).map((blog) => ({
    id: blog.id.toString(),
    title: blog.title,
    desc: blog.content.substring(0, 100) + "...",
    date: new Date(blog.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    image_path: blog.image_path
  }));

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
          {blogs.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No blogs available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

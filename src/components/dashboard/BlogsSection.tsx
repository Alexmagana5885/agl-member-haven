import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { BookOpen, ArrowRight } from "lucide-react";
import { getBlogs } from "@/services/events";
import { stripHtml } from "@/lib/utils";
import { buildAssetUrl, getSessionInfo, updateBlog, deleteBlog, type BlogPayload } from "@/services/api";


export function BlogsSection() {
  const [blogsData, setBlogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOfficial, setIsOfficial] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<BlogPayload>({ title: "", content: "" });
  const [editSubmitting, setEditSubmitting] = useState(false);
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

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSessionInfo();
        setIsOfficial(!!session?.user?.is_official);
      } catch {
        setIsOfficial(false);
      }
    };
    fetchSession();
  }, []);

  const handleOpenEdit = (blog: any) => {
    setEditingBlog(blog);
    setEditForm({
      title: blog.title,
      content: blog.content,
    });
  };

  const handleCloseEdit = () => {
    setEditingBlog(null);
    setEditForm({ title: "", content: "" });
  };

  const handleUpdateBlog = async () => {
    if (!editingBlog) return;
    setEditSubmitting(true);
    try {
      await updateBlog(String(editingBlog.id), {
        title: editForm.title,
        content: editForm.content,
        imagePath: editingBlog.image_path || "../assets/img/Blogs/default.jpg",
      });
      setBlogsData((prevBlogs: any[]) =>
        prevBlogs.map((blog) =>
          blog.id === editingBlog.id ? { ...blog, title: editForm.title, content: editForm.content } : blog,
        ),
      );
      handleCloseEdit();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update blog");
    } finally {
      setEditSubmitting(false);
    }
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [pendingDeleteBlogId, setPendingDeleteBlogId] = useState<number | null>(null);

  const handleRequestDeleteBlog = (blogId: number) => {
    setPendingDeleteBlogId(blogId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteBlog = async () => {
    if (!pendingDeleteBlogId) return;
    setDeleteSubmitting(true);
    try {
      await deleteBlog(String(pendingDeleteBlogId));
      setBlogsData((prevBlogs: any[]) => prevBlogs.filter((blog) => blog.id !== pendingDeleteBlogId));
      setDeleteConfirmOpen(false);
      setPendingDeleteBlogId(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete blog");
    } finally {
      setDeleteSubmitting(false);
    }
  };


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
    content: blog.content,
    desc: stripHtml(blog.content, 120),
    date: new Date(blog.created_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    image_path: blog.image_path,
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
            <div
              key={blog.id}
              className="group rounded-lg border border-border p-4 hover:border-primary/30 hover:shadow-card transition-all"
            >
              {isOfficial && (
                <div className="flex justify-end gap-2 mb-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(blog)}
                  >
                    Edit
                  </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRequestDeleteBlog(blog.id)}
                    >
                      Delete
                    </Button>

                </div>
              )}
              {blog.image_path ? (
                <img
                  src={buildAssetUrl(blog.image_path)}
                  alt={blog.title}
                  className="w-full h-28 object-cover rounded-md mb-2"
                />
              ) : null}
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
      <Dialog open={deleteConfirmOpen} onOpenChange={(open) => { if (!open) { setDeleteConfirmOpen(false); setPendingDeleteBlogId(null); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete blog post?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDeleteConfirmOpen(false); setPendingDeleteBlogId(null); }}
              disabled={deleteSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDeleteBlog}
              disabled={deleteSubmitting}
            >
              {deleteSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingBlog} onOpenChange={(open) => { if (!open) handleCloseEdit(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">

          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <BookOpen className="h-5 w-5 text-primary" /> Edit Blog Post
            </DialogTitle>
            <DialogDescription>
              Change the blog title or content before saving.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 overflow-y-auto flex-1 pr-2">
            <div className="space-y-1.5">
              <Label>Blog Title *</Label>
              <Input
                placeholder="Enter blog title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Blog Content *</Label>
              <RichTextEditor
                value={editForm.content}
                onChange={(val) => setEditForm({ ...editForm, content: val })}
                placeholder="Write the full blog content..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEdit} disabled={editSubmitting}>
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={editSubmitting}
              onClick={handleUpdateBlog}
            >
              {editSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

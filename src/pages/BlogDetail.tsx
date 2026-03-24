import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { getSingleBlog, type Blog } from '@/services/api';
import { stripHtml } from '@/lib/utils';
import '@/index.css'; // Ensure Quill styles available

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const loadBlog = async () => {
      try {
        setLoading(true);
        const blogData = await getSingleBlog(id);
        setBlog(blogData);
      } catch (err) {
        setError('Blog not found or failed to load.');
        console.error('Failed to load blog:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl py-12">
          <Skeleton className="h-10 w-40 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !blog) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl py-12 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Blog Not Found</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl py-8 space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="border-none shadow-card">
          <CardHeader className="pb-4">
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold leading-tight">{blog.title}</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(blog.created_at).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardHeader>
          <CardContent className="prose prose-headings:font-display prose-headings:font-bold max-w-none prose-p:leading-relaxed prose-li:marker:text-primary">
            {blog.image_path && blog.image_path !== '../assets/img/Blogs/default.jpg' && (
              <div className="mb-8">
                <img
                  src={blog.image_path}
                  alt={blog.title}
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}
            <div
              className="ql-editor prose prose-sm max-w-none max-h-[500px] overflow-auto p-4 border rounded-lg scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>Preview: {stripHtml(blog.content, 100)}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}


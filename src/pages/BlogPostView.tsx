import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import { useTheme } from "@/contexts/ThemeContext";
import domedark from "../../domedark.png";
import domelight from "../../domelight.png";
import { getPostBySlug, getDailyLogs, BlogPost, DailyLog } from "@/lib/blog";
import { DailyLogFeed } from "@/components/blog/DailyLogFeed";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ArrowLeft, Calendar, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const BlogPostView = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!slug) return;

            const foundPost = await getPostBySlug(slug);
            const logs = await getDailyLogs();

            if (foundPost) {
                setPost(foundPost);
                setDailyLogs(logs);
            } else {
                console.error("Post not found");
            }
            setLoading(false);
        };
        loadData();
    }, [slug]);

    if (loading) return null;

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl">Post not found</h1>
                <button onClick={() => navigate('/blogs')} className="text-blue-500 underline ml-2">Go back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-x-hidden">
            {/* Background - Preserved */}
            <div
                className="fixed inset-0 z-0 transition-opacity duration-500 ease-in-out"
                style={{
                    backgroundImage: `url(${isDarkMode ? domedark : domelight})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    willChange: 'opacity',
                }}
            />

            <MiniNavbar />

            <div className="relative z-10 pt-24 pb-16 px-4 flex justify-center">
                <article className={cn(
                    "w-full max-w-3xl rounded-2xl shadow-2xl p-8 md:p-12 backdrop-blur-xl border border-white/10",
                    isDarkMode ? "bg-black/60 text-gray-100" : "bg-white/80 text-gray-900"
                )}>
                    {/* Top Bar Navigation */}
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => navigate('/blogs')}
                            className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity text-sm font-medium"
                        >
                            <ArrowLeft size={16} /> Back to Blog
                        </button>

                        {/* Research Stream Drawer */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <button
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors",
                                        isDarkMode
                                            ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                    )}
                                >
                                    <BookOpen size={14} />
                                    Research Stream
                                </button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className={cn(
                                    "w-full sm:w-[540px] overflow-y-auto border-l",
                                    isDarkMode ? "bg-black/95 border-gray-800" : "bg-white/95 border-gray-200"
                                )}
                            >
                                <SheetHeader className="mb-8 mt-4">
                                    <SheetTitle className={cn("text-2xl font-bold", isDarkMode ? "text-white" : "text-gray-900")}>Research Stream</SheetTitle>
                                    <p className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                                        Engineering context and raw daily logs.
                                    </p>
                                </SheetHeader>
                                <DailyLogFeed logs={dailyLogs} />
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Header */}
                    <header className="mb-10 text-center">
                        <div className="flex items-center justify-center gap-4 text-xs font-mono uppercase tracking-widest opacity-60 mb-4">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                            {post.readingTime && <span className="flex items-center gap-1"><Clock size={12} /> {post.readingTime}</span>}
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{post.title}</h1>
                        {post.subtitle && <p className="text-xl opacity-80 font-light">{post.subtitle}</p>}

                        {post.tags && (
                            <div className="flex gap-2 justify-center mt-6">
                                {post.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-bold uppercase">{tag}</span>
                                ))}
                            </div>
                        )}
                    </header>

                    {/* Image */}
                    {post.image && (
                        <div className="mb-12 rounded-xl overflow-hidden shadow-lg">
                            <img src={post.image} alt={post.title} className="w-full object-cover" />
                        </div>
                    )}

                    {/* Content */}
                    <div className={cn(
                        "prose prose-lg max-w-none",
                        isDarkMode ? "prose-invert" : "prose-gray"
                    )}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>

                </article>
            </div>
        </div>
    );
};

export default BlogPostView;

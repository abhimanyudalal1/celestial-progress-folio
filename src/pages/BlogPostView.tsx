import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { getPostBySlug, getDailyLogsForBlog, BlogPost, DailyLog } from "@/lib/blog";
import { DailyLogFeed } from "@/components/blog/DailyLogFeed";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ArrowLeft, BookOpen, Clock, Calendar } from "lucide-react";
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
            // Fetch logs specific to this blog post
            const logs = await getDailyLogsForBlog(slug);

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
        <div className={cn(
            "min-h-screen w-full transition-colors duration-300",
            isDarkMode ? "bg-[#121212] text-white" : "bg-white text-gray-900"
        )}>
            {/* Scroll Progress Indicator */}
            <ScrollProgress />
            
            {/* Top Navigation Bar */}
            <div className={cn(
                "sticky top-0 z-50 w-full px-6 py-4 flex justify-between items-center backdrop-blur-md border-b transition-colors",
                isDarkMode ? "bg-[#121212]/80 border-gray-800" : "bg-white/80 border-gray-100"
            )}>
                <button
                    onClick={() => navigate('/blogs')}
                    className="flex items-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity"
                >
                    <ArrowLeft size={18} /> <span className="hidden sm:inline">All Posts</span>
                </button>

                {/* Mobile Timeline Trigger */}
                <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border",
                                isDarkMode ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"
                            )}>
                                <BookOpen size={14} /> Timeline
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className={cn("w-[85vw] overflow-y-auto", isDarkMode ? "bg-black text-white" : "bg-white text-gray-900")}>
                            <SheetHeader className="mb-6 mt-2 text-left">
                                <p className={cn(
                                    "font-mono text-[10px] uppercase tracking-[0.25em] mb-1",
                                    isDarkMode ? "text-gray-500" : "text-gray-400"
                                )}>
                                    Source notes
                                </p>
                                <SheetTitle className={cn("font-serif text-2xl", isDarkMode ? "text-white" : "text-gray-900")}>
                                    Research Log
                                </SheetTitle>
                            </SheetHeader>
                            <DailyLogFeed logs={dailyLogs} />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr_240px] gap-8 px-6 py-12 md:py-20">

                {/* Left Sidebar (Desktop Timeline Trigger) */}
                <aside className="hidden lg:block relative">
                    <div className="sticky top-32">
                        <Sheet>
                            {/* Timeline Heading */}
                            <h3 className={cn(
                                "font-mono text-xs font-medium uppercase tracking-[0.25em] mb-5",
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                            )}>
                                Research Log
                            </h3>
                            
                            {dailyLogs.length > 0 ? (
                                <ol className="relative list-none m-0 p-0">
                                    {/* Rail: starts exactly at the first dot's center, fades out past the last */}
                                    <div
                                        aria-hidden="true"
                                        className={cn(
                                            "absolute left-[3.5px] top-[9px] bottom-0 w-px pointer-events-none",
                                            "bg-gradient-to-b",
                                            isDarkMode
                                                ? "from-gray-700 via-gray-800 to-transparent"
                                                : "from-gray-300 via-gray-200 to-transparent"
                                        )}
                                    />

                                    {dailyLogs.slice(0, 5).map((log, index) => (
                                        <li key={log.slug}>
                                            <SheetTrigger asChild>
                                                <button className={cn(
                                                    "group relative w-full text-left pl-6 pb-6 rounded-md",
                                                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                                                    isDarkMode ? "focus-visible:outline-white" : "focus-visible:outline-gray-900"
                                                )}>
                                                    {/* Dot — center sits precisely on the rail */}
                                                    <span
                                                        aria-hidden="true"
                                                        className={cn(
                                                            "absolute left-0 top-[5px] w-2 h-2 rounded-full ring-4 transition-all duration-300 group-hover:scale-125",
                                                            index === 0
                                                                ? "bg-blue-500"
                                                                : isDarkMode
                                                                    ? "bg-gray-600 group-hover:bg-gray-300"
                                                                    : "bg-gray-300 group-hover:bg-gray-600",
                                                            isDarkMode ? "ring-[#121212]" : "ring-white"
                                                        )}
                                                    />

                                                    <span className="block transition-transform duration-300 group-hover:translate-x-1">
                                                        <time
                                                            dateTime={log.date}
                                                            className={cn(
                                                                "block font-mono text-[10px] font-medium uppercase tracking-[0.18em] mb-1",
                                                                index === 0
                                                                    ? "text-blue-500"
                                                                    : isDarkMode ? "text-gray-500" : "text-gray-400"
                                                            )}
                                                        >
                                                            {log.date}
                                                        </time>
                                                        <span className={cn(
                                                            "block font-serif text-[15px] font-semibold leading-snug",
                                                            isDarkMode
                                                                ? "text-gray-300 group-hover:text-white"
                                                                : "text-gray-700 group-hover:text-black"
                                                        )}>
                                                            {log.title}
                                                        </span>
                                                    </span>
                                                </button>
                                            </SheetTrigger>
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <p className={cn(
                                    "font-serif italic text-sm",
                                    isDarkMode ? "text-gray-600" : "text-gray-400"
                                )}>
                                    No logs yet.
                                </p>
                            )}

                            {/* Open the full research log */}
                            {dailyLogs.length > 0 && (
                                <SheetTrigger asChild>
                                    <button className={cn(
                                        "group mt-2 inline-flex items-center gap-2 rounded-full border px-4 py-2",
                                        "font-mono text-[10px] font-medium uppercase tracking-[0.2em] transition-colors",
                                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                                        isDarkMode
                                            ? "border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white focus-visible:outline-white"
                                            : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 focus-visible:outline-gray-900"
                                    )}>
                                        <BookOpen size={13} aria-hidden="true" />
                                        <span>Full stream</span>
                                        <span className={cn(
                                            "rounded-full px-1.5 py-0.5 text-[9px] leading-none",
                                            isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                                        )}>
                                            {dailyLogs.length}
                                        </span>
                                    </button>
                                </SheetTrigger>
                            )}

                            <SheetContent
                                side="left"
                                className={cn(
                                    "w-[540px] overflow-y-auto border-r",
                                    isDarkMode ? "bg-black/95 border-gray-800 text-white" : "bg-white/95 border-gray-200 text-gray-900"
                                )}
                            >
                                <SheetHeader className="mb-8 mt-4 text-left">
                                    <p className={cn(
                                        "font-mono text-[10px] uppercase tracking-[0.25em] mb-1",
                                        isDarkMode ? "text-gray-500" : "text-gray-400"
                                    )}>
                                        Source notes
                                    </p>
                                    <SheetTitle className={cn("font-serif text-3xl", isDarkMode ? "text-white" : "text-gray-900")}>
                                        Research Log
                                    </SheetTitle>
                                    <p className={cn("text-sm font-serif italic", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                                        The raw, chronological notes this post was distilled from.
                                    </p>
                                </SheetHeader>
                                <DailyLogFeed logs={dailyLogs} />
                            </SheetContent>
                        </Sheet>
                    </div>
                </aside>

                {/* Article Content - Centered */}
                <main className="max-w-3xl w-full mx-auto">

                    {/* Article Header */}
                    <header className="mb-12">
                        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight font-serif">
                            {post.title}
                        </h1>

                        {post.subtitle && (
                            <p className={cn(
                                "text-xl md:text-2xl font-serif italic mb-8 leading-relaxed",
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                            )}>
                                {post.subtitle}
                            </p>
                        )}

                        {/* Author/Meta Row */}
                        <div className="flex items-center gap-4 border-t border-b py-6 border-dashed border-gray-200 dark:border-gray-800">
                            <div className="flex flex-col text-xs font-mono uppercase tracking-widest opacity-70">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar size={12} /> {post.date}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={12} /> {post.readingTime}
                                </div>
                            </div>
                            <div className="ml-auto flex gap-2">
                                {post.tags?.map(tag => (
                                    <span key={tag} className={cn(
                                        "px-2 py-1 rounded text-xs font-bold uppercase tracking-wider",
                                        isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"
                                    )}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </header>

                    {/* Hero Image */}
                    {post.image && (
                        <div className="mb-16">
                            <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-auto object-cover rounded-lg shadow-sm"
                            />
                            <div className="text-center text-sm mt-3 opacity-50 italic">
                                Figure 1: {post.title}
                            </div>
                        </div>
                    )}

                    {/* Markdown Content */}
                    <article className={cn(
                        "prose prose-lg md:prose-xl max-w-none font-serif",
                        isDarkMode ? "prose-invert" : "prose-gray",
                        "prose-headings:font-black prose-headings:tracking-tight prose-h1:text-4xl",
                        "prose-code:font-mono prose-pre:font-mono prose-a:underline-offset-4"
                    )}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </article>

                    {/* Footer Divider */}
                    <div className="flex justify-center my-20 text-3xl opacity-20 tracking-[1em]">
                        •••
                    </div>

                </main>

                {/* Right Sidebar (Empty for balance or future TOC) */}
                <aside className="hidden lg:block"></aside>

            </div>
        </div>
    );
};

export default BlogPostView;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { getPostBySlug, getDailyLogs, BlogPost, DailyLog } from "@/lib/blog";
import { DailyLogFeed } from "@/components/blog/DailyLogFeed";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
        <div className={cn(
            "min-h-screen w-full transition-colors duration-300",
            isDarkMode ? "bg-[#121212] text-white" : "bg-white text-gray-900"
        )}>
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
                        <SheetContent side="left" className={cn("w-[85vw]", isDarkMode ? "bg-black text-white" : "bg-white")}>
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
                            <div className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-800 space-y-8 py-2">
                                <div className="absolute top-0 left-[-2px] w-full h-full pointer-events-none">
                                    {/* Line is effectively the border-l on the parent */}
                                </div>

                                {dailyLogs.length > 0 ? (
                                    dailyLogs.slice(0, 5).map((log, index) => (
                                        <SheetTrigger asChild key={log.slug}>
                                            <button className="group relative flex items-start text-left w-full pl-6 transition-all">
                                                {/* Dot */}
                                                <div className={cn(
                                                    "absolute left-[-17px] top-1.5 w-4 h-4 rounded-full border-4 transition-all z-10",
                                                    isDarkMode
                                                        ? "bg-black border-gray-600 group-hover:border-white group-hover:bg-gray-800"
                                                        : "bg-white border-gray-300 group-hover:border-black group-hover:bg-gray-100"
                                                )} />

                                                {/* Text */}
                                                <div className="group-hover:translate-x-1 transition-transform">
                                                    <h4 className={cn(
                                                        "font-bold text-sm leading-tight mb-1 font-serif",
                                                        isDarkMode ? "text-gray-200 group-hover:text-white" : "text-gray-800 group-hover:text-black"
                                                    )} style={{ fontFamily: "'Crimson Pro', serif" }}>
                                                        {log.title}
                                                    </h4>
                                                    <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest block">
                                                        {log.date}
                                                    </span>
                                                </div>
                                            </button>
                                        </SheetTrigger>
                                    ))
                                ) : (
                                    <div className="text-xs opacity-50 pl-6 italic">Loading stream...</div>
                                )}

                                {/* View All Link / Context Button */}
                                <SheetTrigger asChild>
                                    <button className={cn(
                                        "group flex items-center gap-2 mt-8 text-xs font-bold uppercase tracking-wider pl-6 transition-colors",
                                        isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                                    )}>
                                        <BookOpen size={14} />
                                        <span>Full Stream</span>
                                    </button>
                                </SheetTrigger>

                            </div>

                            <SheetContent
                                side="left"
                                className={cn(
                                    "w-[540px] overflow-y-auto border-r",
                                    isDarkMode ? "bg-black/95 border-gray-800" : "bg-white/95 border-gray-200"
                                )}
                            >
                                <SheetHeader className="mb-8 mt-4">
                                    <SheetTitle className={cn("text-2xl font-bold", isDarkMode ? "text-white" : "text-gray-900")}>
                                        Project Timeline
                                    </SheetTitle>
                                    <p className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                                        Chronological research notes and updates.
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
                        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight font-serif"
                            style={{ fontFamily: "'Crimson Pro', serif" }}>
                            {post.title}
                        </h1>

                        {post.subtitle && (
                            <p className={cn(
                                "text-xl md:text-2xl font-serif italic mb-8 leading-relaxed",
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                            )} style={{ fontFamily: "'Crimson Pro', serif" }}>
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
                        "prose-headings:font-black prose-headings:tracking-tight prose-h1:text-4xl"
                    )} style={{ fontFamily: "'Crimson Pro', serif" }}>
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

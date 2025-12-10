import { useState, useEffect } from "react";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import { useTheme } from "@/contexts/ThemeContext";
import domedark from "../../domedark.png";
import domelight from "../../domelight.png";
import { BlogCard } from "@/components/blog/BlogCard";
import { getBlogPosts, BlogPost } from "@/lib/blog";
import { cn } from "@/lib/utils";

const Blogs = () => {
  const { isDarkMode } = useTheme();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    // Load data
    const loadData = async () => {
      const posts = await getBlogPosts();
      setBlogPosts(posts);
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Image - Full Screen - PRESERVED */}
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

      {/* Navigation */}
      <MiniNavbar />

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-16 px-4 min-h-screen flex flex-col items-center">

        {/* Paper Container */}
        <div className={cn(
          "w-full max-w-5xl mx-auto rounded-none md:rounded-lg shadow-2xl overflow-hidden min-h-[80vh]",
          isDarkMode ? "bg-[#1a1a1a] text-gray-100" : "bg-[#fdfdfd] text-gray-900"
        )}>
          {/* Header Section */}
          <div className="text-center pt-16 pb-12 px-8 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight font-serif"
              style={{ fontFamily: "'Crimson Pro', serif" }}>
              Engineering & Research
            </h1>
            <p className={cn(
              "text-xl italic font-serif opacity-80 max-w-2xl mx-auto",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )} style={{ fontFamily: "'Crimson Pro', serif" }}>
              Explorations in AI, Systems, and Design.
            </p>
          </div>

          {/* Blog Post Grid */}
          <div className="p-8 md:p-12 bg-opacity-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
              {blogPosts.length === 0 && (
                <div className="col-span-full text-center py-20 opacity-60 italic font-serif">
                  No formal articles yet. Check back soon!
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Blogs;

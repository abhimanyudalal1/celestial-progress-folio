import { useState, useEffect } from "react";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import { useTheme } from "@/contexts/ThemeContext";
import domedark from "../../domedark.png";
import domelight from "../../domelight.png";
import { BlogCard } from "@/components/blog/BlogCard";
import { getBlogPosts, BlogPost } from "@/lib/blog";

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

        {/* Header Section */}
        <div className="text-center mb-10 w-full max-w-4xl mx-auto backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl relative"
          style={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)' }}>

          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight"
            style={{ color: isDarkMode ? '#fff' : '#000' }}>
            Engineering Blog
          </h1>
          <p className="text-lg opacity-80"
            style={{ color: isDarkMode ? '#ccc' : '#444' }}>
            Polished thoughts, architecture deep-dives, and tutorials.
          </p>
        </div>

        {/* Blog Post Grid */}
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
            {blogPosts.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10">
                <p className="opacity-60">No formal articles yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Blogs;

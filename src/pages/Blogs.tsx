import { MiniNavbar } from "@/components/ui/mini-navbar";
import { useTheme } from "@/contexts/ThemeContext";
import domedark from "../../domedark.png"
import domelight from "../../domelight.png"

// Sample blog data
const blogPosts = [
  {
    id: "1",
    title: "Transformer Circuits",
    description: "The attention head terms describe the effects of attention heads in linking input tokens to logits. A^h describes which...",
    image: "/Screenshot 2025-11-11 at 4.43.39 PM.svg",
    tag: "ML Research",
  },
  {
    id: "2",
    title: "Multimodal Neurons",
    subtitle: "On Distill",
    description: "Exploring the fascinating world of neurons that respond to multiple modalities in deep neural networks.",
    image: "/planet1.svg",
    tag: "Deep Learning",
  },
  {
    id: "3",
    title: "Neural Networks (General)",
    description: "A comprehensive overview of neural network architectures, training methods, and applications in modern AI.",
    image: "/placeholder.svg",
    tag: "Tutorial",
  },
];

const Blogs = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Image - Full Screen */}
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

      {/* Content Container - Solid Panel */}
      <div className="relative z-10 pt-24 pb-16 flex justify-center px-4">
        <div
          className="w-full max-w-5xl rounded-2xl shadow-2xl"
          style={{
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
            transition: 'background-color 0.5s ease',
            padding: '3rem 2rem'
          }}
        >
          {/* Header */}
          <header className="mb-12 text-center">
            <h1
              className="text-5xl md:text-6xl font-bold mb-4"
              style={{
                color: isDarkMode ? '#ffffff' : '#000000',
                transition: 'color 0.5s ease'
              }}
            >
              abhimanyu's blog
            </h1>
            <p
              className="text-xl"
              style={{
                color: isDarkMode ? '#e5e7eb' : '#374151',
                transition: 'color 0.5s ease'
              }}
            >
              Recent Exciting Things!
            </p>
          </header>

          {/* Blog Posts Grid */}
          <main>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogPosts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-lg overflow-hidden border-2 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                  style={{
                    backgroundColor: isDarkMode ? '#f9fafb' : '#1f2937',
                    borderColor: isDarkMode ? '#d1d5db' : '#4b5563',
                    transition: 'background-color 0.5s ease, border-color 0.5s ease'
                  }}
                >
                  {/* Blog Card Content */}
                  <div className="p-6">
                    {/* Image Placeholder */}
                    {post.image && (
                      <div className="mb-4 rounded-lg overflow-hidden bg-gray-200 aspect-video flex items-center justify-center">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Title */}
                    <h2
                      className="text-2xl font-bold mb-2 group-hover:underline"
                      style={{
                        color: isDarkMode ? '#111827' : '#f9fafb',
                        transition: 'color 0.5s ease'
                      }}
                    >
                      {post.title}
                    </h2>

                    {/* Subtitle if exists */}
                    {post.subtitle && (
                      <p
                        className="text-sm italic mb-3"
                        style={{
                          color: isDarkMode ? '#6b7280' : '#9ca3af',
                          transition: 'color 0.5s ease'
                        }}
                      >
                        {post.subtitle}
                      </p>
                    )}

                    {/* Description */}
                    <p
                      className="mb-4 leading-relaxed"
                      style={{
                        color: isDarkMode ? '#374151' : '#d1d5db',
                        transition: 'color 0.5s ease'
                      }}
                    >
                      {post.description}
                    </p>

                    {/* Tag */}
                    {post.tag && (
                      <span
                        className="inline-block px-3 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
                          color: isDarkMode ? '#ffffff' : '#111827',
                          transition: 'background-color 0.5s ease, color 0.5s ease'
                        }}
                      >
                        {post.tag}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Third Row - Full Width */}
            <div className="mt-6">
              <article
                className="rounded-lg overflow-hidden border-2 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 cursor-pointer group"
                style={{
                  backgroundColor: isDarkMode ? '#f9fafb' : '#1f2937',
                  borderColor: isDarkMode ? '#d1d5db' : '#4b5563',
                  transition: 'background-color 0.5s ease, border-color 0.5s ease'
                }}
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left side - Image */}
                    <div className="md:w-1/3">
                      <div className="rounded-lg overflow-hidden bg-gray-200 aspect-video flex items-center justify-center">
                        <img
                          src="/placeholder.svg"
                          alt="Neural Networks"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Right side - Content */}
                    <div className="md:w-2/3">
                      <h2
                        className="text-3xl font-bold mb-3 group-hover:underline"
                        style={{
                          color: isDarkMode ? '#111827' : '#f9fafb',
                          transition: 'color 0.5s ease'
                        }}
                      >
                        Neural Networks (General)
                      </h2>
                      <p
                        className="mb-4 leading-relaxed"
                        style={{
                          color: isDarkMode ? '#374151' : '#d1d5db',
                          transition: 'color 0.5s ease'
                        }}
                      >
                        A comprehensive overview of neural network architectures, training methods, and applications in modern AI.
                        Exploring the fundamentals of deep learning and how neural networks have revolutionized machine learning.
                      </p>
                      <span
                        className="inline-block px-3 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
                          color: isDarkMode ? '#ffffff' : '#111827',
                          transition: 'background-color 0.5s ease, color 0.5s ease'
                        }}
                      >
                        Tutorial
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </main>

          {/* Footer Note */}
          <footer className="mt-12 text-center">
            <p
              className="text-sm"
              style={{
                color: isDarkMode ? '#6b7280' : '#9ca3af',
                transition: 'color 0.5s ease'
              }}
            >
              More content coming soon...
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Blogs;

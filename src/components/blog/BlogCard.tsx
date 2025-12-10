import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogPost } from '@/lib/blog';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface BlogCardProps {
    post: BlogPost;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    return (
        <div
            onClick={() => navigate(`/blog/${post.slug}`)}
            className={cn(
                "group cursor-pointer flex flex-col items-center text-center h-full overflow-hidden transition-all duration-300",
                "border-2 rounded-lg p-4",
                isDarkMode
                    ? "bg-gray-900 border-gray-700 hover:border-white text-gray-100"
                    : "bg-white border-black hover:scale-[1.02] text-black"
            )}
        >
            {/* Image Section - Top */}
            {post.image && (
                <div className="w-full aspect-[4/3] mb-4 overflow-hidden rounded border border-gray-200 dark:border-gray-800">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
            )}

            {/* Content Section */}
            <div className="flex flex-col flex-grow w-full items-center">
                {/* Title */}
                <h3 className={cn(
                    "text-2xl font-bold mb-2 font-serif leading-tight",
                    isDarkMode ? "text-gray-100" : "text-black"
                )} style={{ fontFamily: "'Crimson Pro', serif" }}>
                    {post.title}
                </h3>

                {/* Subtitle / Description */}
                <p className={cn(
                    "text-sm italic mb-4 line-clamp-3",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                )} style={{ fontFamily: "'Crimson Pro', serif" }}>
                    {post.description}
                </p>

                {/* Footer Metadata */}
                <div className="mt-auto pt-4 border-t border-dashed border-gray-300 dark:border-gray-700 w-full flex justify-between text-xs font-mono uppercase tracking-widest opacity-60">
                    <span>{post.date}</span>
                    <span>{post.readingTime}</span>
                </div>
            </div>
        </div>
    );
};

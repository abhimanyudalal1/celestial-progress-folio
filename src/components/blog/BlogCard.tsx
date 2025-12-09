import React from 'react';
import { BlogPost } from '@/lib/blog';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogCardProps {
    post: BlogPost;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
    const { isDarkMode } = useTheme();

    return (
        <Link to={`/blog/${post.slug}`} className="block group">
            <article
                className={cn(
                    "h-full flex flex-col rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
                    isDarkMode
                        ? "bg-gray-900/50 border-gray-800 hover:border-blue-500/50"
                        : "bg-white/80 border-gray-200 hover:border-blue-400"
                )}
            >
                {/* Image - if exists */}
                {post.image && (
                    <div className="aspect-video w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                )}

                <div className="flex-1 p-6 flex flex-col">
                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs font-medium mb-3 opacity-60">
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {post.date}
                        </span>
                        {post.readingTime && (
                            <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {post.readingTime}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h2 className={cn(
                        "text-xl font-bold mb-2 group-hover:underline decoration-blue-500 underline-offset-4",
                        isDarkMode ? "text-gray-100" : "text-gray-900"
                    )}>
                        {post.title}
                    </h2>

                    {/* Description */}
                    <p className={cn(
                        "text-sm mb-4 line-clamp-3 leading-relaxed opacity-80 flex-1",
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                        {post.description}
                    </p>

                    {/* Tags */}
                    <div className="mt-auto pt-4 flex items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                            {post.tags?.slice(0, 3).map(tag => (
                                <span
                                    key={tag}
                                    className={cn(
                                        "px-2 py-1 text-[10px] uppercase tracking-wider rounded-md",
                                        isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
                                    )}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-500" />
                    </div>
                </div>
            </article>
        </Link>
    );
};

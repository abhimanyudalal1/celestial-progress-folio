import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { DailyLog } from '@/lib/blog';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface TimelineEntryProps {
    log: DailyLog;
    isExpanded?: boolean;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({ log, isExpanded = false }) => {
    const [isOpen, setIsOpen] = useState(isExpanded);
    const { isDarkMode } = useTheme();

    return (
        <div className="relative pl-8 pb-8 border-l border-dashed border-gray-300 dark:border-gray-700 last:border-0 last:pb-0">
            {/* Timeline Dot */}
            <div
                className={cn(
                    "absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-background transition-colors duration-300",
                    isDarkMode
                        ? "bg-blue-500 ring-black"
                        : "bg-blue-600 ring-white"
                )}
            />

            {/* Date Header / Clickable Area */}
            <div
                className="group cursor-pointer flex items-center gap-3 mb-2"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={cn(
                    "text-xs font-mono font-bold uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity",
                    isDarkMode ? "text-blue-300" : "text-blue-600"
                )}>
                    {log.date}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
            </div>

            {/* Content Card */}
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out overflow-hidden pl-2",
                    isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-50"
                )}
            >
                <div className={cn(
                    "rounded-md p-4 text-sm prose prose-sm max-w-none transition-colors duration-300 border",
                    isDarkMode
                        ? "bg-gray-900/50 border-gray-800 prose-invert"
                        : "bg-gray-50 border-gray-200 prose-gray"
                )}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                    >
                        {log.content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

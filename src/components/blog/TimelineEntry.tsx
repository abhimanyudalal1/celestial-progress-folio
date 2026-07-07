import React, { useId, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { DailyLog } from '@/lib/blog';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface TimelineEntryProps {
    log: DailyLog;
    isExpanded?: boolean;
    /** Marks the most recent entry — gets the accent dot */
    isLatest?: boolean;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({ log, isExpanded = false, isLatest = false }) => {
    const [isOpen, setIsOpen] = useState(isExpanded);
    const { isDarkMode } = useTheme();
    const contentId = useId();

    return (
        <li className="relative pl-6 pb-7 last:pb-2">
            {/* Timeline dot, aligned with the date row */}
            <span
                aria-hidden="true"
                className={cn(
                    "absolute -left-[5px] top-[1.05rem] w-[9px] h-[9px] rounded-full ring-4 transition-colors",
                    isLatest
                        ? "bg-blue-500 ring-blue-500/15"
                        : isDarkMode
                            ? "bg-gray-600 ring-black/40"
                            : "bg-gray-300 ring-white"
                )}
            />

            {/* Disclosure header — a real button: keyboard operable, screen-reader labelled */}
            <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => setIsOpen(v => !v)}
                className={cn(
                    "group w-full text-left rounded-lg px-3 py-2 -ml-3 transition-colors",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                    isDarkMode
                        ? "hover:bg-white/5 focus-visible:outline-white"
                        : "hover:bg-gray-100 focus-visible:outline-gray-900"
                )}
            >
                <span className="flex items-baseline justify-between gap-3">
                    <time
                        dateTime={log.date}
                        className={cn(
                            "font-mono text-[11px] font-medium uppercase tracking-[0.18em]",
                            isLatest
                                ? "text-blue-500"
                                : isDarkMode ? "text-gray-500" : "text-gray-400"
                        )}
                    >
                        {log.date}
                    </time>
                    <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className={cn(
                            "shrink-0 translate-y-0.5 transition-transform duration-300",
                            isOpen && "rotate-180",
                            isDarkMode ? "text-gray-500 group-hover:text-gray-300" : "text-gray-400 group-hover:text-gray-700"
                        )}
                    />
                </span>

                <span className={cn(
                    "block font-serif text-lg font-semibold leading-snug mt-0.5",
                    isDarkMode ? "text-gray-100" : "text-gray-900"
                )}>
                    {log.title}
                </span>

                {log.tags && log.tags.length > 0 && (
                    <span className="flex flex-wrap gap-1.5 mt-2">
                        {log.tags.map(tag => (
                            <span
                                key={tag}
                                className={cn(
                                    "font-mono text-[10px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded border",
                                    isDarkMode
                                        ? "border-gray-700 text-gray-400"
                                        : "border-gray-200 text-gray-500"
                                )}
                            >
                                {tag}
                            </span>
                        ))}
                    </span>
                )}
            </button>

            {/* Collapsible content: grid-rows animation; `invisible` removes the collapsed
                content from the tab order and accessibility tree (max-height hacks don't) */}
            <div
                id={contentId}
                role="region"
                aria-label={`${log.title} — log content`}
                className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
            >
                <div className={cn("overflow-hidden", !isOpen && "invisible")}>
                    <div className={cn(
                        "mt-2 rounded-lg border p-4",
                        "prose prose-sm max-w-none",
                        "prose-headings:font-serif prose-headings:tracking-tight",
                        "prose-code:font-mono prose-code:text-[0.85em] prose-pre:font-mono prose-pre:text-xs",
                        "prose-a:underline prose-a:underline-offset-4",
                        isDarkMode
                            ? "bg-white/[0.03] border-gray-800 prose-invert"
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
        </li>
    );
};

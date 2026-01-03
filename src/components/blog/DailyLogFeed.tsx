import React, { useMemo } from 'react';
import { DailyLog } from '@/lib/blog';
import { TimelineEntry } from './TimelineEntry';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface DailyLogFeedProps {
    logs: DailyLog[];
}

export const DailyLogFeed: React.FC<DailyLogFeedProps> = ({ logs }) => {
    const { isDarkMode } = useTheme();

    // Group logs by Month Year (e.g., "December 2025")
    const groupedLogs = useMemo(() => {
        const groups: Record<string, DailyLog[]> = {};
        logs.forEach(log => {
            const key = `${log.month} ${log.year}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(log);
        });
        return groups;
    }, [logs]);

    return (
        <div className="w-full max-w-3xl mx-auto py-8">
            {/* Main Heading */}
            <h2 className={cn(
                "text-3xl font-black mb-8 pb-4 border-b-2",
                isDarkMode ? "text-gray-100 border-gray-700" : "text-gray-900 border-gray-300"
            )}>
                Project Timeline:
            </h2>

            {Object.entries(groupedLogs).map(([monthYear, monthLogs]) => (
                <div key={monthYear} className="mb-12">
                    {/* Month Header */}
                    <h3 className={cn(
                        "text-2xl font-bold mb-6 sticky top-20 z-10 py-2 backdrop-blur-sm",
                        isDarkMode ? "text-gray-100 bg-black/20" : "text-gray-800 bg-white/40"
                    )}>
                        {monthYear}
                    </h3>

                    <div className="space-y-2">
                        {monthLogs.map((log, index) => (
                            <TimelineEntry
                                key={log.slug}
                                log={log}
                                isExpanded={index === 0} // Expand first item by default
                            />
                        ))}
                    </div>
                </div>
            ))}

            {logs.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No daily logs found for this project. Start writing in src/content/daily/[blog-slug]/!
                </div>
            )}
        </div>
    );
};

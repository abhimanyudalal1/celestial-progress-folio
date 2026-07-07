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
        <div className="w-full max-w-3xl mx-auto pb-8">
            {Object.entries(groupedLogs).map(([monthYear, monthLogs], groupIndex) => (
                <section key={monthYear} aria-label={monthYear} className="mb-10 last:mb-0">
                    {/* Month rule: quiet mono label + hairline + count */}
                    <div className="flex items-center gap-3 mb-5">
                        <h3 className={cn(
                            "font-mono text-xs font-medium uppercase tracking-[0.25em]",
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                            {monthYear}
                        </h3>
                        <div className={cn(
                            "h-px flex-1",
                            isDarkMode ? "bg-gray-800" : "bg-gray-200"
                        )} aria-hidden="true" />
                        <span className={cn(
                            "font-mono text-[10px] uppercase tracking-[0.15em]",
                            isDarkMode ? "text-gray-600" : "text-gray-400"
                        )}>
                            {monthLogs.length} {monthLogs.length === 1 ? 'log' : 'logs'}
                        </span>
                    </div>

                    {/* Continuous rail with entries */}
                    <ol className={cn(
                        "relative ml-1 border-l list-none",
                        isDarkMode ? "border-gray-800" : "border-gray-200"
                    )}>
                        {monthLogs.map((log, index) => (
                            <TimelineEntry
                                key={log.slug}
                                log={log}
                                isExpanded={groupIndex === 0 && index === 0} // latest entry open by default
                                isLatest={groupIndex === 0 && index === 0}
                            />
                        ))}
                    </ol>
                </section>
            ))}

            {logs.length === 0 && (
                <div className={cn(
                    "text-center rounded-lg border border-dashed py-14 px-6",
                    isDarkMode ? "border-gray-800" : "border-gray-200"
                )}>
                    <p className={cn(
                        "font-serif text-lg mb-1",
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                        No research notes yet
                    </p>
                    <p className={cn(
                        "font-mono text-xs uppercase tracking-[0.15em]",
                        isDarkMode ? "text-gray-600" : "text-gray-400"
                    )}>
                        Daily logs for this post will appear here
                    </p>
                </div>
            )}
        </div>
    );
};

import matter from 'gray-matter';

export interface BlogPost {
    slug: string;
    title: string;
    subtitle?: string;
    date: string;
    description: string;
    tags?: string[];
    content: string;
    readingTime?: string;
    image?: string;
}

export interface DailyLog {
    date: string; // YYYY-MM-DD
    slug: string;
    title: string;
    content: string;
    year: string;
    month: string;
    day: string;
}

// Helper to calculate reading time
function calculateReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return `${time} min read`;
}

// Fetch all formal blog posts
export const getBlogPosts = async (): Promise<BlogPost[]> => {
    try {
        // Debug: Check if glob is finding files
        const modules = import.meta.glob('../content/posts/*.md', { query: '?raw', import: 'default', eager: true });
        console.log('Blog Modules Keys:', Object.keys(modules));

        const posts = Object.entries(modules).map(([path, content]) => {
            try {
                console.log(`Parsing ${path}`, { contentType: typeof content, contentPreview: String(content).slice(0, 50) });
                const { data, content: markdownContent } = matter(content as string);
                console.log(`Parsed ${path}:`, data);

                const slug = path.split('/').pop()?.replace('.md', '') || '';

                return {
                    slug,
                    title: data.title || 'Untitled',
                    subtitle: data.subtitle,
                    date: data.date || new Date().toISOString(),
                    description: data.description || '',
                    tags: data.tags || [],
                    content: markdownContent,
                    readingTime: calculateReadingTime(markdownContent),
                    image: data.image,
                } as BlogPost;
            } catch (e) {
                console.error(`Error parsing markdown for ${path}:`, e);
                return null;
            }
        }).filter(Boolean) as BlogPost[]; // Filter out nulls

        console.log('Final Posts Array:', posts);
        return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (err) {
        console.error("Fatal error in getBlogPosts:", err);
        return [];
    }
};

// Fetch all daily logs
export const getDailyLogs = async (): Promise<DailyLog[]> => {
    const modules = import.meta.glob('../content/daily/*.md', { query: '?raw', import: 'default', eager: true });
    // console.log('Daily Log Modules Found:', Object.keys(modules));

    const logs = Object.entries(modules).map(([path, content]) => {
        const filename = path.split('/').pop()?.replace('.md', '') || '';
        const { data, content: markdownContent } = matter(content as string);

        // Extract title: Frontmatter -> First Heading -> Fallback
        let title = data.title;
        if (!title) {
            const headingMatch = markdownContent.match(/^#+\s+(.*)$/m);
            if (headingMatch) {
                title = headingMatch[1];
            } else {
                title = `Log ${filename}`;
            }
        }

        const dateObj = new Date(filename);
        const year = dateObj.getFullYear().toString();
        const month = dateObj.toLocaleString('default', { month: 'long' });
        const day = dateObj.getDate().toString();

        return {
            date: filename,
            slug: filename,
            title,
            content: markdownContent,
            year,
            month,
            day,
        } as DailyLog;
    });

    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
    const posts = await getBlogPosts();
    return posts.find((post) => post.slug === slug);
};

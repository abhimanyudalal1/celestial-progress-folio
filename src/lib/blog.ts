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
    const modules = import.meta.glob('/src/content/posts/*.md', { query: '?raw', import: 'default', eager: true });

    const posts = Object.entries(modules).map(([path, content]) => {
        const { data, content: markdownContent } = matter(content as string);
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
    });

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Fetch all daily logs
export const getDailyLogs = async (): Promise<DailyLog[]> => {
    const modules = import.meta.glob('/src/content/daily/*.md', { query: '?raw', import: 'default', eager: true });

    const logs = Object.entries(modules).map(([path, content]) => {
        // For daily logs, the filename IS the date (YYYY-MM-DD.md)
        const filename = path.split('/').pop()?.replace('.md', '') || '';
        // We can also parse frontmatter if specific overrides are needed, but default to filename date
        const { content: markdownContent } = matter(content as string);

        const dateObj = new Date(filename);
        const year = dateObj.getFullYear().toString();
        const month = dateObj.toLocaleString('default', { month: 'long' });
        const day = dateObj.getDate().toString();

        return {
            date: filename,
            slug: filename,
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

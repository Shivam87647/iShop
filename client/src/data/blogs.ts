export interface BlogPost {
  id: string;
  title: string;
  date: string;
  image: string;
  excerpt: string;
  author: string;
  readTime: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "m3-chip-creators",
    title: "Why Apple's M3 Chip is a True Game Changer for Creators",
    date: "01 June, 2026",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=600&auto=format&fit=crop",
    excerpt: "With the release of the M3 chip family, Apple has taken a massive leap forward in GPU architecture, featuring hardware-accelerated ray tracing and mesh shading.",
    author: "Alex Rivers",
    readTime: "5 min read"
  },
  {
    id: "ios-home-screen-customization",
    title: "The Ultimate Guide to Customizing Your iOS Home Screen",
    date: "28 May, 2026",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop",
    excerpt: "Make your iPhone truly yours. From custom app icons using Shortcuts to interactive widgets, discover how to redesign your iOS experience.",
    author: "Sophia Chen",
    readTime: "4 min read"
  },
  {
    id: "apple-watch-ultra-outdoor",
    title: "Apple Watch Ultra 2: The Ultimate Survival and Fitness Review",
    date: "15 May, 2026",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop",
    excerpt: "We took the Apple Watch Ultra 2 on a 50-mile wilderness hike to test its dual-frequency GPS accuracy, battery life, and offline compass features.",
    author: "Marcus Aurelius",
    readTime: "7 min read"
  }
];

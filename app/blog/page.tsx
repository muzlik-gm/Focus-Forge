'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { MarketingNav } from '@/components/layout/MarketingNav';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/blog', {
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f10] via-[#151518] to-[#0f0f10] opacity-100" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)`,
        }} />
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] gradient-orb bg-blue-600" />
        <div className="absolute top-[40%] left-[5%] w-[400px] h-[400px] gradient-orb bg-blue-500" />
      </div>

      <MarketingNav />

      {/* Main Content */}
      <div className="relative z-10">
        <section className="max-w-5xl mx-auto px-6 pt-40 pb-20">
          <div className="text-center mb-16">
            <div className="skeuo-badge mb-6 inline-flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>BLOG</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 embossed-text tracking-tight">
              Insights & Stories
            </h1>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
              Tips, insights, and stories about productivity, focus, and building better work habits.
            </p>
          </div>

          {loading ? (
            <div className="skeuo-card p-12 text-center">
              <p className="text-zinc-400 text-lg">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="skeuo-card p-12 text-center">
              <p className="text-zinc-400 text-lg">No blog posts yet. Check back soon for productivity tips and insights!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post: any) => (
                <article key={post.id} className="skeuo-panel p-8 skeuo-card-hover">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="skeuo-badge text-blue-400">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 embossed-text">{post.title}</h2>
                  <p className="text-zinc-300 mb-6 leading-relaxed">{post.excerpt}</p>
                  <Link 
                    href={`/blog/${post.slug}`} 
                    className="skeuo-button inline-flex items-center gap-2 px-6 py-3 text-white font-medium"
                  >
                    <span>Read more</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}

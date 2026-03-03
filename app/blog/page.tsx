'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, BookOpen, Rocket, Sparkles } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { toSafeString } from '@/lib/render-safe';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/blog', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
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
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-5xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Cognitive Journal</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
              Focus<br />Intel.
            </h1>
            <p className="text-base font-bold text-black/70 max-w-xl mx-auto">
              High-density insights into productivity engineering and human focus.
            </p>
          </div>

          {loading ? (
            <div className="skeuo-panel p-12 text-center bg-white border-2 border-black animate-pulse">
              <p className="text-xs font-black uppercase tracking-[0.2em]">INITIALIZING FEED...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="skeuo-panel p-12 text-center bg-white border-4 border-black shadow-[10px_10px_0px_black]">
              <Sparkles className="w-8 h-8 mx-auto mb-4 text-black/20" />
              <p className="text-xs font-black uppercase text-black/40">Transmission Pending. Local data nodes are currently empty.</p>
            </div>
          ) : (
            <div className="grid gap-8">
              {posts.map((post: any) => (
                <article key={post.id} className="skeuo-panel p-10 bg-white border-2 border-black shadow-[8px_8px_0px_black] group transition-all">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <span className="skeuo-badge bg-blue-500 text-white border-2 border-black px-3 py-1 text-[9px] font-black uppercase">
                      {toSafeString(post.category)}
                    </span>
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase text-black/40">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {toSafeString(post.readTime)}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter border-b-2 border-black pb-2 group-hover:text-blue-600 transition-colors">{toSafeString(post.title)}</h2>
                  <p className="text-sm font-bold text-black/70 mb-8 leading-relaxed">{toSafeString(post.excerpt)}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="skeuo-button bg-black text-white px-8 py-4 font-black uppercase text-[10px] flex items-center gap-3 w-fit group/btn"
                  >
                    <span>Read Payload</span>
                    <Rocket className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

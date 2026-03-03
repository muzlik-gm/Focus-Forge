'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { Building2, Users, Briefcase, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CompanyPage() {
    const sections = [
        { name: 'Mission', icon: Heart, desc: 'Engineering the next-gen focus architecture.', color: 'bg-red-50' },
        { name: 'Team', icon: Users, desc: 'A node network of decentralized thinkers.', color: 'bg-blue-50' },
        { name: 'Careers', icon: Briefcase, desc: 'Join the telemetry cluster.', color: 'bg-green-50' },
        { name: 'Press', icon: Sparkles, desc: 'Media coverage and brand assets.', color: 'bg-indigo-50' },
    ];

    return (
        <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
            <MarketingNav />

            <main className="flex-grow pt-32 px-6">
                <section className="max-w-5xl mx-auto pb-20">
                    <div className="text-center mb-16 border-b-4 border-black pb-12">
                        <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <span>Forgrin Node_A1</span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
                            One Core.<br />Global Distribution.
                        </h1>
                        <p className="text-base font-bold text-black/70 max-w-xl mx-auto">
                            Our infrastructure is engineered for maximum transparency and efficiency.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {sections.map((app, i) => (
                            <div key={i} className={`skeuo-panel p-8 border-4 border-black shadow-[8px_8px_0px_black] ${app.color} transition-all`}>
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center">
                                        <app.icon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black mb-1 uppercase tracking-tighter italic border-b-2 border-black inline-block pb-1">{app.name}</h3>
                                        <p className="text-[10px] font-black uppercase text-black/40 mt-2">Telemetry Cluster Active</p>
                                    </div>
                                </div>
                                <p className="text-base font-bold text-zinc-600 leading-snug mb-8">{app.desc}</p>
                                <div className="pt-8 border-t-2 border-black flex justify-end">
                                    <Link href={`/company/${app.name.toLowerCase()}`} className="skeuo-button bg-black text-white px-8 py-3 font-black uppercase text-xs shadow-[4px_4px_0px_white]">
                                        View Module
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 skeuo-panel p-12 text-center bg-[#09090b] text-white border-4 border-black shadow-[10px_10px_0px_black] ring-4 ring-black">
                        <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter italic border-b-2 border-white inline-block pb-1">Our Origins.</h2>
                        <p className="text-base font-bold text-white/70 mb-10 max-w-2xl mx-auto">
                            Synthesized in 2024 to bridge the gap between human focus and machine telemetry.
                        </p>
                        <div className="flex justify-center">
                            <Link
                                href="/about"
                                className="skeuo-button bg-white text-black border-2 border-black px-10 py-5 font-black uppercase text-sm flex items-center gap-3 transition-transform hover:scale-105"
                            >
                                <span>Full Protocol History</span>
                                <Users className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

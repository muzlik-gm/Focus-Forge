'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { Shield, Book, Scroll, Lock, FileText } from 'lucide-react';
import Link from 'next/link';

export default function LegalPage() {
    const sections = [
        { name: 'Terms_of_Service', icon: Scroll, desc: 'Operational protocols and user agreements.' },
        { name: 'Privacy_Policy', icon: Eye, desc: 'How we engineer and protect your focal telemetry.' },
        { name: 'GDPR_Compliance', icon: Lock, desc: 'European data sovereignty protocols.' },
        { name: 'Security_Architecture', icon: Shield, desc: 'Hardened infrastructure for deep thinkers.' },
    ];

    function Eye({ className }: { className?: string }) {
        return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    }

    return (
        <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
            <MarketingNav />

            <main className="flex-grow pt-32 px-6 pb-24">
                <section className="max-w-4xl mx-auto">
                    <div className="text-center mb-16 border-b-4 border-black pb-12">
                        <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
                            <Shield className="w-4 h-4 text-emerald-600" />
                            <span>Full Compliance Cluster</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
                            Legal<br />Protocols.
                        </h1>
                        <p className="text-sm font-black uppercase text-black/40 max-w-xl mx-auto">
                            Our legal framework is designed with the same precision as our focus engine.
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {sections.map((section, i) => (
                            <div key={i} className="skeuo-panel p-8 bg-white border-2 border-black shadow-[6px_6px_0px_black] flex flex-col md:flex-row items-center gap-8 group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                <div className="w-16 h-16 bg-zinc-100 border-2 border-black flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                                    <section.icon className="w-8 h-8" />
                                </div>
                                <div className="flex-grow text-center md:text-left">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-1 border-b-2 border-black inline-block pb-0.5">{section.name}</h3>
                                    <p className="text-xs font-bold text-black/60 mt-2">{section.desc}</p>
                                </div>
                                <Link href={`/${section.name.toLowerCase().replace(/_/g, '-')}`} className="skeuo-button bg-black text-white px-8 py-3 font-black uppercase text-[10px] shadow-[4px_4px_0px_white] ring-2 ring-black">
                                    READ_DOCUMENT
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 skeuo-panel p-10 bg-yellow-50 border-4 border-black shadow-[10px_10px_0px_black]">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center flex-shrink-0">
                                <FileText className="w-10 h-10" />
                            </div>
                            <div className="flex-grow text-center md:text-left">
                                <h4 className="text-xl font-black uppercase tracking-tighter italic">Questions regarding our stack?</h4>
                                <p className="text-xs font-bold text-black/70 mt-1">Our legal telemetry team can provide additional technical documentation.</p>
                            </div>
                            <Link href="/contact" className="skeuo-button bg-black text-white px-10 py-5 font-black uppercase text-xs shadow-[6px_6px_0px_white] ring-2 ring-black">
                                REQUEST_DOCS
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

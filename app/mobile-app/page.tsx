'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { Smartphone, Download, Apple, Play, Sparkles, Zap } from 'lucide-react';

export default function MobileAppPage() {
    return (
        <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
            <MarketingNav />

            <main className="flex-grow pt-32 px-6 pb-24">
                <section className="max-w-5xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        {/* Left Content */}
                        <div className="lg:w-1/2">
                            <div className="skeuo-badge mb-6 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
                                <Smartphone className="w-4 h-4 text-pink-600" />
                                <span>Mobile Node Deployment</span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black mb-6 embossed-text tracking-tighter uppercase leading-tight italic">
                                Focus_On<br />The_Move.
                            </h1>
                            <p className="text-xl font-bold text-black/70 mb-10 border-l-8 border-black pl-6">
                                Take your deep work telemetry anywhere. Low-latency focus tracking for iOS and Android.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <button className="skeuo-button bg-black text-white px-8 py-5 font-black uppercase text-xs flex items-center justify-center gap-3 shadow-[6px_6px_0px_white] ring-2 ring-black">
                                    <Apple className="w-5 h-5" />
                                    <span>App_Store</span>
                                </button>
                                <button className="skeuo-button bg-white text-black border-4 border-black px-8 py-5 font-black uppercase text-xs flex items-center justify-center gap-3 shadow-[8px_8px_0px_black] ring-2 ring-black">
                                    <Play className="w-5 h-5 fill-current" />
                                    <span>Google_Play</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Visual (Mockup) */}
                        <div className="lg:w-1/2 flex justify-center lg:justify-end">
                            <div className="w-[300px] h-[600px] bg-white border-[8px] border-black rounded-[40px] shadow-[20px_20px_0px_black] relative overflow-hidden flex flex-col pt-12 pb-6 px-4 ring-8 ring-black">
                                <div className="w-20 h-6 bg-black rounded-full mb-8 mx-auto" />
                                <div className="skeuo-panel bg-zinc-50 border-2 border-black p-4 mb-4 flex-grow relative flex flex-col items-center justify-center">
                                    <div className="w-32 h-32 rounded-full border-[6px] border-black flex items-center justify-center mb-6 bg-white animate-pulse">
                                        <Zap className="w-16 h-16 text-blue-600" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">FOCUS_ACTIVE</h3>
                                    <p className="text-[10px] font-black uppercase text-black/40 mt-2">Node_A1 Tracking</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pb-8">
                                    <div className="skeuo-panel bg-white border-2 border-black h-20" />
                                    <div className="skeuo-panel bg-white border-2 border-black h-20" />
                                </div>
                                <div className="w-full h-1 bg-black rounded-full mt-auto" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Grid */}
                <section className="max-w-5xl mx-auto mt-32 grid md:grid-cols-3 gap-8">
                    {[
                        { name: 'Sync_Path', desc: 'Real-time telemetry synchronization with your desktop node.' },
                        { name: 'Native_Logs', desc: 'Swift and smooth interaction design for mobile deep work.' },
                        { name: 'Pulse_Alerts', desc: 'Minimal haptic feedback systems for focus transitions.' }
                    ].map((f, i) => (
                        <div key={i} className="skeuo-panel p-8 bg-zinc-100 border-2 border-black shadow-[6px_6px_0px_black] ring-2 ring-black">
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-3 border-b-2 border-black inline-block pb-1">{f.name}</h3>
                            <p className="text-xs font-bold text-black/60 leading-snug">{f.desc}</p>
                        </div>
                    ))}
                </section>
            </main>

            <Footer />
        </div>
    );
}

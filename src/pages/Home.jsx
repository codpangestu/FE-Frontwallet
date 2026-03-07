import { Link } from 'react-router-dom';
import { Smartphone, CreditCard, Coins, Sparkles, ArrowRight } from 'lucide-react';
import '../App.css';

export default function Home() {
    return (
        <div className="app-container page-transition bg-slate-100 flex flex-col p-0 pb-6 relative overflow-hidden">

            <div className="flex-1 flex flex-col items-center justify-center relative pt-12 pb-8">

                <div className="relative flex flex-col items-center mt-12 mb-8">
                    {/* Sparkles Top Left */}
                    <div className="absolute -top-12 -left-6 text-[#d4af37] opacity-90">
                        <Sparkles size={36} strokeWidth={1.5} />
                    </div>

                    {/* Dark Blue Smartphone Card */}
                    <div className="bg-[#0f172a] w-36 h-36 rounded-[2.5rem] flex items-center justify-center relative z-20 shadow-2xl">
                        <Smartphone size={72} className="text-white" strokeWidth={1.5} />
                    </div>

                    {/* Gold Credit Card Overlay */}
                    <div className="absolute -bottom-6 -right-8 z-30 bg-[#d4af37] w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl rotate-12">
                        <CreditCard size={44} className="text-white" strokeWidth={1.5} />
                    </div>

                    {/* Gold Coins Top Left */}
                    <div className="absolute -top-4 -left-10 z-10 bg-[#f59e0b] w-14 h-14 rounded-full flex items-center justify-center shadow-lg -rotate-[20deg]">
                        <Coins size={32} className="text-white" strokeWidth={2} />
                    </div>

                    {/* Gold Coins Bottom Right (small) */}
                    <div className="absolute -bottom-10 right-14 z-10 bg-[#f59e0b] w-12 h-12 rounded-full flex items-center justify-center shadow-lg rotate-[25deg]">
                        <Coins size={26} className="text-white" strokeWidth={2} />
                    </div>
                </div>

            </div>

            <div className="px-8 text-center flex flex-col items-center gap-6 pb-12">
                <h1 className="text-[2.5rem] font-extrabold text-slate-900 leading-[1.15] m-0 tracking-tight">
                    Effortless financial<br />management at your<br />fingertips
                </h1>

                <div className="flex gap-2 justify-center items-center mt-2 mb-6">
                    <div className="w-8 h-2 bg-[#d4af37] rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                </div>

                <Link to="/login" className="flex items-center justify-center gap-3 w-full p-5 bg-gradient-to-r from-[#fde047] via-[#d4af37] to-[#b48608] text-slate-900 rounded-full no-underline text-xl font-extrabold shadow-[0_8px_25px_rgba(212,175,55,0.4)] transition-transform hover:scale-[1.02]">
                    Get Started <ArrowRight size={22} strokeWidth={3} className="text-slate-900" />
                </Link>
            </div>

            <div className="w-[130px] h-1.5 bg-slate-300 rounded-full mx-auto"></div>
        </div>
    );
}

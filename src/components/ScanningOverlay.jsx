import React from 'react';
import { Camera, Sparkles, ScanLine, Loader2 } from 'lucide-react';

const ScanningOverlay = ({ message = "Procesando...", subMessage = "Por favor espere" }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white animate-fade-in touch-none select-none">

            {/* Scanning Visualization Area */}
            <div className="relative w-72 h-96 mb-8 rounded-2xl border border-white/20 bg-white/5 overflow-hidden flex items-center justify-center shadow-2xl shadow-blue-500/10">

                {/* Corner Brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl m-2"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl m-2"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl m-2"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl m-2"></div>

                {/* Central Icon / Content */}
                <div className="text-blue-400 opacity-80 animate-pulse">
                    <ScanLine size={64} strokeWidth={1} />
                </div>

                {/* Scanning Beam Animation */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_2px_rgba(96,165,250,0.8)] animate-scan-beam"></div>

                {/* Subtle Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>

            </div>

            {/* Dynamic Text Messages */}
            <div className="flex flex-col items-center px-6 max-w-sm text-center">
                <div className="flex items-center gap-2 mb-2">
                    {message.includes('IA') ? (
                        <Sparkles size={20} className="text-purple-400 animate-pulse" />
                    ) : message.includes('DGII') ? (
                        <Loader2 size={20} className="text-blue-400 animate-spin" />
                    ) : null}
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
                        {message}
                    </h2>
                </div>

                <p className="text-blue-200/70 text-sm font-medium animate-pulse">{subMessage}</p>
            </div>

        </div>
    );
};

export default ScanningOverlay;

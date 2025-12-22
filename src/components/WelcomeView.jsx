import React, { useState } from 'react';
import { clsx } from 'clsx';
// No Lucide imports needed as we are using Material Icons via CSS

const WelcomeView = ({ onNavigate, installPrompt, onInstall }) => {
    const [step, setStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const nextStep = () => {
        if (step < 2) {
            setIsAnimating(true);
            setTimeout(() => {
                setStep(s => s + 1);
                setIsAnimating(false);
            }, 300);
        } else {
            onNavigate('register');
        }
    };

    const handleSkip = () => onNavigate('login');
    const handleLogin = () => onNavigate('login');
    const handleRegister = () => onNavigate('register');

    // --- STEP 0: WELCOME ---
    const StepWelcome = () => (
        <div className={clsx("flex flex-col h-full relative", isAnimating ? "animate-fade-out" : "animate-fade-in")}>
            {/* Install App Button - Top Right */}
            {installPrompt && (
                <div className="absolute top-6 right-6 z-50 animate-fade-in">
                    <button
                        onClick={onInstall}
                        className="flex items-center gap-2 bg-white dark:bg-gray-800 text-[#4F75E8] px-4 py-2 rounded-full shadow-lg border border-blue-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all font-bold text-xs"
                    >
                        <span className="material-icons-round text-sm">download</span>
                        Instalar App
                    </button>
                </div>
            )}

            <div className="flex-1 flex flex-col items-center justify-center space-y-10 relative">
                {/* Visual */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-[#4F75E8] blur-2xl opacity-20 rounded-full group-hover:opacity-30 transition-opacity duration-500"></div>
                    <div className="relative bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-2xl border border-white/50 dark:border-gray-700">
                        <span className="material-icons-round text-[#4F75E8] text-6xl">receipt_long</span>
                    </div>
                    {/* Floating Elements */}
                    <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-bounce" style={{ animationDuration: '3s' }}>
                        <span className="material-icons-round text-[#10B981] text-2xl">trending_up</span>
                    </div>
                    <div className="absolute -bottom-2 -left-6 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}>
                        <span className="material-icons-round text-red-500 text-2xl">trending_down</span>
                    </div>
                </div>

                {/* Text */}
                <div className="text-center space-y-4 px-4">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Factur<span className="text-[#4F75E8]">IA</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-[280px] mx-auto">
                        Gestión inteligente de gastos e ingresos para tu tranquilidad financiera.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4 w-full px-6">
                    {/* Increased opacity and added subtle shadow/border for better contrast */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-2xl border border-white/40 dark:border-gray-600 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                        <span className="material-icons-round text-[#4F75E8] mb-2">auto_graph</span>
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100">Análisis</span>
                        <span className="text-[10px] text-gray-500">Reportes al día</span>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-2xl border border-white/40 dark:border-gray-600 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                        <span className="material-icons-round text-[#10B981] mb-2">qr_code_scanner</span>
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100">Escaneo</span>
                        <span className="text-[10px] text-gray-500">Facturas con IA</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 space-y-4 px-6 pb-6">
                <button
                    onClick={nextStep}
                    className="w-full bg-[#4F75E8] hover:bg-[#3B5BC4] text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/30 transform transition active:scale-95 flex items-center justify-center group"
                >
                    <span>Comenzar ahora</span>
                    <span className="material-icons-round ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <div className="flex items-center justify-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>¿Ya tienes cuenta?</span>
                    <button onClick={handleLogin} className="text-[#4F75E8] font-medium hover:underline">Iniciar Sesión</button>
                </div>
            </div>
        </div>
    );

    // --- STEP 1: GASTOS ---
    const StepExpenses = () => (
        <div className={clsx("flex flex-col h-full relative", isAnimating ? "animate-fade-out" : "animate-fade-in")}>
            <div className="absolute top-0 right-0 p-6 z-10">
                <button onClick={handleSkip} className="text-sm font-medium text-gray-400 hover:text-[#4F75E8] transition-colors">
                    Omitir
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 mt-10">
                {/* Visual */}
                <div className="relative w-full aspect-square max-w-[280px] flex items-center justify-center mb-8">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-full shadow-inner opacity-60"></div>

                    {/* Phone/Card Mockup */}
                    <div className="relative w-40 h-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col items-center pt-6 border border-gray-100 dark:border-gray-700 z-10">
                        <div className="w-12 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mb-4"></div>
                        <div className="w-28 h-2 bg-gray-100 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="w-20 h-2 bg-gray-100 dark:bg-gray-700 rounded mb-6"></div>
                        {/* Scan Effect */}
                        <div className="w-32 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-end justify-between px-2 pb-2 overflow-hidden relative">
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#4F75E8] shadow-[0_0_10px_#4F75E8] animate-pulse"></div>
                            <div className="w-1.5 h-6 bg-[#4F75E8]/40 rounded-t-sm"></div>
                            <div className="w-1.5 h-10 bg-[#4F75E8]/60 rounded-t-sm"></div>
                            <div className="w-1.5 h-8 bg-[#4F75E8]/50 rounded-t-sm"></div>
                            <div className="w-1.5 h-12 bg-[#4F75E8] rounded-t-sm"></div>
                            <div className="w-1.5 h-5 bg-[#4F75E8]/30 rounded-t-sm"></div>
                        </div>
                    </div>

                    {/* Floating Icons */}
                    <div className="absolute top-10 right-4 bg-white dark:bg-gray-700 p-3 rounded-2xl shadow-lg border border-gray-50 dark:border-gray-600 transform rotate-6 z-20 animate-float">
                        <span className="material-icons-round text-[#4F75E8] text-2xl">photo_camera</span>
                    </div>
                    <div className="absolute bottom-12 left-4 bg-white dark:bg-gray-700 p-3 rounded-2xl shadow-lg border border-gray-50 dark:border-gray-600 transform -rotate-6 z-20 animate-float" style={{ animationDelay: '1s' }}>
                        <span className="material-icons-round text-emerald-500 text-2xl">upload_file</span>
                    </div>
                    <div className="absolute top-4 left-10 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl shadow-sm transform -rotate-12 z-0">
                        <span className="material-icons-round text-blue-400 text-lg">edit</span>
                    </div>
                </div>

                <div className="text-center max-w-xs mx-auto">
                    <div className="inline-flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-4">
                        <span className="material-icons-round text-[#4F75E8] text-sm mr-1">receipt_long</span>
                        <span className="text-xs font-bold text-[#4F75E8] uppercase tracking-wide">Registro Inteligente</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
                        Registra Tus Gastos
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
                        Registra fácilmente tus gastos mediante fotos, subidas o ingreso manual. Organiza tus finanzas en segundos.
                    </p>
                </div>
            </div>

            <div className="p-6 pb-10 w-full z-10">
                <div className="flex justify-center space-x-2 mb-8">
                    <div className="w-8 h-2 bg-[#4F75E8] rounded-full transition-all duration-300"></div>
                    <div className="w-2 h-2 bg-gray-300 dark:bg-gray-700 rounded-full transition-all duration-300"></div>
                    <div className="w-2 h-2 bg-gray-300 dark:bg-gray-700 rounded-full transition-all duration-300"></div>
                </div>
                <button
                    onClick={nextStep}
                    className="w-full bg-[#4F75E8] hover:bg-[#3B5BC4] text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center group"
                >
                    <span>Siguiente</span>
                    <span className="material-icons-round ml-2 group-hover:translate-x-1 transition-transform text-lg">arrow_forward</span>
                </button>
            </div>
        </div>
    );

    // --- STEP 2: INGRESOS ---
    const StepIncome = () => (
        <div className={clsx("flex flex-col h-full relative", isAnimating ? "animate-fade-out" : "animate-fade-in")}>
            <div className="flex justify-between items-center px-6 py-6 z-20">
                <div className="flex items-center gap-2">
                    <div className="bg-[#4361EE] p-1.5 rounded-lg">
                        <span className="material-icons-round text-white text-sm">description</span>
                    </div>
                    <span className="font-bold text-lg text-[#4361EE] tracking-tight">FacturIA</span>
                </div>
                <button onClick={handleSkip} className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                    Omitir
                </button>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center px-6 relative z-10">
                <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#10B981]/10 dark:bg-[#10B981]/5 rounded-full blur-3xl -z-10"></div>

                <div className="relative w-full aspect-square max-w-[280px] mb-8">
                    {/* Main Card */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full bg-[#10B981] text-white rounded-2xl shadow-xl shadow-emerald-500/30 p-6 overflow-hidden">
                        <div className="absolute -right-4 -top-4 opacity-20">
                            <span className="material-icons-round text-[120px]">attach_money</span>
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                            <div>
                                <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider mb-1">Ingresos Totales</p>
                                <h2 className="text-3xl font-bold">RD$99,052.93</h2>
                            </div>
                            <div className="flex items-end justify-between">
                                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
                                    <span className="material-icons-round text-sm">trending_up</span>
                                    <span className="text-xs font-semibold">+12%</span>
                                </div>
                                <span className="text-xs text-emerald-100 opacity-80">Desde el mes pasado</span>
                            </div>
                        </div>
                    </div>

                    {/* Check Float */}
                    <div className="absolute -top-4 -right-2 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 animate-bounce" style={{ animationDuration: '3s' }}>
                        <span className="material-icons-round text-yellow-500 text-2xl">monetization_on</span>
                    </div>

                    {/* Bottom List Item Mockup */}
                    <div className="absolute -bottom-6 left-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-3 transform scale-95 opacity-90">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <span className="material-icons-round text-blue-500 text-lg">work</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Proyecto Freelance</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">2025-11-15</p>
                        </div>
                        <p className="text-sm font-bold text-[#10B981]">+RD$18,500</p>
                    </div>
                </div>

                <div className="text-center mt-6 space-y-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                        Gestiona Tus <span className="text-[#10B981]">Ingresos</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed px-2">
                        Registra fácilmente tus entradas de dinero y gestiona múltiples fuentes de ingresos en un solo lugar.
                    </p>
                </div>
            </div>

            <div className="px-6 pb-10 pt-4 z-20 w-full">
                <div className="flex justify-center gap-2 mb-8">
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    <div className="w-8 h-2 rounded-full bg-[#10B981]"></div>
                </div>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleRegister}
                        className="w-full bg-[#4361EE] hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center group"
                    >
                        <span>Comenzar</span>
                        <span className="material-icons-round ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    <button
                        onClick={handleLogin}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-bold py-4 px-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors active:scale-95"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-[100dvh] bg-white dark:bg-gray-900 overflow-hidden relative font-sans">
            {/* Background Blobs (Global) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary opacity-10 blur-3xl rounded-full"></div>
                <div className="absolute top-1/2 -left-32 w-72 h-72 bg-secondary opacity-10 blur-3xl rounded-full"></div>
                <div className="absolute -bottom-32 right-1/4 w-80 h-80 bg-primary opacity-10 blur-3xl rounded-full"></div>
            </div>

            {/* Content Switcher */}
            <div className="h-full z-10 relative">
                {step === 0 && <StepWelcome />}
                {step === 1 && <StepExpenses />}
                {step === 2 && <StepIncome />}
            </div>

            <style>{`
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes float {
                    0% { transform: translateY(0px) rotate(6deg); }
                    50% { transform: translateY(-15px) rotate(6deg); }
                    100% { transform: translateY(0px) rotate(6deg); }
                }
            `}</style>
        </div>
    );
};

export default WelcomeView;

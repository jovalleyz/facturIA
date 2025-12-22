import React, { useState } from 'react';

const LoginView = ({ onLogin, onNavigate, loading, error }) => {
    const [email, setEmail] = useState('jvalle@papino.com');
    const [password, setPassword] = useState('password123');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(email, password);
    };

    return (
        <div className="bg-[#F3F7FF] dark:bg-[#0F172A] font-sans antialiased min-h-[100dvh] flex items-center justify-center p-6 transition-colors duration-300 relative" style={{ fontFamily: 'Inter, sans-serif' }}>
            <style>{`
        .input-group:focus-within label {
            color: #4F75E3;
        }
        .input-group:focus-within .icon-prefix {
            color: #4F75E3;
        }
      `}</style>

            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#4F75E3] opacity-5 blur-[100px] animate-pulse-slow"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#4F75E3] opacity-5 blur-[80px]"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-[#4F75E3] opacity-5 blur-[120px]"></div>
            </div>

            <main className="w-full max-w-[360px] bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(79,117,227,0.1)] dark:shadow-xl p-8 sm:p-10 transition-all duration-300 relative z-10 animate-fade-in border border-white/50 dark:border-white/5 backdrop-blur-sm">
                <div className="flex flex-col items-center mb-10 group">
                    <div className="relative mb-6 transform transition-transform duration-300 group-hover:scale-105">
                        <div className="absolute inset-0 bg-[#4F75E3] blur-xl rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                        <div className="w-20 h-20 bg-gradient-to-br from-[#4F75E3] to-[#6366F1] rounded-2xl rotate-3 shadow-lg flex items-center justify-center relative z-10 border border-white/20">
                            <div className="absolute inset-0 bg-white/10 rounded-2xl"></div>
                            <span className="material-icons-round text-white text-5xl drop-shadow-md">receipt_long</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-[#1E293B] rounded-xl flex items-center justify-center shadow-md z-20 rotate-[-6deg]">
                            <span className="material-icons-round text-green-500 text-xl">check_circle</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1E293B] dark:text-[#F8FAFC] tracking-tight mb-2">FacturIA</h1>
                    <p className="text-[#64748B] dark:text-[#94A3B8] text-sm font-medium opacity-80">Gestión inteligente de gastos</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm text-center mb-4 border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2 input-group group">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] transition-colors duration-200 ml-1" htmlFor="email">
                            Correo
                        </label>
                        <div className="relative transition-all duration-200 transform group-focus-within:-translate-y-1">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <span className="material-icons-round text-[#64748B] dark:text-[#94A3B8] icon-prefix transition-colors duration-200 text-xl">mail</span>
                            </div>
                            <input
                                className="block w-full pl-11 pr-4 py-3.5 bg-[#F8FAFC] dark:bg-[#334155] border border-transparent dark:border-[#475569] rounded-2xl text-[#1E293B] dark:text-[#F8FAFC] placeholder-[#64748B]/60 dark:placeholder-[#94A3B8]/50 focus:outline-none focus:bg-white dark:focus:bg-[#1E293B] focus:ring-2 focus:ring-[#4F75E3]/20 focus:border-[#4F75E3] transition-all duration-200 shadow-sm text-sm"
                                id="email"
                                name="email"
                                placeholder="ejemplo@correo.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2 input-group group">
                        <div className="flex justify-between items-end ml-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] transition-colors duration-200" htmlFor="password">
                                Contraseña
                            </label>
                            <button type="button" onClick={() => onNavigate && onNavigate('forgot-password')} className="text-xs text-[#4F75E3] hover:text-[#3D62CC] font-medium transition-colors">
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                        <div className="relative transition-all duration-200 transform group-focus-within:-translate-y-1">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <span className="material-icons-round text-[#64748B] dark:text-[#94A3B8] icon-prefix transition-colors duration-200 text-xl">lock</span>
                            </div>
                            <input
                                className="block w-full pl-11 pr-12 py-3.5 bg-[#F8FAFC] dark:bg-[#334155] border border-transparent dark:border-[#475569] rounded-2xl text-[#1E293B] dark:text-[#F8FAFC] placeholder-[#64748B]/60 dark:placeholder-[#94A3B8]/50 focus:outline-none focus:bg-white dark:focus:bg-[#1E293B] focus:ring-2 focus:ring-[#4F75E3]/20 focus:border-[#4F75E3] transition-all duration-200 shadow-sm text-sm tracking-widest font-sans"
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#1E293B] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer focus:outline-none"
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <span className="material-icons-round text-xl">{showPassword ? 'visibility' : 'visibility_off'}</span>
                            </button>
                        </div>
                    </div>

                    <button
                        className="w-full relative overflow-hidden group py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-[#4F75E3]/30 text-sm font-bold text-white bg-gradient-to-r from-[#4F75E3] to-[#3D62CC] hover:from-[#3D62CC] hover:to-[#4F75E3] focus:outline-none focus:ring-4 focus:ring-[#4F75E3]/30 transition-all duration-300 transform hover:-translate-y-0.5 mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={loading}
                    >
                        <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full duration-500 ease-in-out transform -skew-x-12 -translate-x-full"></div>
                        <span className="relative flex items-center justify-center gap-2">
                            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                            {!loading && <span className="material-icons-round text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                        </span>
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                            ¿No tienes una cuenta?{' '}
                            <button
                                type="button"
                                onClick={() => onNavigate && onNavigate('register')}
                                className="font-bold text-[#4F75E3] hover:text-[#6366F1] transition-colors relative inline-block group"
                            >
                                Registrarse
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6366F1] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                            </button>
                        </p>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-[#E2E8F0] dark:border-[#475569]/30 flex flex-col items-center">
                    <p className="text-center text-[10px] text-[#64748B] dark:text-[#94A3B8]/50 leading-tight">
                        © 2025 OVM Easy Apps. Todos los derechos reservados.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default LoginView;

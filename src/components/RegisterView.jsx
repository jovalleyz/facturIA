import React, { useState } from 'react';
import { clsx } from 'clsx';
// Material Symbols Outlined based on user snippet

const RegisterView = ({ onRegister, loading }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirm) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            await onRegister(e, name, email, password);
        } catch (err) {
            console.error(err);
            setError('Error al registrarse. Intente de nuevo.');
        }
    };

    return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-brand-bg font-manrope text-text-main antialiased selection:bg-brand-primary/20 selection:text-brand-primary p-4 sm:p-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                .material-symbols-outlined {
                    font-family: 'Material Symbols Outlined';
                    font-weight: normal;
                    font-style: normal;
                    font-size: 24px;
                    line-height: 1;
                    letter-spacing: normal;
                    text-transform: none;
                    display: inline-block;
                    white-space: nowrap;
                    word-wrap: normal;
                    direction: ltr;
                    -webkit-font-feature-settings: 'liga';
                    -webkit-font-smoothing: antialiased;
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
            `}</style>
            <main className="w-full max-w-[400px] bg-white rounded-3xl shadow-card px-8 py-10 relative overflow-hidden animate-fade-in">
                {/* Top Gradient Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary/40 via-brand-primary to-brand-primary/40"></div>

                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-text-main mb-2 tracking-tight">Crear Cuenta</h1>
                    <p className="text-sm text-text-secondary font-medium leading-relaxed">
                        Regístrate para comenzar a gestionar tus finanzas de manera inteligente.
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Name Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Nombre Completo</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 text-[20px] group-focus-within:text-brand-primary transition-colors">person</span>
                            </div>
                            <input
                                className="w-full rounded-xl border border-border-light bg-input-bg pl-10 pr-4 py-3.5 text-sm text-text-main placeholder-slate-400 focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all duration-200"
                                placeholder="Ej. Juan Pérez"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Correo Electrónico</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 text-[20px] group-focus-within:text-brand-primary transition-colors">mail</span>
                            </div>
                            <input
                                className="w-full rounded-xl border border-border-light bg-input-bg pl-10 pr-4 py-3.5 text-sm text-text-main placeholder-slate-400 focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all duration-200"
                                placeholder="nombre@ejemplo.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Contraseña</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 text-[20px] group-focus-within:text-brand-primary transition-colors">lock</span>
                            </div>
                            <input
                                className="w-full rounded-xl border border-border-light bg-input-bg pl-10 pr-10 py-3.5 text-sm text-text-main placeholder-slate-400 focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10 outline-none tracking-widest font-medium transition-all duration-200"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-text-secondary transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showPassword ? 'visibility' : 'visibility_off'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Confirmar Contraseña</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 text-[20px] group-focus-within:text-brand-primary transition-colors">lock_reset</span>
                            </div>
                            <input
                                className="w-full rounded-xl border border-border-light bg-input-bg pl-10 pr-4 py-3.5 text-sm text-text-main placeholder-slate-400 focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10 outline-none tracking-widest font-medium transition-all duration-200"
                                placeholder="••••••••"
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {error}
                        </div>
                    )}

                    <div className="pt-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primary-dark hover:from-[#486bd1] hover:to-[#3352a8] active:scale-[0.98] transition-all duration-200 text-white font-bold text-[15px] shadow-btn hover:shadow-btn-hover flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    Registrarse
                                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="text-center pt-2">
                        <p className="text-sm text-text-secondary">
                            ¿Ya tienes una cuenta?
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onRegister(null, null, null, null, 'login'); }}
                                className="text-brand-primary hover:text-brand-primary-dark font-bold hover:underline decoration-2 underline-offset-2 transition-all ml-1"
                            >
                                Inicia Sesión
                            </a>
                        </p>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 font-medium">
                        © 2025 FacturIA. Todos los derechos reservados.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default RegisterView;

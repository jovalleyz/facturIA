import React, { useState, useEffect } from 'react';
import {
    Moon, Sun, Settings, User,
    ArrowRightLeft, ChevronRight, Download,
    ArrowRight, UserPlus, Send, Building2,
    Plus, Edit2, Trash2, RefreshCw, Check, X,
    FileText
} from 'lucide-react';
import ExportReportModal from './ExportReportModal';

const Avatar = ({ name, url, size = "md", className = "" }) => {
    const [imageError, setImageError] = useState(false);
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-12 h-12 text-lg",
        lg: "w-20 h-20 text-2xl",
        xl: "w-24 h-24 text-3xl"
    };

    if (url && !imageError) {
        return (
            <img
                src={url}
                alt={name}
                className={`${sizeClasses[size]} rounded-2xl object-cover border-4 border-white dark:border-gray-700 shadow-md ${className}`}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div className={`${sizeClasses[size]} rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold border-4 border-white dark:border-gray-700 shadow-md ${className}`}>
            {name ? name[0].toUpperCase() : '?'}
        </div>
    );
};

const SettingsView = ({
    viewingContext,
    sharedAccounts,
    handleSwitchAccount,
    handleSwitchToPersonal,
    exportToCSV,
    handleInviteCollaborator,
    onSignOut,
    onUpdateProfile,
    myCollaborators,
    handleRevokeAccess,
    userCompanies,
    onAddCompany,
    onDeleteCompany,
    onUpdateCompany,
    onSeedOVM,
    darkMode,
    toggleDarkMode,
    invoices // Received from App
}) => {
    const [showExportModal, setShowExportModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(viewingContext?.name || '');
    const [editPhoto, setEditPhoto] = useState(null);

    // Stats for Add Company Form
    const [newCompany, setNewCompany] = useState({ name: '', rnc: '', phone: '', address: '' });
    const [showAddCompany, setShowAddCompany] = useState(false);
    const [editingCompanyId, setEditingCompanyId] = useState(null);

    useEffect(() => {
        setEditName(viewingContext?.name || '');
    }, [viewingContext?.name]);

    const onProfileSave = async () => {
        if (viewingContext.type === 'shared') return;
        await onUpdateProfile(editName, editPhoto);
        setIsEditing(false);
        setEditPhoto(null);
    };

    const onProfileCancel = () => {
        setIsEditing(false);
        setEditName(viewingContext?.name || '');
        setEditPhoto(null);
    };

    const handleAddCompanySubmit = (e) => {
        e.preventDefault();
        if (!newCompany.name || !newCompany.rnc) return alert("Nombre y RNC requeridos");

        if (editingCompanyId) {
            onUpdateCompany(editingCompanyId, newCompany);
            setEditingCompanyId(null);
        } else {
            onAddCompany(newCompany);
        }
        setNewCompany({ name: '', rnc: '', phone: '', address: '' });
        setShowAddCompany(false);
    };

    const handleEditCompanyClick = (company) => {
        setNewCompany({
            name: company.name,
            rnc: company.rnc,
            phone: company.phone || '',
            address: company.address || ''
        });
        setEditingCompanyId(company.id);
        setShowAddCompany(true);
    };

    const handleCancelCompanyEdit = () => {
        setNewCompany({ name: '', rnc: '', phone: '', address: '' });
        setEditingCompanyId(null);
        setShowAddCompany(false);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark font-sans transition-colors duration-300 min-h-screen pb-24">
            {/* Header */}
            <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-white dark:bg-surface-dark sticky top-0 z-50 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <FileText size={18} />
                    </div>
                    <span className="text-xl font-bold text-primary tracking-tight">FacturIA</span>
                </div>
                <button
                    className="p-2 rounded-full bg-white dark:bg-surface-dark shadow-sm text-text-sec-light dark:text-text-sec-dark hover:text-primary transition-colors"
                    onClick={toggleDarkMode}
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </header>

            <main className="px-5 space-y-6">
                <h1 className="text-3xl font-extrabold text-text-main-light dark:text-white">Ajustes</h1>

                {/* Profile Card */}
                <div className="relative bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
                    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="relative">
                                <Avatar
                                    name={viewingContext?.name}
                                    url={editPhoto ? URL.createObjectURL(editPhoto) : viewingContext?.photoURL}
                                    size="lg"
                                    className="transform group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-gray-700"></div>

                                {isEditing && (
                                    <label className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-lg cursor-pointer">
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setEditPhoto(e.target.files[0])} />
                                        <Edit2 size={12} className="text-gray-600" />
                                    </label>
                                )}
                            </div>

                            <div className="flex flex-col justify-center">
                                {isEditing ? (
                                    <input
                                        className="text-xl font-bold bg-transparent border-b border-primary outline-none text-gray-900 dark:text-white mb-1 w-full"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                    />
                                ) : (
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {viewingContext?.name || 'Usuario'}
                                    </h2>
                                )}

                                <p className="text-sm text-gray-500 dark:text-gray-400">{viewingContext?.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="bg-blue-50 dark:bg-blue-900/30 text-primary text-xs px-2.5 py-0.5 rounded-full font-medium border border-blue-100 dark:border-blue-800">v1.3.2</span>
                                    <span className="flex items-center text-xs text-gray-400 dark:text-gray-500 gap-1">
                                        <User size={14} />
                                        {viewingContext?.type === 'personal' ? 'Espacio Personal' : 'Espacio Compartido'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {viewingContext?.type === 'personal' && (
                            <button
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${isEditing ? 'bg-green-100 text-green-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                                onClick={() => isEditing ? onProfileSave() : setIsEditing(true)}
                            >
                                {isEditing ? <Check size={20} /> : <Settings size={20} className="animate-spin-slow" />}
                            </button>
                        )}

                        {isEditing && (
                            <button
                                onClick={onProfileCancel}
                                className="absolute top-0 right-12 w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Change Space */}
                {(sharedAccounts.length > 0 || viewingContext?.type !== 'personal') && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <ArrowRightLeft size={20} className="text-gray-400" />
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Cambiar Espacio</h3>
                        </div>

                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700/50">
                            {viewingContext?.type !== 'personal' && (
                                <button
                                    onClick={handleSwitchToPersonal}
                                    className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group first:rounded-t-2xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><User size={16} /></div>
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">Volver a mi cuenta</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">Personal</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
                                </button>
                            )}

                            {sharedAccounts.map(acc => (
                                <button
                                    key={acc.id}
                                    onClick={() => handleSwitchAccount(acc)}
                                    className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group last:rounded-b-2xl"
                                >
                                    <div className="flex items-center gap-2">
                                        {viewingContext?.email === acc.ownerEmail && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{acc.ownerName || acc.ownerEmail}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">Propietario</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Export Report */}
                <button
                    onClick={() => setShowExportModal(true)}
                    className="w-full bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 flex items-center gap-4 group hover:border-primary/30 transition-all duration-300"
                >
                    <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                        <Download size={24} />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">Exportar Reporte</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Descarga tus movimientos en PDF/Excel</p>
                    </div>
                    <ArrowRight className="text-gray-300 group-hover:text-primary" />
                </button>

                {/* Add Collaborator */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <UserPlus className="text-primary" size={24} />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Agregar Colaborador</h3>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <input
                                className="peer w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-transparent transition-all outline-none"
                                id="email"
                                placeholder="email@amigo.com"
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                            />
                            <label
                                className="absolute left-4 -top-2.5 bg-white dark:bg-surface-dark px-1 text-xs text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary"
                                htmlFor="email"
                            >
                                email@amigo.com
                            </label>
                        </div>

                        <button
                            onClick={() => { handleInviteCollaborator(inviteEmail); setInviteEmail(''); }}
                            disabled={!inviteEmail}
                            className="w-full bg-primary hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <span>Invitar</span>
                            <Send size={18} />
                        </button>
                        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-1">
                            Podrá ver y descargar tus facturas, pero no editarlas.
                        </p>

                        {myCollaborators && myCollaborators.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3 text-xs uppercase tracking-wider">Accesos Concedidos</h4>
                                <div className="space-y-2">
                                    {myCollaborators.map(collab => (
                                        <div key={collab.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400"><User size={14} /></div>
                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{collab.collaboratorEmail}</span>
                                            </div>
                                            <button onClick={() => handleRevokeAccess(collab.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Revocar acceso">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* My Companies */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <Building2 className="text-gray-400" size={24} />
                            <h3 className="font-semibold text-gray-900 dark:text-white">Mis Empresas</h3>
                        </div>
                        <button
                            onClick={() => setShowAddCompany(!showAddCompany)}
                            className="text-primary text-sm font-semibold bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors flex items-center gap-1"
                        >
                            <Plus size={16} /> {showAddCompany ? 'Cancelar' : 'Nueva'}
                        </button>
                    </div>

                    {showAddCompany && (
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-indigo-100 dark:border-indigo-900 animate-fade-in">
                            <form onSubmit={handleAddCompanySubmit} className="space-y-3">
                                <input
                                    placeholder="Nombre Empresa"
                                    value={newCompany.name}
                                    onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary"
                                />
                                <input
                                    placeholder="RNC"
                                    value={newCompany.rnc}
                                    onChange={e => setNewCompany({ ...newCompany, rnc: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary"
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-xl font-medium shadow-lg shadow-blue-500/30">
                                        {editingCompanyId ? 'Actualizar' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-3">
                        {userCompanies.map(company => (
                            <div key={company.id} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-gray-100 dark:border-gray-700 group hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-white text-lg">{company.name}</h4>
                                        <div className="mt-1 flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded w-fit">
                                            <span>RNC:</span>
                                            <span>{company.rnc}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEditCompanyClick(company)} className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                            <Edit2 size={20} />
                                        </button>
                                        <button onClick={() => onDeleteCompany(company.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>



                {/* Sign Out Button */}
                <button
                    onClick={onSignOut}
                    className="w-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                    Cerrar Sesión
                </button>

            </main>

            <ExportReportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                invoices={invoices}
                userProfile={viewingContext}
                companyName={viewingContext?.name || "Usuario"}
            />
        </div>
    );
};

export default SettingsView;

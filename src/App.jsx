import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import {
  Camera,
  Upload,
  FileText,
  Home,
  PieChart,
  Settings,
  LogOut,
  Check,
  Users,
  Loader2,
  Download,
  TrendingUp,
  Search,
  UserPlus,
  ArrowRightLeft,
  Briefcase,
  User,
  Edit2,
  Calendar,
  ChevronDown,
  Infinity,
  Save,
  X as XIcon,
  ImageIcon,
  DollarSign,
  BarChart2,
  CreditCard,
  ChevronRight,
  AlertTriangle,
  Eye,
  Keyboard,
  AlertCircle,
  Trash2,
  Shield,
  Building2,
  Phone,
  MapPin,
  ChevronLeft,
  Hash, Store, LayoutGrid, ArrowLeft, HelpCircle, Layout, Info, UserCircle
} from 'lucide-react';

import { scanQRCode } from './utils/qrScanner';
import SettingsView from './components/SettingsView';
import StatsView from './components/StatsView';
import WelcomeView from './components/WelcomeView';
import RegisterView from './components/RegisterView';
import LoginView from './components/LoginView';

/**
 * CONFIGURACIÓN Y CREDENCIALES
 */
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Inicialización de Servicios
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- UTILIDADES ---

const COLORS = {
  primary: '#4E73DF',
  secondary: '#1CC88A',
  bg: '#F8F9FC',
  text: '#5A5C69',
  white: '#FFFFFF',
  danger: '#e74a3b',
  chart: ['#4E73DF', '#1CC88A', '#36B9CC', '#F6C23E', '#E74A3B', '#858796']
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const normalizeDate = (dateStr) => {
  if (!dateStr) return '';
  // Convertir DD/MM/YYYY o DD/MM/YY a YYYY-MM-DD
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      let year = parts[2];
      // Manejar años de 2 dígitos (ej: 25 -> 2025)
      if (year.length === 2) {
        year = `20${year}`;
      }
      // Asegurar mes y día de 2 dígitos
      const month = parts[1].padStart(2, '0');
      const day = parts[0].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  return dateStr;
};

// --- COMPONENTES UI ---

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false, icon: Icon }) => {
  const baseStyle = "flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200 transform active:scale-95 shadow-sm";
  const variants = {
    primary: `bg-[${COLORS.primary}] text-white hover:bg-blue-700`,
    secondary: `bg-[${COLORS.secondary}] text-white hover:bg-green-600`,
    outline: "border-2 border-gray-300 text-gray-600 hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "text-gray-500 hover:bg-gray-100 shadow-none",
    success: "bg-green-500 text-white hover:bg-green-600"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={variant === 'primary' ? { backgroundColor: COLORS.primary } : variant === 'secondary' ? { backgroundColor: COLORS.secondary } : {}}
    >
      {Icon && <Icon size={20} className="mr-2" />}
      {children}
    </button>
  );
};

const TabSwitch = ({ activeTab, onTabChange, tabs }) => (
  <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
          ? `bg-${tab.color}-500 text-white shadow-md`
          : 'text-gray-500 hover:text-gray-700'
          }`}
        style={activeTab === tab.id ? { backgroundColor: tab.color === 'blue' ? COLORS.primary : tab.color === 'green' ? '#10B981' : '#6B7280' } : {}}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

const Input = ({ label, type = "text", value, onChange, placeholder, name, readOnly = false, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${readOnly ? 'bg-gray-100 text-gray-500' : 'bg-white'} ${type === 'date' ? 'appearance-none' : ''}`}
        {...props}
      />
      {/* Icono de calendario eliminado para evitar duplicidad con el nativo del navegador */}
    </div>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className}`}>
    {children}
  </div>
);

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
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border-2 border-white shadow-sm ${className}`}>
      {name ? name[0].toUpperCase() : '?'}
    </div>
  );
};

// --- HELPER DE COMPRESIÓN ---
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a JPEG con calidad 0.7 para reducir tamaño
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const DuplicateModal = ({ duplicateData, onCancel, onViewExisting }) => {
  if (!duplicateData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-orange-50 p-6 text-center border-b border-orange-100">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 text-orange-500">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">¡Factura Duplicada!</h3>
          <p className="text-sm text-gray-500 mt-1">Ya has registrado esta factura anteriormente.</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Negocio:</span>
              <span className="font-bold text-gray-800 text-right truncate ml-2">{duplicateData.nombre_negocio}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Total:</span>
              <span className="font-bold text-gray-800">{formatCurrency(duplicateData.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">NCF:</span>
              <span className="font-mono text-gray-600">{duplicateData.ncf}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={onCancel} className="flex-1 border border-gray-200">
              Cancelar
            </Button>
            <Button onClick={() => onViewExisting(duplicateData)} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
              <Eye size={18} className="mr-2" /> Ver
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InvoiceDetailModal = ({ invoice, onClose, onEdit, onDelete }) => {
  if (!invoice) return null;

  const total = parseFloat(invoice.total || 0);
  const itbis18 = parseFloat(invoice.itbis18 || invoice.itbis || 0);
  const itbis16 = parseFloat(invoice.itbis16 || 0);
  const propina = parseFloat(invoice.propina || 0);
  const subtotal = total - itbis18 - itbis16 - propina;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Factura ${invoice.nombre_negocio}`,
          text: `Detalle de factura: ${invoice.nombre_negocio} - ${formatCurrency(total)}`,
        });
      } catch (err) { console.log('Error sharing:', err); }
    } else {
      alert("Función de compartir no soportada en este dispositivo.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300" onClick={onClose}>
      <div className="bg-white dark:bg-[#1F2937] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-fade-in ring-1 ring-white/20" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 w-full h-40 bg-gradient-to-b from-blue-50/80 to-transparent dark:from-blue-900/10 pointer-events-none"></div>

        <div className="flex justify-end p-5 relative z-10">
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm flex items-center justify-center text-gray-400 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-600 transition-all shadow-sm">
            <span className="material-icons-round text-xl">close</span>
          </button>
        </div>

        <div className="px-6 flex flex-col items-center relative z-10 -mt-4">
          <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_0_20px_rgba(79,117,227,0.15)] flex items-center justify-center text-[#4F75E3] mb-4 ring-4 ring-white dark:ring-gray-700">
            <span className="material-icons-round text-4xl">storefront</span>
          </div>
          <h3 className="text-center font-bold text-xl text-gray-900 dark:text-white leading-tight">
            {invoice.nombre_negocio}
          </h3>
          <p className="text-xs text-[#4F75E3] font-medium bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full mt-2">
            {invoice.fecha || 'Sin fecha'}
          </p>
          <div className="mt-6 mb-3 flex flex-col items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">Total Facturado</span>
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-0.5">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-gray-700/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/50 dark:bg-blue-900/20 flex items-center justify-center text-[#4F75E3]">
                    <span className="material-icons-round text-base">badge</span>
                  </div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">RNC</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">{invoice.rnc || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-gray-700/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100/50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
                    <span className="material-icons-round text-base">receipt_long</span>
                  </div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">NCF</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">{invoice.ncf || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100/50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                    <span className="material-icons-round text-base">category</span>
                  </div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Categoría</span>
                </div>
                <span className="text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-2 py-1 rounded-md">
                  {invoice.categoria || 'Otros'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">Monto Neto</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>
            {itbis18 > 0 && (
              <div className="flex justify-between items-center px-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">ITBIS (18%)</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(itbis18)}</span>
              </div>
            )}
            {itbis16 > 0 && (
              <div className="flex justify-between items-center px-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">ITBIS (16%)</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(itbis16)}</span>
              </div>
            )}
            <div className="flex justify-between items-center px-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">Propina</span>
              <span className="text-sm font-bold text-gray-400 dark:text-gray-600">{formatCurrency(propina)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <button onClick={onEdit} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all group">
              <span className="material-icons-round text-gray-400 group-hover:text-[#4F75E3] transition-colors">edit</span>
              <span className="text-[10px] font-bold text-gray-500 group-hover:text-[#4F75E3] uppercase tracking-wide">Editar</span>
            </button>
            <button onClick={onDelete} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-red-200 dark:hover:border-red-900/50 transition-all group">
              <span className="material-icons-round text-gray-400 group-hover:text-red-500 transition-colors">delete_outline</span>
              <span className="text-[10px] font-bold text-gray-500 group-hover:text-red-500 uppercase tracking-wide">Eliminar</span>
            </button>
            <button onClick={onClose} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#4F75E3] text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:bg-[#3D62CC] transition-all transform hover:-translate-y-0.5 group">
              <span className="material-icons-round text-white text-xl">check</span>
              <span className="text-[10px] font-bold text-white uppercase tracking-wide">Cerrar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoModal = ({ type = 'success', title, message, onClose }) => {
  const isError = type === 'error';
  const Icon = isError ? AlertCircle : Check;
  const colorClass = isError ? 'red' : 'green';
  const bgClass = isError ? 'bg-red-50' : 'bg-green-50';
  const textClass = isError ? 'text-red-500' : 'text-green-500';
  const borderClass = isError ? 'border-red-100' : 'border-green-100';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className={`${bgClass} p-6 text-center border-b ${borderClass}`}>
          <div className={`w-16 h-16 ${isError ? 'bg-red-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-3 ${textClass}`}>
            <Icon size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{message}</p>
        </div>

        <div className="p-6">
          <Button onClick={onClose} className={`w-full ${isError ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white shadow-lg`}>
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ onConfirm, onCancel, title = "¿Eliminar Factura?", description = "Esta acción no se puede deshacer." }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-red-50 p-6 text-center border-b border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500">
            <Trash2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>

        <div className="p-6 flex gap-3">
          <Button variant="ghost" onClick={onCancel} className="flex-1 border border-gray-200">
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200">
            Sí, Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};

const CompanyInfoModal = ({ companies, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!companies || companies.length === 0) return null;

  const currentCompany = companies[currentIndex];

  const nextCompany = () => {
    setCurrentIndex((prev) => (prev + 1) % companies.length);
  };

  const prevCompany = () => {
    setCurrentIndex((prev) => (prev - 1 + companies.length) % companies.length);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="overflow-y-auto scrollbar-hide">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-[#4E73DF] to-[#224abe] p-6 pb-8 relative overflow-hidden text-white">
            {/* Fondo decorativo */}
            <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12 pointer-events-none">
              <Building2 size={100} />
            </div>

            <div className="relative z-10">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1 flex items-center gap-2">
                <Shield size={14} /> Información de Empresa
              </h3>
              <h2 className="text-2xl font-bold leading-tight">{currentCompany.name}</h2>
            </div>

            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all backdrop-blur-sm z-50">
              <XIcon size={20} />
            </button>
          </div>

          <div className="p-6 -mt-4 bg-white rounded-t-2xl relative z-20">
            <div className="space-y-6">

              {/* RNC Feature Row */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">RNC</p>
                  <p className="text-3xl font-bold text-gray-800 tracking-tight">{currentCompany.rnc}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-100"></div>

              {/* Other Rows */}
              <div className="space-y-5">
                {currentCompany.phone && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 flex-shrink-0">
                      <Phone size={22} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Teléfono</p>
                      <p className="text-lg font-medium text-gray-800">{currentCompany.phone}</p>
                    </div>
                  </div>
                )}
                {currentCompany.address && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 flex-shrink-0">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Dirección</p>
                      <p className="text-sm font-medium text-gray-800 leading-snug">{currentCompany.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {companies.length > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <button onClick={prevCompany} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {currentIndex + 1} / {companies.length}
                </span>
                <button onClick={nextCompany} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTES EXTERNOS ---



// --- COMPONENTES LÓGICOS DE LA APP ---

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [currentView, setCurrentView] = useState('welcome');
  const [error, setError] = useState('');

  const [viewingContext, setViewingContext] = useState(null);
  const [sharedAccounts, setSharedAccounts] = useState([]);
  const [myCollaborators, setMyCollaborators] = useState([]);

  const [userCompanies, setUserCompanies] = useState([]);
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  const [currentInvoice, setCurrentInvoice] = useState({ image: null, data: null });
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    expense: { total: 0, count: 0, itbis: 0, byCategory: {} },
    income: { total: 0, count: 0, itbis: 0, byCategory: {} }
  });

  const [viewingInvoice, setViewingInvoice] = useState(null); // Lifted state for modal
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); // ID de la factura a eliminar
  const [companyToDelete, setCompanyToDelete] = useState(null); // ID de la empresa a eliminar
  const [installPrompt, setInstallPrompt] = useState(null);
  const [infoNotification, setInfoNotification] = useState(null); // {type: 'success'|'error', title: string, message: string }
  const [historyActiveTab, setHistoryActiveTab] = useState('expense');
  const [historySelectedDate, setHistorySelectedDate] = useState(new Date());
  const [historyViewMode, setHistoryViewMode] = useState('month'); // 'month' | 'all' // Lifted state for HistoryView tabs
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Detectar si ya es 'standalone' (ya instalada)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    // Detectar iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (!isStandalone) {
      window.addEventListener('beforeinstallprompt', handler);
      // Si es iOS, activamos el prompt manualmente para mostrar el banner
      if (isIOS) {
        setInstallPrompt({ isIOS: true });
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Lógica especial para iOS
    if (installPrompt.isIOS) {
      alert("Para instalar en iOS: \n1. Toca el botón 'Compartir' (cuadrado con flecha) abajo.\n2. Busca y selecciona 'Agregar a Inicio' (+).");
      return;
    }

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Ref for currentView to access it inside onAuthStateChanged without adding it to dependencies
  const currentViewRef = React.useRef(currentView);
  useEffect(() => { currentViewRef.current = currentView; }, [currentView]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {

        // 1. Fetch photo from Firestore to bypass Auth limit
        let firestorePhoto = null;
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists() && userDoc.data().photoBase64) {
            firestorePhoto = userDoc.data().photoBase64;
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }

        const personalContext = {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || 'Usuario',
          photoURL: firestorePhoto || currentUser.photoURL,
          type: 'personal'
        };
        setViewingContext(personalContext);

        // Update local user state with the correct photo
        if (firestorePhoto) {
          setUser(prev => ({ ...prev, photoURL: firestorePhoto }));
        }

        // Use ref to check current view state accurately
        const cv = currentViewRef.current;
        if (cv === 'login' || cv === 'register' || cv === 'welcome') {
          setCurrentView('dashboard');
        }

        try {
          await Promise.all([
            fetchInvoices(currentUser.uid),
            fetchCollaborations(currentUser.email),
            fetchMyCollaborators(currentUser.uid),
            fetchUserCompanies(currentUser.uid)
          ]);
        } catch (error) {
          console.error("Error loading initial data:", error);
        }

      } else {
        // Only redirect to login if we are in a protected view needed to be guarded
        // If we are in 'welcome', let it stay there.
        const cv = currentViewRef.current;
        if (cv !== 'welcome' && cv !== 'register' && cv !== 'login') {
          setCurrentView('login');
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchCollaborations = async (myEmail) => {
    try {
      const q = query(collection(db, "collaborations"), where("collaboratorEmail", "==", myEmail));
      const querySnapshot = await getDocs(q);
      const accounts = [];
      querySnapshot.forEach((doc) => {
        accounts.push({ id: doc.id, ...doc.data() });
      });
      setSharedAccounts(accounts);

    } catch (err) {
      console.error("Error fetching collaborations:", err);
    }
  };

  const fetchMyCollaborators = async (myUid) => {
    try {
      const q = query(collection(db, "collaborations"), where("ownerUid", "==", myUid));
      const querySnapshot = await getDocs(q);
      const collabs = [];
      querySnapshot.forEach((doc) => {
        collabs.push({ id: doc.id, ...doc.data() });
      });
      setMyCollaborators(collabs);
    } catch (err) {
      console.error("Error fetching my collaborators:", err);
    }
  };

  const handleSwitchAccount = async (account) => {
    setLoading(true);
    setLoadingMessage(`Cambiando al espacio de ${account.ownerName || account.ownerEmail}...`);

    const newContext = {
      uid: account.ownerUid,
      email: account.ownerEmail,
      name: account.ownerName || account.ownerEmail,
      photoURL: null,
      type: 'shared'
    };

    setViewingContext(newContext);
    await fetchInvoices(newContext.uid);
    setCurrentView('dashboard');
    setLoading(false);
    setLoadingMessage('Cargando...');
  };

  const handleSwitchToPersonal = async () => {
    setLoading(true);
    setLoadingMessage('Volviendo a tu espacio personal...');

    const personalContext = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || 'Usuario',
      photoURL: user.photoURL,
      type: 'personal'
    };
    setViewingContext(personalContext);
    await fetchInvoices(user.uid);
    setCurrentView('dashboard');
    setLoading(false);
    setLoadingMessage('Cargando...');
  };

  const handleInviteCollaborator = async (emailToInvite) => {
    if (!emailToInvite) return;
    setLoading(true);
    setLoadingMessage('Enviando invitación...');
    try {
      await addDoc(collection(db, "collaborations"), {
        ownerUid: user.uid,
        ownerEmail: user.email,
        ownerName: user.displayName || 'Usuario',
        collaboratorEmail: emailToInvite,
        createdAt: serverTimestamp()
      });
      alert(`Invitación enviada a ${emailToInvite}`);
      fetchMyCollaborators(user.uid);
    } catch (err) {
      console.error("Error inviting:", err);
      alert("Error al invitar colaborador");
    } finally {
      setLoading(false);
      setLoadingMessage('Cargando...');
    }
  };

  const handleRevokeAccess = async (collabId) => {
    if (!confirm("¿Estás seguro de que quieres revocar el acceso a este usuario?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "collaborations", collabId));
      await fetchMyCollaborators(user.uid);
    } catch (err) {
      console.error("Error revoking access:", err);
      alert("Error al revocar acceso");
    } finally {
      setLoading(false);
    }
  };

  const [notification, setNotification] = useState(null);

  const fetchUserCompanies = async (uid) => {
    try {
      // Removed orderBy to avoid missing index issues on Firestore for now
      const q = query(collection(db, "user_companies"), where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      const comps = [];
      querySnapshot.forEach((doc) => {
        comps.push({ id: doc.id, ...doc.data() });
      });
      setUserCompanies(comps);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  const handleAddCompany = async (companyData) => {
    setLoading(true);
    setLoadingMessage('Guardando empresa...');
    try {
      await addDoc(collection(db, "user_companies"), {
        userId: user.uid,
        ...companyData,
        createdAt: serverTimestamp()
      });
      await fetchUserCompanies(user.uid);
      setNotification({ type: 'success', message: 'Empresa agregada correctamente' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Error adding company:", err);
      setNotification({ type: 'error', message: 'Error al agregar empresa' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
      setLoadingMessage('Cargando...');
    }
  };

  const handleUpdateCompany = async (companyId, companyData) => {
    setLoading(true);
    setLoadingMessage('Actualizando empresa...');
    try {
      await updateDoc(doc(db, "user_companies", companyId), {
        ...companyData,
        updatedAt: serverTimestamp()
      });
      await fetchUserCompanies(user.uid);
      setNotification({ type: 'success', message: 'Empresa actualizada' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Error updating company:", err);
      setNotification({ type: 'error', message: 'Error al actualizar' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
      setLoadingMessage('Cargando...');
    }
  };

  const handleDeleteCompany = async (companyId) => {
    setCompanyToDelete(companyId);
  };

  const confirmDeleteCompany = async () => {
    if (!companyToDelete) return;
    setCompanyToDelete(null);
    setLoading(true);
    setLoadingMessage('Eliminando empresa...');
    try {
      await deleteDoc(doc(db, "user_companies", companyToDelete));
      await fetchUserCompanies(user.uid);
      setNotification({ type: 'success', message: 'Empresa eliminada' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Error deleting company:", err);
      setNotification({ type: 'error', message: 'Error al eliminar empresa' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
      setLoadingMessage('Cargando...');
    }
  };

  const handleSeedOVM = async () => {
    const targets = ["Franklin Rosario Aquino", "Didy Vanessa Encarnación"];
    const companyData = { name: "OVM Consulting", rnc: "131932037", phone: "", address: "" };
    setLoading(true);
    setLoadingMessage('Sincronizando empresas...');
    try {
      let count = 0;
      for (const account of sharedAccounts) {
        if (targets.includes(account.ownerName)) {
          const q = query(
            collection(db, "user_companies"),
            where("userId", "==", account.ownerUid),
            where("rnc", "==", companyData.rnc)
          );
          const snapshot = await getDocs(q);
          if (snapshot.empty) {
            await addDoc(collection(db, "user_companies"), {
              userId: account.ownerUid,
              ...companyData,
              createdAt: serverTimestamp()
            });
            count++;
          }
        }
      }
      setNotification({ type: 'success', message: count > 0 ? `Se agregó OVM a ${count} cuentas.` : 'Todas las cuentas ya tienen OVM.' });
      setTimeout(() => setNotification(null), 4000);
    } catch (e) {
      console.error("Error seeding OVM:", e);
      setNotification({ type: 'error', message: 'Error al sincronizar' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
      setLoadingMessage('Cargando...');
    }
  };

  const fetchInvoices = async (targetUid) => {
    try {
      // Removed orderBy to avoid index issues - sorting client-side instead
      const q = query(collection(db, "invoices"), where("userId", "==", targetUid));
      const querySnapshot = await getDocs(q);
      const docs = [];

      const newStats = {
        expense: { total: 0, count: 0, itbis: 0, byCategory: {} },
        income: { total: 0, count: 0, itbis: 0, byCategory: {} }
      };

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Default to 'expense' if type is missing (legacy data)
        const type = data.type || 'expense';
        docs.push({ id: doc.id, ...data, type });

        const amount = parseFloat(data.total || 0);

        // Calculate ITBIS - Force Number type to prevent string concatenation
        let itbis18 = parseFloat(data.itbis18);
        if (isNaN(itbis18)) itbis18 = parseFloat(data.itbis);
        if (isNaN(itbis18)) itbis18 = 0;

        const itbis16 = parseFloat(data.itbis16) || 0;
        const totalItbis = itbis18 + itbis16;

        // Update Stats
        newStats[type].total += amount;
        newStats[type].count += 1;
        newStats[type].itbis += totalItbis;

        const cat = data.categoria || 'Otros';
        if (!newStats[type].byCategory[cat]) newStats[type].byCategory[cat] = 0;
        newStats[type].byCategory[cat] += amount;
      });

      // Sort by createdAt descending client-side
      docs.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setInvoices(docs);

      // AUTO-DEPRECATION/FIX: Check for corrupted ITBIS (due to previous concatenation bug)
      // Detect anomalies where Itbis > Total, which is impossible.
      const corruptedDocs = docs.filter(d => {
        const t = parseFloat(d.total || 0);
        const i = parseFloat(d.itbis18 || d.itbis || 0) + parseFloat(d.itbis16 || 0);
        return i > t && t > 0;
      });

      if (corruptedDocs.length > 0) {
        console.log("Found corrupted docs:", corruptedDocs.length);
        corruptedDocs.forEach(async (d) => {
          try {
            console.log("Fixing doc:", d.id);
            const saneItbis = (parseFloat(d.total) - (parseFloat(d.total) / 1.18)); // Extract 18% approx
            const ref = doc(db, "invoices", d.id);
            await updateDoc(ref, {
              itbis18: saneItbis,
              itbis: saneItbis // Update legacy field too to be safe
            });
            console.log("Fixed.");
          } catch (e) {
            console.error("Error auto-fixing doc:", e);
          }
        });
        // Silent update - next fetch will show correct data
      }
      setStats(newStats);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  const exportToCSV = (filterType = 'all') => {
    if (invoices.length === 0) return;

    let dataToExport = invoices;

    // Apply Type Filter
    if (filterType !== 'all') {
      dataToExport = invoices.filter(inv => inv.type === filterType);
    }

    // Apply Date Filter (using history state)
    if (historyViewMode !== 'all') {
      dataToExport = dataToExport.filter(inv => {
        if (!inv.fecha) return false;
        const invDate = new Date(inv.fecha);
        return (
          invDate.getMonth() === historySelectedDate.getMonth() &&
          invDate.getFullYear() === historySelectedDate.getFullYear()
        );
      });
    }

    if (dataToExport.length === 0) {
      alert("No hay datos para exportar en esta vista.");
      return;
    }

    // --- SECCIÓN PRINCIPAL (CONVERTIDO A DOP) ---
    const headers = ["Tipo", "Fecha", "Nombre Negocio/Cliente", "RNC", "NCF", "Categoría", "Descripción", "Monto Neto (DOP)", "ITBIS 18% (DOP)", "ITBIS 16% (DOP)", "Propina (DOP)", "Monto Total (DOP)"];
    const rows = dataToExport.map(inv => {
      const total = parseFloat(inv.total || 0);
      const itbis18 = parseFloat(inv.itbis18 || inv.itbis || 0);
      const itbis16 = parseFloat(inv.itbis16 || 0);
      const propina = parseFloat(inv.propina || 0);
      const subtotal = total - itbis18 - itbis16 - propina;

      return [
        inv.type === 'income' ? 'Ingreso' : 'Gasto',
        inv.fecha || "",
        `"${(inv.nombre_negocio || "").replace(/"/g, '""')}"`,
        inv.rnc || "",
        inv.ncf || "",
        inv.categoria || "",
        `"${(inv.descripcion || "").replace(/"/g, '""')}"`,
        subtotal.toFixed(2),
        itbis18.toFixed(2),
        itbis16.toFixed(2),
        propina.toFixed(2),
        total.toFixed(2)
      ];
    });
    let csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    // --- SECCIÓN SECUNDARIA (SOLO USD) ---
    const usdInvoices = dataToExport.filter(inv => inv.moneda === 'USD');

    if (usdInvoices.length > 0) {
      csvContent += "\n\n"; // Espacio entre secciones
      csvContent += "DETALLE DE OPERACIONES EN DÓLARES (USD)\n";

      const usdHeaders = ["Tipo", "Fecha", "Nombre Negocio/Cliente", "RNC", "NCF", "Categoría", "Tasa de Cambio", "Monto Original (USD)", "ITBIS (USD)", "Monto Convertido Total (DOP)"];
      const usdRows = usdInvoices.map(inv => {
        const originalTotal = parseFloat(inv.original_total || 0);
        const tasa = parseFloat(inv.tasa_cambio || 0);
        const totalDop = parseFloat(inv.total || 0);

        return [
          inv.type === 'income' ? 'Ingreso' : 'Gasto',
          inv.fecha || "",
          `"${(inv.nombre_negocio || "").replace(/"/g, '""')}"`,
          inv.rnc || "",
          inv.ncf || "",
          inv.categoria || "",
          tasa.toFixed(2),
          originalTotal.toFixed(2),
          ((parseFloat(inv.itbis18 || inv.itbis || 0) + parseFloat(inv.itbis16 || 0)) / (tasa || 1)).toFixed(2),
          totalDop.toFixed(2)
        ];
      });

      csvContent += [usdHeaders.join(","), ...usdRows.map(r => r.join(","))].join("\n");
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_${viewingContext.email}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- RESIZING LOGIC START ---
  const resizeImage = (file, maxWidth = 1024) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          // Convert to Base64 (JPEG, 0.7 quality)
          resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
        };
      };
    });
  };
  // --- RESIZING LOGIC END ---

  const handleFileUpload = async (event, type = 'expense') => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoadingMessage('Procesando documento...');
      setLoading(true);

      // Resize image before processing to save tokens/costs
      const resizedBase64 = await resizeImage(file);
      const fileUrl = URL.createObjectURL(file);

      setCurrentInvoice(prev => ({ ...prev, file: fileUrl, type }));

      // New Priority Flow: QR -> Backend
      await processInvoicePriority(file, resizedBase64, type);

    } catch (error) {
      console.error("Error processing file:", error);
      setLoading(false);
      setError("Error al procesar la imagen. Inténtalo de nuevo.");
    }
  };

  const processInvoicePriority = async (originalFile, base64Image, type = 'expense') => {
    setLoading(true);
    setError('');

    // 1. TIER 1: QR CODE (e-CF)
    try {
      setLoadingMessage('Buscando código QR...');
      const qrUrl = await scanQRCode(originalFile);

      if (qrUrl) {
        console.log("QR Found:", qrUrl);
        setLoadingMessage('Consultando DGII...');
        const ecfResponse = await fetch('/api/ecf-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: qrUrl })
        });

        if (ecfResponse.ok) {
          const ecfData = await ecfResponse.json();
          // Merge with type info
          ecfData.type = type;

          await handleSuccessProcessing(ecfData, base64Image);
          return;
        } else {
          console.warn("DGII Lookup failed, falling back to Vision...");
        }
      }
    } catch (qrError) {
      console.error("QR Tier failed:", qrError);
      // Continue to Tier 2
    }

    // 2. TIER 2 & 3: VISION OCR + GEMINI (Backend)
    setLoadingMessage('Analizando con IA...');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, type }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error en el servidor');

      await handleSuccessProcessing(data, base64Image);

    } catch (err) {
      console.error("Backend Analysis Error:", err);
      // setError(`Error al procesar: ${err.message}`);
    } finally {
      if (!duplicateWarning) {
        setLoading(false);
        setLoadingMessage('Cargando...');
      }
    }
  };

  const handleSuccessProcessing = async (parsedData, base64Image) => {
    // Normalizar fecha
    if (parsedData.fecha) {
      parsedData.fecha = normalizeDate(parsedData.fecha);
    }

    // --- VALIDACIÓN DE DUPLICADOS ---
    if (parsedData.ncf) {
      setLoadingMessage('Verificando duplicados...');
      const dupQuery = query(
        collection(db, "invoices"),
        where("ncf", "==", parsedData.ncf),
        where("userId", "==", viewingContext.uid)
      );
      const dupSnapshot = await getDocs(dupQuery);

      if (!dupSnapshot.empty) {
        const existingInvoice = dupSnapshot.docs[0].data();
        existingInvoice.id = dupSnapshot.docs[0].id;
        setDuplicateWarning(existingInvoice);
        // Don't stop loading here, let the modal handle it? 
        // Actually original code stopped loading here.
        setLoading(false);
        return;
      }
    }

    setCurrentInvoice(prev => ({ ...prev, image: base64Image, data: parsedData }));
    setCurrentView('verify');
    setLoading(false);
  };



  const handleSaveInvoice = async (validatedData) => {
    setLoading(true);
    setLoadingMessage('Guardando factura...');
    try {
      if (viewingContext.type === 'shared') {
        alert("Como colaborador, solo tienes permisos de lectura.");
        setLoading(false);
        return;
      }

      // Si existe ID, es una actualización
      if (validatedData.id) {
        const invoiceRef = doc(db, "invoices", validatedData.id);
        const { id, ...dataToUpdate } = validatedData;

        await updateDoc(invoiceRef, {
          ...dataToUpdate,
          // Ensure numbers
          total: parseFloat(dataToUpdate.total || 0),
          itbis18: parseFloat(dataToUpdate.itbis18 || 0),
          itbis16: parseFloat(dataToUpdate.itbis16 || 0),
          propina: parseFloat(dataToUpdate.propina || 0),
          updatedAt: serverTimestamp()
        });
      } else {
        const docData = {
          userId: viewingContext.uid,
          ...validatedData,
          // Ensure numbers are numbers
          total: parseFloat(validatedData.total || 0),
          itbis18: parseFloat(validatedData.itbis18 || 0),
          itbis16: parseFloat(validatedData.itbis16 || 0),
          propina: parseFloat(validatedData.propina || 0),
          // Clean undefineds
          rnc: validatedData.rnc || '',
          ncf: validatedData.ncf || '',
          createdAt: serverTimestamp(),
          status: 'completed',
          type: validatedData.type || 'expense'
        };
        await addDoc(collection(db, "invoices"), docData);
      }

      await fetchInvoices(viewingContext.uid);
      if (validatedData.id) {
        setCurrentView('history');
      } else {
        setCurrentView('dashboard');
      }
      setCurrentInvoice({ image: null, data: null });
    } catch (err) {
      console.error(err);
      setError("Error al guardar la factura.");
    } finally {
      setLoading(false);
      setLoadingMessage('Cargando...');
    }
  };

  const handleDeleteInvoice = (invoiceId) => {
    setDeleteConfirmation(invoiceId);
  };

  const confirmDelete = async () => {
    const invoiceId = deleteConfirmation;
    if (!invoiceId) return;

    setDeleteConfirmation(null); // Cerrar modal
    setLoading(true);
    setLoadingMessage('Eliminando factura...');
    try {
      if (viewingContext.type === 'shared') {
        alert("Como colaborador, solo tienes permisos de lectura.");
        return;
      }

      await deleteDoc(doc(db, "invoices", invoiceId));
      await fetchInvoices(viewingContext.uid);
      setCurrentView('history');
      setCurrentInvoice({ image: null, data: null });
    } catch (err) {
      console.error("Error al eliminar factura:", err);
      setError("Error al eliminar la factura.");
    } finally {
      setLoading(false);
      setLoadingMessage('Cargando...');
    }
  };

  const handleUpdateProfile = async (newName, newPhotoFile) => {
    // Validación de archivo
    if (newPhotoFile) {
      if (!newPhotoFile.type.startsWith('image/')) {
        setInfoNotification({
          type: 'error',
          title: 'Formato no válido',
          message: 'Por favor selecciona una imagen (JPG, PNG, WEBP).'
        });
        return;
      }

      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (newPhotoFile.size > MAX_SIZE) {
        setInfoNotification({
          type: 'error',
          title: 'Imagen muy grande',
          message: 'La imagen debe pesar menos de 5MB.'
        });
        return;
      }
    }

    setLoadingMessage('Guardando datos de perfil...');
    setLoading(true);
    console.log("Iniciando actualización de perfil...");

    try {
      let photoURL = user.photoURL;
      let base64Image = null;

      if (newPhotoFile) {
        console.log("Procesando imagen (Base64)...");
        // En lugar de Firebase Storage, usamos Base64 comprimido
        base64Image = await compressImage(newPhotoFile);
        photoURL = base64Image;
        console.log("Imagen procesada a Base64");
      }

      console.log("Actualizando perfil en Auth y Firestore...");

      // 1. Update Auth (Display Name only, Photo URL is too long for Auth)
      await updateProfile(auth.currentUser, {
        displayName: newName
        // No photoURL here
      });

      // 2. Update Firestore (Photo Base64)
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        email: user.email,
        displayName: newName,
        photoBase64: base64Image || user.photoURL // Update if new, else keep existing (if stored there) - logic refinement needed below
      }, { merge: true });

      // If we didn't upload a new one, we don't want to overwrite with old URL if it was from Auth
      if (base64Image) {
        await setDoc(userRef, { photoBase64: base64Image }, { merge: true });
      }

      // Force refresh user state to ensure UI updates across the board
      const updatedUser = {
        ...user,
        displayName: newName,
        photoURL: photoURL
      };

      setUser(updatedUser);

      // Update context similarly
      setViewingContext(prev => ({
        ...prev,
        name: newName,
        photoURL: photoURL
      }));

      console.log("Perfil actualizado con éxito");

      // Feedback for user
      setInfoNotification({
        type: 'success',
        title: '¡Perfil Actualizado!',
        message: 'Tus cambios se han guardado correctamente.'
      });

    } catch (err) {
      console.error("Error updating profile:", err);
      // Usar InfoModal para mostrar el error al usuario
      setInfoNotification({
        type: 'error',
        title: 'Error de actualización',
        message: err.message || 'No se pudieron guardar los cambios. Inténtalo de nuevo.'
      });
      setError("Error al actualizar perfil: " + err.message);
    } finally {
      setLoading(false);
      setLoadingMessage('Cargando...');
    }
  };

  const handleInvoiceClick = (invoice) => {
    console.log("Editing invoice:", invoice);
    setCurrentInvoice({
      image: null,
      data: invoice,
      isEditMode: true // Explicit flag
    });
    setCurrentView('verify');
  };

  // --- VISTAS ---

  // --- AUTH LOGIC ---

  const handleLoginAction = async (email, password) => {
    setLoading(true);
    setLoadingMessage('Iniciando sesión...');
    setError('');

    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading((currentLoading) => {
        if (currentLoading) {
          setError('La conexión está tardando demasiado. Verifica tu internet.');
          return false;
        }
        return currentLoading;
      });
    }, 15000); // 15 seconds

    try {
      await signInWithEmailAndPassword(auth, email, password);
      clearTimeout(timeoutId);
      // Auth state listener will handle the successful transition
    } catch (err) {
      clearTimeout(timeoutId);
      console.error(err);
      let msg = 'Error de autenticación.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') msg = 'Credenciales incorrectas.';
      if (err.code === 'auth/user-not-found') msg = 'Usuario no encontrado.';
      if (err.code === 'auth/too-many-requests') msg = 'Demasiados intentos. Intenta más tarde.';
      setError(msg);
      setLoading(false);
    }
  };

  // --- REGISTER LOGIC ---
  const handleRegisterCustom = async (name, email, pass) => {
    if (!name || !email || !pass) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    setLoadingMessage('Creando cuenta...');
    setError('');

    try {
      // 1. Create User in Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;

      // 2. Update Profile
      await updateProfile(user, { displayName: name });

      // 3. Create User Doc in Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: name,
        createdAt: serverTimestamp(),
        photoURL: user.photoURL
      });

      // 4. Create Personal Context
      await setDoc(doc(db, "user_contexts", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        isPersonal: true
      });

      // 5. Navigate
      setViewingContext({
        uid: user.uid,
        email: user.email,
        name: name,
        photoURL: user.photoURL,
        type: 'personal'
      });

      // Navigate to dashboard
      setCurrentView('dashboard');

    } catch (err) {
      console.error("Registration error:", err);
      let msg = "Error al registrarse. Inténtalo de nuevo.";
      if (err.code === 'auth/email-already-in-use') msg = "El correo ya está registrado";
      if (err.code === 'auth/weak-password') msg = "La contraseña debe tener al menos 6 caracteres";
      setError(msg);
      throw new Error(msg); // Propagate
    } finally {
      setLoading(false);
      setLoadingMessage('Cargando...');
    }
  };




  /* Extracted HistoryView */
  const HistoryView = ({ invoices, exportToCSV, formatCurrency, setViewingInvoice, handleInvoiceClick, activeTab, setActiveTab, selectedDate, setSelectedDate, viewMode, setViewMode }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // viewingInvoice state moved to App level
    const filteredInvoices = invoices.filter(inv => {
      const term = searchTerm.toLowerCase();
      const matchesTerm = (
        (inv.nombre_negocio && inv.nombre_negocio.toLowerCase().includes(term)) ||
        (inv.ncf && inv.ncf.toLowerCase().includes(term)) ||
        (inv.rnc && inv.rnc.includes(term)) ||
        (inv.total && inv.total.toString().includes(term)) ||
        (inv.descripcion && inv.descripcion.toLowerCase().includes(term))
      );

      const matchesType = activeTab === 'all' ? true : inv.type === activeTab;

      let matchesDate = true;
      if (viewMode !== 'all') {
        if (!inv.fecha) {
          matchesDate = false;
        } else {
          const invDate = new Date(inv.fecha);
          matchesDate = (
            invDate.getMonth() === selectedDate.getMonth() &&
            invDate.getFullYear() === selectedDate.getFullYear()
          );
        }
      }

      return matchesTerm && matchesType && matchesDate;
    });

    const changeMonth = (offset) => {
      const newDate = new Date(selectedDate);
      newDate.setMonth(newDate.getMonth() + offset);
      setSelectedDate(newDate);
      setViewMode('month');
    };

    return (
      <div className="p-4 pb-24 space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Registro</h2>

          <div className="flex items-center gap-2">
            {/* Date Picker Button */}
            <div className="relative z-20">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Calendar size={14} className="mr-1" />
                <span className="capitalize">
                  {viewMode === 'all' ? 'Todo' : selectedDate.toLocaleString('es-DO', { month: 'long', year: 'numeric' })}
                </span>
                <ChevronDown size={14} />
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2">
                  <button
                    onClick={() => { setViewMode('all'); setShowDatePicker(false); }}
                    className={`w-full text-left text-xs p-2 rounded-lg mb-2 font-medium transition-colors flex items-center gap-2 ${viewMode === 'all' ? "bg-blue-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
                  >
                    <Infinity size={14} />
                    Todo el historial
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                  <div className="flex justify-between items-center mb-2 px-2 mt-2">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ChevronDown className="rotate-90" size={16} /></button>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{selectedDate.getFullYear()}</span>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ChevronDown className="-rotate-90" size={16} /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const newD = new Date(selectedDate);
                          newD.setMonth(i);
                          setSelectedDate(newD);
                          setViewMode('month');
                          setShowDatePicker(false);
                        }}
                        className={`text-xs p-2 rounded-lg transition-colors ${i === selectedDate.getMonth() && viewMode === 'month' ? "bg-blue-600 text-white font-bold" : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"}`}
                      >
                        {new Date(0, i).toLocaleString('es-DO', { month: 'short' })}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => exportToCSV(activeTab)}
              className="p-2 bg-green-50 text-green-600 rounded-lg shadow-sm hover:bg-green-100 transition-colors"
              title="Exportar a CSV"
            >
              <Download size={20} />
            </button>
          </div>
        </div>

        <TabSwitch
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'expense', label: 'Gastos', color: 'blue' },
            { id: 'income', label: 'Ingresos', color: 'green' },
            { id: 'all', label: 'Todo', color: 'gray' }
          ]}
        />

        <div className="relative shadow-sm">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input type="text" placeholder="Buscar por nombre, NCF, monto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#4E73DF] outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400" />
        </div>
        <div className="space-y-3">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white/50 rounded-xl border border-dashed"><FileText size={48} className="mx-auto mb-2 opacity-30" /><p>No se encontraron facturas.</p></div>
          ) : (
            filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-2 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><FileText size={20} /></div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white text-sm truncate max-w-[150px]">{inv.nombre_negocio || 'Desconocido'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{inv.fecha || 'Sin fecha'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${inv.type === 'income' ? 'text-green-600' : 'text-gray-800 dark:text-gray-200'}`}>
                      {inv.type === 'income' ? '+' : ''}{formatCurrency(inv.total)}
                    </p>
                    <p className="text-xs text-gray-400 font-medium mb-1">ITBIS: {formatCurrency((parseFloat(inv.itbis18 || inv.itbis || 0) + parseFloat(inv.itbis16 || 0)))}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase ${inv.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {inv.categoria || 'Otro'}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex justify-between border-t border-gray-50 pt-2 mt-1">
                  <span>NCF: {inv.ncf || 'N/A'}</span>
                  <div className="flex items-center gap-1 text-[#4E73DF] w-full justify-end mt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setViewingInvoice(inv); }}
                      className="p-1 hover:bg-blue-50 rounded-full transition-colors mr-2"
                      title="Ver Detalles"
                    >
                      <Eye size={20} />
                    </button>
                    <div onClick={(e) => { e.stopPropagation(); handleInvoiceClick(inv); }} className="flex items-center gap-1 cursor-pointer hover:underline">
                      Editar <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };


  const DashboardView = () => {
    const [activeTab, setActiveTab] = useState('expense'); // 'expense' | 'income'
    const currentStats = stats[activeTab];
    const recentInvoices = invoices
      .filter(inv => inv.type === activeTab)
      .slice(0, 3);

    return (
      <div className="p-4 pb-24 space-y-6 animate-fade-in">
        {/* Header con Contexto */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              {viewingContext?.type === 'personal' && (
                <Avatar name={viewingContext.name} url={viewingContext.photoURL} size="md" />
              )}
              Hola, {viewingContext.name.split(' ')[0]}
            </h2>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              {viewingContext?.type === 'personal' ? 'Tu espacio personal' : (
                <span className="text-orange-500 font-medium flex items-center gap-1">
                  <Briefcase size={12} /> Viendo datos de: {viewingContext.name || viewingContext.email}
                </span>
              )}
            </p>
          </div>
          <button onClick={() => setCurrentView('settings')} className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-600 dark:text-gray-300 relative hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Settings size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1">
            <TabSwitch
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={[
                { id: 'expense', label: 'GASTOS', color: 'blue' },
                { id: 'income', label: 'INGRESOS', color: 'green' }
              ]}
            />
          </div>
          {userCompanies.length > 0 && (
            <button
              onClick={() => setShowCompanyModal(true)}
              className="h-10 w-10 bg-white rounded-xl shadow-sm border border-gray-200 text-[#4E73DF] hover:bg-blue-50 flex items-center justify-center transition-all mb-4"
              title="Mis Empresas"
            >
              <Shield size={20} />
            </button>
          )}
        </div>

        {showCompanyModal && (
          <CompanyInfoModal
            companies={userCompanies}
            onClose={() => setShowCompanyModal(false)}
          />
        )}

        <Card className={`relative text-white border-none shadow-xl overflow-hidden ${activeTab === 'expense' ? 'bg-gradient-to-r from-[#4E73DF] to-[#224abe]' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}>
          {/* Fondo decorativo con iconos */}
          <div className="absolute top-[-10px] right-[-10px] opacity-10 rotate-12">
            <DollarSign size={100} />
          </div>
          <div className="absolute bottom-[-10px] left-[-10px] opacity-10 -rotate-12">
            <BarChart2 size={80} />
          </div>

          <div className="relative z-10 flex justify-between items-end">
            <div>
              <p className="text-white/80 text-xs font-medium uppercase mb-1 tracking-wider">Total {activeTab === 'expense' ? 'Gastado' : 'Ingresado'}</p>
              <h3 className="text-4xl font-bold">
                {currentStats.total > 100000
                  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact", maximumFractionDigits: 1 }).format(currentStats.total).replace('$', 'RD$')
                  : formatCurrency(currentStats.total)
                }
              </h3>
            </div>
            {/* Icono eliminado para ahorrar espacio en móvil */}
          </div>
          <div className="relative z-10 mt-6 pt-4 border-t border-white/20 flex justify-between text-sm text-white/90">
            <div className="flex items-center gap-1"><FileText size={14} /> <span>{currentStats.count} Registros</span></div>
            <div className="flex items-center gap-1"><CreditCard size={14} /> <span>ITBIS: {formatCurrency(currentStats.itbis)}</span></div>
          </div>
        </Card>

        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2"><FileText size={18} /> Recientes</h3>
          {recentInvoices.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white/60 rounded-xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText size={32} className="opacity-40" />
              </div>
              <p className="font-medium">No hay facturas aún</p>
              <p className="text-xs mt-1">¡Sube tu primera factura para comenzar!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => handleInvoiceClick(inv)}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">

                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><FileText size={20} /></div>
                    <div><p className="font-bold text-gray-800 text-sm truncate w-32">{inv.nombre_negocio || 'Desconocido'}</p><p className="text-xs text-gray-500">{inv.fecha || 'Sin fecha'}</p></div>
                  </div>
                  <div className="text-right"><p className={`font-bold ${activeTab === 'expense' ? 'text-gray-800' : 'text-green-600'}`}>{activeTab === 'income' ? '+' : ''}{formatCurrency(inv.total)}</p></div>
                </div>
              ))}
              <button onClick={() => setCurrentView('history')} className="w-full text-center text-sm text-[#4E73DF] font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors">Ver Historial Completo</button>
            </div>
          )}
        </div>
      </div>
    );
  };



  const ScanView = () => {
    const [activeTab, setActiveTab] = useState('expense');

    return (
      <div className="h-full flex flex-col p-6 animate-fade-in bg-white dark:bg-gray-900">
        {viewingContext.type === 'shared' && (
          <div className="bg-orange-100 text-orange-800 p-3 rounded-lg mb-4 text-xs text-center font-bold shadow-sm">⚠️ Estás en modo colaborador. No puedes subir facturas aquí.</div>
        )}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Capturar {activeTab === 'expense' ? 'Documento' : 'Ingreso'}</h2>

        <TabSwitch
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'expense', label: 'GASTOS', color: 'blue' },
            { id: 'income', label: 'INGRESOS', color: 'green' }
          ]}
        />

        <div className={`flex-1 flex flex-col gap-6 justify-center ${viewingContext.type === 'shared' ? 'opacity-50 pointer-events-none' : ''}`}>
          <label className={`flex flex-col items-center justify-center h-48 bg-gradient-to-br ${activeTab === 'expense' ? 'from-blue-50 to-indigo-50 border-blue-200' : 'from-green-50 to-emerald-50 border-green-200'} border-2 border-dashed rounded-2xl cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all relative overflow-hidden group`}>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                setCurrentInvoice(prev => ({ ...prev, type: activeTab }));
                handleFileUpload(e);
              }}
              className="hidden"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className={`bg-white p-4 rounded-full shadow-md mb-2 ${activeTab === 'expense' ? 'group-hover:bg-[#4E73DF]' : 'group-hover:bg-green-500'} group-hover:text-white transition-colors`}>
                <Camera size={32} className={`${activeTab === 'expense' ? 'text-[#4E73DF]' : 'text-green-500'} group-hover:text-white`} />
              </div>
              <p className="font-bold text-gray-700">Usar Cámara</p>
            </div>
          </label>

          <div className="flex items-center justify-center gap-4">
            <span className="h-px bg-gray-300 w-12"></span><span className="text-gray-400 text-sm font-medium">O subir archivo</span><span className="h-px bg-gray-300 w-12"></span>
          </div>

          <label className="flex flex-col items-center justify-center h-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-md transition-all">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setCurrentInvoice(prev => ({ ...prev, type: activeTab }));
                handleFileUpload(e);
              }}
              className="hidden"
            />
            <Upload size={28} className="text-gray-400" />
            <p className="text-gray-500 text-sm font-medium">Galería de Imágenes</p>
          </label>

          <div className="flex items-center justify-center gap-4">
            <span className="h-px bg-gray-300 w-12"></span><span className="text-gray-400 text-sm font-medium">O</span><span className="h-px bg-gray-300 w-12"></span>
          </div>

          <button
            onClick={() => {
              setCurrentInvoice({ data: { fecha: new Date().toISOString().split('T')[0] }, type: activeTab });
              setCurrentView('verify');
            }}
            className="w-full py-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
          >
            <Keyboard size={24} />
            Ingresar Manualmente
          </button>
        </div>
        <div className="mt-auto pt-6"><Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="w-full">Cancelar</Button></div>

        {/* Error Message Display */}
        {error && (
          <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
            <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {loading && <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white"><Loader2 size={50} className="animate-spin mb-4 text-white" /><p className="text-lg font-bold text-center px-4 drop-shadow-md">{loadingMessage}</p></div>}
      </div>
    );
  };

  const VerifyView = () => {
    const [formData, setFormData] = useState(() => {
      const data = currentInvoice.data || {};
      const isUSD = data.moneda === 'USD';
      return {
        ...data,
        itbis18: isUSD && data.tasa_cambio ? ((data.itbis18 || data.itbis || 0) * data.tasa_cambio).toFixed(2) : (data.itbis18 !== undefined ? data.itbis18 : data.itbis),
        itbis16: isUSD && data.tasa_cambio ? ((data.itbis16 || 0) * data.tasa_cambio).toFixed(2) : (data.itbis16 || ''),
        type: currentInvoice.type || data.type || 'expense',
        moneda: data.moneda || 'DOP',
        tasa_cambio: data.tasa_cambio || '',
        original_total: isUSD ? data.total : '',
        total: isUSD ? (data.total_dop ? parseFloat(data.total_dop).toFixed(2) : '') : (data.total || '')
      };
    });

    const [isEditing, setIsEditing] = useState(currentInvoice.isEditMode || !formData.id); // Check explicit edit flag first

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => {
        const newData = { ...prev, [name]: value };
        if (prev.moneda === 'USD' && (name === 'original_total' || name === 'tasa_cambio')) {
          const amount = parseFloat(name === 'original_total' ? value : prev.original_total) || 0;
          const rate = parseFloat(name === 'tasa_cambio' ? value : prev.tasa_cambio) || 0;
          if (amount && rate) newData.total = (amount * rate).toFixed(2);
        }
        if (name === 'moneda' && value === 'DOP') {
          newData.original_total = '';
          newData.tasa_cambio = '';
        }
        return newData;
      });
    };

    const uniqueBusinesses = [...new Set(invoices.map(inv => inv.nombre_negocio).filter(Boolean))];
    const isCaptured = !!(currentInvoice.file || currentInvoice.image);

    const handleRncBlur = () => {
      if (formData.rnc) {
        const foundInvoice = invoices.find(inv => inv.rnc === formData.rnc && inv.nombre_negocio);
        if (foundInvoice) {
          setFormData(prev => ({ ...prev, nombre_negocio: foundInvoice.nombre_negocio }));
        }
      }
    };

    const handleClose = () => {
      // Simple logic: if has ID via History likely, else Dashboard
      setCurrentView('history');
    };

    // --- VIEW MODE (NUEVO DISEÑO) ---
    if (!isEditing) {
      return (
        <InvoiceDetailModal
          invoice={formData}
          onClose={handleClose}
          onEdit={() => setIsEditing(true)}
          onDelete={() => handleDeleteInvoice(formData.id)}
        />
      );
    }

    // --- FORM VIEW (NUEVO DISEÑO) ---
    return (
      <div className="p-4 pb-24 animate-fade-in bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setCurrentView('history')} className="p-2 -ml-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editar Factura</h2>
          <button className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <HelpCircle size={24} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-1 mb-6 shadow-sm border border-gray-100 dark:border-gray-700 flex">
          {(!formData.id || formData.type === 'expense') && (
            <button
              onClick={() => !formData.id && setFormData(p => ({ ...p, type: 'expense' }))}
              disabled={!!formData.id}
              className={`flex-1 py-1.5 text-sm font-bold rounded-xl transition-all ${formData.type === 'expense' ? 'bg-[#4F46E5] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Gastos
            </button>
          )}
          {(!formData.id || formData.type === 'income') && (
            <button
              onClick={() => !formData.id && setFormData(p => ({ ...p, type: 'income' }))}
              disabled={!!formData.id}
              className={`flex-1 py-1.5 text-sm font-bold rounded-xl transition-all ${formData.type === 'income' ? 'bg-[#10B981] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Ingresos
            </button>
          )}
        </div>

        {/* Total Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-2xl opacity-50"></div>

          <div className="relative z-10">
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Monto Total</label>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">$</span>
              <input
                type="number"
                name="total"
                value={formData.total || ''}
                onChange={handleChange}
                className="w-full text-5xl font-black text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-200 dark:placeholder-gray-700"
                placeholder="0.00"
              />
            </div>

            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs text-gray-400 font-medium">Monto Neto: </span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {formatCurrency((parseFloat(formData.total || 0) - parseFloat(formData.itbis18 || formData.itbis || 0) - parseFloat(formData.itbis16 || 0) - parseFloat(formData.propina || 0)))}
                </span>
              </div>

              {/* Currency Toggle */}
              <div className="flex bg-indigo-50 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'moneda', value: 'DOP' } })}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${formData.moneda !== 'USD' ? 'bg-white text-indigo-600 shadow-sm' : 'text-indigo-400 hover:text-indigo-600'}`}
                >
                  DOP
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'moneda', value: 'USD' } })}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${formData.moneda === 'USD' ? 'bg-white text-indigo-600 shadow-sm' : 'text-indigo-400 hover:text-indigo-600'}`}
                >
                  USD
                </button>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4 pl-1">Detalles de Factura</h3>

        <div className="space-y-3">
          <datalist id="business-names">
            {uniqueBusinesses.map((name, index) => (
              <option key={index} value={name} />
            ))}
          </datalist>

          {/* RNC */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <div className="text-gray-400"><Hash size={20} /></div>
            <div className="flex-1">
              <input
                type="text"
                name="rnc"
                value={formData.rnc || ''}
                onChange={handleChange}
                onBlur={handleRncBlur}
                placeholder="RNC"
                className="w-full text-sm font-medium text-gray-900 dark:text-white bg-transparent outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* NCF */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <div className="text-gray-400"><FileText size={20} /></div>
            <div className="flex-1">
              <input
                type="text"
                name="ncf"
                value={formData.ncf || ''}
                onChange={handleChange}
                placeholder="NCF (e.g. B01...)"
                className="w-full text-sm font-medium text-gray-900 dark:text-white bg-transparent outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Business Name */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <div className="text-gray-400"><Store size={20} /></div>
            <div className="flex-1">
              <input
                type="text"
                name="nombre_negocio"
                value={formData.nombre_negocio || ''}
                onChange={handleChange}
                list="business-names"
                placeholder="Nombre del Negocio"
                className="w-full text-sm font-medium text-gray-900 dark:text-white bg-transparent outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Date & Category Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-3 flex items-center gap-2 shadow-sm">
              <div className="text-blue-500 bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-lg"><Calendar size={16} /></div>
              <input
                type="date"
                name="fecha"
                value={formData.fecha || ''}
                onChange={handleChange}
                className="w-full text-sm font-medium text-gray-700 dark:text-gray-200 outline-none bg-transparent"
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-3 flex items-center gap-2 shadow-sm relative">
              <div className="text-orange-500 bg-orange-50 dark:bg-orange-900/20 p-1.5 rounded-lg"><LayoutGrid size={16} /></div>
              <select
                name="categoria"
                value={formData.categoria || ''}
                onChange={handleChange}
                className="w-full text-sm font-medium text-gray-700 dark:text-gray-200 outline-none bg-transparent appearance-none relative z-10"
              >
                <option value="">Categoría</option>
                {formData.type === 'expense' ? (
                  <>
                    <option value="Alimentación">Alimentación</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Salud">Salud</option>
                    <option value="Combustible">Combustible</option>
                    <option value="Ocio">Ocio</option>
                    <option value="Compras">Compras</option>
                    <option value="Hogar">Hogar</option>
                    <option value="Otros">Otros</option>
                  </>
                ) : (
                  <>
                    <option value="Salario">Salario</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Inversiones">Inversiones</option>
                    <option value="Regalos">Regalos</option>
                    <option value="Otros">Otros</option>
                  </>
                )}
              </select>
              <ChevronDown size={14} className="absolute right-3 text-gray-400" />
            </div>
          </div>

          {/* Tax & Tip Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-3 flex items-center gap-2 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase">ITBIS(18%)</span>
              <input
                type="number"
                name="itbis18"
                value={formData.itbis18 !== undefined ? formData.itbis18 : ''}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full text-sm font-bold text-gray-900 dark:text-white outline-none text-right placeholder:font-normal bg-transparent"
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-3 flex items-center gap-2 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Propina</span>
              <input
                type="number"
                name="propina"
                value={formData.propina || ''}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full text-sm font-bold text-gray-900 dark:text-white outline-none text-right placeholder:font-normal bg-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
            <textarea
              name="descripcion"
              value={formData.descripcion || ''}
              onChange={handleChange}
              className="w-full text-sm text-gray-700 dark:text-gray-200 outline-none min-h-[80px] resize-none placeholder:text-gray-400 bg-transparent"
              placeholder="Descripción (Opcional)"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="fixed bottom-6 left-4 right-4 z-20">
          <button
            onClick={() => handleSaveInvoice(formData)}
            disabled={loading}
            className="w-full bg-[#4F46E5] text-white py-4 rounded-2xl shadow-xl shadow-indigo-200 font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {formData.id ? 'Guardar Cambios' : 'Guardar Factura'}
          </button>
        </div>
      </div >
    );
  };


  if (currentView === 'login') return <LoginView onLogin={handleLoginAction} onNavigate={setCurrentView} loading={loading} error={error} />;
  if (currentView === 'register') return (
    <RegisterView
      onRegister={async (e, name, email, password, redirect) => {
        if (redirect === 'login') {
          setCurrentView('login');
          return;
        }
        // Logic handled inside handling but we need to pass the registration function wrapper
        // Actually I should wrap handleRegister to match the signature or update handleRegister
        // Adapting handleRegister to accept arguments directly instead of event target
        await handleRegisterCustom(name, email, password);
      }}
      loading={loading}
    />
  );
  if (currentView === 'welcome') return <WelcomeView onNavigate={setCurrentView} installPrompt={installPrompt} onInstall={handleInstallClick} />;

  // Safety check: If we are in a protected view but viewingContext is not ready, show loader
  if (!viewingContext && currentView !== 'login' && currentView !== 'register') {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white"><Loader2 size={40} className="text-[#4E73DF] animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 font-sans text-gray-900 dark:text-gray-100 relative max-w-md mx-auto shadow-2xl flex flex-col">
      <DuplicateModal
        duplicateData={duplicateWarning}
        onCancel={() => {
          setDuplicateWarning(null);
          setLoading(false);
        }}
        onViewExisting={(data) => {
          setDuplicateWarning(null);
          handleInvoiceClick(data);
        }}
      />

      {deleteConfirmation && (
        <DeleteConfirmationModal
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}

      {companyToDelete && (
        <DeleteConfirmationModal
          title="¿Eliminar Empresa?"
          description="¿Está seguro que desea eliminar esta empresa?"
          onConfirm={confirmDeleteCompany}
          onCancel={() => setCompanyToDelete(null)}
        />
      )}

      {infoNotification && (
        <InfoModal
          type={infoNotification.type}
          title={infoNotification.title}
          message={infoNotification.message}
          onClose={() => setInfoNotification(null)}
        />
      )}

      {viewingInvoice && (
        <InvoiceDetailModal
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
          onEdit={() => {
            setViewingInvoice(null);
            handleInvoiceClick(viewingInvoice);
          }}
          onDelete={() => {
            setViewingInvoice(null);
            handleDeleteInvoice(viewingInvoice.id);
          }}
        />
      )}

      {currentView !== 'settings' && (
        <header className={`fixed top-0 left-0 right-0 max-w-md mx-auto px-4 py-4 shadow-sm z-40 flex items-center justify-between transition-colors ${viewingContext?.type === 'shared' ? 'bg-orange-50 border-b border-orange-200' : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md dark:border-b dark:border-gray-800'}`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg text-white shadow-sm ${viewingContext?.type === 'shared' ? 'bg-orange-500' : 'bg-[#4E73DF]'}`}><FileText size={18} /></div>
            <span className={`font-bold text-xl tracking-tight ${viewingContext?.type === 'shared' ? 'text-orange-600' : 'text-[#4E73DF] dark:text-blue-400'}`}>FacturIA</span>
          </div>
        </header>
      )}

      <main className={`flex-1 ${currentView !== 'settings' ? 'pt-20 pb-24' : 'pb-6'}`}>
        {currentView === 'dashboard' && <DashboardView />}

        {currentView === 'history' && <HistoryView
          invoices={invoices}
          exportToCSV={exportToCSV}
          formatCurrency={formatCurrency}
          setViewingInvoice={setViewingInvoice}
          handleInvoiceClick={handleInvoiceClick}
          activeTab={historyActiveTab}
          setActiveTab={setHistoryActiveTab}
          selectedDate={historySelectedDate}
          setSelectedDate={setHistorySelectedDate}
          viewMode={historyViewMode}
          setViewMode={setHistoryViewMode}
        />}
        {currentView === 'stats' && <StatsView invoices={invoices} />}
        {currentView === 'scan' && <ScanView />}
        {currentView === 'verify' && <VerifyView />}
        {currentView === 'settings' && <SettingsView
          viewingContext={viewingContext}
          sharedAccounts={sharedAccounts}
          handleSwitchAccount={handleSwitchAccount}
          handleSwitchToPersonal={handleSwitchToPersonal}
          exportToCSV={() => exportToCSV('all')}
          handleInviteCollaborator={handleInviteCollaborator}
          onSignOut={() => { signOut(auth); setCurrentView('login'); }}
          onUpdateProfile={handleUpdateProfile}
          installPrompt={installPrompt}
          onInstall={handleInstallClick}
          myCollaborators={myCollaborators}
          handleRevokeAccess={handleRevokeAccess}
          userCompanies={userCompanies}
          onAddCompany={handleAddCompany}
          onDeleteCompany={handleDeleteCompany}
          onUpdateCompany={handleUpdateCompany}
          onSeedOVM={handleSeedOVM}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />}
      </main>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 left-4 right-4 z-[100] p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-down ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
          {notification.type === 'error' ? <AlertCircle size={24} /> : <Check size={24} />}
          <p className="font-bold text-sm">{notification.message}</p>
        </div>
      )}

      {/* Floating Install Banner */}
      {installPrompt && !localStorage.getItem('pwa_dismissed') && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-50 animate-slide-up flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-[#4E73DF] p-2 rounded-lg text-white"><Download size={24} /></div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">Instalar FacturIA</p>
              <p className="text-xs text-gray-500">Agrega la app a tu inicio para un acceso más rápido y uso sin conexión.</p>
            </div>
            <button onClick={() => { setInstallPrompt(null); localStorage.setItem('pwa_dismissed', 'true'); }} className="text-gray-400 p-2"><XIcon size={20} /></button>
          </div>
          <Button onClick={handleInstallClick} className="w-full shadow-lg bg-[#4E73DF]">Instalar Ahora</Button>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 flex justify-between items-center z-40 pb-safe">
        <button onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentView === 'dashboard' ? 'text-[#4E73DF] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <Home size={22} /><span className="text-[10px] font-bold mt-1">Inicio</span>
        </button>
        <button onClick={() => setCurrentView('history')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentView === 'history' ? 'text-[#4E73DF] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <Search size={22} /><span className="text-[10px] font-bold mt-1">Buscar</span>
        </button>
        <button onClick={() => setCurrentView('scan')} className={`flex flex-col items-center justify-center -mt-8 text-white rounded-full w-14 h-14 shadow-lg ring-4 ring-[#F8F9FC] dark:ring-gray-900 active:scale-95 transition-transform bg-gradient-to-r from-[#4E73DF] to-[#224abe] hover:shadow-xl ${viewingContext?.type === 'shared' ? 'from-orange-400 to-orange-500 opacity-50 cursor-not-allowed' : ''}`}>
          <Camera size={24} />
        </button>
        <button onClick={() => setCurrentView('stats')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentView === 'stats' ? 'text-[#4E73DF] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <PieChart size={22} /><span className="text-[10px] font-bold mt-1">Stats</span>
        </button>
        <button onClick={() => setCurrentView('settings')} className={`flex flex-col items-center p-2 rounded-xl transition-all relative ${currentView === 'settings' ? 'text-[#4E73DF] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <Settings size={22} /><span className="text-[10px] font-bold mt-1">Ajustes</span>
        </button>
      </nav>

      {/* Global Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-white animate-fade-in">
          <Loader2 size={50} className="animate-spin mb-4 text-white" />
          <p className="text-lg font-bold text-center px-4 drop-shadow-md">{loadingMessage || 'Cargando...'}</p>
        </div>
      )}
    </div>
  );
}

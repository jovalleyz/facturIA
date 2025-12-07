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
  doc
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
  Save,
  X as XIcon,
  ImageIcon,
  DollarSign,
  BarChart2,
  CreditCard,
  ChevronRight,
  AlertTriangle,
  Eye
} from 'lucide-react';

/**
 * CONFIGURACIÓN Y CREDENCIALES
 * Para producción en Vercel, usar variables de entorno.
 * En este entorno de prototipo, usamos la clave directa o un fallback seguro.
 */
// Ajuste para evitar error de compilación con import.meta en entorno ES2015
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
    ghost: "text-gray-500 hover:bg-gray-100 shadow-none"
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

const Input = ({ label, type = "text", value, onChange, placeholder, name, readOnly = false }) => (
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
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-lg",
    lg: "w-20 h-20 text-2xl",
    xl: "w-24 h-24 text-3xl"
  };

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm ${className}`}
        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border-2 border-white shadow-sm ${className}`}>
      {name ? name[0].toUpperCase() : '?'}
    </div>
  );
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

// --- COMPONENTES EXTERNOS ---

const SettingsView = ({
  viewingContext,
  sharedAccounts,
  handleSwitchAccount,
  handleSwitchToPersonal,
  exportToCSV,
  handleInviteCollaborator,
  onSignOut,
  onUpdateProfile,
  installPrompt,
  onInstall
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(viewingContext.name || '');
  const [editPhoto, setEditPhoto] = useState(null);

  useEffect(() => {
    setEditName(viewingContext.name || '');
  }, [viewingContext.name]);

  const onProfileSave = async () => {
    if (viewingContext.type === 'shared') return;
    await onUpdateProfile(editName, editPhoto);
    setIsEditing(false);
    setEditPhoto(null);
  };

  return (
    <div className="p-4 pb-24 animate-fade-in bg-gradient-to-b from-blue-50/50 to-white min-h-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Ajustes</h2>

      <Card className="mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Settings size={80} />
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <Avatar
              name={viewingContext.name}
              url={editPhoto ? URL.createObjectURL(editPhoto) : viewingContext.photoURL}
              size="lg"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-gray-200 cursor-pointer text-[#4E73DF] hover:bg-gray-50 transition-colors">
                <ImageIcon size={16} />
                <input type="file" accept="image/*" onChange={(e) => setEditPhoto(e.target.files[0])} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Tu nombre"
                />
              </div>
            ) : (
              <>
                <p className="font-bold text-gray-900 text-lg truncate">{viewingContext.name}</p>
                <p className="text-xs text-gray-500">{viewingContext.email}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide flex items-center gap-1">
                  {viewingContext.type === 'personal' ? (
                    <><User size={10} /> Espacio Personal</>
                  ) : (
                    <><Users size={10} /> Espacio Colaborativo</>
                  )}
                </p>
              </>
            )}
          </div>

          {viewingContext.type === 'personal' && (
            <div className="flex gap-1">
              <button
                onClick={() => isEditing ? onProfileSave() : setIsEditing(true)}
                className={`p-2 rounded-full transition-colors ${isEditing ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                {isEditing ? <Save size={20} /> : <Edit2 size={18} />}
              </button>
              {isEditing && (
                <button
                  onClick={() => { setIsEditing(false); setEditName(viewingContext.name || ''); setEditPhoto(null); }}
                  className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                >
                  <XIcon size={20} />
                </button>
              )}
            </div>
          )}
        </div>
      </Card>

      {sharedAccounts.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-2 text-sm flex items-center gap-2"><ArrowRightLeft size={16} /> Cambiar Espacio</h3>
          <div className="space-y-2">
            {viewingContext.type !== 'personal' && (
              <button onClick={handleSwitchToPersonal} className="w-full p-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 flex items-center justify-between shadow-sm">
                <span className="text-sm font-medium">Volver a mi cuenta</span>
                <Check size={16} />
              </button>
            )}
            {sharedAccounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => handleSwitchAccount(acc)}
                className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all ${viewingContext.email === acc.ownerEmail ? 'border-orange-200 bg-orange-50 text-orange-700 shadow-sm' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
              >
                <div className="text-left">
                  <p className="text-sm font-bold">{acc.ownerName || acc.ownerEmail}</p>
                  <p className="text-[10px] text-gray-500">Propietario</p>
                </div>
                {viewingContext.email === acc.ownerEmail && <Check size={16} />}
              </button>
            ))}
          </div>
        </div>
      )}



      {installPrompt && (
        <button onClick={onInstall} className="w-full bg-blue-600 text-white p-4 rounded-xl flex items-center justify-between mb-4 shadow-lg hover:bg-blue-700 transition-colors group animate-pulse">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg"><Download size={20} /></div>
            <div className="text-left">
              <p className="font-bold text-sm">Instalar Aplicación</p>
              <p className="text-[10px] text-blue-100">Accede más rápido desde tu inicio</p>
            </div>
          </div>
        </button>
      )}

      <button onClick={exportToCSV} className="w-full bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between mb-4 shadow-sm hover:bg-gray-50 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="bg-green-50 text-green-600 p-2 rounded-lg group-hover:scale-110 transition-transform"><Download size={20} /></div>
          <div className="text-left"><p className="font-bold text-gray-800 text-sm">Exportar Reporte</p></div>
        </div>
      </button>

      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm"><UserPlus size={16} /> Agregar Colaborador</h3>
        <div className="flex gap-2">
          <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@amigo.com" className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
          <button onClick={() => { handleInviteCollaborator(inviteEmail); setInviteEmail(''); }} className="bg-blue-600 text-white rounded-lg px-4 py-2 text-xs font-medium hover:bg-blue-700 transition-colors">Invitar</button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2">Podrá ver y descargar tus facturas, pero no editarlas.</p>
      </div>

      <div className="mt-8"><Button variant="danger" onClick={onSignOut} className="w-full"><LogOut size={18} className="mr-2" /> Cerrar Sesión</Button></div>
    </div>
  );
};

// --- COMPONENTES LÓGICOS DE LA APP ---

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Cargando...');
  const [currentView, setCurrentView] = useState('login');
  const [error, setError] = useState('');

  const [viewingContext, setViewingContext] = useState(null);
  const [sharedAccounts, setSharedAccounts] = useState([]);
  const [newCollabNotification, setNewCollabNotification] = useState(false);

  const [currentInvoice, setCurrentInvoice] = useState({ image: null, data: null });
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0, itbis: 0, byCategory: {} });

  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const personalContext = {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || 'Usuario',
          photoURL: currentUser.photoURL,
          type: 'personal'
        };
        setViewingContext(personalContext);

        if (currentView === 'login' || currentView === 'register') {
          setCurrentView('dashboard');
        }

        await Promise.all([
          fetchInvoices(currentUser.uid),
          fetchCollaborations(currentUser.email)
        ]);

      } else {
        setCurrentView('login');
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
      if (accounts.length > 0) {
        setNewCollabNotification(true);
        setTimeout(() => setNewCollabNotification(false), 5000);
      }
    } catch (err) {
      console.error("Error fetching collaborations:", err);
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
    } catch (err) {
      console.error("Error inviting:", err);
      alert("Error al invitar colaborador");
    } finally {
      setLoading(false);
      setLoadingMessage('Cargando...');
    }
  };

  const fetchInvoices = async (targetUid) => {
    try {
      const q = query(collection(db, "invoices"), where("userId", "==", targetUid), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const docs = [];
      let totalAmount = 0;
      let totalItbis = 0;
      const categoryMap = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        docs.push({ id: doc.id, ...data });

        const amount = parseFloat(data.total || 0);
        totalAmount += amount;
        totalItbis += parseFloat(data.itbis || 0);

        const cat = data.categoria || 'Otros';
        if (!categoryMap[cat]) categoryMap[cat] = 0;
        categoryMap[cat] += amount;
      });

      setInvoices(docs);
      setStats({
        total: totalAmount,
        count: docs.length,
        itbis: totalItbis,
        byCategory: categoryMap
      });
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  const exportToCSV = () => {
    if (invoices.length === 0) return;
    const headers = ["Fecha", "Nombre Negocio", "RNC", "NCF", "Categoría", "Monto Neto", "ITBIS", "Propina", "Monto Total"];
    const rows = invoices.map(inv => {
      const total = parseFloat(inv.total || 0);
      const itbis = parseFloat(inv.itbis || 0);
      const propina = parseFloat(inv.propina || 0);
      const subtotal = total - itbis - propina;

      return [
        inv.fecha || "",
        `"${(inv.nombre_negocio || "").replace(/"/g, '""')}"`, // Escapar comillas dobles
        inv.rnc || "",
        inv.ncf || "",
        inv.categoria || "",
        subtotal.toFixed(2),
        itbis.toFixed(2),
        propina.toFixed(2),
        total.toFixed(2)
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_${viewingContext.email}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processImageWithGemini = async (base64Image) => {
    setLoading(true);
    setError('');
    setLoadingMessage('La IA está leyendo tu factura...');

    // Prompt actualizado para pedir fecha en formato correcto YYYY-MM-DD
    const prompt = `Analiza esta factura dominicana. JSON puro: rnc, ncf, fecha (YYYY-MM-DD o YYYY/MM/DD), nombre_negocio, total (número), itbis (número), propina (número), categoria.`;

    const fetchWithRetry = async (retries = 3, delay = 1000) => {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: base64Image } }] }]
          })
        });

        if (response.status === 503 && retries > 0) {
          setLoadingMessage(`Servidores ocupados (${retries})...`);
          await wait(delay);
          return fetchWithRetry(retries - 1, delay * 2);
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || response.statusText);
        return data;
      } catch (err) {
        if (retries > 0) { await wait(delay); return fetchWithRetry(retries - 1, delay * 2); }
        throw err;
      }
    };

    try {
      const data = await fetchWithRetry();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) throw new Error("La IA no pudo leer la imagen.");

      const cleanJson = textResponse.replace(/```json|```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);

      // Normalizar fecha si la IA devuelve DD/MM/AAAA por error
      if (parsedData.fecha) {
        parsedData.fecha = normalizeDate(parsedData.fecha);
      }

      // --- VALIDACIÓN DE DUPLICADOS ---
      if (parsedData.ncf) {
        setLoadingMessage('Verificando duplicados...');
        // Buscar si ya existe este NCF en las facturas del usuario actual
        const dupQuery = query(
          collection(db, "invoices"),
          where("ncf", "==", parsedData.ncf),
          where("userId", "==", viewingContext.uid)
        );
        const dupSnapshot = await getDocs(dupQuery);

        if (!dupSnapshot.empty) {
          // Si encontramos duplicado, guardamos los datos y mostramos el modal
          const existingInvoice = dupSnapshot.docs[0].data();
          existingInvoice.id = dupSnapshot.docs[0].id;

          setDuplicateWarning(existingInvoice);
          setLoading(false); // Parar loading
          return; // Detener flujo
        }
      }

      setCurrentInvoice({ image: base64Image, data: parsedData });
      setCurrentView('verify');
    } catch (err) {
      console.error("Gemini Final Error:", err);
      setError("No se pudo procesar la factura. Intenta nuevamente.");
    } finally {
      // Solo quitamos el loading si NO encontramos un duplicado (porque el modal se encarga)
      if (!duplicateWarning) {
        setLoading(false);
        setLoadingMessage('Cargando...');
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setLoadingMessage('Procesando imagen...');

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      processImageWithGemini(base64);
    };
    reader.readAsDataURL(file);
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
          updatedAt: serverTimestamp()
        });
      } else {
        const docData = {
          userId: viewingContext.uid,
          ...validatedData,
          createdAt: serverTimestamp(),
          status: 'completed'
        };
        await addDoc(collection(db, "invoices"), docData);
      }

      await fetchInvoices(viewingContext.uid);
      setCurrentView('dashboard');
      setCurrentInvoice({ image: null, data: null });
    } catch (err) {
      console.error(err);
      setError("Error al guardar la factura.");
    } finally {
      setLoading(false);
      setLoadingMessage('Cargando...');
    }
  };

  const handleUpdateProfile = async (newName, newPhotoFile) => {
    setLoading(true);
    setLoadingMessage('Actualizando perfil...');
    try {
      let photoURL = user.photoURL;

      if (newPhotoFile) {
        const storageRef = ref(storage, `profile_images/${user.uid}`);
        await uploadBytes(storageRef, newPhotoFile);
        const url = await getDownloadURL(storageRef);
        photoURL = `${url}?t=${Date.now()}`;
      }

      await updateProfile(auth.currentUser, {
        displayName: newName,
        photoURL: photoURL
      });

      const updatedUser = { ...user, displayName: newName, photoURL: photoURL };
      setUser(updatedUser);
      setViewingContext({
        ...viewingContext,
        name: newName,
        photoURL: photoURL
      });

    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Error al actualizar perfil");
    } finally {
      setLoading(false);
      setLoadingMessage('Cargando...');
    }
  };

  const handleInvoiceClick = (invoice) => {
    setCurrentInvoice({
      image: null,
      data: invoice
    });
    setCurrentView('verify');
  };

  // --- VISTAS ---

  const LoginView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      setLoadingMessage('Iniciando sesión...');
      setError('');
      try { await signInWithEmailAndPassword(auth, email, password); }
      catch (err) { setError('Error de autenticación.'); setLoading(false); }
    };
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="w-full max-w-md text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#4E73DF] mb-4 shadow-lg text-white">
            <FileText size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FacturIA</h1>
          <p className="text-gray-500 mb-8">Gestión inteligente de gastos</p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <Input label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
            <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Iniciar Sesión'}</Button>
          </form>
          <div className="mt-6"><button onClick={() => setCurrentView('register')} className="text-[#4E73DF] font-medium hover:underline">Registrarse</button></div>
        </div>
      </div>
    );
  };

  const RegisterView = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const handleRegister = async (e) => {
      e.preventDefault();
      if (password !== confirm) return setError("Las contraseñas no coinciden");
      setLoading(true);
      setLoadingMessage('Creando cuenta...');
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        setCurrentView('welcome');
      }
      catch (err) { setError(err.message); setLoading(false); }
    };
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Crear Cuenta</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <Input label="Nombre Completo" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Juan Pérez" />
            <Input label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input label="Confirmar" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full shadow-lg" disabled={loading}>Registrarse</Button>
          </form>
          <div className="mt-6 text-center"><button onClick={() => setCurrentView('login')} className="text-[#4E73DF]">Volver al Login</button></div>
        </div>
      </div>
    );
  };

  const WelcomeView = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#4E73DF] to-[#224abe] text-white text-center">
      <div className="bg-white/20 p-6 rounded-full mb-8 backdrop-blur-sm shadow-2xl"><Check size={48} className="text-white" /></div>
      <h1 className="text-4xl font-bold mb-4">¡Bienvenido!</h1>
      <p className="text-lg text-blue-100 mb-10 max-w-xs">Tu asistente financiero personal con IA.</p>
      <button onClick={() => setCurrentView('dashboard')} className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all w-full max-w-xs">Comenzar</button>
    </div>
  );

  const HistoryView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredInvoices = invoices.filter(inv => {
      const term = searchTerm.toLowerCase();
      return (
        (inv.nombre_negocio && inv.nombre_negocio.toLowerCase().includes(term)) ||
        (inv.ncf && inv.ncf.toLowerCase().includes(term)) ||
        (inv.rnc && inv.rnc.includes(term)) ||
        (inv.total && inv.total.toString().includes(term))
      );
    });

    return (
      <div className="p-4 pb-24 space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Registro de Facturas</h2>
          <button
            onClick={exportToCSV}
            className="p-2 bg-green-50 text-green-600 rounded-lg shadow-sm hover:bg-green-100 transition-colors"
            title="Exportar a CSV"
          >
            <Download size={20} />
          </button>
        </div>
        <div className="relative shadow-sm">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input type="text" placeholder="Buscar por nombre, NCF, monto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4E73DF] outline-none transition-all" />
        </div>
        <div className="space-y-3">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white/50 rounded-xl border border-dashed"><FileText size={48} className="mx-auto mb-2 opacity-30" /><p>No se encontraron facturas.</p></div>
          ) : (
            filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => handleInvoiceClick(inv)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><FileText size={20} /></div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm truncate max-w-[150px]">{inv.nombre_negocio || 'Desconocido'}</p>
                      <p className="text-xs text-gray-500">{inv.fecha || 'Sin fecha'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{formatCurrency(inv.total)}</p>
                    <p className="text-[10px] text-gray-400 font-medium mb-1">ITBIS: {formatCurrency(inv.itbis || 0)}</p>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 uppercase">{inv.categoria || 'Otro'}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex justify-between border-t border-gray-50 pt-2 mt-1">
                  <span>NCF: {inv.ncf || 'N/A'}</span>
                  <div className="flex items-center gap-1 text-[#4E73DF]">Editar <ChevronRight size={12} /></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const DashboardView = () => (
    <div className="p-4 pb-24 space-y-6 animate-fade-in">
      {/* Header con Contexto */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {viewingContext?.type === 'personal' && (
              <Avatar name={viewingContext.name} url={viewingContext.photoURL} size="sm" />
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
        <button onClick={() => setCurrentView('settings')} className="p-2 bg-white rounded-full shadow-sm text-gray-600 relative hover:bg-gray-50 transition-colors">
          <Settings size={20} />
          {newCollabNotification && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
        </button>
      </div>

      <Card className={`relative text-white border-none shadow-xl overflow-hidden ${viewingContext?.type === 'personal' ? 'bg-gradient-to-r from-[#4E73DF] to-[#224abe]' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
        {/* Fondo decorativo con iconos */}
        <div className="absolute top-[-10px] right-[-10px] opacity-10 rotate-12">
          <DollarSign size={100} />
        </div>
        <div className="absolute bottom-[-10px] left-[-10px] opacity-10 -rotate-12">
          <BarChart2 size={80} />
        </div>

        <div className="relative z-10 flex justify-between items-end">
          <div><p className="text-white/80 text-xs font-medium uppercase mb-1 tracking-wider">Total Gastado</p><h3 className="text-4xl font-bold">{formatCurrency(stats.total)}</h3></div>
          <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md border border-white/10"><TrendingUp size={28} className="text-white" /></div>
        </div>
        <div className="relative z-10 mt-6 pt-4 border-t border-white/20 flex justify-between text-sm text-white/90">
          <div className="flex items-center gap-1"><FileText size={14} /> <span>{stats.count} Facturas</span></div>
          <div className="flex items-center gap-1"><CreditCard size={14} /> <span>ITBIS: {formatCurrency(stats.itbis)}</span></div>
        </div>
      </Card>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><FileText size={18} /> Recientes</h3>
        {invoices.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white/60 rounded-xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText size={32} className="opacity-40" />
            </div>
            <p className="font-medium">No hay facturas aún</p>
            <p className="text-xs mt-1">¡Sube tu primera factura para comenzar!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.slice(0, 3).map((inv) => (
              <div
                key={inv.id}
                onClick={() => handleInvoiceClick(inv)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><FileText size={20} /></div>
                  <div><p className="font-bold text-gray-800 text-sm truncate w-32">{inv.nombre_negocio || 'Desconocido'}</p><p className="text-xs text-gray-500">{inv.fecha || 'Sin fecha'}</p></div>
                </div>
                <div className="text-right"><p className="font-bold text-gray-800">{formatCurrency(inv.total)}</p></div>
              </div>
            ))}
            <button onClick={() => setCurrentView('history')} className="w-full text-center text-sm text-[#4E73DF] font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors">Ver Historial Completo</button>
          </div>
        )}
      </div>
    </div>
  );

  const StatsView = () => {
    const sortedCategories = Object.entries(stats.byCategory).sort(([, a], [, b]) => b - a);
    return (
      <div className="p-4 pb-24 space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-900">Estadísticas</h2>
        <Card className="border-t-4 border-t-[#4E73DF]">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><PieChart size={18} /> Por Categoría</h3>
          {sortedCategories.length === 0 ? <p className="text-gray-400 text-center py-8">Sin datos suficientes para mostrar gráficos.</p> : (
            <div className="space-y-4">
              {sortedCategories.map(([cat, amount], index) => {
                const percentage = (amount / stats.total) * 100;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-700">{cat}</span><span className="text-gray-500 font-medium">{formatCurrency(amount)} ({percentage.toFixed(0)}%)</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner"><div className="h-3 rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: COLORS.chart[index % COLORS.chart.length] }}></div></div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    );
  };

  const ScanView = () => (
    <div className="h-full flex flex-col p-6 animate-fade-in">
      {viewingContext.type === 'shared' && (
        <div className="bg-orange-100 text-orange-800 p-3 rounded-lg mb-4 text-xs text-center font-bold shadow-sm">⚠️ Estás en modo colaborador. No puedes subir facturas aquí.</div>
      )}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Capturar Factura</h2>
      <div className={`flex-1 flex flex-col gap-6 justify-center ${viewingContext.type === 'shared' ? 'opacity-50 pointer-events-none' : ''}`}>
        <label className="flex flex-col items-center justify-center h-48 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 border-dashed rounded-2xl cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all relative overflow-hidden group">
          <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="bg-white p-4 rounded-full shadow-md mb-2 group-hover:bg-[#4E73DF] group-hover:text-white transition-colors">
              <Camera size={32} className="text-[#4E73DF] group-hover:text-white" />
            </div>
            <p className="font-bold text-gray-700">Usar Cámara</p>
          </div>
        </label>

        <div className="flex items-center justify-center gap-4">
          <span className="h-px bg-gray-300 w-12"></span><span className="text-gray-400 text-sm font-medium">O subir archivo</span><span className="h-px bg-gray-300 w-12"></span>
        </div>

        <label className="flex flex-col items-center justify-center h-32 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all">
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          <Upload size={28} className="text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm font-medium">Galería de Imágenes</p>
        </label>
      </div>
      <div className="mt-auto pt-6"><Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="w-full">Cancelar</Button></div>
      {loading && <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white"><Loader2 size={50} className="animate-spin mb-4 text-white" /><p className="text-lg font-bold text-center px-4 drop-shadow-md">{loadingMessage}</p></div>}
    </div>
  );

  const VerifyView = () => {
    const [formData, setFormData] = useState(currentInvoice.data || {});
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    return (
      <div className="p-4 pb-24 animate-fade-in">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{formData.id ? 'Editar Factura' : 'Validar Datos'}</h2>
        <Card className="border-t-4 border-t-green-500">
          <form className="space-y-4">
            <div className="space-y-4">
              <Input label="RNC" name="rnc" value={formData.rnc || ''} onChange={handleChange} />
              <Input label="NCF" name="ncf" value={formData.ncf || ''} onChange={handleChange} placeholder="B01..." />
              <Input label="Nombre Negocio" name="nombre_negocio" value={formData.nombre_negocio || ''} onChange={handleChange} />
              <Input label="Fecha" name="fecha" value={formData.fecha || ''} onChange={handleChange} type="date" />
            </div>

            <div className="my-6 border-t border-b border-gray-100 py-4 bg-gray-50 -mx-5 px-5">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Monto Total</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    name="total"
                    value={formData.total || ''}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold text-gray-800 bg-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">ITBIS</label>
                  <input type="number" name="itbis" value={formData.itbis || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Propina</label>
                  <input type="number" name="propina" value={formData.propina || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0.00" />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select name="categoria" value={formData.categoria || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Seleccionar Categoría</option>
                <option value="Alimentación">Alimentación</option>
                <option value="Transporte">Transporte</option>
                <option value="Servicios">Servicios</option>
                <option value="Salud">Salud</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div className="pt-4 flex gap-3">
              {!formData.id && <Button variant="ghost" onClick={() => setCurrentView('scan')} className="flex-1">Reintentar</Button>}
              {formData.id && <Button variant="ghost" onClick={() => setCurrentView('history')} className="flex-1">Cancelar</Button>}
              <Button onClick={() => handleSaveInvoice(formData)} className="flex-[2] shadow-lg">
                {formData.id ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  };

  if (loading && currentView === 'login') return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white"><Loader2 size={40} className="text-[#4E73DF] animate-spin" /></div>;
  if (currentView === 'login') return <LoginView />;
  if (currentView === 'register') return <RegisterView />;
  if (currentView === 'welcome') return <WelcomeView />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 font-sans text-gray-900 relative max-w-md mx-auto shadow-2xl overflow-hidden flex flex-col">
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
      <header className={`px-4 py-4 shadow-sm sticky top-0 z-30 flex items-center justify-between transition-colors ${viewingContext.type === 'shared' ? 'bg-orange-50 border-b border-orange-200' : 'bg-white/90 backdrop-blur-md'}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg text-white shadow-sm ${viewingContext.type === 'shared' ? 'bg-orange-500' : 'bg-[#4E73DF]'}`}><FileText size={18} /></div>
          <span className={`font-bold text-xl tracking-tight ${viewingContext.type === 'shared' ? 'text-orange-600' : 'text-[#4E73DF]'}`}>FacturIA</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'history' && <HistoryView />}
        {currentView === 'stats' && <StatsView />}
        {currentView === 'scan' && <ScanView />}
        {currentView === 'verify' && <VerifyView />}
        {currentView === 'settings' && <SettingsView
          viewingContext={viewingContext}
          sharedAccounts={sharedAccounts}
          handleSwitchAccount={handleSwitchAccount}
          handleSwitchToPersonal={handleSwitchToPersonal}
          exportToCSV={exportToCSV}
          handleInviteCollaborator={handleInviteCollaborator}
          onSignOut={() => { signOut(auth); setCurrentView('login'); }}
          onUpdateProfile={handleUpdateProfile}
          installPrompt={installPrompt}
          onInstall={handleInstallClick}
        />}
      </main>

      {/* FOOTER INSTITUCIONAL UNIFICADO */}
      <div className="bg-gray-100/80 backdrop-blur-sm py-3 text-center border-t border-gray-200 text-[10px] text-gray-500">
        <p className="mb-1">OVM Easy Apps. Todos los derechos reservados.</p>
        <a href="https://wa.me/18295341802" target="_blank" rel="noreferrer" className="text-[#4E73DF] font-semibold hover:underline flex items-center justify-center gap-1">
          <Users size={10} /> Soporte WhatsApp
        </a>
      </div>

      <nav className="bg-white border-t border-gray-200 py-2 px-4 flex justify-between items-center z-40 pb-safe">
        <button onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentView === 'dashboard' ? 'text-[#4E73DF] bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}>
          <Home size={22} /><span className="text-[10px] font-bold mt-1">Inicio</span>
        </button>
        <button onClick={() => setCurrentView('history')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentView === 'history' ? 'text-[#4E73DF] bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}>
          <Search size={22} /><span className="text-[10px] font-bold mt-1">Buscar</span>
        </button>
        <button onClick={() => setCurrentView('scan')} className={`flex flex-col items-center justify-center -mt-8 text-white rounded-full w-14 h-14 shadow-lg ring-4 ring-[#F8F9FC] active:scale-95 transition-transform bg-gradient-to-r from-[#4E73DF] to-[#224abe] hover:shadow-xl ${viewingContext.type === 'shared' ? 'from-orange-400 to-orange-500 opacity-50 cursor-not-allowed' : ''}`}>
          <Camera size={24} />
        </button>
        <button onClick={() => setCurrentView('stats')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentView === 'stats' ? 'text-[#4E73DF] bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}>
          <PieChart size={22} /><span className="text-[10px] font-bold mt-1">Stats</span>
        </button>
        <button onClick={() => setCurrentView('settings')} className={`flex flex-col items-center p-2 rounded-xl transition-all relative ${currentView === 'settings' ? 'text-[#4E73DF] bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}>
          <Settings size={22} /><span className="text-[10px] font-bold mt-1">Ajustes</span>
          {newCollabNotification && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
        </button>
      </nav>
    </div>
  );
}

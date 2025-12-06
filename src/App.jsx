import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { 
  Camera, 
  Upload, 
  Home, 
  FileText, 
  Settings, 
  Check, 
  X, 
  LogOut, 
  PieChart, 
  Loader2, 
  Plus, 
  Trash2, 
  Download, 
  Moon, 
  Sun,
  Edit2,
  Save,
  RefreshCw,
  Zap,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  PartyPopper,
  MessageCircle,
  Copyright
} from 'lucide-react';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

// --- CONFIGURACIÓN HÍBRIDA (SEGURA + RESPALDO) ---
/* Esta configuración intenta leer las variables de entorno primero (ideal para producción/seguridad).
   Si no las encuentra (como en esta vista previa o si fallan en GitHub), usa las credenciales directas.
*/

const getEnv = (key, fallback) => {
  try {
    // Intenta leer de Vite (entorno local/producción)
    return import.meta.env[key] || fallback;
  } catch (e) {
    // Si falla (entorno de vista previa), usa el fallback
    return fallback;
  }
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyDfpEQzEWv4wzErgjMeAtbmJPg_aknrrNM"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "app-facturas-8ae2f.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "app-facturas-8ae2f"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "app-facturas-8ae2f.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "859270147246"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:859270147246:web:68359827bd626743d8d13f"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID", "G-QGTYDCD072")
};

// API Key de Gemini
const GEMINI_API_KEY = getEnv("VITE_GEMINI_API_KEY", "AIzaSyB2YbcLjCRl48zVNp1u-8Rg4-jiNPGVP3g");

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variables Globales
const appId = "app-facturas-8ae2f"; 

// --- SERVICIOS ---

const processImageWithGemini = async (base64Image) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `
    Analiza esta imagen de factura comercial (comprobante fiscal) de República Dominicana y extrae los siguientes datos en formato JSON puro (sin markdown).
    
    IMPORTANTE SOBRE EL NCF (Número de Comprobante Fiscal):
    - Busca específicamente el código NCF, que es vital para la validación fiscal.
    - Existen dos formatos válidos en RD, asegúrate de identificar cuál de los dos aparece:
      1. Facturación Tradicional: Comienza con la letra 'B' seguida de números (ejemplos: B0100000001, B02..., B15...).
      2. Facturación Electrónica (e-CF): Comienza con la letra 'E' seguida de números (ejemplos: E3100000001, E32..., E41...).
    
    Campos requeridos:
    - nombre_negocio (string)
    - rnc (string, solo números)
    - ncf (string, formato Bxxxxxxxxx o Exxxxxxxxx según corresponda)
    - fecha (string formato YYYY-MM-DD)
    - subtotal (number)
    - itbis (number, impuesto 18%)
    - propina (number, ley 10%)
    - otros_impuestos (number)
    - total (number)
    - categoria (string, sugiere una categoría: "Alimentación", "Transporte", "Servicios", "Oficina", "Salud", "Entretenimiento", "Otros")

    Asegúrate de que los números sean flotantes. Si algún campo no es visible o no existe, usa null.
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: base64Image } }
          ]
        }]
      })
    });

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResult) throw new Error("No se pudo obtener respuesta de la IA");

    // Limpieza básica del JSON
    const jsonString = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error procesando imagen:", error);
    throw error;
  }
};

// --- COMPONENTES UI ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) => {
  const baseStyle = "px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#4E73DF] text-white shadow-lg shadow-blue-500/30 hover:bg-[#3E63CF]",
    secondary: "bg-[#1CC88A] text-white shadow-lg shadow-green-500/30 hover:bg-[#17B87A]",
    outline: "border-2 border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400",
    ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
  };

  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder, name, readOnly = false }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4E73DF] transition-all text-slate-800 dark:text-white ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
    />
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 ${className}`}>
    {children}
  </div>
);

const Footer = () => (
  <footer className="mt-12 mb-6 text-center animate-fade-in">
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-slate-400 flex items-center gap-1">
        <Copyright size={12} /> OVM Easy Apps 2025. Todos los derechos reservados.
      </p>
      <a 
        href="https://wa.me/18295341802?text=Hola!,%20he%20usado%20la%20app%20de%20Factura%20y%20me%20encanta!,%20quiero%20hablar%20contigo%20por%20otro%20proyecto"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-[#4E73DF] font-medium text-sm hover:underline bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full transition-colors"
      >
        <MessageCircle size={16} />
        Contáctanos
      </a>
    </div>
  </footer>
);

// --- PANTALLAS PRINCIPALES ---

const WelcomeOverlay = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#4E73DF] text-white animate-fade-in">
    <div className="bg-white/20 p-6 rounded-full mb-6 animate-bounce">
      <PartyPopper size={64} />
    </div>
    <h1 className="text-4xl font-bold mb-2">¡Bienvenido!</h1>
    <p className="text-blue-100">Tu cuenta ha sido creada exitosamente.</p>
    <div className="mt-8">
      <Loader2 className="animate-spin" size={32} />
    </div>
  </div>
);

const LoginScreen = ({ setUser, onRegisterSuccess, installPwa, showInstallButton }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const validatePassword = (pass) => {
    // Al menos una mayúscula y un número
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    return hasUpperCase && hasNumber && pass.length >= 6;
  };

  const handleAuthError = (err) => {
    console.error("Auth Error:", err);
    switch (err.code) {
      case 'auth/operation-not-allowed':
        setError("⚠️ ERROR DE CONFIGURACIÓN: Debes habilitar 'Correo electrónico/Contraseña' en la Consola de Firebase > Authentication.");
        break;
      case 'auth/email-already-in-use':
        setError("Este correo ya está registrado.");
        break;
      case 'auth/invalid-email':
        setError("El formato del correo electrónico no es válido.");
        break;
      case 'auth/weak-password':
        setError("La contraseña es muy débil.");
        break;
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        setError("Correo o contraseña incorrectos.");
        break;
      default:
        setError("Error: " + err.message);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Por favor completa todos los campos.");
      setLoading(false);
      return;
    }

    if (isRegistering) {
      // Validaciones específicas de registro
      if (!validatePassword(cleanPassword)) {
        setShowPasswordRules(true); // Mostrar popup de reglas
        setError("La contraseña no cumple con los requisitos de seguridad.");
        setLoading(false);
        return;
      }

      if (cleanPassword !== confirmPassword.trim()) {
        setError("Las contraseñas no coinciden.");
        setLoading(false);
        return;
      }
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        // Notificar al componente padre para mostrar bienvenida
        onRegisterSuccess();
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      }
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      <div className="w-full max-w-md my-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#4E73DF] rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 mb-6 rotate-3">
            <FileText size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">FacturIA</h1>
          <p className="text-slate-500 dark:text-slate-400">Gestiona tus gastos inteligentemente</p>
        </div>

        <Card>
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <Input 
              label="Correo Electrónico" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="tu@email.com"
            />
            
            <div className="relative">
               <Input 
                label="Contraseña" 
                type="password" 
                value={password} 
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (isRegistering) setShowPasswordRules(true);
                }} 
                placeholder="••••••••"
              />
              {/* Tooltip/Popup de reglas de contraseña */}
              {isRegistering && showPasswordRules && (
                <div className="absolute z-10 bottom-full left-0 w-full mb-2 bg-slate-800 text-white text-xs p-3 rounded-lg shadow-xl animate-fade-in border border-slate-700">
                  <p className="font-bold mb-1">Requisitos de contraseña:</p>
                  <ul className="space-y-1">
                    <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-slate-400'}`}>
                      {/[A-Z]/.test(password) ? <Check size={12}/> : <div className="w-3 h-3 rounded-full border border-slate-500"/>} 1 Mayúscula
                    </li>
                    <li className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-400' : 'text-slate-400'}`}>
                       {/[0-9]/.test(password) ? <Check size={12}/> : <div className="w-3 h-3 rounded-full border border-slate-500"/>} 1 Número
                    </li>
                    <li className={`flex items-center gap-2 ${password.length >= 6 ? 'text-green-400' : 'text-slate-400'}`}>
                       {password.length >= 6 ? <Check size={12}/> : <div className="w-3 h-3 rounded-full border border-slate-500"/>} Mínimo 6 caracteres
                    </li>
                  </ul>
                  <div className="absolute bottom-[-6px] left-4 w-3 h-3 bg-slate-800 rotate-45 border-r border-b border-slate-700"></div>
                </div>
              )}
            </div>

            {isRegistering && (
              <Input 
                label="Confirmar Contraseña" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Repite tu contraseña"
              />
            )}
            
            {error && (
              <div className="flex gap-2 text-red-500 text-sm bg-red-50 border border-red-100 p-3 rounded-lg items-start animate-fade-in">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'Registrarse y Entrar' : 'Iniciar Sesión')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setShowPasswordRules(false);
              }}
              className="text-sm text-[#4E73DF] font-medium hover:underline"
            >
              {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </Card>

        {showInstallButton && (
          <div className="mt-6 animate-fade-in">
            <Button onClick={installPwa} className="w-full bg-slate-800 hover:bg-slate-900 text-white shadow-lg shadow-slate-500/20">
              <Smartphone className="w-5 h-5" /> Instalar App en Celular
            </Button>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

const Dashboard = ({ invoices }) => {
  // Cálculos para gráficas
  const totalAmount = invoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
  const totalITBIS = invoices.reduce((sum, inv) => sum + (parseFloat(inv.itbis) || 0), 0);
  
  // Agrupar por categoría
  const categoryData = invoices.reduce((acc, inv) => {
    const cat = inv.categoria || 'Otros';
    acc[cat] = (acc[cat] || 0) + (parseFloat(inv.total) || 0);
    return acc;
  }, {});

  const pieData = Object.keys(categoryData).map(key => ({
    name: key,
    value: categoryData[key]
  }));

  const COLORS = ['#4E73DF', '#1CC88A', '#36B9CC', '#F6C23E', '#E74A3B'];

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Resumen</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Tus gastos este mes</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 text-[#4E73DF] px-3 py-1 rounded-full text-xs font-bold">
          {invoices.length} Facturas
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-[#4E73DF] to-[#224abe] text-white border-none shadow-blue-500/20">
          <p className="text-blue-100 text-xs uppercase font-bold tracking-wider mb-1">Gasto Total</p>
          <h3 className="text-2xl font-bold">RD$ {totalAmount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</h3>
        </Card>
        <Card className="bg-gradient-to-br from-[#1CC88A] to-[#13855c] text-white border-none shadow-green-500/20">
          <p className="text-green-100 text-xs uppercase font-bold tracking-wider mb-1">ITBIS Total</p>
          <h3 className="text-2xl font-bold">RD$ {totalITBIS.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</h3>
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wide">Gastos por Categoría</h3>
        <div className="h-64 w-full">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip 
                  formatter={(value) => `RD$ ${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">Sin datos aún</div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {pieData.map((entry, index) => (
            <div key={index} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              {entry.name}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// --- COMPONENTE DE CÁMARA MEJORADO ---
const CaptureScreen = ({ onScanComplete }) => {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  // Limpiar stream al desmontar
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setCameraActive(true);
      // Pequeño delay para asegurar que el ref del video esté listo
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error("Error cámara:", err);
      setError("No pudimos acceder a la cámara (posible bloqueo del navegador). Usa el botón de 'Subir Imagen' abajo.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Obtener base64
    const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    
    stopCamera();
    processImage(base64Data);
  };

  const processImage = async (base64Data) => {
    setIsProcessing(true);
    try {
      const extractedData = await processImageWithGemini(base64Data);
      onScanComplete(extractedData);
    } catch (apiError) {
      setError("No pudimos leer la factura. Intenta con mejor iluminación.");
      console.error(apiError);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result.split(',')[1]; 
      processImage(base64Data);
    };
    reader.readAsDataURL(file);
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col h-full items-center justify-center pb-20 animate-fade-in">
        <div className="relative">
          <div className="w-20 h-20 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
            <Zap size={40} className="text-[#4E73DF]" />
          </div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4E73DF] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 className="mt-6 text-xl font-bold text-slate-800 dark:text-white">Procesando con IA...</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-center max-w-xs">
          Extrayendo RNC, NCF, Fechas y Montos de tu factura.
        </p>
      </div>
    );
  }

  if (cameraActive) {
    return (
      <div className="flex flex-col h-full bg-black relative animate-fade-in">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full p-6 pb-24 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
          <button 
            onClick={stopCamera}
            className="p-3 rounded-full bg-white/20 text-white backdrop-blur-md"
          >
            <X size={24} />
          </button>
          
          <button 
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:bg-white/50 transition-all active:scale-95"
          >
            <div className="w-16 h-16 bg-white rounded-full"></div>
          </button>

          <div className="w-12"></div> {/* Spacer */}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center justify-center pb-20 animate-fade-in px-6">
      <div className="text-center mb-8 max-w-xs">
        <div className="w-20 h-20 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-[#4E73DF]">
          <Camera size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Capturar Factura</h2>
        <p className="text-slate-500 dark:text-slate-400">Digitaliza tus gastos al instante</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm w-full text-center border border-red-100 flex items-center justify-center gap-2">
           <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button onClick={startCamera} className="w-full h-14 text-lg shadow-xl shadow-blue-500/20">
          <Camera className="w-6 h-6" /> Usar Cámara App
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="px-2 bg-slate-50 dark:bg-slate-950 text-slate-400">O si falla</span></div>
        </div>

        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFile}
        />
        
        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full h-12">
          <Upload className="w-5 h-5" /> Subir Imagen / Archivo
        </Button>
      </div>
    </div>
  );
};

const EditScreen = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      // Asegurar tipos numéricos para cálculos
      subtotal: parseFloat(formData.subtotal) || 0,
      itbis: parseFloat(formData.itbis) || 0,
      propina: parseFloat(formData.propina) || 0,
      otros_impuestos: parseFloat(formData.otros_impuestos) || 0,
      total: parseFloat(formData.total) || 0,
    });
  };

  return (
    <div className="pb-24 animate-slide-up">
      <header className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-slate-950 z-10 py-4 border-b dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Validar Datos</h2>
        <Button variant="ghost" onClick={onCancel} className="!p-2"><X size={20} /></Button>
      </header>

      <div className="space-y-6">
        <Card>
          <h3 className="text-sm font-bold text-[#4E73DF] mb-4 uppercase">Información Fiscal</h3>
          <Input label="Negocio" name="nombre_negocio" value={formData.nombre_negocio} onChange={handleChange} placeholder="Ej. Supermercado X" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="RNC" name="rnc" value={formData.rnc} onChange={handleChange} placeholder="000000000" />
            <Input label="NCF" name="ncf" value={formData.ncf} onChange={handleChange} placeholder="B0100000001" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} />
            <div className="mb-4">
               <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Categoría</label>
               <select 
                name="categoria" 
                value={formData.categoria || "Otros"} 
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4E73DF] dark:text-white appearance-none"
               >
                 {["Alimentación", "Transporte", "Servicios", "Oficina", "Salud", "Entretenimiento", "Otros"].map(c => (
                   <option key={c} value={c}>{c}</option>
                 ))}
               </select>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-[#1CC88A] mb-4 uppercase">Montos (DOP)</h3>
          <Input label="Subtotal / Neto" name="subtotal" type="number" value={formData.subtotal} onChange={handleChange} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="ITBIS (18%)" name="itbis" type="number" value={formData.itbis} onChange={handleChange} />
            <Input label="Propina (10%)" name="propina" type="number" value={formData.propina} onChange={handleChange} />
            <Input label="Otros Imp." name="otros_impuestos" type="number" value={formData.otros_impuestos} onChange={handleChange} />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Input label="TOTAL A PAGAR" name="total" type="number" value={formData.total} onChange={handleChange} />
          </div>
        </Card>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} className="flex-1 text-lg py-4">
            <Check size={20} /> Guardar Factura
          </Button>
        </div>
      </div>
    </div>
  );
};

const HistoryScreen = ({ invoices, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'S/F';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-DO', { day: 'numeric', month: 'short' }).format(date);
  };

  const handleExportCSV = () => {
    const headers = ["Fecha", "Negocio", "RNC", "NCF", "Categoría", "Subtotal", "ITBIS", "Propina", "Total"];
    const csvContent = [
      headers.join(","),
      ...invoices.map(inv => [
        inv.fecha,
        `"${inv.nombre_negocio}"`, // Escape quotes
        inv.rnc,
        inv.ncf,
        inv.categoria,
        inv.subtotal,
        inv.itbis,
        inv.propina,
        inv.total
      ].join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_facturas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="pb-24 animate-fade-in">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Historial</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Tus registros guardados</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} className="!px-3 !py-2 text-xs">
          <Download size={14} /> CSV / Excel
        </Button>
      </header>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <FileText size={48} className="mb-4 opacity-20" />
          <p>No hay facturas registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Card key={inv.id} className="!p-4 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-base">{inv.nombre_negocio || 'Negocio Desconocido'}</h4>
                  <p className="text-xs text-slate-500">{formatDate(inv.fecha)} • {inv.ncf || 'Sin NCF'}</p>
                </div>
                <span className="font-bold text-[#4E73DF]">RD$ {inv.total?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-end mt-2">
                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                  {inv.categoria}
                </span>
                <button 
                  onClick={() => onDelete(inv.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const SettingsScreen = ({ user, toggleTheme, isDark, installPwa, showInstallButton }) => {
  const handleLogout = () => signOut(auth);

  return (
    <div className="pb-24 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Configuración</h2>
        <p className="text-slate-500 text-sm">Preferencias y cuenta</p>
      </header>

      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-[#4E73DF] rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-white">{user?.displayName || 'Usuario'}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="w-full text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50">
            <LogOut size={18} /> Cerrar Sesión
          </Button>
        </Card>

        <Card>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              {isDark ? <Moon size={20} /> : <Sun size={20} />}
              <span className="font-medium">Modo Oscuro</span>
            </div>
            <button 
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isDark ? 'bg-[#4E73DF]' : 'bg-slate-200'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-300 ${isDark ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        </Card>
        
        <Card>
           <div className="flex items-center justify-between py-2 text-slate-500 text-sm">
             <div className="flex items-center gap-2">
               <Smartphone size={18} />
               <span>Instalable (PWA)</span>
             </div>
             
             {showInstallButton ? (
               <button 
                 onClick={installPwa}
                 className="text-[#4E73DF] text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
               >
                 INSTALAR AHORA
               </button>
             ) : (
               <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">INSTALADO / NO DISP.</span>
             )}
           </div>
        </Card>

        <div className="text-center text-xs text-slate-400 mt-10">
          <p>FacturIA v1.0.0 (PWA)</p>
          <p>Desarrollado para demostración</p>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (APP) ---

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); // home, capture, history, settings
  const [invoices, setInvoices] = useState([]);
  const [scannedData, setScannedData] = useState(null); // Para pasar datos de Capture -> Edit
  const [isDark, setIsDark] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  
  // PWA State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Registro del Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('SW registrado', reg))
        .catch(err => console.log('SW error', err));
    }
  }, []);

  // Listen for PWA install event
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    setDeferredPrompt(null);
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listener (Solo si hay usuario)
  useEffect(() => {
    if (!user) {
      setInvoices([]);
      return;
    }

    // Regla de ruta estricta: artifacts/{appId}/users/{userId}/invoices
    const q = query(
      collection(db, 'artifacts', appId, 'users', user.uid, 'invoices'),
      orderBy('fecha', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvoices(docs);
    });

    return () => unsubscribe();
  }, [user]);

  // Manejo de Tema
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleScanComplete = (data) => {
    setScannedData(data);
    setActiveTab('edit');
  };

  const handleSaveInvoice = async (invoiceData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'invoices'), {
        ...invoiceData,
        createdAt: serverTimestamp()
      });
      setScannedData(null);
      setActiveTab('history'); // Ir al historial para verla guardada
    } catch (error) {
      console.error("Error guardando:", error);
      alert("Error al guardar la factura");
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!confirm("¿Eliminar esta factura?")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'invoices', id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterSuccess = () => {
    setShowWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
    }, 3000); // Mostrar bienvenida por 3 segundos
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-[#4E73DF] animate-spin" />
      </div>
    );
  }

  // Pantalla de Bienvenida (Overlay)
  if (user && showWelcome) {
    return <WelcomeOverlay />;
  }

  if (!user) {
    return (
      <LoginScreen 
        setUser={setUser} 
        onRegisterSuccess={handleRegisterSuccess} 
        installPwa={handleInstallClick}
        showInstallButton={showInstallButton}
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      
      {/* Área Principal de Contenido */}
      <main className="max-w-md mx-auto min-h-screen bg-white dark:bg-slate-950 shadow-2xl overflow-hidden relative">
        <div className="h-full overflow-y-auto p-6 scrollbar-hide">
          
          {activeTab === 'home' && <Dashboard invoices={invoices} />}
          
          {activeTab === 'capture' && <CaptureScreen onScanComplete={handleScanComplete} />}
          
          {activeTab === 'edit' && scannedData && (
            <EditScreen 
              initialData={scannedData} 
              onSave={handleSaveInvoice} 
              onCancel={() => {
                setScannedData(null);
                setActiveTab('home');
              }} 
            />
          )}

          {activeTab === 'history' && <HistoryScreen invoices={invoices} onDelete={handleDeleteInvoice} />}
          
          {activeTab === 'settings' && (
            <SettingsScreen 
              user={user} 
              toggleTheme={toggleTheme} 
              isDark={isDark} 
              installPwa={handleInstallClick}
              showInstallButton={showInstallButton}
            />
          )}
          
        </div>

        {/* Barra de Navegación Inferior (Móvil) */}
        {activeTab !== 'edit' && (
          <nav className="absolute bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe pt-2 px-6 flex justify-between items-center z-50 h-[80px]">
            <NavButton icon={Home} label="Inicio" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <NavButton icon={FileText} label="Historial" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
            
            {/* Botón Central Flotante */}
            <div className="-mt-8">
              <button 
                onClick={() => setActiveTab('capture')}
                className="w-14 h-14 bg-[#4E73DF] rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center text-white transition-transform active:scale-95 hover:bg-[#3E63CF]"
              >
                <Plus size={28} strokeWidth={2.5} />
              </button>
            </div>

            <NavButton icon={PieChart} label="Reporte" active={false} onClick={() => setActiveTab('home')} /> {/* Reporte es parte del home en este MVP */}
            <NavButton icon={Settings} label="Ajustes" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </nav>
        )}
      </main>

      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}

const NavButton = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${active ? 'text-[#4E73DF]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
  >
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

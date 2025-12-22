import React, { useState, useMemo } from 'react';
import {
    ChevronDown,
    TrendingUp,
    TrendingDown,
    Briefcase,
    Laptop,
    LineChart,
    Gift,
    Home,
    Utensils,
    Car,
    Film,
    ShoppingBag,
    PieChart,
    DollarSign,
    Calendar,
    Infinity
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Map categories to icons and colors
const getCategoryConfig = (category, type) => {
    const config = {
        // Gastos
        'Hogar': { icon: Home, color: 'bg-red-100 text-red-600', bar: 'bg-red-500', hex: '#EF4444' }, // Red-500
        'Comida': { icon: Utensils, color: 'bg-orange-100 text-orange-600', bar: 'bg-orange-500', hex: '#F97316' }, // Orange-500
        'Alimentación': { icon: Utensils, color: 'bg-orange-100 text-orange-600', bar: 'bg-orange-500', hex: '#F97316' }, // Alias
        'Transporte': { icon: Car, color: 'bg-blue-100 text-blue-600', bar: 'bg-blue-500', hex: '#3B82F6' }, // Blue-500
        'Combustible': { icon: Car, color: 'bg-yellow-100 text-yellow-600', bar: 'bg-yellow-500', hex: '#EAB308' }, // Yellow-500
        'Ocio': { icon: Film, color: 'bg-purple-100 text-purple-600', bar: 'bg-purple-500', hex: '#A855F7' }, // Purple-500
        'Compras': { icon: ShoppingBag, color: 'bg-pink-100 text-pink-600', bar: 'bg-pink-500', hex: '#EC4899' }, // Pink-500
        'Salud': { icon: Briefcase, color: 'bg-cyan-100 text-cyan-600', bar: 'bg-cyan-500', hex: '#06B6D4' }, // Cyan-500
        'Servicios': { icon: Laptop, color: 'bg-indigo-100 text-indigo-600', bar: 'bg-indigo-500', hex: '#6366F1' }, // Indigo-500
        // Ingresos
        'Salario': { icon: Briefcase, color: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-500', hex: '#10B981' }, // Emerald-500
        'Freelance': { icon: Laptop, color: 'bg-teal-100 text-teal-600', bar: 'bg-teal-400', hex: '#2DD4BF' }, // Teal-400
        'Inversiones': { icon: LineChart, color: 'bg-sky-100 text-sky-600', bar: 'bg-sky-500', hex: '#0EA5E9' }, // Sky-500
        'Regalos': { icon: Gift, color: 'bg-lime-100 text-lime-600', bar: 'bg-lime-500', hex: '#84CC16' }, // Lime-500
    };

    const defaultConfig = type === 'expense'
        ? { icon: DollarSign, color: 'bg-gray-100 text-gray-600', bar: 'bg-gray-500', hex: '#6B7280' } // Gray-500
        : { icon: DollarSign, color: 'bg-gray-100 text-gray-600', bar: 'bg-gray-500', hex: '#6B7280' };

    // Fuzzy match or exact match
    const key = Object.keys(config).find(k => category && category.includes(k)) || 'default';

    return key === 'default' ? defaultConfig : config[key];
};


const StatsView = ({ invoices = [] }) => {
    const [activeTab, setActiveTab] = useState('expense'); // 'expense' | 'income'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month'); // 'month' | 'all'
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Filter Logic
    const filteredData = useMemo(() => {
        return invoices.filter(inv => {
            if (inv.type !== activeTab) return false;

            if (viewMode === 'all') return true;

            const invDate = new Date(inv.fecha); // Assuming format 'YYYY-MM-DD' or ISO
            // Handle "DD/MM/YYYY" format if necessary, but standard JS Date parse works for ISO.

            return (
                invDate.getMonth() === selectedDate.getMonth() &&
                invDate.getFullYear() === selectedDate.getFullYear()
            );
        });
    }, [invoices, activeTab, selectedDate, viewMode]);

    // Aggregation Logic
    const stats = useMemo(() => {
        const total = filteredData.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);

        // Group by Category
        const byCategory = filteredData.reduce((acc, inv) => {
            const cat = inv.categoria || 'Otros';
            acc[cat] = (acc[cat] || 0) + (parseFloat(inv.total) || 0);
            return acc;
        }, {});

        const sortedCategories = Object.entries(byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([name, amount]) => ({
                name,
                amount,
                percentage: total > 0 ? (amount / total) * 100 : 0
            }));

        return { total, categories: sortedCategories };
    }, [filteredData]);

    // Comparison Logic (Current Month vs Previous Month)
    const comparisonData = useMemo(() => {
        if (viewMode === 'all') return { pct: 0, text: 'Promedio histórico', status: 'neutral' };

        const prevDate = new Date(selectedDate);
        prevDate.setMonth(prevDate.getMonth() - 1);

        const prevData = invoices.filter(inv => {
            if (inv.type !== activeTab) return false;
            const invDate = new Date(inv.fecha);
            return (
                invDate.getMonth() === prevDate.getMonth() &&
                invDate.getFullYear() === prevDate.getFullYear()
            );
        });

        const prevTotal = prevData.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);

        let pct = 0;
        if (prevTotal === 0) {
            pct = stats.total > 0 ? 100 : 0;
        } else {
            pct = ((stats.total - prevTotal) / prevTotal) * 100;
        }

        // Determine Status Text
        const isIncome = activeTab === 'income';
        let text = 'Estable';
        let status = 'neutral'; // neutral, good, bad

        if (stats.total === 0) {
            text = 'Sin datos';
            status = 'neutral';
        } else if (isIncome) {
            if (pct >= 5) { text = '¡Excelente crecimiento!'; status = 'good'; }
            else if (pct <= -5) { text = 'Descenso en ingresos'; status = 'bad'; }
            else { text = 'Ingresos estables'; status = 'neutral'; }
        } else {
            // Expenses
            if (pct >= 5) { text = 'Alerta: Aumento de gastos'; status = 'bad'; }
            else if (pct <= -5) { text = '¡Buen ahorro!'; status = 'good'; }
            else { text = 'Gastos bajo control'; status = 'neutral'; }
        }

        return { pct, text, status };
    }, [invoices, activeTab, selectedDate, viewMode, stats.total]);

    // Gradient Colors for Chart
    const chartColors = activeTab === 'income'
        ? ['#10B981', '#2DD4BF', '#0EA5E9', '#84CC16'] // Emerald, Teal, Sky, Lime
        : ['#4F46E5', '#6366F1', '#8B5CF6', '#EC4899']; // Indigo, Violet, Pink (Blue themeish)

    // Generate Conic Gradient for Donut
    const conicGradient = useMemo(() => {
        if (stats.categories.length === 0) return 'conic-gradient(#E5E7EB 0% 100%)';

        let currentDeg = 0;
        const stops = stats.categories.map((cat, index) => {
            // Look up the specific config for this category to get its hex color
            const config = getCategoryConfig(cat.name, activeTab);
            // Use config.hex, fallback to chartColors[index % ...] if missing
            const color = config.hex || chartColors[index % chartColors.length];

            return { pct: cat.percentage, color: color };
        });

        // Calculate accumulation
        let gradientStr = 'conic-gradient(';
        let accumPct = 0;

        stops.forEach((stop, i) => {
            const start = accumPct;
            const end = accumPct + stop.pct;
            accumPct = end;
            gradientStr += `${stop.color} ${start}% ${end}%, `;
        });

        // Fill remainder 
        if (accumPct < 100) {
            gradientStr += `#E5E7EB ${accumPct}% 100%)`;
        } else {
            gradientStr = gradientStr.slice(0, -2) + ')';
        }

        return gradientStr;
    }, [stats, activeTab]);

    const changeMonth = (offset) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setSelectedDate(newDate);
        setViewMode('month'); // Switch back to specific month view when changing date
    };

    const themeColor = activeTab === 'income' ? 'emerald' : 'indigo'; // Blue/Primary is Indigo-600 approx

    return (
        <div className="p-4 pb-24 animate-fade-in font-sans">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Estadísticas</h2>

                <div className="relative">
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-2 rounded-full text-xs font-semibold shadow-sm border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                    >
                        <Calendar size={14} className="mr-1" />
                        <span className="capitalize">
                            {viewMode === 'all' ? 'Todo' : selectedDate.toLocaleString('es-DO', { month: 'long', year: 'numeric' })}
                        </span>
                        <ChevronDown size={16} />
                    </button>

                    {/* Simple Date Picker Dropdown */}
                    {showDatePicker && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 p-2">
                            <button
                                onClick={() => { setViewMode('all'); setShowDatePicker(false); }}
                                className={clsx(
                                    "w-full text-left text-xs p-2 rounded-lg mb-2 font-medium transition-colors flex items-center gap-2",
                                    viewMode === 'all' ? "bg-primary text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                                )}
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
                                        className={clsx(
                                            "text-xs p-2 rounded-lg transition-colors",
                                            i === selectedDate.getMonth() && viewMode === 'month'
                                                ? "bg-primary text-white font-bold"
                                                : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                        )}
                                    >
                                        {new Date(0, i).toLocaleString('es-DO', { month: 'short' })}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-1.5 mb-8 flex shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <button
                    onClick={() => setActiveTab('expense')}
                    className={clsx(
                        "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 relative z-10",
                        activeTab === 'expense'
                            ? "bg-[#4F46E5] text-white shadow-md"
                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                >
                    GASTOS
                    {activeTab === 'expense' && <TrendingDown size={18} />}
                </button>
                <button
                    onClick={() => setActiveTab('income')}
                    className={clsx(
                        "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 relative z-10",
                        activeTab === 'income'
                            ? "bg-[#10B981] text-white shadow-md"
                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                >
                    INGRESOS
                    {activeTab === 'income' && <TrendingUp size={18} />}
                </button>
            </div>

            {/* Main Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-soft p-6 mb-6 relative overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                {/* Background Blur */}
                <div className={clsx(
                    "absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-500",
                    activeTab === 'income' ? "bg-emerald-500/10" : "bg-indigo-500/10"
                )}></div>

                {/* Card Header */}
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className={clsx(
                            "p-2 rounded-xl transition-colors",
                            activeTab === 'income' ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-indigo-50 dark:bg-indigo-900/20"
                        )}>
                            <PieChart className={clsx("text-xl", activeTab === 'income' ? "text-emerald-500" : "text-indigo-500")} size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Distribución</h3>
                    </div>
                    {/* Dynamic Trend */}
                    <div className={clsx(
                        "flex items-center gap-1 px-2.5 py-1 rounded-lg",
                        comparisonData.status === 'good' ? "bg-emerald-50 text-emerald-600" :
                            comparisonData.status === 'bad' ? "bg-red-50 text-red-600" :
                                "bg-blue-50 text-blue-600"
                    )}>
                        {comparisonData.pct > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span className="text-xs font-bold">
                            {comparisonData.pct > 0 ? '+' : ''}{comparisonData.pct.toFixed(1)}%
                        </span>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="relative w-64 h-64 mx-auto mb-10 group">
                    <div
                        className="w-full h-full rounded-full relative shadow-glow transition-transform duration-500 group-hover:scale-[1.02]"
                        style={{ background: conicGradient }}
                    ></div>
                    <div className="absolute inset-5 bg-white dark:bg-gray-800 rounded-full flex flex-col items-center justify-center shadow-inner z-10 border border-gray-50 dark:border-gray-700">
                        <span className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                            Total {activeTab === 'income' ? 'Ingresado' : 'Gastado'}
                        </span>
                        <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                            {new Intl.NumberFormat('es-DO', { notation: "compact", compactDisplay: "short", style: "currency", currency: "DOP" }).format(stats.total)}
                        </span>
                        <p className={clsx(
                            "text-[10px] font-medium mt-1 px-2 py-0.5 rounded-full transition-colors",
                            comparisonData.status === 'good' ? "text-emerald-500 bg-emerald-50" :
                                comparisonData.status === 'bad' ? "text-red-500 bg-red-50" :
                                    "text-gray-500 bg-gray-50"
                        )}>
                            {comparisonData.text}
                        </p>
                    </div>
                </div>

                {/* Category Breakdown List */}
                <div className="space-y-6 relative z-10">
                    {stats.categories.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm py-4">No hay registros para este periodo</div>
                    ) : (
                        stats.categories.map((cat, idx) => {
                            const config = getCategoryConfig(cat.name, activeTab);
                            const isExpense = activeTab === 'expense';

                            // Dynamic bar color uses specific hex from config or fallback
                            const barColor = config.hex || chartColors[idx % chartColors.length];

                            return (
                                <div key={idx} className="group/item cursor-pointer">
                                    <div className="flex justify-between items-center mb-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover/item:scale-110",
                                                // Icon background color
                                                isExpense ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600" : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600"
                                            )}>
                                                {/* Allow icon color override from config if desireable, but keeping uniform icon style is fine. 
                                                    Actually, let's use the category specific color for the icon text to match! 
                                                */}
                                                <config.icon size={20} style={{ color: config.hex }} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm transition-colors">
                                                    {cat.name}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-gray-500 font-medium">{cat.percentage.toFixed(0)}% del total</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(cat.amount)}</span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${cat.percentage}%`,
                                                backgroundColor: barColor,
                                                boxShadow: `0 0 8px ${barColor}80` // Add glow
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsView;

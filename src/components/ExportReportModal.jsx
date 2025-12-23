import React, { useState } from 'react';
import { Download, FileText, Table, Calendar, X, Check, Activity, PieChart } from 'lucide-react';
import { generatePDFReport, generateExcelReport, filterInvoicesByDate } from '../utils/reportGenerator';

export default function ExportReportModal({ isOpen, onClose, invoices, userProfile, companyName }) {
    if (!isOpen) return null;

    const [loading, setLoading] = useState(false);
    const [format, setFormat] = useState('pdf'); // 'pdf' | 'excel'
    const [success, setSuccess] = useState(false);

    // Dates State
    const currentYear = new Date().getFullYear();
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const [startMonth, setStartMonth] = useState(0); // Jan
    const [startYear, setStartYear] = useState(currentYear);
    const [endMonth, setEndMonth] = useState(new Date().getMonth());
    const [endYear, setEndYear] = useState(currentYear);

    const handleGenerate = async () => {
        setLoading(true);

        // Wait a bit to simulate processing and allow UI render
        setTimeout(async () => {
            try {
                const filteredInvoices = filterInvoicesByDate(invoices, startMonth, startYear, endMonth, endYear);

                if (filteredInvoices.length === 0) {
                    alert("No hay transacciones en el período seleccionado.");
                    setLoading(false);
                    return;
                }

                const periodLabel = `${months[startMonth]} ${startYear} - ${months[endMonth]} ${endYear}`;
                const periodObj = { label: periodLabel };

                if (format === 'pdf') {
                    await generatePDFReport(filteredInvoices, periodObj, userProfile, companyName);
                } else {
                    generateExcelReport(filteredInvoices, periodObj);
                }

                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                }, 1500);

            } catch (error) {
                console.error("Export Error:", error);
                alert("Error al generar el reporte.");
            } finally {
                setLoading(false);
            }
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Download size={100} className="text-white transform rotate-12" />
                    </div>
                    <div className="relative z-10 text-white">
                        <h2 className="text-2xl font-bold mb-1">Exportar Reporte</h2>
                        <p className="text-blue-100 text-sm">Selecciona el período y formato deseado.</p>
                    </div>
                    <button onClick={onClose} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors backdrop-blur-md">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto scrollbar-hide space-y-6">

                    {/* Period Selector */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-800 dark:text-white font-semibold">
                            <Calendar size={18} className="text-blue-600" />
                            <h3>Rango de Fechas</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Desde</label>
                                <div className="flex gap-2">
                                    <select
                                        value={startMonth}
                                        onChange={e => setStartMonth(parseInt(e.target.value))}
                                        className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 outline-none w-full"
                                    >
                                        {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                    </select>
                                    <select
                                        value={startYear}
                                        onChange={e => setStartYear(parseInt(e.target.value))}
                                        className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 outline-none w-20"
                                    >
                                        {[currentYear, currentYear - 1, currentYear - 2].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* End Date */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Hasta</label>
                                <div className="flex gap-2">
                                    <select
                                        value={endMonth}
                                        onChange={e => setEndMonth(parseInt(e.target.value))}
                                        className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 outline-none w-full"
                                    >
                                        {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                    </select>
                                    <select
                                        value={endYear}
                                        onChange={e => setEndYear(parseInt(e.target.value))}
                                        className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 outline-none w-20"
                                    >
                                        {[currentYear, currentYear - 1, currentYear - 2].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Format Selector */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-800 dark:text-white font-semibold">
                            <FileText size={18} className="text-blue-600" />
                            <h3>Formato</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* PDF Option */}
                            <button
                                onClick={() => setFormat('pdf')}
                                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${format === 'pdf'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${format === 'pdf' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                    }`}>
                                    <Activity size={24} />
                                </div>
                                <div className="text-center">
                                    <span className={`block font-bold ${format === 'pdf' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>Reporte PDF</span>
                                    <span className="text-[10px] text-gray-400 font-medium">Gráficos + Análisis</span>
                                </div>
                                {format === 'pdf' && <div className="absolute top-2 right-2 text-blue-500"><Check size={16} /></div>}
                            </button>

                            {/* Excel Option */}
                            <button
                                onClick={() => setFormat('excel')}
                                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${format === 'excel'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${format === 'excel' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                    }`}>
                                    <Table size={24} />
                                </div>
                                <div className="text-center">
                                    <span className={`block font-bold ${format === 'excel' ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>Excel Data</span>
                                    <span className="text-[10px] text-gray-400 font-medium">Tabla Cruda + Resumen</span>
                                </div>
                                {format === 'excel' && <div className="absolute top-2 right-2 text-green-500"><Check size={16} /></div>}
                            </button>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading || success}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${success
                                ? 'bg-green-500 text-white shadow-green-500/30'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/30'
                            } ${loading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Generando...</span>
                            </>
                        ) : success ? (
                            <>
                                <Check size={24} />
                                <span>¡Listo!</span>
                            </>
                        ) : (
                            <>
                                <Download size={22} />
                                <span>Descargar {format.toUpperCase()}</span>
                            </>
                        )}
                    </button>

                </div>
            </div>
        </div>
    );
}

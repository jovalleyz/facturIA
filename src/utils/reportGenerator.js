import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Chart from 'chart.js/auto';

/**
 * Formats currency (DOP)
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 2
    }).format(amount);
};

/**
 * Filters invoices by date range
 */
export const filterInvoicesByDate = (invoices, startMonth, startYear, endMonth, endYear) => {
    return invoices.filter(inv => {
        if (!inv.fecha) return false;
        // inv.fecha is usually "YYYY-MM-DD"
        // if user has old data "DD/MM/YYYY" ensure parsing
        let dateObj = new Date(inv.fecha);
        // Handle potential parsing issues if needed, but assuming standard YYYY-MM-DD from app
        if (isNaN(dateObj.getTime())) return false;

        const invMonth = dateObj.getMonth(); // 0-11
        const invYear = dateObj.getFullYear();

        // Check if >= Start
        if (invYear < startYear) return false;
        if (invYear === startYear && invMonth < startMonth) return false;

        // Check if <= End
        if (invYear > endYear) return false;
        if (invYear === endYear && invMonth > endMonth) return false;

        return true;
    });
};

/**
 * Generates Financial Analysis Logic
 */
const generateAnalysis = (invoices) => {
    const expenses = invoices.filter(inv => inv.type === 'expense');
    const income = invoices.filter(inv => inv.type === 'income');

    const totalExpense = expenses.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const totalIncome = income.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const balance = totalIncome - totalExpense;

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, curr) => {
        const cat = curr.categoria || 'Sin Categoría';
        acc[cat] = (acc[cat] || 0) + parseFloat(curr.total || 0);
        return acc;
    }, {});

    // Find top expense category
    let topCategory = '';
    let topCategoryAmount = 0;
    Object.entries(expensesByCategory).forEach(([cat, amount]) => {
        if (amount > topCategoryAmount) {
            topCategoryAmount = amount;
            topCategory = cat;
        }
    });

    const efficiency = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

    // Generate text
    const observations = [];
    if (totalIncome > totalExpense) {
        observations.push("Tus ingresos superan tus gastos, lo que indica un flujo de caja positivo.");
        observations.push(`Estás ahorrando un ${efficiency}% de tus ingresos en este período.`);
    } else {
        observations.push("Tus gastos superan tus ingresos. Es importante revisar las categorías de mayor consumo.");
        const deficit = Math.abs(balance);
        observations.push(`Tienes un déficit de ${formatCurrency(deficit)}.`);
    }

    if (topCategory) {
        observations.push(`La categoría donde más gastaste fue "${topCategory}" con un total de ${formatCurrency(topCategoryAmount)}.`);
    }

    const suggestions = [];
    if (efficiency < 10 && efficiency > 0) {
        suggestions.push("Tu margen de ahorro es bajo (<10%). Considera reducir gastos hormiga.");
    }
    if (topCategoryAmount > (totalExpense * 0.4)) {
        suggestions.push(`"${topCategory}" representa más del 40% de tus gastos. Busca alternativas más económicas en esta área.`);
    }
    if (totalIncome === 0) {
        suggestions.push("No registraste ingresos en este período. Asegúrate de registrar todas tus entradas de dinero.");
    }

    return {
        totalExpense,
        totalIncome,
        balance,
        expensesByCategory,
        topCategory,
        topCategoryAmount,
        observations,
        suggestions
    };
};

/**
 * Generates Charts on a Canvas and returns Image Data URL
 */
const generateChartsImages = async (analysis) => {
    // We need to create a canvas element in the DOM (hidden) to render chartjs
    // Then extract image.
    const chartWidth = 600;
    const chartHeight = 300;

    // 1. Bar Chart: Income vs Expense
    const canvas1 = document.createElement('canvas');
    canvas1.width = chartWidth;
    canvas1.height = chartHeight;

    const ctx1 = canvas1.getContext('2d');
    const chart1 = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ['Ingresos', 'Gastos'],
            datasets: [{
                label: 'Monto (DOP)',
                data: [analysis.totalIncome, analysis.totalExpense],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)', // Green-500
                    'rgba(239, 68, 68, 0.8)'   // Red-500
                ],
                borderColor: [
                    '#10B981',
                    '#EF4444'
                ],
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { display: false },
                    ticks: { font: { family: 'Helvetica' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Helvetica', weight: 'bold' } }
                }
            },
            animation: false
        }
    });

    const img1 = canvas1.toDataURL('image/png');
    chart1.destroy();

    // 2. Pie Chart: Expenses by Category
    const canvas2 = document.createElement('canvas');
    canvas2.width = chartWidth;
    canvas2.height = chartHeight;
    const ctx2 = canvas2.getContext('2d');

    const labels = Object.keys(analysis.expensesByCategory);
    const data = Object.values(analysis.expensesByCategory);

    // Modern Palette (Rotated to avoid Blue as primary when single category)
    const colors = [
        '#F59E0B', '#8B5CF6', '#EC4899', '#10B981',
        '#3B82F6', '#6366F1', '#14B8A6', '#EF4444'
    ];

    const chart2 = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: { family: 'Helvetica', size: 10 },
                        usePointStyle: true,
                        boxWidth: 8
                    }
                }
            },
            animation: false
        }
    });

    const img2 = canvas2.toDataURL('image/png');
    chart2.destroy();

    return { img1, img2 };
};

/**
 * MAIN: PDF GENERATOR
 */
export const generatePDFReport = async (invoices, period, userProfile, companyName = "Personal") => {
    const analysis = generateAnalysis(invoices);
    const { img1, img2 } = await generateChartsImages(analysis);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    // -- HEADER DESIGN --
    // Gradient-like effect using multiple rects or just a solid branded color
    doc.setFillColor(37, 99, 235); // Brand Blue (Primary)
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Decorative Shapes (Circles/Lines) to make it look "Designed"
    doc.setFillColor(255, 255, 255);
    doc.setGState(new doc.GState({ opacity: 0.1 })); // Transparency
    doc.circle(pageWidth - 20, -10, 40, 'F');
    doc.circle(20, 50, 30, 'F');
    doc.setGState(new doc.GState({ opacity: 1 })); // Reset

    // Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("FacturIA", margin, 22);

    // Subtitle
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Reporte Financiero Inteligente", margin, 28);

    doc.setFontSize(11);
    doc.text(`Generado para: ${companyName}`, margin, 38);

    // Date/Period on Right
    doc.setFontSize(10);
    doc.text(`Período: ${period.label}`, pageWidth - margin, 20, { align: 'right' });
    doc.text(`Fecha Emisión: ${new Date().toLocaleDateString('es-DO')}`, pageWidth - margin, 38, { align: 'right' });

    // -- RESUMEN EJECUTIVO --
    let yPos = 55;
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen Ejecutivo", margin, yPos);

    // Cards Effect (Draw Rectangles)
    yPos += 10;
    const boxWidth = (pageWidth - (margin * 2) - 10) / 3;
    const boxes = [
        { label: "Ingresos", val: analysis.totalIncome, color: [16, 185, 129] }, // Green
        { label: "Gastos", val: analysis.totalExpense, color: [239, 68, 68] },   // Red
        { label: "Balance", val: analysis.balance, color: [59, 130, 246] }       // Blue
    ];

    boxes.forEach((box, i) => {
        const x = margin + (i * (boxWidth + 5));

        // Background
        doc.setFillColor(249, 250, 251); // Gray-50
        doc.setDrawColor(229, 231, 235); // Gray-200
        doc.roundedRect(x, yPos, boxWidth, 30, 3, 3, 'FD');

        // Strip
        doc.setFillColor(...box.color);
        doc.rect(x, yPos + 27, boxWidth, 3, 'F');

        // Text
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128); // Gray-500
        doc.text(box.label, x + 5, yPos + 10);

        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55); // Gray-800
        doc.setFont("helvetica", "bold");
        doc.text(formatCurrency(box.val), x + 5, yPos + 20);
    });

    // -- CHARTS --
    yPos += 45;
    doc.setFontSize(14);
    doc.text("Análisis Gráfico", margin, yPos);
    yPos += 10;

    // Add Chart Images
    // Width ratio
    const imgWidth = (pageWidth - (margin * 3)) / 2;
    const imgHeight = imgWidth * 0.6; // Aspect ratio

    doc.addImage(img1, 'PNG', margin, yPos, imgWidth, imgHeight);
    doc.addImage(img2, 'PNG', margin + imgWidth + 10, yPos, imgWidth, imgHeight);

    yPos += imgHeight + 15;

    // -- OBSERVACIONES --
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text("Diagnóstico Financiero", margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);

    analysis.observations.forEach(obs => {
        doc.text(`• ${obs}`, margin + 5, yPos);
        yPos += 6;
    });

    yPos += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Sugerencias:", margin + 5, yPos);
    yPos += 6;
    doc.setFont("helvetica", "italic");
    analysis.suggestions.forEach(sug => {
        doc.text(`• ${sug}`, margin + 5, yPos);
        yPos += 6;
    });

    // -- TABLA TRANSACCIONES --
    yPos += 15;
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text("Detalle de Movimientos", margin, yPos);
    yPos += 5;

    const tableRows = invoices.map(inv => [
        inv.fecha || '-',
        inv.nombre_negocio || 'N/A',
        inv.categoria || 'Varios',
        inv.ncf || '-',
        inv.type === 'income' ? formatCurrency(inv.total) : '-',
        inv.type === 'expense' ? formatCurrency(inv.total) : '-'
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Fecha', 'Negocio', 'Categoría', 'NCF', 'Ingreso', 'Gasto']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8 },
        columnStyles: {
            4: { halign: 'right', textColor: [16, 185, 129] },
            5: { halign: 'right', textColor: [239, 68, 68] }
        }
    });

    // -- FOOTER --
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount} - Generado por FacturIA`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`Reporte_Financiero_${period.label.replace(' ', '_')}.pdf`);
};

/**
 * MAIN: EXCEL GENERATOR
 */
export const generateExcelReport = (invoices, period) => {
    // 1. Prepare Data
    const formattedData = invoices.map(inv => ({
        Fecha: inv.fecha,
        Negocio: inv.nombre_negocio,
        RNC: inv.rnc,
        NCF: inv.ncf,
        Tipo: inv.type === 'income' ? 'Ingreso' : 'Gasto',
        Categoría: inv.categoria || 'General',
        SubTotal: parseFloat(inv.subtotal || 0),
        ITBIS: parseFloat(inv.itbis || 0),
        Propina: parseFloat(inv.propina_legal || 0),
        Total: parseFloat(inv.total || 0)
    }));

    // 2. Create Workbook
    const wb = XLSX.utils.book_new();

    // 3. Transactions Sheet
    const ws1 = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.book_append_sheet(wb, ws1, "Transacciones");

    // 4. Summary Sheet
    const analysis = generateAnalysis(invoices);
    const summaryData = [
        ["Reporte Financiero", `Período: ${period.label}`],
        [""],
        ["Resumen General"],
        ["Total Ingresos", analysis.totalIncome],
        ["Total Gastos", analysis.totalExpense],
        ["Balance Neto", analysis.balance],
        ["Eficiencia", `${(analysis.balance / analysis.totalIncome * 100).toFixed(2)}%`],
        [""],
        ["Gastos por Categoría"]
    ];

    Object.entries(analysis.expensesByCategory).forEach(([cat, amount]) => {
        summaryData.push([cat, amount]);
    });

    const ws2 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws2, "Resumen");

    // Export
    XLSX.writeFile(wb, `Reporte_Financiero_${period.label}.xlsx`);
};

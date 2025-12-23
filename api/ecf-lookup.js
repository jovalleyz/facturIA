import { load } from 'cheerio';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // Validate standard DGII URL format for security
    // Example: https://ecf.dgii.gov.do/eCF/ConsultaTimbre?RncEmisor=...
    if (!url.startsWith('https://ecf.dgii.gov.do/eCF/ConsultaTimbre')) {
        return res.status(400).json({ error: 'Invalid DGII URL' });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`DGII site responded with ${response.status}`);
        }

        const html = await response.text();
        const $ = load(html);

        // Extraction logic based on the DGII page structure provided by user
        // The structure typically uses table rows with labels and values.
        // Based on image: 
        // RNC Emisor, Razón social emisor, RNC Comprador, Razón social comprador, 
        // e-NCF, Fecha de Emisión, Total de ITBIS, Monto Total, Estado.

        const getDataByLabel = (label) => {
            // Find the row that contains the label
            const labelCell = $(`td:contains("${label}")`);
            if (labelCell.length > 0) {
                // Return the text of the *next* sibling cell (value)
                return labelCell.next('td').text().trim();
            }
            return null;
        };

        const rncEmisor = getDataByLabel('RNC Emisor');
        const razonSocialEmisor = getDataByLabel('Razón social emisor');
        const ncf = getDataByLabel('e-NCF');
        const fechaEmision = getDataByLabel('Fecha de Emisión');
        const itbis = getDataByLabel('Total de ITBIS');
        const total = getDataByLabel('Monto Total');
        const estado = getDataByLabel('Estado');

        // Manual mapping to app schema
        // App schema: 
        // rnc, ncf, fecha (YYYY-MM-DD), nombre_negocio, total (number), itbis (number), propina (0), categoria (default)

        const parseAmount = (str) => {
            if (!str) return 0;
            return parseFloat(str.replace(/,/g, ''));
        };

        const parseDate = (dateStr) => {
            if (!dateStr) return '';
            // DGII format seems to be DD-MM-YYYY
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
            }
            return dateStr;
        };

        const result = {
            rnc: rncEmisor,
            ncf: ncf ? (ncf.match(/([BE].*)/i)?.[1]?.toUpperCase() || ncf) : null,
            fecha: parseDate(fechaEmision),
            nombre_negocio: razonSocialEmisor,
            total: parseAmount(total),
            itbis: parseAmount(itbis),
            propina: 0, // DGII page usually doesn't show legal tip in the summary, defaulting to 0
            categoria: 'Otros', // Default
            source: 'dgii-ecf',
            estado: estado // 'Aceptado', etc.
        };

        if (!result.ncf || !result.total) {
            // If critical fields are missing, perhaps standard scraping failed or page changed layout
            console.error("Scraping Incomplete:", result);
            return res.status(500).json({ error: 'Failed to extract data from DGII page' });
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error('DGII Scraper Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

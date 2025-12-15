import { ImageAnnotatorClient } from '@google-cloud/vision';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image, type } = req.body; // Base64 image, type ('expense' | 'income')
        if (!image) {
            return res.status(400).json({ error: 'Missing image data' });
        }

        // AUTH: Google Cloud Vision
        // We expect GOOGLE_CREDENTIALS_JSON env var containing the full Service Account JSON
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

        const client = new ImageAnnotatorClient({
            credentials: {
                client_email: credentials.client_email,
                private_key: credentials.private_key,
                project_id: credentials.project_id,
            },
        });

        // 1. OCR with Google Cloud Vision
        const [result] = await client.textDetection({
            image: { content: image },
        });

        const fullText = result.fullTextAnnotation?.text;

        if (!fullText) {
            return res.status(400).json({ error: 'No text found in image' });
        }

        // --- 2. TIER 2: REGEX PARSING (Traditional Invoices) ---
        // Attempt to extract structured data using rigid patterns to avoid AI costs/latency.
        try {
            console.log("Tier 2: Attempting Regex extraction...");
            const extractedData = {};

            // NCF Pattern: B followed by 10 digits (e.g. B0100000154)
            const ncfMatch = fullText.match(/\b(B\d{10})\b/i);
            if (ncfMatch) extractedData.ncf = ncfMatch[1].toUpperCase();

            // RNC Pattern: 9 or 11 digits, often labeled "RNC"
            // We look for a standalone sequence of 9 or 11 digits that isn't the NCF
            const rncMatches = fullText.matchAll(/\b(\d{9}|\d{11})\b/g);
            for (const match of rncMatches) {
                const val = match[1];
                if (val !== '131932037' && val !== extractedData.ncf) { // Ignore OVM RNC if present
                    extractedData.rnc = val;
                    break; // Take the first reasonable RNC found
                }
            }

            // Date Pattern: DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD
            const dateMatch = fullText.match(/\b(\d{2})[-/](\d{2})[-/](\d{4})\b/) ||
                fullText.match(/\b(\d{4})[-/](\d{2})[-/](\d{2})\b/);

            if (dateMatch) {
                if (dateMatch[1].length === 4) {
                    extractedData.fecha = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`; // YYYY-MM-DD
                } else {
                    extractedData.fecha = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`; // DD-MM-YYYY -> YYYY-MM-DD
                }
            }

            // Total Amount Pattern: usually the largest currency-like number at the bottom
            // Strategy: Find all numbers with decimals, pick the largest one.
            const moneyMatches = fullText.matchAll(/(\d{1,3}(?:,\d{3})*\.\d{2})/g);
            let maxAmount = 0;
            for (const match of moneyMatches) {
                const val = parseFloat(match[1].replace(/,/g, ''));
                if (val > maxAmount) maxAmount = val;
            }
            if (maxAmount > 0) extractedData.total = maxAmount;

            // ITBIS (18%) estimation
            if (extractedData.total) {
                extractedData.itbis = parseFloat((extractedData.total * 0.18 / 1.18).toFixed(2)); // Rough estimate
            }

            // Decision: Do we have enough confidence?
            // If we have NCF, Total, and Date, we treat it as Success for Tier 2.
            const isConfidenceHigh = extractedData.ncf && extractedData.total && extractedData.fecha;

            if (isConfidenceHigh) {
                console.log("Tier 2 Success:", extractedData);
                return res.status(200).json({
                    ...extractedData,
                    nombre_negocio: "Detectado por OCR", // Placeholder, difficult to get accurate name via Regex
                    categoria: "Otros",
                    propina: 0,
                    source: "vision-regex"
                });
            }
            console.log("Tier 2 Failed (Low Confidence). Proceeding to Gemini...");

        } catch (regexError) {
            console.error("Tier 2 Error:", regexError);
            // Verify we don't crash, just continue to Gemini
        }


        // --- 3. TIER 3: AI PARSING (Gemini 2.5) ---
        // Verified ID from search: gemini-2.5-flash-lite
        const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
        const MODEL_ID = 'gemini-2.5-flash-lite';

        let prompt;
        const RNC_BLOCKLIST = '131932037, 131-93203-7, 131932037, 131-93203-7';
        const NAME_BLOCKLIST = '"OVM CONSULTING", "OVALLEY & EMPULSO", "OVALLEY & EMPULSO PROFESSIONAL CONSULTANTS"';

        if (type === 'income') {
            prompt = `Analiza este documento. Es una FACTURA DE INGRESO.
             TU OBJETIVO: Extraer los datos del CLIENTE a quien se le factura.

             REGLAS CRÍTICAS DE EXTRACCIÓN:
             1. BUSCA EL CAMPO "CLIENTE:" o "FACTURADO A:". El valor que sigue es el 'nombre_negocio'.
             2. PROHIBIDO: NUNCA uses ${NAME_BLOCKLIST} ni sus variaciones como 'nombre_negocio'.
             3. PROHIBIDO: NUNCA uses el RNC "131932037" o sus formatos como 'rnc'. Ese es el RNC de OVM. Busca el RNC del CLIENTE.
             4. Si no encuentras un cliente distinto al emisor, devuelve null en 'nombre_negocio' y 'rnc'.

             Extrae en JSON puro: 
             rnc (del CLIENTE), 
             ncf (ej: B0100000154), 
             fecha (YYYY-MM-DD), 
             nombre_negocio (El nombre del CLIENTE), 
             moneda (Detectar si es "DOP" o "USD"),
             total (número), 
             itbis18 (número, impuesto facturado), 
             itbis16 (número), 
             propina (número), 
             categoria (Sugerir una de: "Salario", "Freelance", "Asesorías", "Venta de Artículos", "Ventas varias", "Alquiler", "Otros"),
             descripcion (Breve descripción del concepto).
             Texto:
             ${fullText}`;
        } else {
            prompt = `Analiza este texto extraído de una factura de gasto dominicana.
             TU OBJETIVO: Extraer los datos del PROVEEDOR que emite la factura.

             REGLAS DE PROPINA (LEY REP. DOM):
             1. Busca términos como "10% Ley", "10%", "Propina", "%LEY", "%Ley".
             2. Si existe, asígnalo al campo 'propina'.
             3. VALIDACIÓN: La propina debe ser estrictamente el 10% del monto neto (Subtotal). Total = Neto + ITBIS + Propina.
             
             REGLAS DE EXCLUSIÓN (OVM):
             1. El RNC "131932037" (OVM Consulting) NO es el proveedor. NO lo captures como 'rnc'.
             2. Busca el RNC del negocio que emitió la factura.
             
             Extrae en JSON puro: 
             rnc (del PROVEEDOR, ignora ${RNC_BLOCKLIST}), 
             ncf, 
             fecha (YYYY-MM-DD), 
             nombre_negocio (El que vende), 
             moneda (Detectar si es "DOP" o "USD"), 
             total (número), 
             itbis18 (número, por defecto el 18% va aquí), 
             itbis16 (número, si explícitamente es 16%), 
             propina (número, validar 10% ley), 
             categoria.
             Texto:
             ${fullText}`;
        }

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const geminiData = await geminiResponse.json();
        const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            console.error('Gemini Parsing Failed. Full Response:', JSON.stringify(geminiData, null, 2));
            throw new Error(`Gemini parsing failed. Model: ${MODEL_ID}. Status: ${geminiResponse.status} - ${geminiData.error?.message || 'Unknown error'}`);
        }

        const cleanJson = textResponse.replace(/```json|```/g, '').trim();
        let parsedData = JSON.parse(cleanJson);

        // USD Conversion Logic
        if (parsedData.moneda === 'USD') {
            try {
                console.log('USD detected, fetching exchange rate...');
                const infoDolarResponse = await fetch('https://www.infodolar.com.do/');
                const html = await infoDolarResponse.text();

                // Regex to find the "Venta" rate in the table with id="DolarPromedio"
                // We look for the table, then the row with "Promedio InfoDolar", then the 3rd cell (Venta)
                // Structure: <table ... id="DolarPromedio"> ... <tbody> ... <td ...>Promedio InfoDolar</td> ... <td ...>Compra</td> ... <td ...>Venta</td>

                // Simplified regex approach: Find "Promedio InfoDolar", then look for the next two "colCompraVenta" cells
                // The Venta rate is in the second "colCompraVenta" cell after "Promedio InfoDolar"

                // Let's try to match the specific cell content for Venta
                // <td class="colCompraVenta" data-order="$64.48">

                const promedioMatch = html.match(/id="DolarPromedio"[\s\S]*?Promedio InfoDolar[\s\S]*?colCompraVenta[\s\S]*?colCompraVenta[^>]*>([\s\S]*?)<\/td>/);

                if (promedioMatch && promedioMatch[1]) {
                    // Extract the number from the cell content (e.g., "$64.48 ...")
                    const rateMatch = promedioMatch[1].match(/\$(\d+\.\d+)/);
                    if (rateMatch && rateMatch[1]) {
                        const rate = parseFloat(rateMatch[1]);
                        parsedData.tasa_cambio = rate;
                        parsedData.total_dop = parsedData.total * rate;
                        console.log(`Exchange rate found: ${rate}. Total DOP: ${parsedData.total_dop}`);
                    }
                }
            } catch (error) {
                console.error('Error fetching exchange rate:', error);
                // Fallback: User will have to enter it manually
            }
        }

        return res.status(200).json(parsedData);

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

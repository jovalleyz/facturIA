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

        // 2. Parse with Gemini 2.5 Flash Lite (User Specified)
        // Verified ID from search: gemini-2.5-flash-lite
        const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
        const MODEL_ID = 'gemini-2.5-flash-lite';

        let prompt;
        if (type === 'income') {
            prompt = `Analiza este texto de un comprobante de ingreso o factura de venta emitida por "OVM Consulting".
             IMPORTANTE: El campo 'nombre_negocio' DEBE ser el nombre del CLIENTE a quien se le factura, NO "OVM Consulting".
             IMPORTANTE: Ignora los RNC "131932037", "131-93203-7" o similares que correspondan a OVM Consulting. Busca el RNC del CLIENTE.
             Extrae en JSON puro: 
             rnc (del CLIENTE si aparece, NO de OVM Consulting ni 131932037), 
             ncf (si aplica), 
             fecha (YYYY-MM-DD), 
             nombre_negocio (Nombre del CLIENTE o Fuente del Ingreso. Ignora "OVM Consulting"), 
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
            prompt = `Analiza este texto extraído de una factura de gasto dominicana. Extrae en JSON puro: rnc, ncf, fecha (YYYY-MM-DD), nombre_negocio, moneda (Detectar si es "DOP" o "USD"), total (número), itbis18 (número, por defecto el 18% va aquí), itbis16 (número, si explícitamente es 16%), propina (número), categoria.
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

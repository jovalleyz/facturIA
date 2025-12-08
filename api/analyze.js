import { ImageAnnotatorClient } from '@google-cloud/vision';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image } = req.body; // Base64 image
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

        // 2. Parse with Gemini 1.5 Flash (Cheap & Fast)
        // We reuse the VITE_GEMINI_API_KEY (safely used on server side here)
        const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
        const prompt = `Analiza este texto extraído de una factura dominicana. Extrae en JSON puro: rnc, ncf, fecha (YYYY-MM-DD), nombre_negocio, total (número), itbis (número), propina (número), categoria.
    Texto:
    ${fullText}`;

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const geminiData = await geminiResponse.json();
        const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error('Gemini parsing failed');
        }

        const cleanJson = textResponse.replace(/```json|```/g, '').trim();
        const parsedData = JSON.parse(cleanJson);

        return res.status(200).json(parsedData);

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

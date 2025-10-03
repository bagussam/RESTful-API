// Mengimpor modul yang diperlukan
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

// --- Inisialisasi Aplikasi ---
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
// Menggunakan nama variabel 'ai' sesuai materi asli
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

// --- Konfigurasi Model Default ---
const GEMINI_MODEL = "gemini-2.5-flash";

// --- Middleware ---
app.use(express.json());

// --- Helper Function untuk Ekstraksi Teks (sesuai materi asli) ---
// Fungsi ini dirancang untuk mengambil teks dari struktur respons API versi lama
function extractText(resp) {
  try {
    const candidate = resp?.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    if (part?.text) {
      return part.text;
    }
    // Fallback jika struktur berbeda
    return JSON.stringify(resp, null, 2);
  } catch (err) {
    console.error("Error saat mengekstrak teks:", err);
    return JSON.stringify(resp, null, 2);
  }
}

// --- Definisi Endpoint API ---

// 1. Endpoint untuk menghasilkan konten dari prompt teks
app.post('/generate-text', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    
    // Menggunakan sintaks API yang benar untuk versi pustaka Anda
    const resp = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ parts: [{ text: prompt }] }],
    });

    res.json({ result: extractText(resp) });
  } catch (err) {
    console.error("Error di /generate-text:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Endpoint untuk menghasilkan konten dari gambar
app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: "Image file is required" });
        }
        
        const imagePart = {
            inlineData: {
                mimeType: req.file.mimetype,
                data: req.file.buffer.toString('base64')
            }
        };

        const resp = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { parts: [{ text: prompt || "Jelaskan gambar ini." }] },
                { parts: [imagePart] }
            ]
        });

        res.json({ result: extractText(resp) });
    } catch (err) {
        console.error("Error di /generate-from-image:", err);
        res.status(500).json({ error: err.message });
    }
});

// 3. Endpoint untuk menghasilkan konten dari dokumen
app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: "Document file is required" });
        }

        const documentPart = {
            inlineData: {
                mimeType: req.file.mimetype,
                data: req.file.buffer.toString('base64')
            }
        };

        const resp = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { parts: [{ text: prompt || "Ringkas dokumen berikut:" }] },
                { parts: [documentPart] }
            ]
        });

        res.json({ result: extractText(resp) });
    } catch (err) {
        console.error("Error di /generate-from-document:", err);
        res.status(500).json({ error: err.message });
    }
});

// 4. Endpoint untuk menghasilkan konten dari audio
app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: "Audio file is required" });
        }

        const audioPart = {
            inlineData: {
                mimeType: req.file.mimetype,
                data: req.file.buffer.toString('base64')
            }
        };

        const resp = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { parts: [{ text: prompt || "Transkripsikan audio berikut:" }] },
                { parts: [audioPart] }
            ]
        });

        res.json({ result: extractText(resp) });
    } catch (err) {
        console.error("Error di /generate-from-audio:", err);
        res.status(500).json({ error: err.message });
    }
});


// --- Menjalankan Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});


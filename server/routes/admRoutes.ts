import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { fetchADMListini, downloadADMPdfAsBase64 } from '../services/admService.js';
import { analyzeTextWithAI } from '../services/aiAnalyzer.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const admLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: { success: false, error: "Troppe richieste da questo IP, riprova più tardi." }
});

const router = Router();

// Apply rate limiter on all ADM routes
router.use(admLimiter);

/**
 * GET /api/adm/listini
 * Retrieve the list of available price lists on the ADM website
 */
router.get("/listini", requireAdmin, async (_req, res) => {
  try {
    const listini = await fetchADMListini();
    res.json({ success: true, listini });
  } catch (err: any) {
    console.error("Error in /api/adm/listini:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/adm/download
 * Downloads a PDF from the ADM website and returns it in Base64 (Protected against SSRF)
 */
router.get("/download", requireAdmin, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "URL obbligatorio" });
    }
    
    // SSRF Prevention: Extract only the PATH and force authorized hostname in service
    let pathOnly: string;
    try {
      const parsedUrl = new URL(url);
      // Only allow ADM hostname if it's a complete URL
      if (parsedUrl.hostname !== 'www.adm.gov.it') {
         return res.status(400).json({ error: "Accesso negato: Hostname non autorizzato." });
      }
      pathOnly = parsedUrl.pathname + parsedUrl.search;
    } catch (e) {
      // If it's not a valid URL, it might already be a relative path
      pathOnly = url.startsWith('/') ? url : `/${url}`;
    }
    
    const base64 = await downloadADMPdfAsBase64(pathOnly);
    res.json({ success: true, base64 });
  } catch (err: any) {
    console.error("Error in /api/adm/download:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/adm/analyze
 * Analyze text extracted from PDF via Gemini AI protected in the Backend
 */
router.post("/analyze", requireAdmin, async (req, res) => {
  try {
    console.log("Analyze request body keys:", Object.keys(req.body || {}));
    const { fileName, textData, aiModel } = req.body;
    if (!fileName || !textData) {
        return res.status(400).json({ error: "Parametri mancanti: fileName e textData sono obbligatori." });
    }
    const result = await analyzeTextWithAI(fileName, textData, aiModel);
    res.json({ success: true, result });
  } catch (err: any) {
    console.error("Error in /api/adm/analyze:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

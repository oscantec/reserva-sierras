import { fetchSheetData } from '../lib/sheets-utils.js';
import { getServerConfig, normalizePrivateKey } from '../lib/server-config.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const config = await getServerConfig();

        // El sheetId puede venir del cliente o de la config guardada en Supabase
        const sheetId = req.body?.sheetId || config.googleSheetsId;
        const sheetName = req.body?.sheetName;

        if (!sheetId) {
            return res.status(400).json({ error: 'Missing sheetId' });
        }

        // Credenciales: primero variables de entorno (si existen), si no, la config de Supabase
        const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || config.googleServiceAccountEmail;
        const privateKey = normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY || config.googlePrivateKey);

        if (!email || !privateKey) {
            return res.status(500).json({ error: 'Credenciales de Google no configuradas' });
        }

        const data = await fetchSheetData(sheetId, sheetName, email, privateKey);
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

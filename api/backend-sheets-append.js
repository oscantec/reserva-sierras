import { appendSheetData } from '../lib/sheets-utils.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { sheetId, sheetName, rowData } = req.body;

        if (!sheetId || !rowData) {
            return res.status(400).json({ error: 'Missing sheetId or rowData' });
        }

        const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

        if (!email || !privateKey) {
            return res.status(500).json({ error: 'Credenciales de Google no configuradas en el servidor' });
        }

        const data = await appendSheetData(sheetId, sheetName, email, privateKey, rowData);
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('API Append Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

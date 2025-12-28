import { appendSheetData } from '../lib/sheets-utils.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { sheetId, sheetName, email, privateKey, rowData } = req.body;

        if (!sheetId || !email || !privateKey || !rowData) {
            throw new Error('Missing required data');
        }

        const data = await appendSheetData(sheetId, sheetName, email, privateKey, rowData);
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('API Append Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

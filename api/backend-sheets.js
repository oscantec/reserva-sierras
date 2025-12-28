import { fetchSheetData } from '../lib/sheets-utils.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { sheetId, sheetName, email, privateKey } = req.body;

        if (!sheetId || !email || !privateKey) {
            throw new Error('Missing required credentials');
        }

        const data = await fetchSheetData(sheetId, sheetName, email, privateKey);
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

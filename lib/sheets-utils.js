import KJUR from 'jsrsasign';

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const TOKEN_URI = 'https://oauth2.googleapis.com/token';

async function getAccessToken(email, privateKey) {
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const claimSet = {
        iss: email,
        scope: SCOPES,
        aud: TOKEN_URI,
        exp: now + 3600,
        iat: now
    };

    const sHeader = JSON.stringify(header);
    const sClaimSet = JSON.stringify(claimSet);

    // Private Key Sanitization
    privateKey = privateKey.replace(/\\n/g, '\n');
    privateKey = privateKey.replace(/\\\\n/g, '\n');
    privateKey = privateKey.trim();

    if (!privateKey.includes('-----BEGIN') || !privateKey.includes('-----END')) {
        throw new Error('Invalid private key format: missing BEGIN/END markers.');
    }

    const sJWS = KJUR.jws.JWS.sign('RS256', sHeader, sClaimSet, privateKey);

    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    params.append('assertion', sJWS);

    const response = await fetch(TOKEN_URI, {
        method: 'POST',
        body: params
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Token Error: ${text}`);
    }

    const data = await response.json();
    return data.access_token;
}

export async function fetchSheetData(sheetId, sheetName, email, privateKey) {
    const token = await getAccessToken(email, privateKey);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}`;
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
        throw new Error(`Sheets API Error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    return parseSheetData(data.values || []);
}

export async function appendSheetData(sheetId, sheetName, email, privateKey, rowData) {
    const token = await getAccessToken(email, privateKey);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            values: [rowData]
        })
    });

    if (!res.ok) {
        throw new Error(`Sheets API Append Error: ${res.status} ${await res.text()}`);
    }

    return await res.json();
}

function parseSheetData(values) {
    if (!values || values.length < 2) return []
    const headers = values[0].map(h => h.toString().trim())
    const rows = values.slice(1)
    return rows.map(row => {
        const obj = {}
        headers.forEach((header, index) => {
            obj[header] = row[index] || ''
        })
        return obj
    })
}

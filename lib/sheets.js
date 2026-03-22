import { google } from 'googleapis'

const SHEET_ID   = process.env.SHEET_ID
const SHEET_NAME = process.env.SHEET_NAME || 'Aday Listesi'

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('eksik')
  let creds
  try { creds = JSON.parse(raw) }
  catch(e) { throw new Error('parse: ' + e.message) }
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

export async function getRows() {
  const auth   = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME + '!A1:I3000',
    })
    const rows = res.data.values || []
    return rows.slice(1).map((r, i) => ({
      rowNum:  i + 2,
      isim:    r[0] || '',
      meslek:  r[1] || '',
      email:   r[2] || '',
      tel:     r[3] || '',
      almanca: r[4] || '',
      tarih:   r[5] || '',
      notlar:  r[6] || '',
      durum:   r[7] || 'Yeni',
      atanan:  r[8] || '',
    })).filter(r => r.isim && !r.isim.startsWith('--'))
  } catch(e) {
    const d = e.response ? JSON.stringify(e.response.data) : e.message
    throw new Error('err:' + d + ' id:' + SHEET_ID)
  }
}

export async function updateRow(rowNum, notlar, durum, atanan) {
  const auth   = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: SHEET_NAME + '!G' + rowNum + ':I' + rowNum,
    valueInputOption: 'RAW',
    requestBody: { values: [[notlar, durum, atanan]] },
  })
}

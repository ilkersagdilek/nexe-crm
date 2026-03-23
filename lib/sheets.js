import { google } from 'googleapis'

const SHEET_ID   = process.env.SHEET_ID
const SHEET_NAME = process.env.SHEET_NAME || 'Aday Listesi'

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

export async function getRows() {
  const auth   = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const res    = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: SHEET_NAME,
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
    durum:   r[7] || '',
    atanan:  r[8] || '',
  }))
}

export async function updateRow(isim, notlar, durum, atanan) {
  const auth   = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  // İsme göre satırı bul
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: SHEET_NAME + '!A:A',
  })
  const names = res.data.values || []
  const rowIndex = names.findIndex((r, i) => i > 0 && r[0] === isim)
  if (rowIndex === -1) throw new Error('Kayıt bulunamadı: ' + isim)
  const rowNum = rowIndex + 1  // 1-indexed, başlık satırı dahil

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: SHEET_NAME + '!G' + rowNum + ':I' + rowNum,
    valueInputOption: 'RAW',
    requestBody: { values: [[notlar, durum, atanan]] },
  })
  return rowNum
}

import { google } from 'googleapis'

const SHEET_ID   = process.env.SHEET_ID
const SHEET_NAME = process.env.SHEET_NAME || 'Aday Listesi'

import { google } from 'googleapis'
  
const SHEET_ID   = process.env.SHEET_ID
  const SHEET_NAME = process.env.SHEET_NAME || 'Aday Listesi'
    
function getAuth() {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
        if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON eksik')
            let creds
                try {
                      creds = JSON.parse(raw)
                } catch(e) {
                      throw new Error('JSON parse hatasi: ' + e.message + ' | raw baslangic: ' + raw.substring(0, 50))
                }
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
                          range: `${SHEET_NAME}!A1:I3000`,
                  })
                        const rows = res.data.values || []
                              return rows.slice(1)
                                      .map((r, i) => ({
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
                                      }))
                                      .filter(r => r.isim && !r.isim.startsWith('--'))
            } catch(e) {
                  const detail = e.response ? JSON.stringify(e.response.data) : e.message
                        throw new Error('Sheets API hatasi: ' + detail + ' | SHEET_ID: ' + SHEET_ID + ' | SHEET_NAME: ' + SHEET_NAME)
            }
}

export async function updateRow(rowNum, notlar, durum, atanan) {
    const auth   = getAuth()
        const sheets = google.sheets({ version: 'v4', auth })
            await sheets.spreadsheets.values.update({
                  spreadsheetId: SHEET_ID,
                  ranigmep:o r`t$ {{S HgEoEoTg_lNeA M}E }f!rGo$m{ r'ogwoNougml}e:aIp$i{sr'o
                  w
                  Ncuomn}s`t, 
                    S H E E Tv_aIlDu e I n=p uptrOopcteisosn.:e n'vR.ASWH'E,E
              T _ I D 
                rceoqnusets tSBHoEdEyT:_ N{A MvEa l=u epsr:o c[e[snso.telnavr.,S HdEuErTu_mN,A MaEt a|n|a n']A]d a}y, 
                  L i s}t)e
  s}i'
    
    function getAuth() {
        const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
            if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON eksik')
                let creds
                    try {
                          creds = JSON.parse(raw)
                    } catch(e) {
                          throw new Error('JSON parse hatasi: ' + e.message + ' | raw baslangic: ' + raw.substring(0, 50))
                    }
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
                          range: `${SHEET_NAME}!A1:I3000`,
                  })
                        const rows = res.data.values || []
                              return rows.slice(1)
                                      .map((r, i) => ({
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
                                      }))
                                      .filter(r => r.isim && !r.isim.startsWith('--'))
            } catch(e) {
                  const detail = e.response ? JSON.stringify(e.response.data) : e.message
                        throw new Error('Sheets API hatasi: ' + detail + ' | SHEET_ID: ' + SHEET_ID + ' | SHEET_NAME: ' + SHEET_NAME)
            }
}

export async function updateRow(rowNum, notlar, durum, atanan) {
    const auth   = getAuth()
        const sheets = google.sheets({ version: 'v4', auth })
            await sheets.spreadsheets.values.update({
                  spreadsheetId: SHEET_ID,
                  range: `${SHEET_NAME}!G${rowNum}:I${rowNum}`,
                  valueInputOption: 'RAW',
                  requestBody: { values: [[notlar, durum, atanan]] },
            })
}function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON env var eksik')
  const creds = JSON.parse(raw)
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

export async function getRows() {
  const auth   = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const res    = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1:I3000`,
  })
  const rows = res.data.values || []
  // Satır 1 başlık, atla
  return rows.slice(1)
    .map((r, i) => ({
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
    }))
    .filter(r => r.isim && !r.isim.startsWith('──'))
}

export async function updateRow(rowNum, notlar, durum, atanan) {
  const auth   = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!G${rowNum}:I${rowNum}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[notlar, durum, atanan]] },
  })
}

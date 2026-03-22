import { getRows, updateRow } from '../../lib/sheets'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { rowNum, note, durum, atanan, kullanici } = req.body
  if (!rowNum) return res.status(400).json({ error: 'rowNum gerekli' })

  try {
    // Mevcut notu al
    const rows = await getRows()
    const row  = rows.find(r => r.rowNum === rowNum)
    const existingNotes = row?.notlar || ''

    let combined = existingNotes
    if (note && note.trim()) {
      const now = new Date().toLocaleString('tr-TR', {
        timeZone: 'Europe/Berlin',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
      const line = `[${now} · ${kullanici || 'Kullanıcı'}]: ${note.trim()}`
      combined = existingNotes ? existingNotes + '\n' + line : line
    }

    await updateRow(rowNum, combined, durum || row?.durum || 'Yeni', atanan || row?.atanan || '')
    res.status(200).json({ ok: true, notlar: combined })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
}

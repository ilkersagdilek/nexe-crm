import { getRows, updateRow } from '../../lib/sheets'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { rowNum, isim, note, durum, atanan, kullanici } = req.body
  if (!isim && !rowNum) return res.status(400).json({ error: 'isim veya rowNum gerekli' })

  try {
    // Mevcut notu al
    const rows = await getRows()
    const row  = isim
      ? rows.find(r => r.isim === isim)
      : rows.find(r => r.rowNum === rowNum)
    if (!row) return res.status(404).json({ error: 'Kayıt bulunamadı' })

    const ts       = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Berlin' })
    const newLine  = note ? '[' + ts + ' · ' + kullanici + ']: ' + note : ''
    const combined = [row.notlar, newLine].filter(Boolean).join('\n')

    // İsim bazlı güncelle (kayma olmaz)
    await updateRow(row.isim, combined, durum !== undefined ? durum : (row.durum || 'Aday'), atanan !== undefined ? atanan : (row.atanan || ''))

    res.json({ ok: true, notlar: combined })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

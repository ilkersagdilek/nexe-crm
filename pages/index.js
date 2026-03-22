import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './index.module.css'

const KULLANICILAR = ['İlker', 'Dr. Levent', 'Hakan']

const DURUMLAR = [
  { key: 'Yeni',          label: 'Yeni',           bg: '#E8EAF6', color: '#283593' },
  { key: 'Arama Yapıldı', label: 'Arama Yapıldı',  bg: '#E3F2FD', color: '#0D47A1' },
  { key: 'Olumlu',        label: 'Olumlu â',        bg: '#E8F5E9', color: '#1B5E20' },
  { key: 'Olumsuz',       label: 'Olumsuz â',       bg: '#FFEBEE', color: '#B71C1C' },
  { key: 'Müşteri Oldu',  label: 'Müşteri Oldu â',  bg: '#F3E5F5', color: '#4A148C' },
]

export default function Home() {
  const [authed,    setAuthed]    = useState(false)
  const [password,  setPassword]  = useState('')
  const [pwError,   setPwError]   = useState('')
  const [kullanici, setKullanici] = useState('')
  const [rows,      setRows]      = useState([])
  const [loading,   setLoading]   = useState(false)
  const [search,    setSearch]    = useState('')
  const [fMeslek,   setFMeslek]   = useState('')
  const [fDurum,    setFDurum]    = useState('')
  const [fAtanan,   setFAtanan]   = useState('')
  const [modal,     setModal]     = useState(null)  // { row }
  const [noteText,  setNoteText]  = useState('')
  const [selDurum,  setSelDurum]  = useState('')
  const [saving,    setSaving]    = useState(false)
  const [toast,     setToast]     = useState(null)
  const noteRef = useRef()

  // ââ AUTH ââââââââââââââââââââââââââââââââââââââââââââ
  async function handleLogin(e) {
    e.preventDefault()
    if (!kullanici) { setPwError('Lütfen adınızı seçin.'); return }
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (data.ok) {
      sessionStorage.setItem('nexe_user', kullanici)
      setAuthed(true)
      loadRows()
    } else {
      setPwError('Hatalı şifre.')
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem('nexe_user')
    if (saved) { setKullanici(saved); setAuthed(true); loadRows() }
  }, [])

  // ââ DATA ââââââââââââââââââââââââââââââââââââââââââââ
  async function loadRows() {
    setLoading(true)
    try {
      const res  = await fetch('/api/rows')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setRows(data.rows)
    } catch(e) {
      showToast('Veri yüklenemedi: ' + e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function saveNote() {
    if (!modal) return
    setSaving(true)
    try {
      const res = await fetch('/api/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowNum:    modal.row.rowNum,
          note:      noteText,
          durum:     selDurum,
          atanan:    kullanici,
          kullanici: kullanici,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      // Local state güncelle
      setRows(prev => prev.map(r =>
        r.rowNum === modal.row.rowNum
          ? { ...r, notlar: data.notlar, durum: selDurum, atanan: kullanici }
          : r
      ))
      showToast('Kaydedildi â', 'success')
      setModal(null)
    } catch(e) {
      showToast('Hata: ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // ââ MODAL âââââââââââââââââââââââââââââââââââââââââââ
  function openModal(row) {
    setModal({ row })
    setNoteText('')
    setSelDurum(row.durum || 'Yeni')
    setTimeout(() => noteRef.current?.focus(), 100)
  }

  function closeModal() { setModal(null) }

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') closeModal()
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && modal) saveNote()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [modal, noteText, selDurum])

  // ââ TOAST âââââââââââââââââââââââââââââââââââââââââââ
  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ââ FILTER ââââââââââââââââââââââââââââââââââââââââââ
  const filtered = rows.filter(r => {
    const q = search.toLowerCase()
    const textMatch = !q || [r.isim, r.email, r.tel, r.meslek, r.notlar]
      .join(' ').toLowerCase().includes(q)
    const mMatch = !fMeslek
      || (fMeslek === '__bos__' ? !r.meslek : r.meslek === fMeslek)
    const dMatch = !fDurum  || (r.durum || 'Yeni') === fDurum
    const aMatch = !fAtanan || r.atanan === fAtanan
    return textMatch && mMatch && dMatch && aMatch
  })

  // Stats
  const tip   = rows.filter(r => r.meslek === 'Tıp Doktoru').length
  const dis   = rows.filter(r => r.meslek === 'Diş Hekimi').length
  const ecz   = rows.filter(r => r.meslek === 'Eczacı').length
  const bos   = rows.filter(r => !r.meslek).length
  const olumlu = rows.filter(r => r.durum === 'Olumlu').length
  const musteri = rows.filter(r => r.durum === 'Müşteri Oldu').length

  // ââ LOGIN SCREEN ââââââââââââââââââââââââââââââââââââ
  if (!authed) return (
    <div className={styles.loginBg}>
      <form className={styles.loginCard} onSubmit={handleLogin}>
        <div className={styles.loginLogo}>NEXE</div>
        <div className={styles.loginSub}>ADAY PIPELINE · CRM</div>
        <div className={styles.loginField}>
          <label>Adınız</label>
          <select value={kullanici} onChange={e => setKullanici(e.target.value)} required>
            <option value="">Seçin...</option>
            {KULLANICILAR.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className={styles.loginField}>
          <label>Şifre</label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setPwError('') }}
            placeholder="â¢â¢â¢â¢â¢â¢â¢â¢"
            autoFocus
          />
        </div>
        {pwError && <div className={styles.pwError}>{pwError}</div>}
        <button type="submit" className={styles.btnLogin}>Giriş Yap â</button>
      </form>
    </div>
  )

  // ââ MAIN APP ââââââââââââââââââââââââââââââââââââââââ
  return (
    <div className={styles.app}>

      {/* HEADER */}
      <header className={styles.header}>
        <span className={styles.brand}>NEXE</span>
        <div className={styles.hdivider} />
        <span className={styles.pageTitle}>Aday Pipeline</span>
        <div className={styles.headerRight}>
          <span className={styles.userBadge}>{kullanici}</span>
          <button className={styles.btnSignout} onClick={() => {
            sessionStorage.removeItem('nexe_user'); setAuthed(false)
          }}>Ãıkış</button>
        </div>
      </header>

      {/* STATS */}
      <div className={styles.statsBar}>
        <Stat color="#E65100" num={tip}     label="Tıp Dr." />
        <Stat color="#1B5E20" num={dis}     label="Diş Hek." />
        <Stat color="#0D47A1" num={ecz}     label="Eczacı" />
        <Stat color="#9E9E9E" num={bos}     label="Belirsiz" />
        <div className={styles.statsSep} />
        <Stat color="#1B5E20" num={olumlu}  label="Olumlu" />
        <Stat color="#4A148C" num={musteri} label="Müşteri" />
        <Stat color="#C62828" num={rows.length} label="Toplam" right />
      </div>

      {/* TOOLBAR */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <SearchIcon />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="İsim, e-posta, telefon ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>Ã</button>}
        </div>
        <select className={styles.select} value={fMeslek} onChange={e => setFMeslek(e.target.value)}>
          <option value="">Tüm Meslekler</option>
          <option value="Tıp Doktoru">Tıp Doktoru</option>
          <option value="Diş Hekimi">Diş Hekimi</option>
          <option value="Eczacı">Eczacı</option>
          <option value="__bos__">Meslek Belirsiz</option>
        </select>
        <select className={styles.select} value={fDurum} onChange={e => setFDurum(e.target.value)}>
          <option value="">Tüm Durumlar</option>
          {DURUMLAR.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
        </select>
        <select className={styles.select} value={fAtanan} onChange={e => setFAtanan(e.target.value)}>
          <option value="">Tüm Ekip</option>
          {KULLANICILAR.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <button className={styles.btnRefresh} onClick={loadRows} disabled={loading}>
          {loading ? 'â³' : 'â»'} Yenile
        </button>
        <span className={styles.countBadge}>{filtered.length} kayıt</span>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrap}>
        {loading && rows.length === 0 ? (
          <div className={styles.loadingMsg}><span className={styles.spinner} /> Yükleniyor...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>İsim Soyisim</th>
                <th>Meslek</th>
                <th className={styles.hideM}>E-Posta</th>
                <th>Telefon</th>
                <th className={styles.hideM}>Almanca</th>
                <th className={styles.hideM}>Sunum Tarihi</th>
                <th>Durum</th>
                <th className={styles.hideS}>Atanan</th>
                <th>Son Not</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let prevGroup = null
                let idx = 0
                const elems = []
                filtered.forEach(r => {
                  const group = r.meslek ? 'dolu' : 'bos'
                  if (prevGroup === 'dolu' && group === 'bos') {
                    elems.push(
                      <tr key="sep" className={styles.sepRow}>
                        <td colSpan={11}>ââ Meslek bilgisi girilmemiş katılımcılar ââ</td>
                      </tr>
                    )
                  }
                  prevGroup = group
                  idx++
                  const durum = r.durum || 'Yeni'
                  const lastNote = r.notlar
                    ? r.notlar.split('\n').pop().substring(0, 55) + (r.notlar.length > 55 ? 'â¦' : '')
                    : ''
                  elems.push(
                    <tr key={r.rowNum} className={`${styles.row} ${styles['row_' + meslekKey(r.meslek)]}`}>
                      <td className={styles.tdIdx}>{idx}</td>
                      <td className={styles.tdName}>{r.isim}</td>
                      <td><MeslekBadge m={r.meslek} /></td>
                      <td className={`${styles.tdEmail} ${styles.hideM}`}>{r.email}</td>
                      <td className={styles.tdTel}>{r.tel}</td>
                      <td className={styles.hideM}>{r.almanca}</td>
                      <td className={`${styles.tdDate} ${styles.hideM}`}>{r.tarih}</td>
                      <td><DurumBadge d={durum} /></td>
                      <td className={styles.hideS}>{r.atanan && <span className={styles.atananBadge}>{r.atanan}</span>}</td>
                      <td className={styles.tdNote} title={r.notlar}>{lastNote}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.btnAct} ${styles.btnCall}`}
                            title="Ara"
                            onClick={() => window.open('https://wa.me/' + r.tel.replace(/[^0-9]/g,''))}
                          >ð</button>
                          <button
                            className={`${styles.btnAct} ${styles.btnNote}`}
                            title="Not ekle / Düzenle"
                            onClick={() => openModal(r)}
                          >âï¸</button>
                        </div>
                      </td>
                    </tr>
                  )
                })
                if (filtered.length === 0) {
                  elems.push(
                    <tr key="empty"><td colSpan={11} className={styles.empty}>
                      Sonuç bulunamadı.
                    </td></tr>
                  )
                }
                return elems
              })()}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div className={styles.modalBg} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>{modal.row.isim}</div>
                <div className={styles.modalSub}>
                  {modal.row.meslek && <MeslekBadge m={modal.row.meslek} />}
                  <span style={{marginLeft:8, color:'var(--ink3)', fontSize:12}}>{modal.row.tel}</span>
                </div>
              </div>
              <button className={styles.modalClose} onClick={closeModal}>Ã</button>
            </div>
            <div className={styles.modalBody}>
              {modal.row.notlar && (
                <div className={styles.history}>
                  {modal.row.notlar.split('\n').map((l, i) => (
                    <div key={i} className={styles.histLine}>{l}</div>
                  ))}
                </div>
              )}
              <textarea
                ref={noteRef}
                className={styles.noteInput}
                placeholder={`Görüşme notu, izlenim, sonraki adım...\n(Ctrl+Enter ile kaydet)`}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                rows={4}
              />
              <div className={styles.durumRow}>
                <span className={styles.durumLabel}>Durum:</span>
                {DURUMLAR.map(d => (
                  <button
                    key={d.key}
                    className={styles.durumBtn}
                    style={{
                      background: selDurum === d.key ? d.bg : '#F5F5F5',
                      color: selDurum === d.key ? d.color : 'var(--ink3)',
                      border: selDurum === d.key ? `2px solid ${d.color}` : '2px solid transparent',
                      fontWeight: selDurum === d.key ? 600 : 400,
                    }}
                    onClick={() => setSelDurum(d.key)}
                  >{d.label}</button>
                ))}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <span className={styles.modalHint}>Ctrl+Enter ile kaydet</span>
              <button className={styles.btnCancel} onClick={closeModal}>İptal</button>
              <button className={styles.btnSave} onClick={saveNote} disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`${styles.toast} ${styles['toast_' + toast.type]}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

// ââ SMALL COMPONENTS ââââââââââââââââââââââââââââââââââââââââââââââ
function Stat({ color, num, label, right }) {
  return (
    <div className={styles.stat} style={right ? { marginLeft: 'auto' } : {}}>
      <div className={styles.statDot} style={{ background: color }} />
      <span className={styles.statNum}>{num}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

function MeslekBadge({ m }) {
  const map = {
    'Tıp Doktoru': { bg: '#FFF3E0', color: '#E65100', label: 'Tıp Dr.' },
    'Diş Hekimi':  { bg: '#E8F5E9', color: '#1B5E20', label: 'Diş Hek.' },
    'Eczacı':       { bg: '#E3F2FD', color: '#0D47A1', label: 'Eczacı' },
  }
  const s = map[m] || { bg: '#EEEEEE', color: '#777', label: '?' }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 9px', borderRadius: 20,
      fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
    }}>{s.label}</span>
  )
}

function DurumBadge({ d }) {
  const found = DURUMLAR.find(x => x.key === d) || DURUMLAR[0]
  return (
    <span style={{
      background: found.bg, color: found.color,
      padding: '2px 9px', borderRadius: 20,
      fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
    }}>{found.label}</span>
  )
}

function meslekKey(m) {
  if (m === 'Tıp Doktoru') return 'tip'
  if (m === 'Diş Hekimi')  return 'dis'
  if (m === 'Eczacı')       return 'ecz'
  return 'bos'
}

function SearchIcon() {
  return (
    <svg className={styles.searchIco} width="14" height="14" fill="none"
      stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

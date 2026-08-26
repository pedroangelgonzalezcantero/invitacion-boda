'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, CheckCircle, XCircle, ChefHat, AlertTriangle, MessageCircle, RefreshCw, ChevronDown, ChevronUp, Baby, User, Download, QrCode, Images, Eye } from 'lucide-react'
import * as XLSX from 'xlsx'
import { QRCodeSVG } from 'qrcode.react'

// ── Types ──────────────────────────────────────────────────────
interface Attendee {
  id: string
  name: string
  type: 'adult' | 'child'
  age?: number
  menu_preference: string
  allergies: string[]
  allergies_other?: string
}

interface RSVPResponse {
  id: string
  created_at: string
  updated_at: string
  guest_name: string
  attending: boolean
  message?: string
  rsvp_attendees: Attendee[]
}

interface Summary {
  totalResponses: number
  confirmed: number
  declined: number
  totalAttending: number
  totalAdults: number
  totalChildren: number
  menuCount: Record<string, number>
  allergyCount: Record<string, number>
}

// ── Constants ──────────────────────────────────────────────
const MENU_LABELS: Record<string, string> = {
  standard:      '🥩 Menú adulto con carne',
  fish:          '🐟 Menú adulto con pescado',
  vegetarian:    '🥗 Vegetariano',
  vegan:         '🌱 Vegano',
  'gluten-free': '🌾 Sin gluten',
  children:      '🧒 Infantil',
}

const ALLERGY_LABELS: Record<string, string> = {
  gluten:    'Gluten',
  lactose:   'Lactosa',
  nuts:      'Frutos secos',
  shellfish: 'Marisco',
  fish:      'Pescado',
  egg:       'Huevo',
  soy:       'Soja',
  other:     'Otra',
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.8)',
  border: '1px solid rgba(201,169,110,0.3)',
  borderRadius: 8,
  padding: '10px 14px',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  width: '100%',
  color: '#2c2c2c',
  outline: 'none',
}

// ── Main Component ─────────────────────────────────────────────
export default function AdminPage() {
  const [token, setToken]               = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [summary, setSummary]           = useState<Summary | null>(null)
  const [rsvps, setRsvps]               = useState<RSVPResponse[]>([])
  const [filter, setFilter]             = useState<'all' | 'confirmed' | 'declined'>('all')
  const [expandedId, setExpandedId]     = useState<string | null>(null)
  const [search, setSearch]             = useState('')
  const [origin, setOrigin]             = useState('')
  const [visits, setVisits]             = useState<{ total: number; today: number } | null>(null)

  useEffect(() => { setOrigin(window.location.origin) }, [])

  // ── Excel export ────────────────────────────────────────────
  const exportToExcel = useCallback(() => {
    const confirmed = rsvps.filter(r => r.attending)
    const declined  = rsvps.filter(r => !r.attending)

    // ── Hoja 1: Confirmados (una fila por ASISTENTE) ──────────
    const confirmedRows = confirmed.flatMap(r =>
      (r.rsvp_attendees ?? []).map(a => ({
        'Grupo / Invitado':  r.guest_name,
        'Nombre asistente':  a.name,
        'Tipo':              a.type === 'adult' ? 'Adulto' : 'Niño/a',
        'Edad':              a.type === 'child' ? (a.age ?? '') : '',
        'Menú':              MENU_LABELS[a.menu_preference] ?? a.menu_preference,
        'Alergias':          (a.allergies ?? []).map(al => ALLERGY_LABELS[al] ?? al).join(', '),
        'Alergia (otra)':    a.allergies_other ?? '',
        'Mensaje':           r.message ?? '',
        'Fecha respuesta':   new Date(r.updated_at).toLocaleString('es-ES'),
      }))
    )

    // ── Hoja 2: Declinados ────────────────────────────────────
    const declinedRows = declined.map(r => ({
      'Nombre':            r.guest_name,
      'Mensaje':           r.message ?? '',
      'Fecha respuesta':   new Date(r.updated_at).toLocaleString('es-ES'),
    }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(confirmedRows.length ? confirmedRows : [{ Info: 'Sin confirmados aún' }]), 'Confirmados')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(declinedRows.length   ? declinedRows   : [{ Info: 'Sin declinados aún'  }]), 'Declinados')

    const fecha = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(wb, `invitados_boda_${fecha}.xlsx`)
  }, [rsvps])

  const fetchData = useCallback(async (authToken: string) => {
    setLoading(true)
    setError('')
    try {
      const [res, visitsRes] = await Promise.all([
        fetch('/api/admin/guests', { headers: { 'x-admin-token': authToken } }),
        fetch('/api/track', { headers: { 'x-admin-token': authToken } }),
      ])
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Error desconocido')
        if (res.status === 401) setAuthenticated(false)
        return
      }
      setSummary(json.summary)
      setRsvps(json.rsvps ?? [])
      if (visitsRes.ok) {
        const vJson = await visitsRes.json()
        setVisits(vJson)
      }
      if (json.demo) {
        setError('⚙️ Base de datos no configurada. Configura DATABASE_URL en Vercel → Settings → Environment Variables.')
      }
    } catch {
      setError('Error de red')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthenticated(true)
    fetchData(token)
  }

  // Auto-refresh cada 60s
  useEffect(() => {
    if (!authenticated) return
    const t = setInterval(() => fetchData(token), 60_000)
    return () => clearInterval(t)
  }, [authenticated, token, fetchData])

  const filtered = rsvps
    .filter(r => filter === 'all' ? true : filter === 'confirmed' ? r.attending : !r.attending)
    .filter(r => !search || r.guest_name.toLowerCase().includes(search.toLowerCase())
      || r.rsvp_attendees?.some(a => a.name.toLowerCase().includes(search.toLowerCase())))

  // ── Login screen ────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg, #faf8f5 0%, #f5ede0 100%)' }}>
        <motion.div className="card-elegant p-8 w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">💍</div>
            <h1 className="text-2xl mb-1" style={{ color: 'var(--charcoal)', fontWeight: 300 }}>Panel de administración</h1>
            <p className="text-sm" style={{ color: 'var(--charcoal)', opacity: 0.5, fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
              Introduce tu token de acceso
            </p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input type="password" value={token} onChange={e => setToken(e.target.value)}
              placeholder="Token secreto" style={inputStyle} autoFocus />
            {error && <p className="text-sm text-center" style={{ color: '#c0392b' }}>{error}</p>}
            <button type="submit" className="btn-gold">Acceder →</button>
          </form>
        </motion.div>
      </div>
    )
  }

  // ── Dashboard ────────────────────────────────────────────────
  return (
    <div className="min-h-screen px-4 py-8" style={{ background: '#faf8f5', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl" style={{ color: 'var(--charcoal)', fontWeight: 300 }}>Invitados 💍</h1>
            <p className="text-sm" style={{ color: 'var(--charcoal)', opacity: 0.45, fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
              Panel de administración · boda 2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            {rsvps.length > 0 && (
              <button onClick={exportToExcel} title="Descargar Excel"
                style={{ background: 'none', border: '1px solid #1e7e34', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: '#1e7e34', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.78rem' }}>
                <Download size={15} /> Excel
              </button>
            )}
            <button onClick={() => fetchData(token)} disabled={loading}
              style={{ background: 'none', border: '1px solid var(--gold-light)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: 'var(--gold)' }}>
              <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl text-sm" style={{
            background: error.startsWith('⚙️') ? 'rgba(255,193,7,0.1)' : '#fff5f5',
            border: `1px solid ${error.startsWith('⚙️') ? 'rgba(255,193,7,0.4)' : '#fcc'}`,
            color: error.startsWith('⚙️') ? '#7d6608' : '#c0392b',
            fontFamily: "'Montserrat', sans-serif", lineHeight: 1.6,
          }}>
            {error}
          </div>
        )}

        {/* ── STATS ── */}
        {summary && (
          <div className="flex flex-col gap-3">
            {/* Fila 1: resumen de grupos */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Users size={20} />,      label: 'Respuestas',           sublabel: 'grupos',   value: summary.totalResponses, color: 'var(--charcoal)' },
                { icon: <CheckCircle size={20} />, label: 'Confirmados',          sublabel: 'grupos',   value: summary.confirmed,      color: 'var(--gold)' },
                { icon: <XCircle size={20} />,     label: 'Declinados',           sublabel: 'grupos',   value: summary.declined,       color: 'var(--rose-dark)' },
              ].map(s => (
                <motion.div key={s.label} className="card-elegant p-4 flex flex-col gap-1"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-2" style={{ color: s.color }}>
                    {s.icon}
                    <span style={{ fontSize: '1.8rem', fontWeight: 300 }}>{s.value}</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', fontFamily: "'Montserrat', sans-serif", fontWeight: 300, color: 'var(--charcoal)', opacity: 0.55 }}>
                    {s.label}
                  </p>
                  <p style={{ fontSize: '0.65rem', fontFamily: "'Montserrat', sans-serif", fontWeight: 300, color: 'var(--charcoal)', opacity: 0.35 }}>
                    {s.sublabel}
                  </p>
                </motion.div>
              ))}
            </div>
            {/* Fila 2: personas y visitas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: <Users size={20} />,   label: 'Total asistentes', sublabel: 'personas',  value: summary.totalAttending, color: '#4a7c59' },
                { icon: <User size={20} />,    label: 'Adultos',          sublabel: 'personas',  value: summary.totalAdults,    color: '#5c9e6a' },
                { icon: <Baby size={20} />,    label: 'Niños',            sublabel: 'personas',  value: summary.totalChildren,  color: '#7b8fa1' },
                { icon: <Eye size={20} />,     label: 'Visitas web',      sublabel: visits ? `hoy: ${visits.today}` : '…', value: visits?.total ?? '…', color: '#9b7cc8' },
              ].map(s => (
                <motion.div key={s.label} className="card-elegant p-4 flex flex-col gap-1"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-2" style={{ color: s.color }}>
                    {s.icon}
                    <span style={{ fontSize: '1.8rem', fontWeight: 300 }}>{s.value}</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', fontFamily: "'Montserrat', sans-serif", fontWeight: 300, color: 'var(--charcoal)', opacity: 0.55 }}>
                    {s.label}
                  </p>
                  <p style={{ fontSize: '0.65rem', fontFamily: "'Montserrat', sans-serif", fontWeight: 300, color: 'var(--charcoal)', opacity: 0.35 }}>
                    {s.sublabel}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── MENÚS + ALERGIAS ── */}
        {summary && (Object.keys(summary.menuCount).length > 0 || Object.keys(summary.allergyCount).length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Menús */}
            {Object.keys(summary.menuCount).length > 0 && (
              <div className="card-elegant p-5">
                <p className="text-xs uppercase tracking-widest mb-3 flex items-center gap-2"
                  style={{ color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                  <ChefHat size={13} /> Menús
                </p>
                <div className="flex flex-col gap-2">
                  {Object.entries(summary.menuCount).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span style={{ fontSize: '0.88rem', color: 'var(--charcoal)' }}>{MENU_LABELS[k] ?? k}</span>
                      <span className="rounded-full px-3 py-0.5 text-xs"
                        style={{ background: 'rgba(201,169,110,0.12)', color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif" }}>
                        {v} {v === 1 ? 'persona' : 'personas'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Alergias */}
            {Object.keys(summary.allergyCount).length > 0 && (
              <div className="card-elegant p-5">
                <p className="text-xs uppercase tracking-widest mb-3 flex items-center gap-2"
                  style={{ color: 'var(--rose-dark)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                  <AlertTriangle size={13} /> Alergias
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(summary.allergyCount).map(([k, v]) => (
                    <span key={k} className="rounded-full px-3 py-1 text-xs"
                      style={{ background: 'rgba(230,126,34,0.09)', border: '1px solid rgba(230,126,34,0.25)', color: '#c0392b', fontFamily: "'Montserrat', sans-serif" }}>
                      {ALLERGY_LABELS[k] ?? k} ({v})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FILTROS + BÚSQUEDA ── */}
        <div className="flex flex-wrap items-center gap-3">
          {(['all', 'confirmed', 'declined'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px', borderRadius: 50, cursor: 'pointer',
                border: `1px solid ${filter === f ? 'var(--gold)' : 'rgba(201,169,110,0.3)'}`,
                background: filter === f ? 'var(--gold)' : 'white',
                color: filter === f ? 'white' : 'var(--charcoal)',
                fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
              {f === 'all' ? `Todos (${rsvps.length})` : f === 'confirmed' ? `✓ Confirmados (${summary?.confirmed ?? 0})` : `✗ Declinados (${summary?.declined ?? 0})`}
            </button>
          ))}
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Buscar por nombre…"
            style={{ ...inputStyle, maxWidth: 220, padding: '6px 12px', fontSize: '0.82rem', marginLeft: 'auto' }} />
        </div>

        {/* ── LISTA DE RSVP ── */}
        {loading ? (
          <div className="text-center py-20" style={{ color: 'var(--gold)', opacity: 0.5, fontFamily: "'Montserrat', sans-serif" }}>
            Cargando…
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.length === 0 && (
              <p className="text-center py-10" style={{ color: 'var(--charcoal)', opacity: 0.4, fontFamily: "'Montserrat', sans-serif", fontSize: '0.88rem' }}>
                No hay respuestas en esta categoría
              </p>
            )}

            {filtered.map(rsvp => {
              const isExpanded = expandedId === rsvp.id
              const statusColor = rsvp.attending ? 'var(--gold)' : 'var(--rose-dark)'
              const attendees   = rsvp.rsvp_attendees ?? []
              const hasAllergies = attendees.some(a => (a.allergies?.length ?? 0) > 0 || a.allergies_other)

              return (
                <motion.div key={rsvp.id} className="card-elegant overflow-hidden"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>

                  {/* Row header */}
                  <div className="flex items-center justify-between p-4 cursor-pointer gap-3"
                    onClick={() => setExpandedId(isExpanded ? null : rsvp.id)}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{ width: 38, height: 38, background: statusColor, fontSize: '0.9rem' }}>
                        {rsvp.guest_name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate" style={{ fontWeight: 400, color: 'var(--charcoal)', fontSize: '1.05rem' }}>
                          {rsvp.guest_name}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--charcoal)', opacity: 0.5, fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                          {rsvp.attending
                            ? `✓ Asiste · ${attendees.length} persona${attendees.length !== 1 ? 's' : ''}${hasAllergies ? ' · ⚠ alergias' : ''}`
                            : '✗ No puede asistir'}
                          {' · '}{new Date(rsvp.updated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={16} color="var(--gold-light)" style={{ flexShrink: 0 }} />
                      : <ChevronDown size={16} color="var(--gold-light)" style={{ flexShrink: 0 }} />}
                  </div>

                  {/* Expandido */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                        style={{ borderTop: '1px solid rgba(201,169,110,0.15)' }}>
                        <div className="p-4 flex flex-col gap-4">

                          {/* Attendees */}
                          {rsvp.attending && attendees.length > 0 && (
                            <div>
                              <p className="text-xs uppercase tracking-widest mb-2"
                                style={{ color: 'var(--charcoal)', opacity: 0.4, fontFamily: "'Montserrat', sans-serif" }}>
                                Asistentes
                              </p>
                              <div className="flex flex-col gap-2">
                                {attendees.map(a => (
                                  <div key={a.id} className="rounded-xl p-3 flex flex-col gap-1"
                                    style={{ background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.15)' }}>
                                    <div className="flex items-center gap-2">
                                      {a.type === 'child'
                                        ? <Baby size={13} color="var(--rose-dark)" />
                                        : <User size={13} color="var(--gold)" />}
                                      <span style={{ fontWeight: 400, color: 'var(--charcoal)', fontSize: '0.95rem' }}>
                                        {a.name}
                                        {a.type === 'child' && a.age ? ` (${a.age} años)` : ''}
                                      </span>
                                      <span className="ml-auto text-xs rounded-full px-2 py-0.5"
                                        style={{ background: 'rgba(201,169,110,0.12)', color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif" }}>
                                        {MENU_LABELS[a.menu_preference] ?? a.menu_preference}
                                      </span>
                                    </div>
                                    {((a.allergies?.length ?? 0) > 0 || a.allergies_other) && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {(a.allergies ?? []).map(al => (
                                          <span key={al} className="text-xs rounded-full px-2 py-0.5"
                                            style={{ background: 'rgba(230,126,34,0.09)', color: '#c0392b', fontFamily: "'Montserrat', sans-serif" }}>
                                            ⚠ {ALLERGY_LABELS[al] ?? al}
                                          </span>
                                        ))}
                                        {a.allergies_other && (
                                          <span className="text-xs rounded-full px-2 py-0.5"
                                            style={{ background: 'rgba(230,126,34,0.09)', color: '#c0392b', fontFamily: "'Montserrat', sans-serif" }}>
                                            ⚠ {a.allergies_other}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Mensaje */}
                          {rsvp.message && (
                            <div>
                              <p className="text-xs uppercase tracking-widest mb-1 flex items-center gap-1"
                                style={{ color: 'var(--charcoal)', opacity: 0.4, fontFamily: "'Montserrat', sans-serif" }}>
                                <MessageCircle size={11} /> Mensaje
                              </p>
                              <p style={{ color: 'var(--charcoal)', fontStyle: 'italic', opacity: 0.75, fontSize: '0.9rem', lineHeight: 1.6 }}>
                                "{rsvp.message}"
                              </p>
                            </div>
                          )}

                          {/* Fecha */}
                          <p className="text-xs" style={{ color: 'var(--charcoal)', opacity: 0.3, fontFamily: "'Montserrat', sans-serif" }}>
                            Respondido: {new Date(rsvp.updated_at).toLocaleString('es-ES')}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* ── QR RECUERDOS ── */}
        {origin && (
          <div className="card-elegant p-6 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2" style={{ color: 'var(--gold)' }}>
              <QrCode size={16} />
              <p className="text-xs uppercase tracking-widest" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                QR Galería de fotos
              </p>
            </div>
            <p style={{ color: 'var(--charcoal)', opacity: 0.45, fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.78rem', maxWidth: 260 }}>
              Muestra este QR en la boda para que los invitados suban sus fotos y vídeos
            </p>
            <div className="p-4 rounded-2xl" style={{ background: 'white', border: '1px solid rgba(201,169,110,0.2)' }}>
              <QRCodeSVG value={`${origin}/recuerdos`} size={180} fgColor="#2c2c2c" bgColor="white" />
            </div>
            <a href={`${origin}/recuerdos`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs"
              style={{ color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
              <Images size={13} /> {origin}/recuerdos
            </a>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs pb-6" style={{ color: 'var(--charcoal)', opacity: 0.25, fontFamily: "'Montserrat', sans-serif" }}>
          Accede desde /admin · Se actualiza cada 60 segundos
        </p>
      </div>
    </div>
  )
}


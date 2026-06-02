'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Plus, RefreshCw } from 'lucide-react'

interface RSVPData {
  attending: boolean
  companions_count: number
  menu_preference: string
  allergies: string
  message: string
  updated_at: string
}

interface GuestWithRSVP {
  id: string
  name: string
  code: string
  max_companions: number
  email: string | null
  phone: string | null
  notes: string | null
  rsvp: RSVPData | null
}

interface Summary {
  totalGuests: number
  confirmed: number
  declined: number
  pending: number
  totalAttending: number
}

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [guests, setGuests] = useState<GuestWithRSVP[]>([])
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGuest, setNewGuest] = useState({ name: '', maxCompanions: 1, email: '', phone: '' })
  const [addingGuest, setAddingGuest] = useState(false)

  const fetchData = useCallback(async (authToken: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/guests', {
        headers: { 'x-admin-token': authToken },
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Error desconocido')
        if (res.status === 401) setAuthenticated(false)
        return
      }
      setSummary(json.summary)
      setGuests(json.guests)
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

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingGuest(true)
    try {
      const res = await fetch('/api/admin/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({
          name: newGuest.name,
          maxCompanions: newGuest.maxCompanions,
          email: newGuest.email || undefined,
          phone: newGuest.phone || undefined,
        }),
      })
      if (res.ok) {
        setNewGuest({ name: '', maxCompanions: 1, email: '', phone: '' })
        setShowAddForm(false)
        fetchData(token)
      }
    } finally {
      setAddingGuest(false)
    }
  }

  const filteredGuests = guests.filter((g) => {
    if (filter === 'confirmed') return g.rsvp?.attending === true
    if (filter === 'declined') return g.rsvp?.attending === false
    if (filter === 'pending') return !g.rsvp
    return true
  })

  const menuLabel: Record<string, string> = {
    standard: 'Estándar',
    vegetarian: 'Vegetariano',
    vegan: 'Vegano',
    'gluten-free': 'Sin gluten',
    children: 'Infantil',
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(201,169,110,0.3)',
    borderRadius: 8,
    padding: '10px 14px',
    fontFamily: "inherit",
    fontSize: '0.9rem',
    width: '100%',
    color: '#2c2c2c',
    outline: 'none',
  }

  if (!authenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg, #faf8f5 0%, #f5ede0 100%)' }}
      >
        <motion.div
          className="card-elegant p-8 w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl text-center mb-2" style={{ color: 'var(--charcoal)', fontWeight: 300 }}>
            Panel de administración
          </h1>
          <p className="text-center text-sm mb-6" style={{ color: 'var(--charcoal)', opacity: 0.5, fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
            Introduce tu token de acceso
          </p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token secreto"
              style={inputStyle}
            />
            {error && <p className="text-sm text-center" style={{ color: '#c0392b' }}>{error}</p>}
            <button type="submit" className="btn-gold">
              Acceder
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: '#faf8f5', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl" style={{ color: 'var(--charcoal)', fontWeight: 300 }}>Panel de invitados</h1>
            <p className="text-sm" style={{ color: 'var(--charcoal)', opacity: 0.5, fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
              Gestión de la boda
            </p>
          </div>
          <button
            onClick={() => fetchData(token)}
            disabled={loading}
            style={{ background: 'none', border: '1px solid var(--gold-light)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: 'var(--gold)' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total invitados', value: summary.totalGuests, icon: <Users size={18} />, color: 'var(--charcoal)' },
              { label: 'Confirmados', value: summary.confirmed, icon: <CheckCircle size={18} />, color: 'var(--gold)' },
              { label: 'Declinados', value: summary.declined, icon: <XCircle size={18} />, color: 'var(--rose-dark)' },
              { label: 'Pendientes', value: summary.pending, icon: <Clock size={18} />, color: 'var(--sage)' },
              { label: 'Asistirán', value: summary.totalAttending, icon: <Users size={18} />, color: '#5c9e6a', className: 'col-span-2 md:col-span-1' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className={`card-elegant p-4 flex flex-col gap-1 ${(stat as { className?: string }).className || ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2" style={{ color: stat.color }}>
                  {stat.icon}
                  <span className="text-2xl font-light">{stat.value}</span>
                </div>
                <p className="text-xs" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, color: 'var(--charcoal)', opacity: 0.6 }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filters + Add button */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {(['all', 'confirmed', 'declined', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px',
                borderRadius: 50,
                border: `1px solid ${filter === f ? 'var(--gold)' : 'rgba(201,169,110,0.3)'}`,
                background: filter === f ? 'var(--gold)' : 'white',
                color: filter === f ? 'white' : 'var(--charcoal)',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 300,
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {f === 'all' ? 'Todos' : f === 'confirmed' ? 'Confirmados' : f === 'declined' ? 'Declinados' : 'Pendientes'}
            </button>
          ))}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 16px',
              borderRadius: 50,
              border: '1px solid var(--gold)',
              background: 'transparent',
              color: 'var(--gold)',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 300,
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            <Plus size={14} /> Añadir invitado
          </button>
        </div>

        {/* Add Guest Form */}
        {showAddForm && (
          <motion.div
            className="card-elegant p-6 mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <h3 className="text-lg mb-4" style={{ color: 'var(--charcoal)', fontWeight: 400 }}>Nuevo invitado</h3>
            <form onSubmit={handleAddGuest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input value={newGuest.name} onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })} placeholder="Nombre completo *" required style={inputStyle} />
              </div>
              <input value={newGuest.email} onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} placeholder="Email (opcional)" style={inputStyle} />
              <input value={newGuest.phone} onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })} placeholder="Teléfono (opcional)" style={inputStyle} />
              <div className="flex items-center gap-3">
                <label style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: 'var(--charcoal)', opacity: 0.7, whiteSpace: 'nowrap' }}>
                  Máx. acompañantes:
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={newGuest.maxCompanions}
                  onChange={(e) => setNewGuest({ ...newGuest, maxCompanions: parseInt(e.target.value) })}
                  style={{ ...inputStyle, width: 70 }}
                />
              </div>
              <button type="submit" disabled={addingGuest} className="btn-gold md:col-span-2" style={{ fontSize: '0.85rem', padding: '10px 24px' }}>
                {addingGuest ? 'Guardando...' : 'Guardar invitado'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Guest list */}
        {loading ? (
          <div className="text-center py-20" style={{ color: 'var(--gold)', opacity: 0.5 }}>Cargando...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredGuests.length === 0 && (
              <p className="text-center py-10" style={{ color: 'var(--charcoal)', opacity: 0.4, fontFamily: "'Montserrat', sans-serif" }}>
                No hay invitados en esta categoría
              </p>
            )}
            {filteredGuests.map((guest) => {
              const isExpanded = expandedId === guest.id
              const statusColor = guest.rsvp
                ? guest.rsvp.attending ? 'var(--gold)' : 'var(--rose-dark)'
                : 'var(--sage)'
              const statusLabel = guest.rsvp
                ? guest.rsvp.attending ? '✓ Confirmado' : '✗ Declinado'
                : '⏳ Pendiente'

              return (
                <motion.div
                  key={guest.id}
                  className="card-elegant overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : guest.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="rounded-full flex items-center justify-center text-white text-sm font-light"
                        style={{ width: 36, height: 36, background: statusColor, flexShrink: 0 }}
                      >
                        {guest.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 400, color: 'var(--charcoal)' }}>{guest.name}</p>
                        <p className="text-xs" style={{ color: 'var(--charcoal)', opacity: 0.5, fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                          Código: <strong>{guest.code}</strong>
                          {guest.rsvp?.attending && ` · ${1 + (guest.rsvp.companions_count || 0)} persona(s)`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs hidden md:block"
                        style={{ color: statusColor, fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
                      >
                        {statusLabel}
                      </span>
                      {isExpanded ? <ChevronUp size={16} color="var(--gold-light)" /> : <ChevronDown size={16} color="var(--gold-light)" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border-t px-4 pb-4 pt-3"
                      style={{ borderColor: 'rgba(201,169,110,0.15)' }}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--charcoal)', opacity: 0.4, fontFamily: "'Montserrat', sans-serif" }}>Estado</p>
                          <p style={{ color: statusColor }}>{statusLabel}</p>
                        </div>
                        {guest.email && (
                          <div>
                            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--charcoal)', opacity: 0.4, fontFamily: "'Montserrat', sans-serif" }}>Email</p>
                            <p style={{ color: 'var(--charcoal)' }}>{guest.email}</p>
                          </div>
                        )}
                        {guest.phone && (
                          <div>
                            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--charcoal)', opacity: 0.4, fontFamily: "'Montserrat', sans-serif" }}>Teléfono</p>
                            <p style={{ color: 'var(--charcoal)' }}>{guest.phone}</p>
                          </div>
                        )}
                        {guest.rsvp && (
                          <>
                            <div>
                              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--charcoal)', opacity: 0.4, fontFamily: "'Montserrat', sans-serif" }}>Acompañantes</p>
                              <p style={{ color: 'var(--charcoal)' }}>{guest.rsvp.companions_count}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--charcoal)', opacity: 0.4, fontFamily: "'Montserrat', sans-serif" }}>Menú</p>
                              <p style={{ color: 'var(--charcoal)' }}>{menuLabel[guest.rsvp.menu_preference] || guest.rsvp.menu_preference}</p>
                            </div>
                            {guest.rsvp.allergies && (
                              <div>
                                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--charcoal)', opacity: 0.4, fontFamily: "'Montserrat', sans-serif" }}>Alergias</p>
                                <p style={{ color: 'var(--charcoal)' }}>{guest.rsvp.allergies}</p>
                              </div>
                            )}
                            {guest.rsvp.message && (
                              <div className="col-span-2 md:col-span-3">
                                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--charcoal)', opacity: 0.4, fontFamily: "'Montserrat', sans-serif" }}>Mensaje</p>
                                <p style={{ color: 'var(--charcoal)', fontStyle: 'italic', opacity: 0.8 }}>"{guest.rsvp.message}"</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}


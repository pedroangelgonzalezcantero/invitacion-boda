'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, User, Baby,
  ChefHat, AlertTriangle, MessageCircle, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────
interface Attendee {
  id: string
  name: string
  type: 'adult' | 'child'
  age?: number
  menuPreference: string
  allergies: string[]
  allergiesOther: string
}

// ─── Constants ────────────────────────────────────────────────
const MENU_OPTIONS = [
  { value: 'standard',    label: '🍽️  Menú adulto con carne' },
  { value: 'fish',        label: '🐟  Menú adulto con pescado' },
  { value: 'vegetarian',  label: '🥗  Vegetariano' },
  { value: 'vegan',       label: '🌱  Vegano' },
  { value: 'gluten-free', label: '🌾  Sin gluten' },
  { value: 'children',    label: '🧒  Menú infantil' },
]

const ALLERGY_OPTIONS = [
  { value: 'gluten',    label: 'Gluten' },
  { value: 'lactose',   label: 'Lactosa' },
  { value: 'nuts',      label: 'Frutos secos' },
  { value: 'shellfish', label: 'Marisco' },
  { value: 'fish',      label: 'Pescado' },
  { value: 'egg',       label: 'Huevo' },
  { value: 'soy',       label: 'Soja' },
  { value: 'other',     label: 'Otra…' },
]

const MAX_ATTENDEES = 10

function newAttendee(name = ''): Attendee {
  return {
    id: Math.random().toString(36).slice(2),
    name,
    type: 'adult',
    menuPreference: 'standard',
    allergies: [],
    allergiesOther: '',
  }
}

// ─── Shared styles ────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.85)',
  border: '1px solid rgba(201,169,110,0.3)',
  borderRadius: 10,
  padding: '11px 14px',
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: '1rem',
  width: '100%',
  color: 'var(--charcoal)',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--charcoal)',
  opacity: 0.55,
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 300,
  display: 'block',
  marginBottom: 8,
}

const backBtnStyle: React.CSSProperties = {
  padding: '12px 18px',
  borderRadius: 50,
  border: '1px solid rgba(201,169,110,0.3)',
  background: 'transparent',
  color: 'var(--charcoal)',
  opacity: 0.6,
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 300,
  fontSize: '0.82rem',
  cursor: 'pointer',
  flexShrink: 0,
}

const pageAnim = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.28 },
}

// ─── AttendeeCard ─────────────────────────────────────────────
function AttendeeCard({
  attendee,
  index,
  isMain,
  onChange,
  onRemove,
}: {
  attendee: Attendee
  index: number
  isMain: boolean
  onChange: (u: Attendee) => void
  onRemove?: () => void
}) {
  const [expanded, setExpanded] = useState(true)
  const set = (f: Partial<Attendee>) => onChange({ ...attendee, ...f })
  const toggleAllergy = (v: string) => {
    const has = attendee.allergies.includes(v)
    set({ allergies: has ? attendee.allergies.filter(a => a !== v) : [...attendee.allergies, v] })
  }

  const hasRestrictions = attendee.allergies.length > 0 || !!attendee.allergiesOther

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(201,169,110,0.25)', background: 'rgba(255,255,255,0.88)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div
          className="rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            width: 38, height: 38,
            background: attendee.type === 'child' ? 'rgba(212,165,165,0.2)' : 'rgba(201,169,110,0.12)',
            border: `1px solid ${attendee.type === 'child' ? 'rgba(212,165,165,0.5)' : 'rgba(201,169,110,0.35)'}`,
          }}
        >
          {attendee.type === 'child' ? <Baby size={16} color="var(--rose-dark)" /> : <User size={16} color="var(--gold)" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="truncate" style={{ color: 'var(--charcoal)', fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem' }}>
            {attendee.name || (isMain ? 'Tu nombre' : `Acompañante ${index}`)}
          </p>
          <p className="text-xs" style={{ color: 'var(--charcoal)', opacity: 0.45, fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
            {attendee.type === 'child' ? `Niño/a${attendee.age ? ` · ${attendee.age} años` : ''}` : 'Adulto'}
            {hasRestrictions && ' · ⚠ Restricciones'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isMain && onRemove && (
            <button type="button" onClick={e => { e.stopPropagation(); onRemove() }}
              className="rounded-full p-1.5"
              style={{ background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.15)' }}>
              <Trash2 size={13} color="#c0392b" />
            </button>
          )}
          {expanded ? <ChevronUp size={16} color="var(--gold-light)" /> : <ChevronDown size={16} color="var(--gold-light)" />}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 flex flex-col gap-4" style={{ borderTop: '1px solid rgba(201,169,110,0.12)' }}>

              {/* Name */}
              <div className="pt-4">
                <label style={labelStyle}>{isMain ? 'Tu nombre completo' : 'Nombre completo'}</label>
                <input
                  value={attendee.name}
                  onChange={e => set({ name: e.target.value })}
                  placeholder={isMain ? 'Escribe tu nombre' : 'Nombre del acompañante'}
                  style={inputStyle}
                />
              </div>

              {/* Type — solo acompañantes */}
              {!isMain && (
                <div>
                  <label style={labelStyle}>Tipo de asistente</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'adult', label: 'Adulto', icon: <User size={14} /> },
                      { value: 'child', label: 'Niño/a', icon: <Baby size={14} /> },
                    ].map(opt => {
                      const sel = attendee.type === opt.value
                      return (
                        <button key={opt.value} type="button"
                          onClick={() => set({ type: opt.value as 'adult' | 'child', menuPreference: opt.value === 'child' ? 'children' : 'standard', age: undefined })}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all"
                          style={{
                            border: `1.5px solid ${sel ? (opt.value === 'child' ? 'var(--rose-dark)' : 'var(--gold)') : 'rgba(201,169,110,0.2)'}`,
                            background: sel ? (opt.value === 'child' ? 'rgba(176,120,120,0.08)' : 'rgba(201,169,110,0.08)') : 'white',
                            color: sel ? (opt.value === 'child' ? 'var(--rose-dark)' : 'var(--gold)') : 'rgba(44,44,44,0.5)',
                            fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem',
                          }}>
                          {opt.icon}{opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Age — niños */}
              {attendee.type === 'child' && (
                <div>
                  <label style={labelStyle}>Edad del niño/a</label>
                  <input type="number" min={0} max={17}
                    value={attendee.age ?? ''}
                    onChange={e => set({ age: parseInt(e.target.value) || undefined })}
                    placeholder="ej. 5"
                    style={{ ...inputStyle, width: 90 }} />
                </div>
              )}

              {/* Menu */}
              <div>
                <label style={labelStyle}><ChefHat size={11} style={{ display: 'inline', marginRight: 5 }} />Preferencia de menú</label>
                <div className="flex flex-col gap-1.5">
                  {MENU_OPTIONS
                    .filter(o => attendee.type === 'child' ? true : o.value !== 'children')
                    .map(opt => {
                      const sel = attendee.menuPreference === opt.value
                      return (
                        <button key={opt.value} type="button" onClick={() => set({ menuPreference: opt.value })}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                          style={{
                            border: `1.5px solid ${sel ? 'var(--gold)' : 'rgba(201,169,110,0.15)'}`,
                            background: sel ? 'rgba(201,169,110,0.08)' : 'white',
                            fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.82rem',
                            color: sel ? 'var(--charcoal)' : 'rgba(44,44,44,0.6)',
                          }}>
                          <div className="rounded-full flex-shrink-0"
                            style={{ width: 16, height: 16, border: `2px solid ${sel ? 'var(--gold)' : 'rgba(201,169,110,0.3)'}`, background: sel ? 'var(--gold)' : 'transparent' }} />
                          {opt.label}
                        </button>
                      )
                    })}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label style={labelStyle}><AlertTriangle size={11} style={{ display: 'inline', marginRight: 5 }} />Alergias o intolerancias</label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGY_OPTIONS.map(opt => {
                    const sel = attendee.allergies.includes(opt.value)
                    return (
                      <button key={opt.value} type="button" onClick={() => toggleAllergy(opt.value)}
                        className="px-3 py-1.5 rounded-full transition-all"
                        style={{
                          border: `1.5px solid ${sel ? '#e67e22' : 'rgba(201,169,110,0.2)'}`,
                          background: sel ? 'rgba(230,126,34,0.09)' : 'white',
                          color: sel ? '#c0392b' : 'rgba(44,44,44,0.55)',
                          fontFamily: "'Montserrat', sans-serif", fontWeight: sel ? 400 : 300, fontSize: '0.75rem',
                        }}>
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
                {attendee.allergies.includes('other') && (
                  <motion.input initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    value={attendee.allergiesOther}
                    onChange={e => set({ allergiesOther: e.target.value })}
                    placeholder="Especifica la alergia…"
                    style={{ ...inputStyle, marginTop: 8 }} />
                )}
                {!hasRestrictions && (
                  <p className="text-xs mt-1.5" style={{ color: 'var(--charcoal)', opacity: 0.3, fontFamily: "'Montserrat', sans-serif" }}>
                    Sin restricciones alimentarias
                  </p>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── ErrorBox ─────────────────────────────────────────────────
function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: '#fff5f5', border: '1px solid #fcc' }}>
      <AlertCircle size={15} color="#c0392b" style={{ flexShrink: 0, marginTop: 1 }} />
      <p className="text-sm" style={{ color: '#c0392b', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>{msg}</p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────
export default function RSVPForm() {
  // Steps: 'start' → 'attendees' → 'message' → 'success'
  const [step, setStep] = useState<'start' | 'attendees' | 'message' | 'success' | 'error'>('start')
  const [attending, setAttending] = useState<boolean | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([newAttendee()])
  const [declineName, setDeclineName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const addAttendee = () => {
    if (attendees.length >= MAX_ATTENDEES) return
    setAttendees(prev => [...prev, newAttendee()])
  }

  const handleSubmit = async () => {
    const mainName = attending === false
      ? declineName.trim()
      : attendees[0]?.name.trim()
    if (!mainName) { setApiError('Por favor, escribe tu nombre completo.'); return }

    setSubmitting(true)
    setApiError('')
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: mainName,
          attending,
          attendees: attending ? attendees : [],
          message,
        }),
      })
      if (res.ok) {
        setStep('success')
      } else {
        const json = await res.json()
        // Show a friendlier error with setup hint
        const msg = json.error || 'Error desconocido'
        setApiError(msg)
        setStep('error')
      }
    } catch {
      setApiError('Error de red. Inténtalo de nuevo.')
      setStep('error')
    } finally {
      setSubmitting(false)
    }
  }

  // Progress dots (solo steps visibles)
  const steps = attending !== false
    ? ['start', 'attendees', 'message']
    : ['start', 'message']
  const currentIdx = steps.indexOf(step)

  return (
    <div className="w-full max-w-lg mx-auto">
      <AnimatePresence mode="wait">

        {/* ══ STEP: start — nombre + asistencia ════════════════ */}
        {step === 'start' && (
          <motion.div key="start" {...pageAnim} className="flex flex-col gap-6">

                      {/* ¿Asistes? */}
            <div>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 12 }}>¿Asistirás a la boda?</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: true,  emoji: '🎉', label: '¡Sí, allí estaré!', color: 'var(--gold)',      rgb: '201,169,110' },
                  { value: false, emoji: '😢', label: 'No podré asistir',  color: 'var(--rose-dark)', rgb: '176,120,120' },
                ].map(opt => {
                  const sel = attending === opt.value
                  return (
                    <button key={String(opt.value)} type="button"
                      onClick={() => {
                        setAttending(opt.value)
                        if (opt.value === true) {
                          setTimeout(() => setStep('attendees'), 260)
                        }
                        // Si es false, NO navegamos: mostramos el campo de nombre abajo
                      }}
                      className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-all"
                      style={{
                        border: `2px solid ${sel ? opt.color : 'rgba(201,169,110,0.2)'}`,
                        background: sel ? `rgba(${opt.rgb},0.08)` : 'white',
                      }}>
                      <span style={{ fontSize: 28 }}>{opt.emoji}</span>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.78rem', color: sel ? 'var(--charcoal)' : 'rgba(44,44,44,0.5)', textAlign: 'center' }}>
                        {opt.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Campo de nombre cuando no puede asistir */}
            <AnimatePresence>
              {attending === false && (
                <motion.div
                  key="decline-name"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  <div
                    className="p-4 rounded-2xl flex items-start gap-3"
                    style={{ background: 'rgba(176,120,120,0.07)', border: '1px solid rgba(176,120,120,0.2)' }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>💌</span>
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.82rem', color: 'var(--charcoal)', opacity: 0.7, lineHeight: 1.6 }}>
                      Lo sentimos mucho, te echaremos de menos. ¿Nos dices tu nombre para que sepamos quién nos ha escrito?
                    </p>
                  </div>

                  <div>
                    <label style={labelStyle}>Tu nombre completo</label>
                    <input
                      autoFocus
                      value={declineName}
                      onChange={e => setDeclineName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && declineName.trim()) {
                          setApiError('')
                          setStep('message')
                        }
                      }}
                      placeholder="Escribe tu nombre…"
                      style={inputStyle}
                    />
                  </div>

                  {apiError && <ErrorBox msg={apiError} />}

                  <button
                    type="button"
                    onClick={() => {
                      if (!declineName.trim()) { setApiError('Por favor, escribe tu nombre.'); return }
                      setApiError('')
                      setStep('message')
                    }}
                    className="btn-gold w-full"
                    style={{ fontSize: '0.9rem', padding: '13px 20px' }}
                  >
                    Continuar →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {attending !== false && apiError && <ErrorBox msg={apiError} />}
          </motion.div>
        )}

        {/* ══ STEP: attendees ══════════════════════════════════ */}
        {step === 'attendees' && (
          <motion.div key="attendees" {...pageAnim} className="flex flex-col gap-4">
            <div className="text-center">
              <p style={{ ...labelStyle, display: 'block', textAlign: 'center' }}>¿Quién asistirá?</p>
              <p className="text-xs" style={{ color: 'var(--charcoal)', opacity: 0.4, fontFamily: "'Montserrat', sans-serif" }}>
                Añade a todos los que vengan contigo (pareja, hijos, familia…)
              </p>
            </div>

            <AnimatePresence>
              {attendees.map((att, i) => (
                <AttendeeCard
                  key={att.id}
                  attendee={att}
                  index={i + 1}
                  isMain={i === 0}
                  onChange={updated => setAttendees(prev => prev.map(a => a.id === att.id ? updated : a))}
                  onRemove={i > 0 ? () => setAttendees(prev => prev.filter(a => a.id !== att.id)) : undefined}
                />
              ))}
            </AnimatePresence>

            {attendees.length < MAX_ATTENDEES && (
              <motion.button type="button" onClick={addAttendee}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl w-full"
                style={{
                  border: '1.5px dashed rgba(201,169,110,0.35)',
                  background: 'rgba(201,169,110,0.04)',
                  color: 'var(--gold)',
                  fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', letterSpacing: '0.08em',
                }}
                whileHover={{ borderColor: 'var(--gold)', background: 'rgba(201,169,110,0.09)' }}>
                <Plus size={15} /> Añadir acompañante
              </motion.button>
            )}

            {apiError && <ErrorBox msg={apiError} />}

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={() => setStep('start')} style={backBtnStyle}>← Atrás</button>
              <button type="button" onClick={() => {
                if (!attendees[0]?.name.trim()) { setApiError('Por favor, escribe tu nombre.'); return }
                setApiError('')
                setStep('message')
              }} className="btn-gold flex-1" style={{ fontSize: '0.9rem', padding: '12px 20px' }}>
                Continuar →
              </button>
            </div>
          </motion.div>
        )}

        {/* ══ STEP: message ════════════════════════════════════ */}
        {step === 'message' && (
          <motion.div key="message" {...pageAnim} className="flex flex-col gap-5">

            {/* Resumen */}
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.18)' }}>
              <p style={{ ...labelStyle, marginBottom: 8 }}>Resumen</p>
              {attending ? (
                <div className="flex flex-col gap-1">
                  <p style={{ color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.9rem' }}>
                    ✓ Confirmado · {attendees.length} persona{attendees.length > 1 ? 's' : ''}
                    {attendees.some(a => a.type === 'child') && ` (incl. ${attendees.filter(a => a.type === 'child').length} niño/s)`}
                  </p>
                  {attendees.map(a => (
                    <p key={a.id} className="text-xs" style={{ color: 'var(--charcoal)', opacity: 0.6, fontFamily: "'Montserrat', sans-serif", fontWeight: 300, paddingLeft: 12 }}>
                      {a.type === 'child' ? '🧒' : '👤'} {a.name || '—'}
                      {a.type === 'child' && a.age ? ` (${a.age} años)` : ''}
                      {a.allergies.length > 0 ? ' · ⚠ restricciones' : ''}
                    </p>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--rose-dark)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.9rem' }}>
                  ✗ No podrá asistir — {declineName || attendees[0]?.name || '—'}
                </p>
              )}
            </div>

            <div>
              <label style={labelStyle}>
                <MessageCircle size={11} style={{ display: 'inline', marginRight: 5 }} />
                Mensaje para los novios (opcional)
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="¡Escríbenos unas palabras bonitas! 💌"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {apiError && <ErrorBox msg={apiError} />}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(attending ? 'attendees' : 'start')} style={backBtnStyle}>← Atrás</button>
              <button type="button" onClick={handleSubmit} disabled={submitting}
                className="btn-gold flex-1"
                style={{ opacity: submitting ? 0.7 : 1, fontSize: '0.9rem', padding: '12px 20px' }}>
                {submitting ? 'Enviando…' : attending ? '🎊 Confirmar asistencia' : 'Enviar respuesta'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ══ STEP: success ════════════════════════════════════ */}
        {step === 'success' && (
          <motion.div key="success" {...pageAnim} className="text-center py-10 flex flex-col items-center gap-5">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              style={{ fontSize: 64 }}>
              {attending ? '🎊' : '💌'}
            </motion.div>
            <h3 className="text-3xl" style={{ color: 'var(--gold)', fontWeight: 300, fontStyle: 'italic' }}>
              {attending ? '¡Nos vemos en la boda!' : 'Gracias por avisarnos'}
            </h3>
            <p style={{ color: 'var(--charcoal)', opacity: 0.65, fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.9rem', maxWidth: 300, lineHeight: 1.65 }}>
              {attending
                ? `Hemos apuntado a ${attendees.length} persona${attendees.length > 1 ? 's' : ''}. ¡Estamos muy emocionados de verte!`
                : `Hemos recibido tu respuesta, ${declineName || 'amigo/a'}. Te echaremos de menos en este día tan especial.`}
            </p>
            {attending && (
              <div className="flex flex-col gap-1.5 w-full max-w-xs">
                {attendees.map(a => (
                  <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(201,169,110,0.07)', border: '1px solid rgba(201,169,110,0.15)' }}>
                    <span>{a.type === 'child' ? '🧒' : '👤'}</span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.82rem', color: 'var(--charcoal)' }}>
                      {a.name || '—'}{a.type === 'child' && a.age ? ` (${a.age} años)` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ══ STEP: error ══════════════════════════════════════ */}
        {step === 'error' && (
          <motion.div key="error" {...pageAnim} className="text-center py-8 flex flex-col items-center gap-4">
            <span style={{ fontSize: 48 }}>😕</span>
            <div className="flex flex-col gap-2 w-full">
              <ErrorBox msg={apiError} />
              {(apiError.toLowerCase().includes('database') || apiError.toLowerCase().includes('prisma')) && (
                <div
                  className="p-4 rounded-xl text-left"
                  style={{ background: 'rgba(255,243,205,0.8)', border: '1px solid rgba(255,193,7,0.4)' }}
                >
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: '0.78rem', color: '#7d6608', marginBottom: 8 }}>
                    💡 Para que el formulario funcione:
                  </p>
                  <ol style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.75rem', color: '#7d6608', lineHeight: 1.8, paddingLeft: 16, margin: 0 }}>
                    <li>Configura <code>DATABASE_URL</code> en Vercel → Settings → Environment Variables</li>
                    <li>Formato: <code>mysql://USER:PASS@srv495.hstgr.io:3306/BBDD</code></li>
                    <li>Ejecuta el SQL de <code>supabase/mysql-migration.sql</code> en Hostinger</li>
                    <li>Despliega de nuevo en Vercel</li>
                  </ol>
                </div>
              )}
            </div>
            <button onClick={() => { setStep('message'); setApiError('') }} className="btn-gold">
              Intentar de nuevo
            </button>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Progress dots */}
      {!['success', 'error', 'start'].includes(step) && (
        <div className="flex justify-center gap-2 mt-6">
          {steps.slice(1).map((s, i) => (
            <div key={s} className="rounded-full transition-all duration-300"
              style={{ width: currentIdx - 1 === i ? 20 : 6, height: 6, background: currentIdx - 1 >= i ? 'var(--gold)' : 'rgba(201,169,110,0.2)' }} />
          ))}
        </div>
      )}
    </div>
  )
}


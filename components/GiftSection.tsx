'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Eye, EyeOff, Copy, Check } from 'lucide-react'
import SectionWrapper from './SectionWrapper'

const BANK_ACCOUNT = process.env.NEXT_PUBLIC_BANK_ACCOUNT || 'ES12 1234 5678 9012 3456 7890'
const BANK_NAME    = process.env.NEXT_PUBLIC_BANK_NAME    || 'CaixaBank'
const BANK_HOLDER  = process.env.NEXT_PUBLIC_BANK_HOLDER  || 'Pedro Ángel González & Mari García'

export default function GiftSection() {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied]     = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(BANK_ACCOUNT.replace(/\s/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <SectionWrapper
      id="regalo"
      className="py-20 px-6"
      style={{ background: 'linear-gradient(160deg, #2d4d2d 0%, #1e3a1e 100%)' }}
    >
      <div className="max-w-lg mx-auto text-center">

        {/* Label */}
        <p
          className="text-xs tracking-[0.4em] uppercase mb-3"
          style={{ color: 'rgba(201,169,110,0.7)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
        >
          Lista de bodas
        </p>

        {/* Title */}
        <h2
          className="text-4xl mb-4"
          style={{ color: '#fffef9', fontWeight: 300, fontStyle: 'italic',
            fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          El mejor regalo
        </h2>

        {/* Subtitle */}
        <p
          className="mb-10 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.55)', fontFamily: "'Montserrat', sans-serif",
            fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.75 }}
        >
          Vuestra presencia es el regalo más especial que podéis hacernos.
          Pero si aun así queréis contribuir a nuestra nueva vida juntos,
          podéis hacer una aportación a nuestra cuenta.
        </p>

        {/* Card */}
        <motion.div
          className="rounded-3xl overflow-hidden mx-auto"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(201,169,110,0.25)',
            backdropFilter: 'blur(10px)',
            maxWidth: 420,
          }}
          whileHover={{ borderColor: 'rgba(201,169,110,0.45)' }}
        >
          {/* Card top */}
          <div className="p-6 flex flex-col items-center gap-4">
            <div
              className="rounded-full flex items-center justify-center"
              style={{ width: 56, height: 56, background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)' }}
            >
              <Gift size={24} color="var(--gold)" />
            </div>

            <div className="text-center">
              <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
                {BANK_NAME}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.82rem' }}>
                {BANK_HOLDER}
              </p>
            </div>

            {/* Account reveal */}
            <AnimatePresence mode="wait">
              {!revealed ? (
                /* ── Hidden state ── */
                <motion.button
                  key="hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setRevealed(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold), #b8935c)',
                    color: 'white',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 300,
                    fontSize: '0.82rem',
                    letterSpacing: '0.1em',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(201,169,110,0.35)',
                  }}
                  whileHover={{ scale: 1.04, boxShadow: '0 6px 24px rgba(201,169,110,0.5)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Eye size={15} />
                  Ver número de cuenta
                </motion.button>
              ) : (
                /* ── Revealed state ── */
                <motion.div
                  key="revealed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex flex-col gap-3"
                >
                  {/* IBAN display */}
                  <div
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl"
                    style={{
                      background: 'rgba(201,169,110,0.1)',
                      border: '1px solid rgba(201,169,110,0.25)',
                    }}
                  >
                    <div className="text-left">
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', letterSpacing: '0.15em', fontFamily: "'Montserrat', sans-serif', fontWeight: 300", textTransform: 'uppercase', marginBottom: 3 }}>
                        IBAN
                      </p>
                      <p style={{ color: '#fffef9', fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: '1rem', letterSpacing: '0.12em' }}>
                        {BANK_ACCOUNT}
                      </p>
                    </div>

                    {/* Copy button */}
                    <motion.button
                      onClick={handleCopy}
                      className="rounded-full p-2.5 flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: copied ? 'rgba(90,180,90,0.2)' : 'rgba(201,169,110,0.15)',
                        border: `1px solid ${copied ? 'rgba(90,180,90,0.4)' : 'rgba(201,169,110,0.3)'}`,
                        cursor: 'pointer',
                      }}
                      whileTap={{ scale: 0.9 }}
                      title="Copiar IBAN"
                    >
                      <AnimatePresence mode="wait">
                        {copied
                          ? <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={16} color="#5ab45a" /></motion.div>
                          : <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }}><Copy size={16} color="var(--gold)" /></motion.div>
                        }
                      </AnimatePresence>
                    </motion.button>
                  </div>

                  {copied && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ color: '#5ab45a', fontSize: '0.75rem', fontFamily: "'Montserrat', sans-serif", fontWeight: 300, textAlign: 'center' }}
                    >
                      ✓ IBAN copiado al portapapeles
                    </motion.p>
                  )}

                  {/* Hide again */}
                  <button
                    onClick={() => setRevealed(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.3)',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 300,
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <EyeOff size={12} /> Ocultar cuenta
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card bottom note */}
          <div style={{ borderTop: '1px solid rgba(201,169,110,0.12)', padding: '14px 24px' }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.72rem', textAlign: 'center', lineHeight: 1.6 }}>
              💚 Muchas gracias por vuestro cariño
            </p>
          </div>
        </motion.div>

      </div>
    </SectionWrapper>
  )
}


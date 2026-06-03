'use client'

import { motion } from 'framer-motion'
import SectionWrapper from './SectionWrapper'

const BRIDE       = process.env.NEXT_PUBLIC_BRIDE_NAME  || 'Pedro Ángel'
const GROOM       = process.env.NEXT_PUBLIC_GROOM_NAME  || 'Mari'
const BRIDE_PHONE = process.env.NEXT_PUBLIC_BRIDE_PHONE || ''
const GROOM_PHONE = process.env.NEXT_PUBLIC_GROOM_PHONE || ''

function whatsappUrl(phone: string, senderSide: string, coupleName: string) {
  const clean  = phone.replace(/\D/g, '')
  const text   = encodeURIComponent(
    `¡Hola! 😊 Os escribo por vuestra super boda y tenia unas dudas:`
  )
  return `https://wa.me/${clean}?text=${text}`
}

interface ContactCardProps {
  name: string
  role: string
  phone: string
  emoji: string
  color: string
  borderColor: string
  senderSide: string
}

function ContactCard({ name, role, phone, emoji, color, borderColor, senderSide }: ContactCardProps) {
  const hasPhone = !!phone
  const url = hasPhone ? whatsappUrl(phone, senderSide, name) : '#'

  return (
    <motion.div
      className="flex flex-col items-center gap-4 p-6 rounded-3xl"
      style={{
        background: 'rgba(255,255,255,0.9)',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        flex: 1,
        minWidth: 0,
      }}
      whileHover={{ y: -4, boxShadow: '0 10px 32px rgba(0,0,0,0.1)' }}
    >
      {/* Avatar */}
      <div
        className="rounded-full flex items-center justify-center text-3xl"
        style={{ width: 68, height: 68, background: color, border: `2px solid ${borderColor}` }}
      >
        {emoji}
      </div>

      {/* Name & role */}
      <div className="text-center">
        <p style={{
          fontSize: '1.3rem',
          fontWeight: 300,
          color: 'var(--charcoal)',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          letterSpacing: '0.03em',
        }}>
          {name}
        </p>
        <p style={{
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--charcoal)',
          opacity: 0.4,
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 300,
          marginTop: 2,
        }}>
          {role}
        </p>
      </div>

      {/* WhatsApp button */}
      {hasPhone ? (
        <motion.a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full w-full justify-center"
          style={{
            background: '#25D366',
            color: 'white',
            textDecoration: 'none',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 400,
            fontSize: '0.78rem',
            letterSpacing: '0.06em',
            boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
          }}
          whileHover={{ scale: 1.04, boxShadow: '0 6px 18px rgba(37,211,102,0.45)' }}
          whileTap={{ scale: 0.97 }}
        >
          {/* WhatsApp SVG icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Escribir por WhatsApp
        </motion.a>
      ) : (
        <p style={{
          fontSize: '0.72rem',
          color: 'var(--charcoal)',
          opacity: 0.35,
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 300,
          textAlign: 'center',
        }}>
          Configura el teléfono en .env.local
        </p>
      )}
    </motion.div>
  )
}

export default function WhatsAppSection() {
  return (
    <SectionWrapper
      id="contacto"
      className="py-20 px-6"
      style={{ background: 'var(--warm-white)' }}
    >
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p
            className="text-xs tracking-[0.4em] uppercase mb-3"
            style={{ color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            ¿Tienes alguna duda?
          </p>
          <h2
            className="text-4xl mb-3"
            style={{ color: 'var(--charcoal)', fontWeight: 300, fontStyle: 'italic',
              fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Estamos aquí
          </h2>
          <p style={{
            color: 'var(--charcoal)',
            opacity: 0.55,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 300,
            fontSize: '0.88rem',
            lineHeight: 1.7,
            maxWidth: 360,
            margin: '0 auto',
          }}>
            Si tienes cualquier pregunta sobre el día,
            el lugar o la logística, escríbenos sin dudarlo.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col sm:flex-row gap-4">
          <ContactCard
            name={BRIDE}
            role="Novio"
            phone={BRIDE_PHONE}
            emoji="🤵"
            color="rgba(201,169,110,0.12)"
            borderColor="rgba(201,169,110,0.3)"
            senderSide={`parte del novio (${BRIDE})`}
          />
          <ContactCard
            name={GROOM}
            role="Novia"
            phone={GROOM_PHONE}
            emoji="👰"
            color="rgba(212,165,165,0.15)"
            borderColor="rgba(212,165,165,0.4)"
            senderSide={`parte de la novia (${GROOM})`}
          />
        </div>

        {/* Small note */}
        <p style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: '0.72rem',
          color: 'var(--charcoal)',
          opacity: 0.3,
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 300,
        }}>
          Al pulsar el botón se abrirá WhatsApp con un mensaje predefinido
        </p>
      </div>
    </SectionWrapper>
  )
}


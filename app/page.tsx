'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import EnvelopeAnimation from '@/components/EnvelopeAnimation'
import CountdownTimer from '@/components/CountdownTimer'
import PhotoGallery from '@/components/PhotoGallery'
import RSVPForm from '@/components/RSVPForm'
import SectionWrapper from '@/components/SectionWrapper'
import GiftSection from '@/components/GiftSection'
import WhatsAppSection from '@/components/WhatsAppSection'
import FAQSection from '@/components/FAQSection'
import { MapPin, Calendar, Clock, Heart } from 'lucide-react'

const MusicPlayer = dynamic(() => import('@/components/MusicPlayer'), { ssr: false })

const BRIDE = process.env.NEXT_PUBLIC_BRIDE_NAME || 'Pedro Ángel'
const GROOM = process.env.NEXT_PUBLIC_GROOM_NAME || 'Mari'
const WEDDING_DATE = process.env.NEXT_PUBLIC_WEDDING_DATE || '2026-11-28T12:30:00'

const weddingDateFormatted = new Date(WEDDING_DATE).toLocaleDateString('es-ES', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const weddingTime = new Date(WEDDING_DATE).toLocaleTimeString('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
})

export default function Home() {
  const [envelopeOpened, setEnvelopeOpened] = useState(false)

  return (
    <>
      {/* ENVELOPE INTRO */}
      <AnimatePresence>
        {!envelopeOpened && (
          <EnvelopeAnimation
            onOpen={() => setEnvelopeOpened(true)}
            brideName={BRIDE}
            groomName={GROOM}
          />
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <AnimatePresence>
        {envelopeOpened && (
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Music Player */}
            <MusicPlayer />

            {/* ─── HERO ─── */}
            <section
              className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden"
              style={{ background: 'linear-gradient(180deg, #faf8f5 0%, #f5ede0 100%)' }}
            >
              {/* Decorative circles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)' }} />
                <div style={{ position: 'absolute', bottom: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,165,165,0.1) 0%, transparent 70%)' }} />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="relative z-10 flex flex-col items-center gap-6"
              >
                <p
                  className="text-xs tracking-[0.4em] uppercase"
                  style={{ color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
                >
                  Nos casamos
                </p>

                <h1
                  style={{
                    fontSize: 'clamp(3.5rem, 12vw, 7rem)',
                    fontWeight: 300,
                    lineHeight: 1,
                    color: 'var(--charcoal)',
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    letterSpacing: '0.02em',
                  }}
                >
                  {BRIDE}
                  <br />
                  <span style={{ color: 'var(--gold)', fontSize: '0.5em', display: 'block', margin: '8px 0', fontStyle: 'italic', letterSpacing: '0.1em' }}>
                    &amp;
                  </span>
                  {GROOM}
                </h1>

                <div
                  className="flex items-center gap-2"
                  style={{ color: 'var(--charcoal)', opacity: 0.6 }}
                >
                  <div style={{ height: 1, width: 40, background: 'var(--gold-light)' }} />
                  <Calendar size={14} color="var(--gold)" />
                  <span
                    className="text-sm capitalize"
                    style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, letterSpacing: '0.05em' }}
                  >
                    {weddingDateFormatted}
                  </span>
                  <div style={{ height: 1, width: 40, background: 'var(--gold-light)' }} />
                </div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ marginTop: 40 }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5 L12 19 M6 13 L12 19 L18 13" stroke="var(--gold-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </motion.div>
            </section>

            {/* ─── FECHA & LUGAR ─── */}
            <SectionWrapper
              id="fecha"
              className="py-20 px-6 text-center"
              style={{ background: 'var(--warm-white)' }}
            >
              <p
                className="text-xs tracking-[0.4em] uppercase mb-8"
                style={{ color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
              >
                El gran día
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {[
                  {
                    icon: <Calendar size={28} color="var(--gold)" />,
                    title: 'Fecha',
                    content: new Date(WEDDING_DATE).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
                  },
                  {
                    icon: <Clock size={28} color="var(--gold)" />,
                    title: 'Hora',
                    content: weddingTime,
                    sub: 'Ceremonia civil',
                  },
                  {
                    icon: <MapPin size={28} color="var(--gold)" />,
                    title: 'Lugar',
                    content: 'Molina Real',
                    sub: 'Madrid, España',
                    link: 'https://www.google.com/maps/place/Restaurante+Molina+Real+Celebraciones/@38.088364,-1.1941352,17z/data=!4m6!3m5!1s0xd638818f963a077:0x35423618ccc8d257!8m2!3d38.088364!4d-1.1915603!16s%2Fg%2F11x9btl0p?entry=ttu&g_ep=EgoyMDI2MDUzMS4wIKXMDSoASAFQAw%3D%3D',
                  },
                ].map((item) => (
                  <motion.div
                    key={item.title}
                    className="card-elegant p-8 flex flex-col items-center gap-3"
                    whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(201,169,110,0.15)' }}
                  >
                    {item.icon}
                    <p
                      className="text-xs tracking-[0.2em] uppercase"
                      style={{ color: 'var(--charcoal)', opacity: 0.5, fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
                    >
                      {item.title}
                    </p>
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center"
                        style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: '1.1rem' }}
                      >
                        {item.content}
                      </a>
                    ) : (
                      <p className="text-center" style={{ color: 'var(--charcoal)', fontSize: '1.1rem' }}>
                        {item.content}
                      </p>
                    )}
                    {item.sub && (
                      <p className="text-xs" style={{ color: 'var(--charcoal)', opacity: 0.4, fontFamily: "'Montserrat', sans-serif" }}>
                        {item.sub}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>



            </SectionWrapper>

            {/* ─── CUENTA ATRÁS ─── */}
            <SectionWrapper
              id="countdown"
              className="py-20 px-6 text-center"
              style={{ background: 'linear-gradient(135deg, #f5ede0 0%, #faf8f5 100%)' }}
            >
              <p
                className="text-xs tracking-[0.4em] uppercase mb-3"
                style={{ color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
              >
                Cuenta atrás
              </p>
              <h2
                className="text-4xl mb-10"
                style={{ color: 'var(--charcoal)', fontWeight: 300, fontStyle: 'italic' }}
              >
                Cada segundo cuenta
              </h2>
              <CountdownTimer targetDate={WEDDING_DATE} />
            </SectionWrapper>

            {/* ─── NUESTRA HISTORIA ─── */}
            <SectionWrapper
              id="historia"
              className="py-20 px-6"
              style={{ background: 'var(--warm-white)' }}
            >
              <div className="max-w-2xl mx-auto text-center">
                <p
                  className="text-xs tracking-[0.4em] uppercase mb-3"
                  style={{ color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
                >
                  Nuestra historia
                </p>
                <h2
                  className="text-4xl mb-10"
                  style={{ color: 'var(--charcoal)', fontWeight: 300, fontStyle: 'italic' }}
                >
                  Cómo empezó todo
                </h2>

                <div className="flex flex-col gap-10">
                  {[
                    {
                      year: '2019',
                      emoji: '☕',
                      title: 'El primer encuentro',
                      text: 'Nos conocimos en una pequeña cafetería del centro. Una mirada, una sonrisa, y el mundo paró por un momento. Ninguno de los dos sabía que ese día cambiaría nuestras vidas para siempre.',
                    },
                    {
                      year: '2021',
                      emoji: '✈️',
                      title: 'Nuestra primera aventura',
                      text: 'Decidimos que queríamos ver el mundo juntos. Roma fue nuestra primera aventura como pareja, caminando por calles empedradas, comiendo pasta y prometiéndonos que esto no sería la última vez.',
                    },
                    {
                      year: '2024',
                      emoji: '💍',
                      title: 'La propuesta',
                      text: 'En el mismo lugar donde nos conocimos, entre nervios y lágrimas de alegría, le pregunté si querría pasar el resto de su vida conmigo. La respuesta fue un rotundo "¡sí!".',
                    },
                    {
                      year: '2026',
                      emoji: '🎊',
                      title: 'El gran paso',
                      text: '¡Y ahora te invitamos a compartir con nosotros el día más especial de nuestras vidas! Tu presencia hará de esta celebración algo todavía más mágico.',
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.year}
                      className="flex gap-6 text-left"
                      initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7 }}
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className="rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ width: 52, height: 52, background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)', fontSize: 22 }}
                        >
                          {item.emoji}
                        </div>
                        {i < 3 && <div style={{ width: 1, flex: 1, background: 'var(--gold-light)', marginTop: 8 }} />}
                      </div>
                      <div className="pb-8">
                        <span
                          className="text-xs tracking-[0.2em]"
                          style={{ color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
                        >
                          {item.year}
                        </span>
                        <h3
                          className="text-xl mt-1 mb-2"
                          style={{ color: 'var(--charcoal)', fontWeight: 500 }}
                        >
                          {item.title}
                        </h3>
                        <p
                          style={{ color: 'var(--charcoal)', opacity: 0.7, lineHeight: 1.7, fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.9rem' }}
                        >
                          {item.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="flex justify-center mt-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart size={32} fill="var(--rose)" color="var(--rose)" />
                </motion.div>
              </div>
            </SectionWrapper>

            {/* ─── GALERÍA ─── */}
            <SectionWrapper
              id="galeria"
              className="py-20 px-6"
              style={{ background: 'linear-gradient(135deg, #f5ede0 0%, #faf8f5 100%)' }}
            >
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                  <p
                    className="text-xs tracking-[0.4em] uppercase mb-3"
                    style={{ color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
                  >
                    Galería
                  </p>
                  <h2
                    className="text-4xl"
                    style={{ color: 'var(--charcoal)', fontWeight: 300, fontStyle: 'italic' }}
                  >
                    Nuestros momentos
                  </h2>
                </div>
                <PhotoGallery />
              </div>
            </SectionWrapper>

            {/* ─── REGALO ─── */}
            <GiftSection />

            {/* ─── RSVP ─── */}
            <SectionWrapper
              id="rsvp"
              className="py-20 px-6"
              style={{ background: 'var(--warm-white)' }}
            >
              <div className="max-w-md mx-auto">
                <div className="text-center mb-10">
                  <p
                    className="text-xs tracking-[0.4em] uppercase mb-3"
                    style={{ color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
                  >
                    Confirmación de asistencia
                  </p>
                  <h2
                    className="text-4xl mb-4"
                    style={{ color: 'var(--charcoal)', fontWeight: 300, fontStyle: 'italic' }}
                  >
                    ¿Vendrás?
                  </h2>
                  <p
                    style={{ color: 'var(--charcoal)', opacity: 0.6, fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.9rem' }}
                  >
                    Por favor, confirma tu asistencia antes del{' '}
                    <strong style={{ color: 'var(--gold)' }}>20 de Septiembre de 2026</strong>
                  </p>
                </div>
                <RSVPForm />
              </div>
            </SectionWrapper>

            {/* ─── WHATSAPP CONTACTO ─── */}
            <WhatsAppSection />

            {/* ─── PREGUNTAS FRECUENTES ─── */}
            <FAQSection />

            {/* ─── FOOTER ─── */}
            <footer
              className="py-16 px-6 text-center"
              style={{ background: 'var(--charcoal)' }}
            >
              <div className="flex flex-col items-center gap-4">
                <p
                  style={{
                    fontSize: 'clamp(1.8rem, 6vw, 3rem)',
                    fontWeight: 300,
                    color: 'var(--gold)',
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                    letterSpacing: '0.05em',
                  }}
                >
                  {BRIDE} &amp; {GROOM}
                </p>
                <p
                  className="text-xs tracking-[0.3em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
                >
                  {new Date(WEDDING_DATE).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div style={{ width: 40, height: 1, background: 'rgba(201,169,110,0.3)', margin: '8px 0' }} />
                <p
                  className="text-xs"
                  style={{ color: 'rgba(255,255,255,0.2)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
                >
                  Hecho con amor ♥
                </p>
              </div>
            </footer>
          </motion.main>
        )}
      </AnimatePresence>
    </>
  )
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import SectionWrapper from './SectionWrapper'

interface FAQItem {
  question: string
  answer: string
  emoji: string
  link?: { label: string; url: string }
}

const FAQ_ITEMS: FAQItem[] = [
  {
    emoji: '📍',
    question: '¿Dónde se celebra la ceremonia y el banquete?',
    answer: 'La ceremonia civil y el banquete se celebran en Molina Real, Molina de Segura. Puedes encontrar la ubicación exacta en la sección "El gran día" más arriba, con enlace directo a Google Maps.',
  },
  {
    emoji: '🕐',
    question: '¿A qué hora debo llegar?',
    answer: 'La ceremonia comienza a las 12:30 h. Os pedimos que lleguéis con al menos 15-20 minutos de antelación para que todos estéis acomodados antes del inicio. La puntualidad nos ayuda a que todo salga perfecto.',
  },
  {
    emoji: '👗',
    question: '¿Cuál es el código de vestimenta?',
    answer: 'Queremos que vengáis a vuestro estilo, solo con dos pequeñas excepciones: el blanco queda reservado y el chándal… no es muy de boda.',
  },
  {
    emoji: '🏨',
    question: '¿Dónde puedo alojarme?',
    answer: 'Si queréis sobrevivir a la fiesta, os recomendamos alojaros en Molina de Segura (Murcia). Este hotel es ideal para recuperarse después de darlo todo:',
    link: { label: 'Ver hotel en Booking.com', url: 'https://www.booking.com/Share-H5nfdW7' },
  },
  {
    emoji: '🚗',
    question: '¿Hay aparcamiento disponible en el salon de Celebraciones?',
    answer: 'Sí, el Restaurante Molina Real dispone de parking gratuito para todos los invitados. Si venís en coche, no tendréis ningún problema. También hay zona de aparcamiento en los alrededores si el parking estuviese completo.',
  },
  {
    emoji: '👶',
    question: '¿Pueden venir los niños?',
    answer: '¡Por supuesto! Los niños son bienvenidos en nuestra boda. Habrá menú infantil disponible, así que no olvidéis indicarlo en el formulario de confirmación de asistencia.',
  },
  {
    emoji: '📱',
    question: '¿Puedo hacer fotos durante la ceremonia?',
    answer: 'Preferimos que durante la ceremonia viváis el momento con nosotros sin pantallas. Tenemos un fotógrafo profesional que capturará todos los momentos. En el banquete podréis hacer todas las fotos y vídeos que queráis.',
  },
  {
    emoji: '🍽️',
    question: '¿Hay opciones para personas con alergias o dietas especiales?',
    answer: 'Sí, absolutamente. Al confirmar tu asistencia podrás indicar tu preferencia de menú (vegetariano, vegano, sin gluten…) y cualquier alergia o intolerancia. El restaurante lo tendrá todo en cuenta.',
  },
  {
    emoji: '📅',
    question: '¿Cuándo es el plazo para confirmar asistencia?',
    answer: 'Te pedimos que confirmes tu asistencia antes del 20 de septiembre de 2026. Esto nos ayuda a organizar el restaurante, la disposición de las mesas y todos los detalles con tiempo suficiente. ¡No te olvides!',
  },
  {
    emoji: '🎁',
    question: '¿Qué podemos regalaros?',
    answer: 'Vuestro regalo más especial es vuestra presencia. Si queréis hacernos un obsequio, podéis contribuir a nuestra luna de miel mediante transferencia bancaria. Encontraréis los datos en la sección "Lista de bodas" de esta misma web.',
  },
  {
    emoji: '🌧️',
    question: '¿Qué pasa si llueve?',
    answer: 'En el restaurante Molina Real dispone de espacios cubiertos que garantizan la celebración en perfectas condiciones independientemente del tiempo. Tenemos un plan B completamente preparado por si el tiempo no acompaña, así que no hay de qué preocuparse.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex(prev => prev === i ? null : i)

  return (
    <SectionWrapper
      id="faq"
      className="py-20 px-6"
      style={{ background: 'linear-gradient(160deg, #faf8f5 0%, #f5ede0 100%)' }}
    >
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p
            className="text-xs tracking-[0.4em] uppercase mb-3"
            style={{ color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            Preguntas frecuentes
          </p>
          <h2
            className="text-4xl mb-4"
            style={{
              color: 'var(--charcoal)',
              fontWeight: 300,
              fontStyle: 'italic',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
            }}
          >
            ¿Tienes dudas?
          </h2>
          <p
            style={{
              color: 'var(--charcoal)',
              opacity: 0.5,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 300,
              fontSize: '0.88rem',
              lineHeight: 1.7,
              maxWidth: 380,
              margin: '0 auto',
            }}
          >
            Aquí respondemos las preguntas más habituales.
            Si no encuentras lo que buscas, escríbenos por WhatsApp.
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <motion.div
                key={i}
                layout
                className="rounded-2xl overflow-hidden"
                style={{
                  background: isOpen ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.75)',
                  border: `1px solid ${isOpen ? 'rgba(201,169,110,0.4)' : 'rgba(201,169,110,0.18)'}`,
                  boxShadow: isOpen ? '0 4px 24px rgba(201,169,110,0.1)' : 'none',
                  transition: 'border-color 0.25s, box-shadow 0.25s, background 0.25s',
                }}
              >
                {/* Question row */}
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {/* Emoji */}
                  <span
                    className="flex-shrink-0 rounded-xl flex items-center justify-center"
                    style={{
                      width: 38,
                      height: 38,
                      background: isOpen ? 'rgba(201,169,110,0.12)' : 'rgba(201,169,110,0.07)',
                      fontSize: 18,
                      transition: 'background 0.2s',
                    }}
                  >
                    {item.emoji}
                  </span>

                  {/* Question text */}
                  <span
                    className="flex-1"
                    style={{
                      color: 'var(--charcoal)',
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '1.08rem',
                      fontWeight: isOpen ? 500 : 400,
                      lineHeight: 1.4,
                      textAlign: 'left',
                    }}
                  >
                    {item.question}
                  </span>

                  {/* Toggle icon */}
                  <motion.div
                    className="flex-shrink-0 rounded-full flex items-center justify-center"
                    style={{
                      width: 28,
                      height: 28,
                      background: isOpen ? 'var(--gold)' : 'rgba(201,169,110,0.12)',
                      border: `1px solid ${isOpen ? 'var(--gold)' : 'rgba(201,169,110,0.25)'}`,
                      transition: 'background 0.2s, border-color 0.2s',
                    }}
                    animate={{ rotate: isOpen ? 0 : 0 }}
                  >
                    {isOpen
                      ? <Minus size={13} color="white" />
                      : <Plus size={13} color="var(--gold)" />
                    }
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-5 pb-5"
                        style={{ paddingLeft: 'calc(1.25rem + 38px + 1rem)' }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 1,
                            background: 'rgba(201,169,110,0.3)',
                            marginBottom: 12,
                          }}
                        />
                        <p
                          style={{
                            color: 'var(--charcoal)',
                            opacity: 0.72,
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 300,
                            fontSize: '0.875rem',
                            lineHeight: 1.8,
                          }}
                        >
                          {item.answer}
                        </p>
                        {item.link && (
                          <a
                            href={item.link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              marginTop: 10,
                              padding: '8px 16px',
                              borderRadius: 50,
                              background: 'linear-gradient(135deg, #003580, #0057b8)',
                              color: 'white',
                              fontFamily: "'Montserrat', sans-serif",
                              fontWeight: 400,
                              fontSize: '0.78rem',
                              letterSpacing: '0.04em',
                              textDecoration: 'none',
                              boxShadow: '0 4px 12px rgba(0,53,128,0.3)',
                            }}
                          >
                            🏨 {item.link.label}
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom note */}
        <motion.p
          className="text-center mt-10 text-sm"
          style={{
            color: 'var(--charcoal)',
            opacity: 0.4,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 300,
            fontStyle: 'italic',
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.4 }}
          viewport={{ once: true }}
        >
          ¿Aún tienes dudas? Escríbenos en la sección de contacto 💬
        </motion.p>

      </div>
    </SectionWrapper>
  )
}


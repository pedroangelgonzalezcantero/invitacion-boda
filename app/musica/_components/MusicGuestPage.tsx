'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import MusicRequestModal from '@/app/musica/_components/MusicRequestModal'
import MusicSearchBox from '@/app/musica/_components/MusicSearchBox'
import MusicSearchResults from '@/app/musica/_components/MusicSearchResults'
import MusicStatusMessage from '@/app/musica/_components/MusicStatusMessage'
import {
  MusicCommitResponse,
  MusicPreviewResponse,
  SpotifyTrackResult,
} from '@/lib/music/types'

const BRIDE = process.env.NEXT_PUBLIC_BRIDE_NAME || 'Pedro Ángel'
const GROOM = process.env.NEXT_PUBLIC_GROOM_NAME || 'Mari'

export default function MusicGuestPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SpotifyTrackResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrackResult | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [requestPanelOpen, setRequestPanelOpen] = useState(false)
  const [preview, setPreview] = useState<MusicPreviewResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; title: string; message: string } | null>(null)
  const [actionTrackId, setActionTrackId] = useState<string | null>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      try {
        setSearching(true)
        setSearchError('')
        const response = await fetch(`/api/music/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        })
        const json = await response.json()

        if (!response.ok) {
          throw new Error(json.error || 'SEARCH_ERROR')
        }

        setResults(json.items || [])
      } catch (error) {
        if (controller.signal.aborted) return
        setResults([])
        setSearchError(error instanceof Error ? error.message : 'No se ha podido completar la búsqueda.')
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false)
        }
      }
    }, 350)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [query])

  const emptyStateVisible = useMemo(() => {
    return query.trim().length >= 2 && !searching && !searchError && results.length === 0
  }, [query, searching, searchError, results.length])

  const idleStateVisible = useMemo(() => {
    return query.trim().length < 2 && !status && !searchError
  }, [query, status, searchError])

  async function handlePreview(track = selectedTrack) {
    if (!track) return

    setSelectedTrack(track)
    setActionTrackId(track.spotifyTrackId)
    setPreviewLoading(true)
    setRequestPanelOpen(true)
    setPreview(null)
    setStatus(null)

    try {
      const response = await fetch('/api/music/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'preview',
          track,
        }),
      })

      const json = await response.json() as MusicPreviewResponse | { error?: string }
      if (!response.ok || !('ok' in json)) {
        throw new Error('error' in json ? json.error || 'No se ha podido comprobar la canción.' : 'No se ha podido comprobar la canción.')
      }

      setPreview(json)
    } catch (error) {
      setRequestPanelOpen(false)
      setStatus({
        tone: 'error',
        title: 'No hemos podido comprobar la canción',
        message: error instanceof Error ? error.message : 'Inténtalo otra vez dentro de un momento.',
      })
    } finally {
      setPreviewLoading(false)
      setActionTrackId(null)
    }
  }

  function handleQueryChange(value: string) {
    setQuery(value)

    if (value.trim().length < 2) {
      setResults([])
      setSearching(false)
      setSearchError('')
    }
  }

  async function handleConfirm() {
    if (!selectedTrack || !preview) return

    setActionTrackId(selectedTrack.spotifyTrackId)
    setSubmitting(true)

    try {
      const response = await fetch('/api/music/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'commit',
          track: selectedTrack,
        }),
      })

      const json = await response.json() as MusicCommitResponse | { error?: string }
      if (!response.ok || !('ok' in json)) {
        throw new Error('error' in json ? json.error || 'No se ha podido enviar la petición.' : 'No se ha podido enviar la petición.')
      }

      setStatus({
        tone: 'success',
        title: json.title,
        message: `${json.message}${json.requestCount > 1 ? ` · Solicitada ${json.requestCount} veces.` : ''}`,
      })
      setRequestPanelOpen(false)
      setPreview(null)
    } catch (error) {
      setStatus({
        tone: 'error',
        title: 'No hemos podido enviar la petición',
        message: error instanceof Error ? error.message : 'Inténtalo de nuevo en unos segundos.',
      })
    } finally {
      setSubmitting(false)
      setActionTrackId(null)
    }
  }

  function handleSelect(track: SpotifyTrackResult) {
    setSelectedTrack(track)
    setPreview(null)
    setRequestPanelOpen(false)
    setStatus(null)
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #3a342f 0%, #43392f 31%, #f7f0e5 31%, #fbf7f1 100%)' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(201,169,110,0.18), transparent 24%), radial-gradient(circle at 18% 20%, rgba(212,165,165,0.10), transparent 18%)' }} />
        <div style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', width: 'min(900px, 92vw)', height: 220, opacity: 0.16, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 68%)' }} />
        <div style={{ position: 'absolute', top: 128, left: '12%', width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(201,169,110,0.14)' }} />
        <div style={{ position: 'absolute', top: 164, right: '10%', width: 82, height: 82, borderRadius: '50%', border: '1px solid rgba(240,216,152,0.18)' }} />
        <div style={{ position: 'absolute', top: 116, left: '8%', width: 8, height: 8, borderRadius: '50%', background: 'rgba(240,216,152,0.9)', boxShadow: '0 0 18px rgba(240,216,152,0.75)' }} />
        <div style={{ position: 'absolute', top: 208, right: '16%', width: 10, height: 10, borderRadius: '50%', background: 'rgba(212,165,165,0.78)', boxShadow: '0 0 18px rgba(212,165,165,0.6)' }} />
        <div style={{ position: 'absolute', top: 252, left: '20%', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', boxShadow: '0 0 16px rgba(255,255,255,0.55)' }} />
      </div>

      <main className="relative z-10 px-4 pt-8 pb-10 md:pt-12 md:pb-14">
        <div className="max-w-2xl mx-auto flex flex-col gap-5">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center px-4 pt-6 pb-32 md:pb-32"
            style={{
              color: 'white',
            }}
          >
            <p className="text-xs uppercase tracking-[0.45em]" style={{ color: 'rgba(232,213,176,0.9)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
              Playlist de la boda del año
            </p>
            <h1 className="mt-4" style={{ color: 'white', fontSize: 'clamp(2.9rem, 11vw, 5.1rem)', fontWeight: 300, lineHeight: 1.02 }}>
              La fiesta la pones tú
              <span style={{ display: 'block', color: 'var(--gold-light)', fontStyle: 'italic' }}>canción a canción</span>
            </h1>
            <p className="mt-4 mx-auto max-w-xl" style={{ color: 'rgba(255,255,255,0.88)', textShadow: '0 1px 10px rgba(0,0,0,0.16)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.94rem', lineHeight: 1.85 }}>
              Pide ese temazo que te va a sacar a bailar, mándaselo al DJ con un toque y ayúdanos a encender la noche de {BRIDE} &amp; {GROOM}.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {['💃 Temazos', '🥂 Boda', '✨ After party'].map((label) => (
                <span
                  key={label}
                  className="rounded-full px-3 py-1"
                  style={{
                    background: 'rgba(255,255,255,0.09)',
                    border: '1px solid rgba(232,213,176,0.26)',
                    color: 'rgba(255,255,255,0.92)',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '0.74rem',
                    letterSpacing: '0.04em',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.section>

          <div className="-mt-12 md:-mt-10">
            <MusicSearchBox query={query} onChange={handleQueryChange} searching={searching} />
          </div>

          {status && (
            <MusicStatusMessage tone={status.tone} title={status.title} message={status.message} />
          )}

          {searchError && (
            <MusicStatusMessage tone="error" title="No hemos podido buscar en Spotify" message={searchError} />
          )}

          {results.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="px-1">
                <p className="text-xs uppercase tracking-[0.35em]" style={{ color: 'rgba(44,44,44,0.52)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                  Resultados
                </p>
                <p className="mt-1" style={{ color: 'rgba(44,44,44,0.42)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.74rem' }}>
                  Toca el check dorado para pedir una canción al momento.
                </p>
              </div>
              <MusicSearchResults
                items={results}
                selectedTrackId={selectedTrack?.spotifyTrackId || null}
                onSelect={handleSelect}
                onQuickConfirm={handlePreview}
                actionTrackId={actionTrackId}
              />
            </section>
          )}

          {emptyStateVisible && (
            <div className="card-elegant p-5 text-center" style={{ background: 'rgba(255,255,255,0.84)', borderColor: 'rgba(201,169,110,0.16)', boxShadow: '0 18px 40px rgba(69,52,38,0.08)' }}>
              <p style={{ color: 'var(--charcoal)', fontSize: '1.2rem' }}>Sin resultados</p>
              <p className="mt-2" style={{ color: 'rgba(44,44,44,0.56)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.84rem', lineHeight: 1.7 }}>
                Prueba con otro artista, otro título o una combinación más específica.
              </p>
            </div>
          )}

          {idleStateVisible && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elegant p-5 md:p-6"
              style={{ background: 'rgba(255,255,255,0.86)', borderColor: 'rgba(201,169,110,0.16)', boxShadow: '0 18px 40px rgba(69,52,38,0.08)' }}
            >
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em]" style={{ color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                    Esta noche promete
                  </p>
                  <h2 className="mt-2" style={{ color: 'var(--charcoal)', fontSize: '1.8rem', fontWeight: 300 }}>
                    Elige tu himno y súbelo a la pista
                  </h2>
                  <p className="mt-2" style={{ color: 'rgba(44,44,44,0.58)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.84rem', lineHeight: 1.75 }}>
                    Busca artista o canción, toca el check dorado y deja tu voto para que el DJ sepa qué temazos van a romper la boda.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { emoji: '🔎', title: 'Busca', text: 'Tu canción favorita o ese guilty pleasure que no puede faltar.' },
                    { emoji: '✅', title: 'Marca', text: 'Toca el check dorado del resultado que quieras pedir.' },
                    { emoji: '🎉', title: 'Celebra', text: 'El DJ lo recibirá al momento para prender la fiesta.' },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[22px] p-4"
                      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(247,240,229,0.92) 100%)', border: '1px solid rgba(201,169,110,0.14)' }}
                    >
                      <div style={{ fontSize: '1.3rem' }}>{item.emoji}</div>
                      <p className="mt-3" style={{ color: 'var(--charcoal)', fontSize: '1.02rem' }}>{item.title}</p>
                      <p className="mt-1" style={{ color: 'rgba(44,44,44,0.56)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.76rem', lineHeight: 1.7 }}>
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div className="text-center pt-2 pb-6">
            <p style={{ color: 'rgba(44,44,44,0.3)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Busca · Marca · Confirma · Baila
            </p>
          </div>
        </div>
      </main>

      <MusicRequestModal
        open={requestPanelOpen}
        track={selectedTrack}
        preview={preview}
        previewLoading={previewLoading}
        submitting={submitting}
        onClose={() => setRequestPanelOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  )
}






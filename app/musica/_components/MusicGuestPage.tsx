'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Disc3, Music2, Sparkles } from 'lucide-react'
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
    <div className="min-h-screen overflow-hidden" style={{ background: '#f7f5fa' }}>
      <main className="px-4 pt-4 pb-12 sm:pt-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative isolate overflow-hidden rounded-[30px] px-5 pt-8 pb-10 text-center sm:rounded-[38px] sm:px-10 sm:pt-12 sm:pb-14"
            style={{
              background: 'linear-gradient(135deg, #171326 0%, #30204a 54%, #54294f 100%)',
              boxShadow: '0 28px 70px rgba(37,25,57,0.2)',
            }}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full blur-3xl" style={{ background: 'rgba(221,76,157,0.28)' }} />
              <div className="absolute -bottom-36 -left-24 h-72 w-72 rounded-full blur-3xl" style={{ background: 'rgba(105,82,231,0.3)' }} />
              <div className="absolute right-[12%] top-[18%] opacity-[0.08]" style={{ color: 'white' }}>
                <Disc3 size={190} strokeWidth={0.7} />
              </div>
            </div>
            <div className="relative z-10">
              <div
                className="mx-auto inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.16)', color: '#f8d8ee' }}
              >
                <Sparkles size={14} />
                <span className="text-[0.64rem] font-medium uppercase tracking-[0.2em]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  La playlist de la boda
                </span>
              </div>
              <h1 className="mt-6" style={{ color: '#fff', fontSize: 'clamp(2.35rem, 8.4vw, 4.4rem)', fontWeight: 400, lineHeight: 0.98, letterSpacing: '-0.045em' }}>
                <span className="block">La fiesta</span>
                <span className="mt-1 block">la pones tú</span>
                <span className="mt-2 block" style={{ color: '#f5b8dc', fontStyle: 'italic', fontWeight: 300 }}>
                  canción a canción
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-lg" style={{ color: 'rgba(255,255,255,0.86)', fontFamily: "'Montserrat', sans-serif", fontSize: 'clamp(0.82rem, 3.5vw, 0.96rem)', lineHeight: 1.8 }}>
                Pide ese temazo que te va a sacar a bailar y ayúdanos a encender la noche de {BRIDE} &amp; {GROOM}.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {[
                  { emoji: '💃', label: 'Temazos' },
                  { emoji: '🥂', label: 'Boda' },
                  { emoji: '✨', label: 'After party' },
                ].map(({ emoji, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      borderColor: 'rgba(255,255,255,0.14)',
                      color: 'rgba(255,255,255,0.92)',
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '0.7rem',
                    }}
                  >
                    <span aria-hidden="true">{emoji}</span>{label}
                  </span>
                ))}
              </div>
            </div>
          </motion.section>

          <div className="relative z-10 -mt-9 mx-2 sm:mx-6">
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
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#55456f', fontFamily: "'Montserrat', sans-serif" }}>
                  Resultados
                </p>
                <span className="rounded-full px-2.5 py-1 text-xs" style={{ background: '#ece7f3', color: '#665482', fontFamily: "'Montserrat', sans-serif" }}>
                  {results.length}
                </span>
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
            <div className="rounded-[24px] border p-6 text-center" style={{ background: '#fff', borderColor: '#e9e3f0', boxShadow: '0 16px 40px rgba(49,36,68,0.07)' }}>
              <Music2 className="mx-auto mb-3" size={24} color="#8765a7" />
              <p style={{ color: '#332842', fontSize: '1.2rem' }}>Sin resultados</p>
              <p className="mt-2" style={{ color: '#746b7d', fontFamily: "'Montserrat', sans-serif", fontSize: '0.84rem', lineHeight: 1.7 }}>
                Prueba con otro artista, otro título o una combinación más específica.
              </p>
            </div>
          )}
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


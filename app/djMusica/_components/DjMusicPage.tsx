'use client'

import { useCallback, useEffect, useState } from 'react'
import DjHistoryList from '@/app/djMusica/_components/DjHistoryList'
import DjMusicLogin from '@/app/djMusica/_components/DjMusicLogin'
import DjQueueList from '@/app/djMusica/_components/DjQueueList'
import DjSearchFilters from '@/app/djMusica/_components/DjSearchFilters'
import DjStatsCards from '@/app/djMusica/_components/DjStatsCards'
import { DjHistoryItemDto, DjQueueItemDto, DjStatsDto } from '@/lib/music/types'

const SESSION_KEY = 'djMusicToken'

type HistoryFilter = 'all' | 'today' | 'hours' | 'top' | 'repeated'

export default function DjMusicPage() {
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem(SESSION_KEY) || ''
  })
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'queue' | 'history'>('queue')
  const [queueItems, setQueueItems] = useState<DjQueueItemDto[]>([])
  const [historyItems, setHistoryItems] = useState<DjHistoryItemDto[]>([])
  const [stats, setStats] = useState<DjStatsDto | null>(null)
  const [historySearch, setHistorySearch] = useState('')
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all')
  const [busyId, setBusyId] = useState<string | null>(null)

  const fetchDashboard = useCallback(async (authToken: string, options?: { search?: string; filter?: HistoryFilter }) => {
    setLoading(true)
    setError('')

    try {
      const search = options?.search ?? historySearch
      const filter = options?.filter ?? historyFilter
      const headers = { 'x-dj-token': authToken }

      const [queueRes, statsRes, historyRes] = await Promise.all([
        fetch('/api/music/dj/queue', { headers }),
        fetch('/api/music/dj/stats', { headers }),
        fetch(`/api/music/dj/history?q=${encodeURIComponent(search)}&filter=${encodeURIComponent(filter)}`, { headers }),
      ])

      if (queueRes.status === 401 || statsRes.status === 401 || historyRes.status === 401) {
        throw new Error('TOKEN_INVALIDO')
      }

      const queueJson = await queueRes.json()
      const statsJson = await statsRes.json()
      const historyJson = await historyRes.json()

      if (!queueRes.ok) throw new Error(queueJson.error || 'No se ha podido cargar la cola.')
      if (!statsRes.ok) throw new Error(statsJson.error || 'No se han podido cargar las estadísticas.')
      if (!historyRes.ok) throw new Error(historyJson.error || 'No se ha podido cargar el histórico.')

      setQueueItems(queueJson.items || [])
      setStats(statsJson)
      setHistoryItems(historyJson.items || [])
      setAuthenticated(true)
      sessionStorage.setItem(SESSION_KEY, authToken)
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.message === 'TOKEN_INVALIDO') {
        sessionStorage.removeItem(SESSION_KEY)
        setAuthenticated(false)
        setError('El token del DJ no es válido o ha caducado.')
      } else {
        setError(fetchError instanceof Error ? fetchError.message : 'Error de conexión')
      }
    } finally {
      setLoading(false)
    }
  }, [historyFilter, historySearch])

  useEffect(() => {
    if (token) {
      const timeout = window.setTimeout(() => {
        void fetchDashboard(token, { search: '', filter: 'all' })
      }, 0)

      return () => window.clearTimeout(timeout)
    }
  }, [fetchDashboard, token])

  useEffect(() => {
    if (!authenticated || !token) return

    const timer = window.setInterval(() => {
      void fetchDashboard(token)
    }, 20_000)

    return () => window.clearInterval(timer)
  }, [authenticated, token, fetchDashboard])

  useEffect(() => {
    if (!authenticated || !token) return

    const timeout = window.setTimeout(() => {
      void fetchDashboard(token)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [historySearch, historyFilter, authenticated, token, fetchDashboard])

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await fetchDashboard(token, { search: historySearch, filter: historyFilter })
  }

  async function handleMarkPlayed(queueItemId: string) {
    setBusyId(queueItemId)
    setError('')

    try {
      const response = await fetch('/api/music/dj/play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-dj-token': token,
        },
        body: JSON.stringify({ queueItemId }),
      })

      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || 'No se ha podido actualizar la canción.')
      }

      await fetchDashboard(token)
    } catch (playError) {
      setError(playError instanceof Error ? playError.message : 'No se ha podido actualizar la canción.')
    } finally {
      setBusyId(null)
    }
  }

  if (!authenticated) {
    return (
      <DjMusicLogin
        token={token}
        error={error}
        loading={loading}
        onTokenChange={setToken}
        onSubmit={handleLogin}
      />
    )
  }

  return (
    <div className="min-h-screen px-4 py-6 md:py-8" style={{ background: 'linear-gradient(180deg, #342f2c 0%, #43382f 18%, #f7f0e5 18%, #fbf7f1 100%)' }}>
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <div className="rounded-[30px] border p-5 md:p-7" style={{ background: 'linear-gradient(180deg, rgba(70,56,46,0.94) 0%, rgba(54,44,38,0.92) 100%)', borderColor: 'rgba(232,213,176,0.14)', boxShadow: '0 24px 70px rgba(0,0,0,0.16)' }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.45em]" style={{ color: 'rgba(232,213,176,0.9)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                Wedding music control
              </p>
              <h1 className="mt-3" style={{ color: 'white', fontSize: 'clamp(2rem, 5vw, 3.8rem)', fontWeight: 300 }}>
                Panel DJ · Cabina en directo
              </h1>
              <p className="mt-3" style={{ color: 'rgba(255,255,255,0.62)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 680 }}>
                Gestiona la cola, detecta canciones repetidas al instante y mueve cada tema al histórico cuando ya haya sonado.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-full px-4 py-3 border" style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'white', fontFamily: "'Montserrat', sans-serif", fontSize: '0.78rem' }} onClick={() => fetchDashboard(token)}>
                {loading ? 'Actualizando…' : 'Actualizar'}
              </button>
              <button className="rounded-full px-4 py-3 border" style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.72)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.78rem' }} onClick={() => { sessionStorage.removeItem(SESSION_KEY); setAuthenticated(false); setToken(''); }}>
                Salir
              </button>
            </div>
          </div>
        </div>

        <DjStatsCards stats={stats} />

        <DjSearchFilters
          tab={tab}
          historySearch={historySearch}
          historyFilter={historyFilter}
          onTabChange={setTab}
          onSearchChange={setHistorySearch}
          onFilterChange={setHistoryFilter}
        />

        {error && (
          <div className="rounded-[24px] border p-4" style={{ background: 'rgba(255,249,249,0.95)', borderColor: 'rgba(214,125,125,0.22)', boxShadow: '0 12px 30px rgba(69,52,38,0.07)' }}>
            <p style={{ color: '#7a2e33' }}>Ha ocurrido un problema</p>
            <p className="mt-1" style={{ color: 'rgba(44,44,44,0.72)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.82rem' }}>{error}</p>
          </div>
        )}

        {tab === 'queue' ? (
          <DjQueueList items={queueItems} busyId={busyId} onMarkPlayed={handleMarkPlayed} />
        ) : (
          <DjHistoryList items={historyItems} />
        )}
      </div>
    </div>
  )
}





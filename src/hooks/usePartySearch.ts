import { useState, useEffect, useRef } from 'react'
import { useAppSelector } from '@store/hooks'
import { partyService, type PartyRecord } from '@services/partyService'

export function usePartySearch() {
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<PartyRecord[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const company_id = activeBranch?.company_id
    if (!company_id) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await partyService.search(company_id, query)
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query, activeBranch?.company_id])

  return { query, setQuery, results, loading }
}

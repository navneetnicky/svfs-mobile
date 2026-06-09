import { useState, useEffect, useRef } from 'react'
import { useAppSelector } from '@store/hooks'
import { consignmentService, type ConsignmentRecord } from '@services/consignmentService'

export function useConsignmentSearch() {
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<ConsignmentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const company_id = activeBranch?.company_id
    if (!company_id) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await consignmentService.search(company_id, query)
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

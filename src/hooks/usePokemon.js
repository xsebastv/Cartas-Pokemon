import { useEffect, useRef, useState } from 'react'
import { getPokemonList, getPokemonByNameOrId, getAllPokemonNames } from '../services/pokeApi'

export function usePokemon({ initialLimit = 24 } = {}){
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(initialLimit)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const controllerRef = useRef(null)
  // Caché para búsqueda parcial en el cliente
  const allNamesRef = useRef(null) // string[] | null
  const matchListRef = useRef([])  // coincidencias actuales para paginar cuando query != '' y no es exacta
  const searchModeRef = useRef('none') // 'none' | 'exact' | 'partial'

  const start = () => {
    controllerRef.current?.abort?.()
    const c = new AbortController()
    controllerRef.current = c
    setLoading(true)
    setError(null)
    return c
  }

  const loadFirstPage = async (q = query) => {
    const c = start()
    try{
      if(q){
        const ql = q.toLowerCase().trim()
  // 1) intentar coincidencia directa por nombre/ID
        try{
          const poke = await getPokemonByNameOrId(ql, { signal: c.signal })
          setItems([poke])
          setPage(0)
          setHasMore(false)
          matchListRef.current = []
          searchModeRef.current = 'exact'
          return
        }catch(ex){
          // 2) búsqueda parcial por nombre que contiene
          // cargar caché una sola vez
          if(!allNamesRef.current){
            try{
              allNamesRef.current = await getAllPokemonNames({ signal: c.signal })
            }catch(fetchErr){ /* swallow, will fall back below */ }
          }
          const list = Array.isArray(allNamesRef.current) ? allNamesRef.current : []
          const matches = list.filter(n => n.includes(ql))
          matchListRef.current = matches
          searchModeRef.current = 'partial'
          if(matches.length === 0){
            setItems([])
            setPage(0)
            setHasMore(false)
            return
          }
          const take = matches.slice(0, limit)
          const detailed = await Promise.all(take.map(n => getPokemonByNameOrId(n, { signal: c.signal })))
          setItems(detailed)
          setPage(0)
          setHasMore(limit < matches.length)
          return
        }
      }else{
        const offset = 0
        const { data, count } = await getPokemonList({ signal: c.signal, limit, offset })
        setItems(data)
        setPage(0)
        setHasMore(data.length < count)
        matchListRef.current = []
        searchModeRef.current = 'none'
      }
    }catch(err){
      if(err.name !== 'AbortError') setError(err)
      setItems([])
      setHasMore(false)
    }finally{
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if(loading || !hasMore) return
    // When in partial search mode, paginate over matched names
    if(query && searchModeRef.current === 'partial'){
      const c = start()
      try{
        const matches = matchListRef.current || []
        const nextPage = page + 1
        const offset = nextPage * limit
        const take = matches.slice(offset, offset + limit)
        if(take.length === 0){ setHasMore(false); return }
        const detailed = await Promise.all(take.map(n => getPokemonByNameOrId(n, { signal: c.signal })))
        setItems(prev => [...prev, ...detailed])
        setPage(nextPage)
        setHasMore((offset + take.length) < matches.length)
      }catch(err){ if(err.name !== 'AbortError') setError(err) }
      finally{ setLoading(false) }
      return
    }
  // Paginación normal del catálogo cuando no hay búsqueda
    if(query) return
    const nextPage = page + 1
    const c = start()
    try{
      const offset = nextPage * limit
      const { data, count } = await getPokemonList({ signal: c.signal, limit, offset })
      setItems(prev => [...prev, ...data])
      setPage(nextPage)
      setHasMore((nextPage + 1) * limit < count)
    }catch(err){
      if(err.name !== 'AbortError') setError(err)
    }finally{
      setLoading(false)
    }
  }

  // Inicial
  useEffect(()=>{ loadFirstPage('') }, [])

  // Debounce de la búsqueda; también reinicia estado de página y modo
  useEffect(()=>{
    const id = setTimeout(()=>{ loadFirstPage(query) }, 300)
    return () => clearTimeout(id)
  }, [query, limit])

  const refresh = () => loadFirstPage(query)

  return { items, loading, error, hasMore, loadMore, refresh, query, setQuery, limit, setLimit }
}

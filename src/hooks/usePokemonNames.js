import { useEffect, useRef, useState } from 'react'
import { getAllPokemonNames } from '../services/pokeApi'

export function usePokemonNames(){
  const [names, setNames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    // Cargar una vez la lista de nombres
    if(loadedRef.current) return
    loadedRef.current = true
    const c = new AbortController()
    setLoading(true); setError(null)
    getAllPokemonNames({ signal: c.signal })
      .then(list => setNames(list))
      .catch(err => { if(err.name !== 'AbortError') setError(err) })
      .finally(() => setLoading(false))
    return () => c.abort()
  }, [])

  return { names, loading, error }
}

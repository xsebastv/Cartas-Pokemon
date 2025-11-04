import React, { useMemo, useState, useEffect } from 'react'
import { usePokemon } from './hooks/usePokemon'
import { usePokemonNames } from './hooks/usePokemonNames'
import Loader from './components/Loader'
import Card from './components/Card'
import Viewer3D from './components/Viewer3D'
import DetailModal from './components/DetailModal'
import Header from './components/Header'
import { loadState, saveState } from './utils/storage'

export default function App(){
  const { items, loading, error, refresh, query, setQuery, hasMore, loadMore } = usePokemon({ initialLimit: 24 })
  const { names } = usePokemonNames()
  const [selected, setSelected] = useState(null) // { item, mode: 'view'|'catch' } Selección actual para el visor 3D
  const [detail, setDetail] = useState(null)
  const [invokedIds, setInvokedIds] = useState(new Set())
  const [capturedIds, setCapturedIds] = useState(new Set())
  const [searchText, setSearchText] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'invoked' | 'captured' Filtro activo en la galería
  const [hydrated, setHydrated] = useState(false)

  // Cargar estado persistido al iniciar
  useEffect(()=>{
    const { capturedIds: c, invokedIds: i } = loadState()
    setCapturedIds(c)
    setInvokedIds(i)
    setHydrated(true)
  }, [])

  // Persistir cambios al modificar colecciones
  useEffect(()=>{
    if(!hydrated) return
    saveState({ capturedIds, invokedIds })
  }, [capturedIds, invokedIds, hydrated])

  const handleInvoke = (item) => {
    setSelected({ item, mode: 'view' })
    setInvokedIds(prev => {
      const next = new Set(prev); next.add(item.id);
      // Persistir inmediatamente usando el último estado
      try{ saveState({ capturedIds, invokedIds: next }) }catch{}
      return next
    })
  }

  const handleUninvoke = (item) => {
    setInvokedIds(prev => {
      const next = new Set(prev); next.delete(item.id)
      try{ saveState({ capturedIds, invokedIds: next }) }catch{}
      return next
    })
  }

  const handleUncapture = (item) => {
    setCapturedIds(prev => {
      const next = new Set(prev); next.delete(item.id)
      // Mantener invocado tal cual; desatrarpar no borra "invocado" salvo que el usuario lo pida
      try{ saveState({ capturedIds: next, invokedIds }) }catch{}
      return next
    })
  }

  // Sugerencias para coincidencia parcial (contiene)
  const suggestions = useMemo(() => {
    const t = searchText.trim().toLowerCase()
    if(t.length < 2) return []
    return names.filter(n => n.includes(t)).slice(0,8)
  }, [names, searchText])

  const shownItems = useMemo(() => {
    if(filter === 'captured') return items.filter(p => capturedIds.has(p.id))
    if(filter === 'invoked') return items.filter(p => invokedIds.has(p.id))
    return items
  }, [items, filter, capturedIds, invokedIds])

  const counts = useMemo(() => {
    const inLoaded = (ids) => items.reduce((acc, p)=> acc + (ids.has(p.id) ? 1 : 0), 0)
    return {
      total: items.length,
      invokedInView: inLoaded(invokedIds),
      capturedInView: inLoaded(capturedIds),
      invokedSaved: invokedIds.size,
      capturedSaved: capturedIds.size,
    }
  }, [items, invokedIds, capturedIds])

  const commitSearch = (text) => {
    const v = (text || '').trim().toLowerCase()
    // Permitir limpiar para reiniciar el catálogo
    setQuery(v)
  }

  // Sincronizar automáticamente el texto de búsqueda con la consulta (con debounce)
  useEffect(()=>{
    const id = setTimeout(()=>{
      const v = (searchText || '').trim().toLowerCase()
      // Sólo propagar si es diferente de la consulta actual para evitar bucles
      if(v !== (query||'')) setQuery(v)
    }, 400)
    return () => clearTimeout(id)
  }, [searchText])

  const statusOf = (item) => capturedIds.has(item.id) ? 'Capturado' : (invokedIds.has(item.id) ? 'Invocado' : 'Disponible')

  // Atajo para atrapar desde la tarjeta
  React.useEffect(()=>{
    const onCatch = (e) => {
      const item = e.detail
      if(item){ setSelected({ item, mode: 'catch' }) }
    }
    window.addEventListener('catch-from-card', onCatch)
    return () => window.removeEventListener('catch-from-card', onCatch)
  }, [])

  return (
    <div>
      <Header
        counts={counts}
        filter={filter}
        setFilter={setFilter}
        searchText={searchText}
        setSearchText={setSearchText}
        suggestions={suggestions}
        commitSearch={commitSearch}
        showing={shownItems.length}
      />

      <div className="container">
        <p className="subtitle" style={{marginTop:12}}>Busca tu Pokémon y ¡invócalo! Visualiza un modelo 3D temático e interactivo.</p>

        {error && (
          <div role="alert" style={{margin:"12px 0", color:"#f86"}}>
            Ocurrió un error al cargar personajes. <button className="btn" onClick={refresh}>Reintentar</button>
          </div>
        )}

        <div className="shelf" aria-live="polite">
          {shownItems.map(p => (
            <Card
              key={p.id}
              character={p}
              status={statusOf(p)}
              onInvoke={()=>handleInvoke(p)}
              onUninvoke={()=>handleUninvoke(p)}
              onUncapture={()=>handleUncapture(p)}
              onOpenDetail={()=>setDetail(p)}
            />
          ))}
        </div>
        {loading && <Loader label="Cargando personajes"/>}
        {!loading && hasMore && (
          <div style={{display:'grid', placeItems:'center', margin:'16px 0'}}>
            <button className="btn" onClick={loadMore} aria-label="Cargar más">Cargar más</button>
          </div>
        )}
      </div>

      {/* Superposición del visor 3D */}
      {selected && (
        <Viewer3D
          character={selected.item}
          mode={selected.mode}
          onClose={() => setSelected(null)}
          onCapture={(ok) => {
            if(ok){
              setCapturedIds(prev => {
                const next = new Set(prev); next.add(selected.item.id)
                // Persistir inmediatamente; asegurar que también quede invocado
                const inv = new Set(invokedIds); inv.add(selected.item.id)
                try{ saveState({ capturedIds: next, invokedIds: inv }) }catch{}
                setInvokedIds(inv)
                return next
              })
              setSelected(null)
            }
          }}
        />
      )}

      {detail && (
        <DetailModal pokemon={detail} onClose={()=>setDetail(null)} />
      )}
    </div>
  )
}

import React, { useEffect, useRef, useState } from 'react'
import PokeballMark from './PokeballMark'

export default function Header({
  counts,
  filter,
  setFilter,
  searchText,
  setSearchText,
  suggestions = [],
  commitSearch,
  showing
}){
  const [compact, setCompact] = useState(false)
  const compactRef = useRef(false)

  useEffect(()=>{
    // Histeresis para evitar parpadeos al subir/bajar cerca del umbral.
    // Compactar al pasar COMPACT_AT, expandir sólo si sube por encima de EXPAND_AT.
    const COMPACT_AT = 180
    const EXPAND_AT = 80
    let ticking = false
    const onScroll = () => {
      if(ticking) return
      ticking = true
      requestAnimationFrame(()=>{
        const y = window.scrollY || window.pageYOffset || 0
        const isCompact = compactRef.current
        if(!isCompact && y >= COMPACT_AT){
          compactRef.current = true
          setCompact(true)
        }else if(isCompact && y <= EXPAND_AT){
          compactRef.current = false
          setCompact(false)
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    // Ejecutar una vez para el estado inicial
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header ${compact ? 'is-compact' : ''}`} role="banner">
      <div className="nav container">
        <div className="brand">
          <span className="logo"><PokeballMark size={30} /></span>
          <span className="wordmark">Cartas Pokémon 3D</span>
        </div>
        <div className="nav-right">
          <span className="badge">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M8 0L3 8h4l-1 8 7-12H9z"/></svg>
            Invocados: {counts.invokedSaved}
          </span>
          <span className="badge">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M1 8h14" stroke="currentColor" strokeWidth="2"/>
              <circle cx="8" cy="8" r="3"/>
            </svg>
            Capturados: {counts.capturedSaved}
          </span>
        </div>
      </div>

      <div className="hero container">
        <p className="tagline">Busca, invoca y atrapa — modelos 3D temáticos.</p>
        <div className="searchbar" role="search">
          <div className="search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              aria-label="Buscar"
              placeholder="Buscar por nombre o ID (ej: pikachu)"
              value={searchText}
              onChange={e=>setSearchText(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'){ commitSearch(searchText) } }}
            />
            {searchText?.length > 0 && (
              <button
                type="button"
                className="icon-btn clear-btn"
                aria-label="Limpiar búsqueda"
                onClick={()=>{ setSearchText(''); commitSearch('') }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
            <button
              type="button"
              className="btn sm go-btn"
              disabled={!searchText?.trim()}
              onClick={()=>commitSearch(searchText)}
            >Buscar</button>
          </div>
          {suggestions.length > 0 && (
            <div className="suggestions" role="listbox">
              {suggestions.map(s => (
                <div role="option" key={s} className="suggestion" onClick={()=>{ setSearchText(s); commitSearch(s) }}>{s}</div>
              ))}
            </div>
          )}
        </div>
        <div className="segmented" role="tablist" aria-label="Filtros">
          <button className={`seg ${filter==='all'?'active':''}`} aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>Todos ({counts.total})</button>
          <button className={`seg ${filter==='invoked'?'active':''}`} aria-pressed={filter==='invoked'} onClick={()=>setFilter('invoked')}>Invocados ({counts.invokedInView})</button>
          <button className={`seg ${filter==='captured'?'active':''}`} aria-pressed={filter==='captured'} onClick={()=>setFilter('captured')}>Capturados ({counts.capturedInView})</button>
        </div>
        <div className="meta">
          <span className="meta-item">Mostrando: {showing}</span>
        </div>
      </div>

      <div className="header-watermark" aria-hidden />
    </header>
  )
}

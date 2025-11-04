import React from 'react'
import './Card.css'
import { primaryTypeHex } from '../utils/pokemonColors'

function initials(name='?'){
  return name.split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()).join('') || '?'
}

function colorFromName(name=''){
  let h=0; for(const ch of name) h = (h*31 + ch.charCodeAt(0)) % 360
  return `hsl(${h} 60% 55%)`
}

function truncate(text='', n=140){
  const t = String(text)
  if(t.length <= n) return t
  return t.slice(0, n-1).trimEnd()+"…"
}

export default function Card({ character, status, onInvoke, onUninvoke, onUncapture, onOpenDetail }){
  // Soporta tanto forma de personaje genérico como Pokémon (degradado elegante)
  const name = character?.name || '—'
  const types = character?.types || []
  const race = character?.race
  const gender = character?.gender
  const description = character?.description
  const appearances = character?.appearances
  const sprite = character?.sprite

  const bg = colorFromName(name)
  const init = initials(name)
  const appearCount = Array.isArray(appearances) ? appearances.length : undefined

  return (
    <article className="card" aria-label={`Carta ${name}`} style={{
      '--average-color': primaryTypeHex(types, name)
    }} onClick={onOpenDetail} tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); onOpenDetail?.() } }}>
      <div className="flip-inner">
  {/* Anverso */}
        <div className="flip-front">
          <div className="card-media" style={{
            background: `radial-gradient(300px 200px at 70% 30%, rgba(255,255,255,.15), transparent 60%), ${bg}`
          }} aria-label={`Imagen de ${name}`}>
            {sprite ? (
              <img className="card-img" src={sprite} alt={`Imagen de ${name}`} loading="lazy" />
            ) : (
              <div className="card-initials" aria-hidden>{init}</div>
            )}
          </div>
          <div className="card-body">
            <header className="card-head">
              <h3 className="card-title" onClick={onOpenDetail} style={{cursor:'pointer', textDecoration:'underline dotted 1px rgba(255,255,255,.3)'}} title="Ver detalles">{name}</h3>
              {(() => {
                const cls = status === 'Disponible' ? 'ok' : (status === 'Capturado' ? 'warn' : '')
                const dot = status === 'Disponible' ? 'var(--ok)' : (status === 'Capturado' ? 'var(--danger)' : 'var(--brand-blue)')
                return (
                  <span className={`badge ${cls}`} aria-label={`Estado: ${status}`}>
                    <span style={{width:8,height:8,borderRadius:999,display:'inline-block',background: dot}} />
                    {status}
                  </span>
                )
              })()}
            </header>
            <div className="card-meta" aria-label="Tipos">
              <span>{types?.length ? types.join(', ') : '—'}</span>
            </div>
            {description && (
              <p className="card-desc">{truncate(description, 140)}</p>
            )}
            <div className="card-foot">
              <span className="chip-id" aria-label={`ID ${character?.id}`} title={`ID ${character?.id}`}>#{character?.id}</span>
              <div className="card-actions" style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                {status === 'Capturado' ? (
                  <button className="btn" onClick={(e)=>{ e.stopPropagation?.(); onUncapture?.(character) }} aria-label={`Desatrapar a ${name}`}>Desatrapar</button>
                ) : status === 'Invocado' ? (
                  <>
                    <button className="btn" onClick={(e)=>{ e.stopPropagation?.(); onUninvoke?.(character) }} aria-label={`Desinvocar a ${name}`}>Desinvocar</button>
                    <button className="btn" onClick={(e)=>{ e.stopPropagation?.(); const ev = new CustomEvent('catch-from-card', { detail: character }); window.dispatchEvent(ev); }} aria-label={`Atrapar a ${name}`}>Atrapar</button>
                  </>
                ) : (
                  <>
                    <button className="btn" onClick={(e)=>{ e.stopPropagation?.(); onInvoke?.() }} aria-label={`Invocar a ${name}`}>Invocar</button>
                    <button className="btn" onClick={(e)=>{ e.stopPropagation?.(); const ev = new CustomEvent('catch-from-card', { detail: character }); window.dispatchEvent(ev); }} aria-label={`Atrapar a ${name}`}>Atrapar</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

    {/* Reverso */}
    <div className="flip-back" aria-label={`Reverso de ${name}`} onClick={onOpenDetail} title="Click para ver detalles">
          <div className="card-media" style={{
            background: `radial-gradient(240px 180px at 70% 30%, rgba(255,255,255,.12), transparent 60%), #33363B`
          }}>
            {sprite ? (
              <img className="card-img" src={sprite} alt="" aria-hidden="true" style={{opacity:.25, filter:'grayscale(100%)'}}/>
            ) : null}
          </div>
          <div className="card-body">
            <header className="card-head">
              <h3 className="card-title">{name}</h3>
              <span className="chip">#{character?.id}</span>
            </header>
            <div className="card-meta"><span>{types?.length ? types.join(', ') : '—'}</span></div>
            {description && <p className="card-desc">{truncate(description, 120)}</p>}
            <div className="card-foot" style={{justifyContent:'space-between'}}>
              <span className="chip-id" aria-label={`ID ${character?.id}`} title={`ID ${character?.id}`}>#{character?.id}</span>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                {status === 'Capturado' ? (
                  <button className="btn" onClick={(e)=>{ e.stopPropagation?.(); onUncapture?.(character) }} aria-label={`Desatrapar a ${name}`}>Desatrapar</button>
                ) : status === 'Invocado' ? (
                  <>
                    <button className="btn" onClick={(e)=>{ e.stopPropagation?.(); onUninvoke?.(character) }} aria-label={`Desinvocar a ${name}`}>Desinvocar</button>
                    <button className="btn" onClick={(e)=>{ e.stopPropagation?.(); const ev = new CustomEvent('catch-from-card', { detail: character }); window.dispatchEvent(ev); }} aria-label={`Atrapar a ${name}`}>Atrapar</button>
                  </>
                ) : (
                  <>
                    <button className="btn" onClick={(e)=>{ e.stopPropagation?.(); onInvoke?.() }} aria-label={`Invocar a ${name}`}>Invocar</button>
                    <button className="btn" onClick={(e)=>{ e.stopPropagation?.(); const ev = new CustomEvent('catch-from-card', { detail: character }); window.dispatchEvent(ev); }} aria-label={`Atrapar a ${name}`}>Atrapar</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

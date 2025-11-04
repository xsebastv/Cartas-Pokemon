import React, { useEffect } from 'react'
import { primaryTypeHex, TYPE_COLORS } from '../utils/pokemonColors'

export default function DetailModal({ pokemon, onClose }){
  if(!pokemon) return null
  const { name, id, types = [], description, abilities = [], stats = [], sprite, sprites, height, weight } = pokemon
  const color = primaryTypeHex(types, name)

  useEffect(() => {
    const onKey = (e) => { if(e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={`Detalles de ${name}`} onClick={(e)=>{ if(e.target.classList.contains('modal-overlay')) onClose?.() }}>
  <div className="modal card-vertical" role="document">
        <header className="modal-head">
          <div>
            <div style={{fontSize:12, color:'var(--brand-muted)'}}>Pokémon #{id}</div>
            <div style={{fontWeight:900, fontSize:20, textTransform:'capitalize'}}>{name}</div>
          </div>
          <button className="btn" onClick={onClose} aria-label="Cerrar">Cerrar</button>
        </header>
        <div className="modal-body card-body-vertical">
          <div className="hero-vertical">
            <div className="sprite" style={{background: `radial-gradient(520px 300px at 70% 30%, rgba(255,255,255,.15), transparent 60%), ${color}`}}>
              {sprite ? <img src={sprite} alt={name} /> : <div style={{opacity:.6}}>Sin imagen</div>}
            </div>
          </div>
          <div className="main">
            <div className="types">
              {types.map(t => (
                <span key={t} className="chip" style={{background:(TYPE_COLORS[t]?.hex||'#888')+'22', borderColor:(TYPE_COLORS[t]?.hex||'#888')}}>{t}</span>
              ))}
            </div>
            {description && <p className="desc">{description}</p>}
          </div>
          <div className="side">
            <section>
              <h4>Habilidades</h4>
              <div className="chips">
                {abilities.length ? abilities.map(a => <span key={a} className="chip" style={{background:'rgba(255,255,255,.06)'}}>{a}</span>) : <span style={{opacity:.7}}>—</span>}
              </div>
            </section>
            <section>
              <h4>Información</h4>
              <div className="info-grid">
                <div><span className="label">Altura</span><span className="val">{height ? (height/10).toFixed(1)+' m' : '—'}</span></div>
                <div><span className="label">Peso</span><span className="val">{weight ? (weight/10).toFixed(1)+' kg' : '—'}</span></div>
                <div><span className="label">Tipos</span><span className="val">{types.join(', ')||'—'}</span></div>
                <div><span className="label">ID</span><span className="val">{id}</span></div>
              </div>
            </section>
            <section>
              <h4>Estadísticas</h4>
              <div className="stats">
                {stats.map(s => (
                  <div key={s.name} className="stat">
                    <div className="label">{s.name}</div>
                    <div className="bar">
                      <div className="fill" style={{width: `${Math.min(100, Math.round((s.base/150)*100))}%`, background: `linear-gradient(90deg, ${color} 0%, rgba(255,255,255,.6) 100%)`}}/>
                    </div>
                    <div className="val">{s.base}</div>
                  </div>
                ))}
              </div>
            </section>
            {sprites && (
              <section>
                <h4>Sprites</h4>
                <div className="sprites">
                  {['front_default','back_default','front_shiny','back_shiny'].map(k=> sprites?.[k] ? (
                    <img key={k} src={sprites[k]} alt={k} />
                  ) : null)}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .modal-overlay{ position:fixed; inset:0; background: rgba(2,6,12,.7); display:grid; place-items:center; z-index:60; }
        .modal{ background: var(--brand-surface); border:1px solid rgba(255,255,255,.08); border-radius:16px; overflow:hidden; }
        .card-vertical{ width:min(640px, 94vw); max-height: 88vh; display:grid; grid-template-rows:auto 1fr }
        .modal-head{ display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background: var(--brand-surface-2); border-bottom:1px solid rgba(255,255,255,.06); position:sticky; top:0; z-index:1 }
        .modal-body.card-body-vertical{ display:grid; grid-template-columns: 1fr; gap:14px; padding:16px; overflow:auto }
        .hero-vertical{ }
        .sprite{ display:grid; place-items:center; height: clamp(280px, 52vh, 520px); border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,.06) }
        .sprite img{ width:100%; height:100%; object-fit:contain }
  .main{}
  .side{}
        .types{ display:flex; gap:8px; margin-top:6px; flex-wrap:wrap }
        .chips{ display:flex; flex-wrap:wrap; gap:8px }
        .desc{ margin-top:10px; color: var(--brand-muted) }
        h4{ margin: 14px 0 8px 0 }
        .stats{ display:grid; gap:8px }
        .stat{ display:grid; grid-template-columns: 84px 1fr 40px; align-items:center; gap:10px }
        .bar{ height:12px; background: rgba(255,255,255,.06); border-radius:999px; overflow:hidden }
        .fill{ height:100%; border-radius:999px }
        .info-grid{ display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
        .info-grid .label{ display:block; font-size:12px; color:var(--brand-muted) }
        .info-grid .val{ font-weight:600 }
        .sprites{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; padding:8px 0 }
        .sprites img{ width:64px; height:64px; image-rendering:pixelated; border-radius:8px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.06); padding:6px }
        @media (max-width: 820px){
          .sprite{ height: 300px }
        }
      `}</style>
    </div>
  )
}

const BASE = 'https://pokeapi.co/api/v2'

function pickSprite(s){
  // Orden preferido: official-artwork PNG > dream_world SVG > front_default
  return (
    s?.other?.['official-artwork']?.front_default ||
    s?.other?.dream_world?.front_default ||
    s?.front_default ||
    ''
  )
}

function normalizePokemon(p){
  return {
    id: p.id,
    name: p.name,
    types: (p.types||[]).map(t=>t.type?.name),
    height: p.height,
    weight: p.weight,
    abilities: (p.abilities||[]).map(a=>a.ability?.name),
    stats: (p.stats||[]).map(s=>({ name:s.stat?.name, base:s.base_stat })),
    sprite: pickSprite(p.sprites),
    sprites: p.sprites,
  }
}

export async function getPokemonList({ limit = 24, offset = 0, signal }={}){
  const url = new URL(`${BASE}/pokemon`)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('offset', String(offset))
  const res = await fetch(url, { signal })
  if(!res.ok) throw new Error('HTTP '+res.status)
  const json = await res.json()
  const results = json?.results || []
  // Obtener detalles de cada uno para conocer sprites/tipos
  const detailed = await Promise.all(results.map(async r => {
    const d = await getPokemonByNameOrId(r.name, { signal })
    return d
  }))
  return { count: json?.count ?? detailed.length, data: detailed }
}

export async function getPokemonByNameOrId(nameOrId, { signal } = {}){
  const url = `${BASE}/pokemon/${encodeURIComponent(nameOrId)}`
  const res = await fetch(url, { signal })
  if(!res.ok) throw new Error('HTTP '+res.status)
  const p = await res.json()
  const basic = normalizePokemon(p)
  // Especie para texto descriptivo (flavor text)
  try{
    const sres = await fetch(`${BASE}/pokemon-species/${p.id}`, { signal })
    if(sres.ok){
      const sp = await sres.json()
      const flavor = (sp.flavor_text_entries||[]).find(f=>f.language?.name==='es') || (sp.flavor_text_entries||[]).find(f=>f.language?.name==='en')
      basic.description = flavor?.flavor_text?.replace(/\f/g,' ')
    }
  }catch{}
  return basic
}

export async function getAllPokemonNames({ signal } = {}){
  const url = new URL(`${BASE}/pokemon`)
  url.searchParams.set('limit', '2000')
  url.searchParams.set('offset', '0')
  const res = await fetch(url, { signal })
  if(!res.ok) throw new Error('HTTP '+res.status)
  const json = await res.json()
  return (json?.results || []).map(r => r.name)
}

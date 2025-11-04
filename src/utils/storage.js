// Utilidades sencillas de persistencia (capturados/invocados) usando localStorage
const KEY = 'pokemonState.v1'

function safeParse(json, fallback){
  try{ return JSON.parse(json) ?? fallback }catch{ return fallback }
}

export function loadState(){
  if(typeof window === 'undefined') return { capturedIds: new Set(), invokedIds: new Set() }
  const raw = window.localStorage.getItem(KEY)
  const data = safeParse(raw, { capturedIds: [], invokedIds: [] })
  return {
    capturedIds: new Set(Array.isArray(data.capturedIds) ? data.capturedIds : []),
    invokedIds: new Set(Array.isArray(data.invokedIds) ? data.invokedIds : []),
  }
}

export function saveState({ capturedIds, invokedIds }){
  if(typeof window === 'undefined') return
  const payload = {
    capturedIds: Array.from(capturedIds || []),
    invokedIds: Array.from(invokedIds || []),
  }
  try{ window.localStorage.setItem(KEY, JSON.stringify(payload)) }catch{}
}

export function markInvoked(id){
  const { capturedIds, invokedIds } = loadState()
  invokedIds.add(id)
  saveState({ capturedIds, invokedIds })
}

export function markCaptured(id){
  const { capturedIds, invokedIds } = loadState()
  capturedIds.add(id)
  // Si está capturado, considerarlo también invocado implícitamente
  invokedIds.add(id)
  saveState({ capturedIds, invokedIds })
}

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import Loader from './Loader'
import { gsap } from 'gsap'
import { primaryTypeThreeColor, TYPE_COLORS } from '../utils/pokemonColors'

// Simple sword-like sound using Web Audio API
async function playInvokeSound(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(440, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12)
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25)
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.26)
  }catch{}
}

function colorFromPokemon(p){
  return primaryTypeThreeColor(p?.types, p?.name)
}

// Viewer3D: Visualizador con Three.js.
// - Modo 'view': muestra al Pokémon (impostor de planos cruzados) para parecer 3D al orbitar.
// - Modo 'catch': agrega anillo tipo GO y activa la animación de captura.
export default function Viewer3D({ character, mode = 'catch', onClose, onCapture }){
  const mountRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [banner, setBanner] = useState('')
  const animRef = useRef({})

  useEffect(()=>{
  let renderer, scene, camera, controls, frame, ro, pmremGen, envTex
    const mount = mountRef.current
    const size = () => ({ w: mount.clientWidth, h: mount.clientHeight })

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(size().w, size().h)
    mount.appendChild(renderer.domElement)

  // Scene & Camera
    scene = new THREE.Scene()
    scene.background = null
  // Subtle environment reflections for glossy plastic feel
  pmremGen = new THREE.PMREMGenerator(renderer)
  pmremGen.compileEquirectangularShader()
  envTex = pmremGen.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envTex
    camera = new THREE.PerspectiveCamera(50, size().w / size().h, 0.1, 100)
    camera.position.set(
      mode === 'view' ? 0.0 : 0.0,
      mode === 'view' ? 1.1 : 1.6,
      mode === 'view' ? 1.7 : 3.2
    )
    const ambient = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambient)
    const dir = new THREE.DirectionalLight(0xffffff, 1.0)
    dir.position.set(2,3,2)
    scene.add(dir)

  // Clean background: no grid/axes for a tidier look

  // Procedural Pokéball (sphere halves + ring) - only in catch mode
    let centerMat
    if(mode === 'catch'){
      // Canonical Poké Ball palette
      const sphereGeo = new THREE.SphereGeometry(0.8, 48, 48)
      const redMat   = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#E3350D'), metalness:0.15, roughness:0.22, clearcoat:1, clearcoatRoughness:0.08 })
      const whiteMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#FFFFFF'), metalness:0.02, roughness:0.26, clearcoat:0.9, clearcoatRoughness:0.1 })
      const blackMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#2B2B2B'), metalness:0.35, roughness:0.35, clearcoat:0.5 })

  const upper = new THREE.Mesh(sphereGeo, redMat)
  const lower = new THREE.Mesh(sphereGeo, whiteMat)
  // Tiny seam gap for definition
  upper.position.y = 0.002
  lower.position.y = -0.002
      // Clip halves
      upper.material.clippingPlanes = [ new THREE.Plane(new THREE.Vector3(0,-1,0), 0) ]
      lower.material.clippingPlanes = [ new THREE.Plane(new THREE.Vector3(0,1,0), 0) ]
      upper.material.clipShadows = lower.material.clipShadows = true
      renderer.localClippingEnabled = true

  // Equator band (black) and center button (with rim and white core)
  const ring = new THREE.TorusGeometry(0.8, 0.055, 24, 140)
  const ringMesh = new THREE.Mesh(ring, blackMat)
      ringMesh.rotation.x = Math.PI/2
  // Subtle seam groove slightly inset for realism
  const grooveGeo = new THREE.TorusGeometry(0.795, 0.008, 32, 180)
  const grooveMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#111111'), metalness:0.2, roughness:0.5 })
  const groove = new THREE.Mesh(grooveGeo, grooveMat)
  groove.rotation.x = Math.PI/2
  // Center button with black rim, metallic bezel, and white core, placed on the front of the ball
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.06, 48), blackMat)
  rim.rotation.x = Math.PI/2
  rim.position.z = 0.78
  const bezelMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#9DA3AD'), metalness:0.6, roughness:0.35, clearcoat:0.4 })
  const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,0.02, 48), bezelMat)
  bezel.rotation.x = Math.PI/2
  bezel.position.z = 0.81
  centerMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#FFFFFF'), emissive: new THREE.Color('#FFFFFF').multiplyScalar(0.12), emissiveIntensity: 1, metalness:0.0, roughness:0.18, clearcoat:1, clearcoatRoughness:0.06 })
  const center = new THREE.Mesh(new THREE.CylinderGeometry(0.115,0.115,0.08, 48), centerMat)
  center.rotation.x = Math.PI/2
  center.position.z = 0.82

  const ball = new THREE.Group()
  ball.add(upper, lower, ringMesh, groove, rim, bezel, center)
  // Minimal rear hinge: attach small brackets to each half so they separate when opening
  const hingeMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#2B2B2B'), metalness:0.3, roughness:0.35, clearcoat:0.3 })
  const hingeTop = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.06), hingeMat)
  hingeTop.position.set(0, 0.0, -0.78)
  upper.add(hingeTop)
  const hingeBot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.06), hingeMat)
  hingeBot.position.set(0, 0.0, -0.78)
  lower.add(hingeBot)
  // Posición inicial detrás del Pokémon respecto a la cámara (z negativa)
  ball.position.set(-0.8, 0.6, -1.8)
  scene.add(ball)
      // store refs
      animRef.current.ball = ball
      animRef.current.upper = upper
      animRef.current.lower = lower
      animRef.current.center = center
      animRef.current.centerMat = centerMat

      // Preload flare texture (radial gradient) and create a throw glow sprite attached to the button
      const flareTex = new THREE.TextureLoader().load('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="white" stop-opacity="1"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient><circle cx="128" cy="128" r="128" fill="url(%23g)"/></svg>')
      const glowMat = new THREE.SpriteMaterial({ map: flareTex, color: 0xfff1aa, transparent:true, opacity:0.0, depthWrite:false, blending: THREE.AdditiveBlending })
      const throwGlow = new THREE.Sprite(glowMat)
      throwGlow.scale.set(0.2, 0.2, 0.2)
      throwGlow.position.set(0, 0, 0.86)
      center.add(throwGlow)
      animRef.current.throwGlow = throwGlow
      animRef.current.flareTex = flareTex

      // Glossy highlight sprite on top hemisphere for a nicer plastic shine
  const highlightMat = new THREE.SpriteMaterial({ map: flareTex, color: 0xffffff, transparent:true, opacity:0.16, depthWrite:false, blending: THREE.AdditiveBlending })
      const highlight = new THREE.Sprite(highlightMat)
      highlight.scale.set(0.9, 0.9, 0.9)
      highlight.position.set(0.35, 0.45, 0.35)
      upper.add(highlight)
      animRef.current.highlight = highlight
    }

  // Pokemon mesh: prefer a thin 3D slab with front/back textures; fallback to billboard
  let billboard
  // Prefer high-quality official artwork for the front; fall back to game sprite
  const frontUrl = character?.sprite || character?.sprites?.front_default
  const texLoader = new THREE.TextureLoader()
  const loadTex = (url) => new Promise(resolve => {
    if(!url) return resolve(null)
    texLoader.load(url, (t)=>{ t.colorSpace = THREE.SRGBColorSpace; resolve(t) }, undefined, ()=> resolve(null))
  })
  ;(async ()=>{
    const [front] = await Promise.all([loadTex(frontUrl)])
    if(front){
      // Billboard simple: una sola imagen que siempre mira a la cámara (evita "efecto raro").
      const ratio = (front.image?.width || 1) / (front.image?.height || 1)
      const width = 1.4 * ratio
      const height = 1.4
      const mat = new THREE.MeshBasicMaterial({ map: front, transparent: true, depthWrite: false, side: THREE.DoubleSide })
      const geo = new THREE.PlaneGeometry(width, height)
      const billboard = new THREE.Mesh(geo, mat)
      billboard.position.set(0, 1.0, 0)
      scene.add(billboard)
      animRef.current.billboard = billboard
      // Soft shadow on ground
      const shadowTex = new THREE.TextureLoader().load('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="black" stop-opacity="0.35"/><stop offset="100%" stop-color="black" stop-opacity="0"/></radialGradient><rect width="100%" height="100%" fill="url(%23g)"/></svg>')
      const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent:true, depthWrite:false })
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.2), shadowMat)
      shadow.rotation.x = -Math.PI/2
      shadow.position.set(0,0.01,0)
      scene.add(shadow)
      animRef.current.shadow = shadow
      if(animRef.current?.controls){
        animRef.current.controls.target.set(0,1.0,0)
        animRef.current.controls.update()
      }
    }
  })()

  // Controls
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.enablePan = false
  controls.minDistance = mode === 'view' ? 1.1 : 1.6
  controls.maxDistance = mode === 'view' ? 3.5 : 7
    // Default target roughly at sprite height to keep it centered
    controls.target.set(0, 1.0, 0)
    controls.update()

    // expose to animation handler
    animRef.current.scene = scene
    animRef.current.controls = controls

    // Pokémon GO-like catch ring (visual aid)
    if(mode === 'catch'){
      const ringGeo = new THREE.RingGeometry(0.55, 0.65, 48)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent:true, opacity:0.6, side: THREE.DoubleSide })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = -Math.PI/2
      ring.position.set(0, 0.98, 0)
      scene.add(ring)
      animRef.current.ring = ring
      gsap.to(ring.scale, { x:1.2, y:1.2, z:1.2, duration:1.0, repeat:-1, yoyo:true, ease:'sine.inOut' })
    }

    const animate = () => {
      frame = requestAnimationFrame(animate)
      if(mode === 'catch'){
        animRef.current.upper && (animRef.current.upper.rotation.y += 0.004)
        animRef.current.lower && (animRef.current.lower.rotation.y += 0.004)
        animRef.current.center && (animRef.current.center.rotation.z += 0.004)
      }
  // Mantener el billboard mirando a cámara
  if(animRef.current.billboard){ animRef.current.billboard.lookAt(camera.position) }
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const { w, h } = size()
      camera.aspect = w/h; camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(onResize)
      ro.observe(mount)
    } else {
      window.addEventListener('resize', onResize)
    }

    setTimeout(()=>setReady(true), 250)
    playInvokeSound()

    // Cleanup
    return () => {
      try { cancelAnimationFrame(frame) } catch{}
      if (ro) {
        try { ro.disconnect() } catch{}
      } else {
        window.removeEventListener('resize', onResize)
      }
  try { controls && controls.dispose() } catch{}
      try { renderer && renderer.dispose() } catch{}
  try { pmremGen && pmremGen.dispose() } catch{}
  try { envTex && envTex.dispose && envTex.dispose() } catch{}
      try { if (mount && renderer?.domElement?.parentNode === mount) mount.removeChild(renderer.domElement) } catch{}
      try { scene && scene.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) { if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose()); else obj.material.dispose() } }) } catch{}
    }
  }, [character, mode])
  // Sounds
  const playThrow = () => {
    try{ const ctx = new (window.AudioContext||window.webkitAudioContext)(); const o=ctx.createOscillator(); const g=ctx.createGain(); o.type='square'; o.frequency.setValueAtTime(220, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(660, ctx.currentTime+0.15); g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime+0.05); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+0.25); o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.26);}catch{}
  }
  const playCapture = () => {
    try{ const ctx = new (window.AudioContext||window.webkitAudioContext)(); const o=ctx.createOscillator(); const g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(523.25, ctx.currentTime); g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime+0.01); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+0.4); o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.45);}catch{}
  }
  const playFail = () => {
    try{ const ctx = new (window.AudioContext||window.webkitAudioContext)(); const o=ctx.createOscillator(); const g=ctx.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(440, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime+0.2); g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime+0.02); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+0.3); o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.32);}catch{}
  }

  // compute probability using type/weight/stats (simple heuristic)
  const computeCatchProbability = (p) => {
    let prob = 0.6
    const types = p?.types || []
    const primary = types[0]
    if(primary){
      if(['dragon','psychic','ghost','steel','dark','fairy'].includes(primary)) prob -= 0.08
      if(['normal','bug','flying'].includes(primary)) prob += 0.05
      if(['rock','ground','ice','poison'].includes(primary)) prob -= 0.03
      if(['grass','water','fire','electric'].includes(primary)) prob += 0.01
    }
    const w = p?.weight || 0 // hectograms
    if(w >= 800) prob -= 0.10
    else if(w >= 400) prob -= 0.05
    else if(w <= 200) prob += 0.05
    const avg = (p?.stats||[]).reduce((a,s)=>a+(s.base||0),0) / Math.max(1,(p?.stats||[]).length)
    if(avg >= 90) prob -= 0.10
    else if(avg >= 70) prob -= 0.05
    else if(avg <= 60) prob += 0.05
    return Math.min(0.95, Math.max(0.1, prob))
  }

  const handleCatch = async () => {
    if(mode !== 'catch') return
    const { scene } = animRef.current || {}
    if(!scene) return
    // Extract references from last effect run by querying children
    // We stored them via closure; re-create small handles
    const mount = mountRef.current
    if(!mount) return
    // Access ball group and billboard: they are attached to the scene in known order; safer: find by type
    const ball = animRef.current.ball || scene.children.find(o => o.type === 'Group')
    const upper = animRef.current.upper
    const lower = animRef.current.lower
    const center = animRef.current.center
    const centerMat = animRef.current.centerMat
  const targetMesh = animRef.current.impostor || animRef.current.billboard
    if(!ball) return

    try{
      // Disable controls while animating
      animRef.current.controls.enabled = false
      playThrow()
      // Brief glow flash on throw
      if(animRef.current.throwGlow){
        const g = animRef.current.throwGlow
        try{ g.material.opacity = 0; g.scale.set(0.2,0.2,0.2) }catch{}
        gsap.to(g.material, { opacity:0.95, duration:0.12, yoyo:true, repeat:1, ease:'sine.inOut' })
        gsap.to(g.scale, { x:0.85, y:0.85, duration:0.24, ease:'power1.out' })
      }
      // Simple trail sprites behind the ball at throw start
      if(animRef.current.flareTex && ball){
        const mkTrail = (z, delay) => {
          const mat = new THREE.SpriteMaterial({ map: animRef.current.flareTex, color: 0xffe28a, transparent:true, opacity:0.6, depthWrite:false, blending: THREE.AdditiveBlending })
          const s = new THREE.Sprite(mat)
          s.scale.set(0.28,0.28,0.28)
          s.position.set(0,0,z)
          ball.add(s)
          gsap.to(s.material, { opacity:0, duration:0.35, delay, ease:'power1.out', onComplete:()=>{ try{ ball.remove(s); s.material.map?.dispose?.(); s.material.dispose?.() }catch{} } })
        }
        mkTrail(0.4, 0)
        mkTrail(0.2, 0.05)
        mkTrail(0.0, 0.1)
      }
  const startPos = ball.position.clone()
  // Apuntar al centro del anillo si existe; si no, al Pokémon
  const aimBase = animRef.current.ring ? animRef.current.ring.position.clone() : (targetMesh ? targetMesh.position.clone() : new THREE.Vector3(0,1.0,0))
  const target = new THREE.Vector3(aimBase.x, 1.0, aimBase.z)
    // Arc-like throw: go to mid-air point, then to target
    const mid = new THREE.Vector3((startPos.x+target.x)/2, Math.max(startPos.y, target.y)+0.8, (startPos.z+target.z)/2)
    await new Promise(res=> gsap.to(ball.position, { duration: 0.35, x: mid.x, y: mid.y, z: mid.z, ease: 'power2.out', onComplete:res }))
    await new Promise(res=> gsap.to(ball.position, { duration: 0.35, x: target.x, y: target.y, z: target.z, ease: 'power2.in', onComplete:res }))

      // open ball
      if(upper && lower){
        await new Promise(res => gsap.to([upper.position, lower.position], { duration:0.25, y:(i)=> i===0? 0.35 : -0.35, ease:'power2.out', onComplete:res }))
      }

      if(targetMesh){
        await new Promise(res=> gsap.to(targetMesh.scale, { duration: 0.35, x:0.01, y:0.01, z:0.01, ease:'expo.in', onComplete:()=>{ targetMesh.visible=false; res() } }))
      }

      // close ball
      if(upper && lower){
        await new Promise(res => gsap.to([upper.position, lower.position], { duration:0.2, y:0, ease:'power2.in', onComplete:res }))
      }

      await new Promise(res=> gsap.to(ball.position, { duration: 0.5, x: startPos.x, y: startPos.y+0.2, z: startPos.z, ease:'power1.out', onComplete:res }))

      // Shakes
      const shakes = 3
      for(let i=0;i<shakes;i++){
        await new Promise(res=> gsap.to(ball.rotation, { duration: 0.2, z: 0.3, yoyo:true, repeat:1, ease:'power1.inOut', onComplete:res }))
      }

      // Precisión: éxito sólo si cae dentro del anillo (plano XZ)
      let insideRing = true
      if(animRef.current.ring){
        const rPos = animRef.current.ring.position
        const dx = ball.position.x - rPos.x
        const dz = ball.position.z - rPos.z
        const dist = Math.hypot(dx, dz)
        // Tolerancia más amable
        insideRing = dist <= 0.85
      }
      const base = computeCatchProbability(character)
      const success = (Math.random() < (insideRing ? base : base * 0.5))
      if(success){
        playCapture()
        // pulse center emissive
        if(animRef.current.centerMat){
          await new Promise(res=> gsap.to(animRef.current.centerMat, { duration:0.25, emissiveIntensity:2, yoyo:true, repeat:1, ease:'power1.inOut', onComplete:res }))
        }
        // Flash the aiming ring
        if(animRef.current.ring && animRef.current.ring.material){
          const rm = animRef.current.ring.material
          gsap.to(rm, { opacity: 1, duration: 0.06, yoyo: true, repeat: 1 })
        }
        // Create a capture flare sprite at the button world position
        try{
          const wp = new THREE.Vector3(); animRef.current.center.getWorldPosition(wp)
          const flareMat = new THREE.SpriteMaterial({ map: animRef.current.flareTex, color: 0xffffff, transparent:true, opacity:1, depthWrite:false, blending: THREE.AdditiveBlending })
          const flare = new THREE.Sprite(flareMat)
          flare.position.copy(wp)
          flare.scale.set(0.01, 0.01, 0.01)
          animRef.current.scene.add(flare)
          gsap.to(flare.scale, { x:2.2, y:2.2, duration:0.35, ease:'power2.out' })
          gsap.to(flare.material, { opacity:0, duration:0.35, ease:'power2.out', onComplete:()=>{ try{ animRef.current.scene.remove(flare); flare.material.map?.dispose?.(); flare.material.dispose?.() }catch{} } })
        }catch{}
        setBanner('¡Capturado!')
        setTimeout(()=> setBanner(''), 1200)
        onCapture?.(true)
      }else{
        playFail()
        // Release: show pokemon again and send ball back slightly
        if(targetMesh){ targetMesh.visible = true; gsap.to(targetMesh.scale, { duration:0.25, x:1, y:1, z:1, ease:'back.out(2)' }) }
        gsap.to(ball.position, { duration:0.4, x: startPos.x, y: startPos.y, z: startPos.z, ease:'power1.out' })
        animRef.current.controls.enabled = true
      }
    }catch{
      animRef.current.controls.enabled = true
    }
  }

  return (
    <div className="viewer-overlay" role="dialog" aria-label={`Visualizador 3D de ${character?.name}`}>
      {!ready && (
        <div className="viewer-loading"><Loader label="Invocando"/></div>
      )}
      <div className="viewer-panel">
        <header className="viewer-head">
          <div>
            <div style={{fontSize:12, color:'var(--brand-muted)'}}>Pokémon</div>
            <div style={{fontWeight:900}}>{character?.name}</div>
          </div>
          <div style={{display:'flex', gap:8}}>
            {mode === 'catch' && <button className="btn" onClick={handleCatch} aria-label="Atrapar">Atrapar</button>}
            <button className="btn" onClick={onClose} aria-label="Cerrar">Cerrar</button>
          </div>
        </header>
        <div ref={mountRef} className="viewer-canvas"/>
        {/* Mini ficha (tarjeta) sobre la escena para cumplir 'ver tarjeta + modelo' */}
        <div className="viewer-cardchip" aria-hidden>
          <div className="chip-inner">
            {character?.sprite ? (
              <img alt="sprite" src={character.sprite} />
            ) : <div className="ph" />}
            <div className="meta">
              <div className="nm">{character?.name}</div>
              <div className="tp">{(character?.types||[]).join(', ')}</div>
            </div>
          </div>
        </div>
      </div>
      {banner && <div className="viewer-banner">{banner}</div>}
      <style>{`
        .viewer-overlay{ position:fixed; inset:0; background: rgba(2,6,12, .7); display:grid; place-items:center; z-index:50; }
        .viewer-panel{ position:relative; width:min(920px, 92vw); height:min(70vh, 680px); background: var(--brand-surface); border:1px solid rgba(255,255,255,.08); border-radius:16px; overflow:hidden; display:grid; grid-template-rows:auto 1fr; }
        .viewer-head{ display:flex; justify-content:space-between; align-items:center; padding:12px 14px; background: var(--brand-surface-2); border-bottom:1px solid rgba(255,255,255,.06); }
        .viewer-canvas{ width:100%; height:100%; }
        .viewer-loading{ position:absolute; inset:0; display:grid; place-items:center; }
        .viewer-banner{ position:fixed; top:20%; left:50%; transform:translateX(-50%); background: rgba(0,0,0,.6); padding:12px 16px; border-radius:10px; border:1px solid rgba(255,255,255,.15); font-weight:900; letter-spacing:.5px; }
        .viewer-cardchip{ position:absolute; left:10px; top:56px; z-index:3; }
        .viewer-cardchip .chip-inner{ display:flex; gap:8px; align-items:center; background:rgba(0,0,0,.35); border:1px solid rgba(255,255,255,.12); padding:6px 8px; border-radius:10px; backdrop-filter: blur(6px); }
        .viewer-cardchip img{ width:36px; height:36px; object-fit:contain }
        .viewer-cardchip .ph{ width:36px; height:36px; background:rgba(255,255,255,.06); border-radius:8px }
        .viewer-cardchip .nm{ font-weight:700; text-transform:capitalize }
        .viewer-cardchip .tp{ font-size:12px; color:var(--brand-muted) }
      `}</style>
    </div>
  )
}

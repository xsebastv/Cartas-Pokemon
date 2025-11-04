import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './Loader.css'

export default function Loader({ label = 'Cargando' }){
  const wrapRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.loader-card')
      const cardsMidIndex = Math.floor(cards.length / 2)
      const yOffset = 60
      const scaleOffset = 0.02
      const duration = 0.8
      const scaleDuration = duration / 3
      const tl = gsap.timeline({ repeat: -1 })

      const driftIn = () => gsap.timeline().from('.loader-cards', {
        yPercent: -yOffset / 3,
        duration,
        ease: 'power2.inOut',
      })

      const driftOut = () => gsap.timeline().to('.loader-cards', {
        yPercent: yOffset / 3,
        duration,
        ease: 'power2.inOut',
      })

      const scaleCards = () => gsap.timeline()
        .to('.loader-card', {
          scale: (i) => {
            if (i <= cardsMidIndex) return 1 - i * scaleOffset
            return 1 - (cards.length - 1 - i) * scaleOffset
          },
          delay: duration / 3,
          duration: scaleDuration,
          ease: 'expo.inOut',
        })
        .to('.loader-card', { scale: 1, duration: scaleDuration })

      const shuffleCards = () => gsap.timeline()
        .set('.loader-card', { y: (i) => -i * 0.5 })
        .fromTo('.loader-card', { rotate: 45, yPercent: -yOffset }, {
          duration,
          rotate: 65,
          yPercent: yOffset,
          stagger: duration * 0.03,
          ease: 'expo.inOut',
        })

      tl.add(driftIn()).add(shuffleCards(), '<').add(scaleCards(), '<').add(driftOut(), '<55%')
      return () => tl.kill()
    }, wrapRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="loader-wrap" ref={wrapRef} role="status" aria-live="polite">
      <ul className="loader-cards" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <li key={i} className="loader-card" />
        ))}
      </ul>
      <div className="loader-label">{label}…</div>
    </div>
  )
}

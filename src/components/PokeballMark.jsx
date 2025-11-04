import React from 'react'

export default function PokeballMark({ size = 28 }){
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <radialGradient id="g" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="#111"/>
      <path d="M2 32h60" stroke="#111" strokeWidth="8"/>
      <path d="M4 32h56" stroke="#fff" strokeOpacity=".2" strokeWidth="2"/>
      <path d="M2 32" stroke="#000" strokeWidth="6"/>
      <path d="M2 32h60" stroke="#000" strokeOpacity=".2" strokeWidth="10"/>
      <path d="M32 2a30 30 0 0 1 30 30H2A30 30 0 0 1 32 2Z" fill="#e60012"/>
      <circle cx="32" cy="32" r="10" fill="#111"/>
      <circle cx="32" cy="32" r="6" fill="#fff"/>
      <circle cx="32" cy="28" r="8" fill="url(#g)"/>
    </svg>
  )
}

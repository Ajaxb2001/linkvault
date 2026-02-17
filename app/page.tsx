'use client'

import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { Playfair_Display, DM_Mono, DM_Sans } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['500', '700'] })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['300', '400'] })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'] })

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [btnHovered, setBtnHovered] = useState(false)

  const login = async () => {
    try {
      setLoading(true)
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={dmSans.className}
      style={{
        minHeight: '100vh',
        background: '#0c0c0e',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header — matches dashboard exactly */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(12,12,14,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 32px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
        }}>
          <span className={playfair.className} style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#f0ede8',
            letterSpacing: '-0.02em',
          }}>
            Link<span style={{ color: '#e8c97e' }}>Vault</span>
          </span>
        </div>
      </header>

      {/* Thin gold accent bar under header */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #e8c97e, transparent)',
        opacity: 0.15,
      }} />

      {/* Main centered content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}>
        {/* Card — same border-radius, background, border as dashboard panels */}
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: '#111114',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {/* Card top accent line */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #e8c97e, transparent)',
            opacity: 0.45,
          }} />

          <div style={{ padding: '36px 32px 32px' }}>
            {/* Eyebrow */}
            <p
              className={dmMono.className}
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#4a4852',
                marginBottom: '8px',
              }}
            >
              Get started
            </p>

            {/* Title */}
            <h1
              className={playfair.className}
              style={{
                fontSize: '1.6rem',
                fontWeight: 500,
                color: '#f0ede8',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                marginBottom: '6px',
              }}
            >
              Sign in to your vault
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '0.82rem',
              color: '#4a4852',
              lineHeight: 1.55,
              marginBottom: '32px',
            }}>
              Save, organize, and access your links effortlessly.
            </p>

            {/* Divider */}
            <div style={{
              height: '1px',
              background: 'rgba(255,255,255,0.07)',
              marginBottom: '24px',
            }} />

            {/* Google Button */}
            <button
              onClick={login}
              disabled={loading}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                background: btnHovered && !loading ? '#1c1c21' : '#18181c',
                border: `1px solid ${btnHovered && !loading ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '10px',
                padding: '13px 20px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#f0ede8',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontFamily: 'inherit',
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              {loading ? (
                <>
                  <SpinnerIcon />
                  <span style={{ color: '#8a8790' }}>Signing you in…</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </button>

            {/* Footer note */}
            <div
              className={dmMono.className}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '20px',
              }}
            >
              {['Secure OAuth', 'No passwords stored'].map((text, i) => (
                <span key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.65rem', letterSpacing: '0.05em', color: '#4a4852' }}>
                    {text}
                  </span>
                  {i === 0 && (
                    <span style={{
                      width: '3px', height: '3px',
                      borderRadius: '50%',
                      background: '#4a4852',
                      opacity: 0.5,
                      display: 'inline-block',
                    }} />
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function SpinnerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      style={{ flexShrink: 0, animation: 'spin 0.7s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
      <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke="#e8c97e" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.657 32.676 29.197 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 19.01 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.681 0-14.344 4.337-17.694 10.691z"/>
      <path fill="#4CAF50" d="M24 44c5.102 0 9.807-1.957 13.324-5.141l-6.152-5.205C29.131 35.091 26.686 36 24 36c-5.176 0-9.623-3.302-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.233-2.231 4.13-4.131 5.654l.003-.002 6.152 5.205C36.891 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  )
}
export const dynamic = 'force-dynamic'
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/')
        return
      }
      setUser(data.session.user)
    }
    init()
  }, [router])

  useEffect(() => {
    if (!user) return
    fetchBookmarks()

    const channel = supabase
      .channel('bookmarks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks' },
        fetchBookmarks
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })
    setBookmarks(data || [])
  }

  const addBookmark = async () => {
    if (!title || !url) return
    setAdding(true)
    await supabase.from('bookmarks').insert({ title, url, user_id: user.id })
    setTitle('')
    setUrl('')
    setAdding(false)
    triggerFlash('Bookmark saved!')
  }

  const deleteBookmark = async (id: string) => {
    setDeleting(id)
    await supabase.from('bookmarks').delete().eq('id', id)
    setDeleting(null)
  }

  const triggerFlash = (msg: string) => {
    setFlash(msg)
    setTimeout(() => setFlash(null), 2000)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }

  const getDomain = (rawUrl: string) => {
    try {
      return new URL(rawUrl).hostname.replace('www.', '')
    } catch {
      return rawUrl
    }
  }

  if (!user) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Mono:wght@300;400&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --bg: #0c0c0e;
          --surface: #111114;
          --surface2: #18181c;
          --border: rgba(255,255,255,0.07);
          --border-hover: rgba(255,255,255,0.15);
          --accent: #e8c97e;
          --accent-dim: rgba(232,201,126,0.12);
          --text-primary: #f0ede8;
          --text-secondary: #8a8790;
          --text-muted: #4a4852;
          --red: #e06c75;
          --red-dim: rgba(224,108,117,0.1);
          --radius: 12px;
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Sans', system-ui, sans-serif;
          --font-mono: 'DM Mono', monospace;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body, #dashboard-root {
          background: var(--bg);
          color: var(--text-primary);
          font-family: var(--font-body);
          min-height: 100vh;
        }

        /* Noise texture overlay */
        #dashboard-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.6;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(12,12,14,0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
        }

        .header-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 32px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .logo span {
          color: var(--accent);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .user-chip {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-muted);
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 4px 10px;
          border-radius: 100px;
          letter-spacing: 0.02em;
          display: none;
        }

        @media (min-width: 640px) {
          .user-chip { display: block; }
        }

        .logout-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-muted);
          transition: color 0.15s;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .logout-btn:hover { color: var(--red); }

        /* Layout */
        .main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 32px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          position: relative;
          z-index: 1;
        }

        @media (min-width: 1024px) {
          .main { grid-template-columns: 320px 1fr; }
        }

        /* Panel */
        .panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }

        .add-panel {
          padding: 28px;
        }

        @media (min-width: 1024px) {
          .add-panel { position: sticky; top: 88px; }
        }

        .panel-label {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .panel-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 20px;
        }

        .field {
          position: relative;
          margin-bottom: 12px;
        }

        .field-input {
          width: 100%;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 11px 14px;
          font-family: var(--font-body);
          font-size: 0.875rem;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }

        .field-input::placeholder {
          color: var(--text-muted);
        }

        .field-input:focus {
          border-color: rgba(232,201,126,0.4);
          background: rgba(232,201,126,0.03);
        }

        .save-btn {
          width: 100%;
          margin-top: 4px;
          background: var(--accent);
          color: #0c0c0e;
          border: none;
          border-radius: 8px;
          padding: 12px;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: 0.01em;
        }

        .save-btn:hover:not(:disabled) { opacity: 0.88; }
        .save-btn:active:not(:disabled) { transform: scale(0.98); }
        .save-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Bookmarks section */
        .section-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .count-badge {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-muted);
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 3px 9px;
          border-radius: 100px;
        }

        /* Empty state */
        .empty {
          padding: 64px 32px;
          text-align: center;
        }

        .empty-icon {
          font-size: 2.5rem;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-title {
          font-family: var(--font-display);
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .empty-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        /* Bookmark row */
        .bm-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
          animation: fadeSlide 0.25s ease forwards;
        }

        .bm-row:last-child { border-bottom: none; }
        .bm-row:hover { background: var(--surface2); }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .bm-favicon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: var(--surface2);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.65rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
          overflow: hidden;
        }

        .bm-favicon img {
          width: 16px;
          height: 16px;
          object-fit: contain;
        }

        .bm-content {
          flex: 1;
          min-width: 0;
        }

        .bm-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--accent);
          text-decoration: none;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.15s;
          margin-bottom: 2px;
        }

        .bm-title:hover { color: #f0d898; }

        .bm-domain {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .delete-btn {
          background: none;
          border: 1px solid transparent;
          border-radius: 6px;
          cursor: pointer;
          padding: 5px 9px;
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          transition: color 0.15s, border-color 0.15s, background 0.15s;
          flex-shrink: 0;
        }

        .delete-btn:hover {
          color: var(--red);
          border-color: var(--red-dim);
          background: var(--red-dim);
        }

        .delete-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* Flash toast */
        .flash {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%) translateY(0);
          background: var(--accent);
          color: #0c0c0e;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.04em;
          padding: 10px 20px;
          border-radius: 100px;
          box-shadow: 0 8px 32px rgba(232,201,126,0.25);
          z-index: 9999;
          animation: flashIn 0.2s ease, flashOut 0.3s ease 1.7s forwards;
        }

        @keyframes flashIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        @keyframes flashOut {
          to { opacity: 0; transform: translateX(-50%) translateY(10px); }
        }

        /* Subtle top accent line */
        .accent-bar {
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: 0.35;
        }
      `}</style>

      <div id="dashboard-root">
        <div className="accent-bar" />

        <header className="header">
          <div className="header-inner">
            <div className="logo">Link<span>Vault</span></div>
            <div className="header-right">
              <span className="user-chip">{user.email}</span>
              <button className="logout-btn" onClick={logout}>Sign out</button>
            </div>
          </div>
        </header>

        <main className="main">
          {/* Add Bookmark Panel */}
          <section>
            <div className="panel add-panel">
              <div className="panel-label">New entry</div>
              <div className="panel-title">Save a link</div>

              <div className="field">
                <input
                  className="field-input"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBookmark()}
                />
              </div>
              <div className="field">
                <input
                  className="field-input"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBookmark()}
                />
              </div>
              <button
                className="save-btn"
                onClick={addBookmark}
                disabled={adding || !title || !url}
              >
                {adding ? 'Saving…' : 'Save Bookmark'}
              </button>
            </div>
          </section>

          {/* Bookmarks List */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Your Vault</h2>
              <span className="count-badge">{bookmarks.length}</span>
            </div>

            <div className="panel">
              {bookmarks.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">◈</div>
                  <p className="empty-title">The vault is empty</p>
                  <p className="empty-sub">Add your first link to get started</p>
                </div>
              ) : (
                bookmarks.map((b) => (
                  <div key={b.id} className="bm-row">
                    <div className="bm-favicon">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${getDomain(b.url)}&sz=32`}
                        alt=""
                        onError={(e) => {
                          const el = e.currentTarget
                          el.style.display = 'none'
                          el.parentElement!.textContent = getDomain(b.url).charAt(0).toUpperCase()
                        }}
                      />
                    </div>

                    <div className="bm-content">
                      <a className="bm-title" href={b.url} target="_blank" rel="noopener noreferrer">
                        {b.title}
                      </a>
                      <span className="bm-domain">{getDomain(b.url)}</span>
                    </div>

                    <button
                      className="delete-btn"
                      onClick={() => deleteBookmark(b.id)}
                      disabled={deleting === b.id}
                    >
                      {deleting === b.id ? '…' : 'Del'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>

        {flash && <div className="flash">{flash}</div>}
      </div>
    </>
  )
}
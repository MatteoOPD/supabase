import { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) {
      setError(error.message)
      console.error('Google Sign-In Error:', error)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError(error.message)
    }
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Supabase Google Auth Test</h1>

      {error && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          Error: {error}
        </div>
      )}

      {!session ? (
        <div>
          <p>Not logged in</p>
          <button
            onClick={signInWithGoogle}
            style={{
              background: '#4285F4',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Sign in with Google
          </button>
        </div>
      ) : (
        <div>
          <p style={{ color: 'green' }}>Logged in!</p>
          <div style={{
            background: '#f5f5f5',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>User ID:</strong> {session.user.id}</p>
            <p><strong>Provider:</strong> {session.user.app_metadata.provider}</p>
          </div>
          <button
            onClick={signOut}
            style={{
              background: '#757575',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      )}

      <div style={{ marginTop: '40px', fontSize: '14px', color: '#666' }}>
        <h3>Debug Info:</h3>
        <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL}</p>
        <p>Anon Key: {import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 50)}...</p>
      </div>
    </div>
  )
}

export default App

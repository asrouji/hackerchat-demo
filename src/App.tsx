import './App.css'
import { supabase } from './supabase'
import { User } from '@supabase/auth-js'
import { useState, useEffect } from 'react'

function App() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => authListener.subscription.unsubscribe()
  })

  const signInWithGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div>
      <h1>HackerChat</h1>
      {!user ? (
        <button onClick={signInWithGithub}>Sign in with GitHub</button>
      ) : (
        <div>
          <p>Welcome, {user.user_metadata.preferred_username}</p>
          <img
            src={user.user_metadata.avatar_url}
            alt="Avatar"
            style={{
              width: '30px',
              borderRadius: '50%',
            }}
          />
          <button onClick={signOut}>Sign Out</button>
        </div>
      )}
    </div>
  )
}

export default App

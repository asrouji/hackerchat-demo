import './App.css'
import { supabase } from './supabase'
import { User } from '@supabase/auth-js'
import React, { useState, useEffect } from 'react'
import { Tables } from './supabase.types'

type Message = Tables<'message'> & { hacker: Tables<'hacker'> }

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await createHackerIfNotExists(session.user)
      } else {
        setUser(null)
      }
    }
    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  const signInWithGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const createHackerIfNotExists = async (user: User) => {
    const { data: existingHacker } = await supabase.from('hacker').select('*').eq('id', user.id).single()
    if (!existingHacker) {
      await supabase.from('hacker').insert({
        id: user.id,
        github_login: user.user_metadata.preferred_username,
        github_avatar_url: user.user_metadata.avatar_url,
      })
    }
  }

  const fetchMessages = async () => {
    const { data } = await supabase.from('message').select('*, hacker(*)').order('created_at', { ascending: true })
    setMessages(data ?? [])
  }

  useEffect(() => {
    if (user) {
      fetchMessages()
    }
  }, [user])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return
    await supabase.from('message').insert({
      content: newMessage,
      hacker_id: user.id,
    })
    setNewMessage('')
    fetchMessages()
  }

  return (
    <div>
      <h1>HackerChat</h1>
      {!user ? (
        <button onClick={signInWithGithub}>Sign in with GitHub</button>
      ) : (
        <div>
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
          <div>
            {messages.map(msg => (
              <div key={msg.id}>
                <img src={msg.hacker.github_avatar_url} style={{ width: '30px', borderRadius: '50%' }} />
                <strong>{msg.hacker.github_login}</strong> {msg.content}
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default App

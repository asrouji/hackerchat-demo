import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'
import './App.css'

type Message = {
  content: string
  created_at: string
  hacker_id: string
  id: number
  hacker: { github_login: string; github_avatar_url: string }
}

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
      }
    }
    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        createHackerIfNotExists(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchMessages()
    }
  }, [user])

  async function createHackerIfNotExists(user: User) {
    const { data: existingHacker } = await supabase.from('hacker').select('*').eq('id', user.id).single()

    if (!existingHacker) {
      await supabase.from('hacker').insert({
        id: user.id,
        github_login: user.user_metadata.preferred_username,
        github_avatar_url: user.user_metadata.avatar_url,
        created_at: new Date().toISOString(),
      })
    }
  }

  async function signInWithGithub() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
    })
    if (error) console.error('Error signing in:', error)
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error signing out:', error)
  }

  async function fetchMessages() {
    const { data, error } = await supabase
      .from('message')
      .select('*, hacker(github_login, github_avatar_url)')
      .order('created_at', { ascending: true })

    if (error) console.error('Error fetching messages:', error)
    else setMessages(data)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const { error } = await supabase.from('message').insert({
      content: newMessage,
      hacker_id: user.id,
      created_at: new Date().toISOString(),
    })

    if (error) console.error('Error sending message:', error)
    else {
      setNewMessage('')
      fetchMessages()
    }
  }

  return (
    <div className="app-container">
      <h1>HackerChat</h1>

      {!user ? (
        <button onClick={signInWithGithub}>Sign in with GitHub</button>
      ) : (
        <div>
          <div className="user-info">
            <img src={user.user_metadata.avatar_url} alt="Avatar" className="avatar" />
            <span className="username">{user.user_metadata.preferred_username}</span>
            <button onClick={signOut} className="sign-out-btn">
              Sign out
            </button>
          </div>

          <div className="messages-container">
            {messages.map(msg => (
              <div key={msg.id} className="message">
                <img src={msg.hacker.github_avatar_url} alt="Avatar" className="message-avatar" />
                <strong className="message-username">{msg.hacker.github_login}:</strong>
                <span>{msg.content}</span>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="message-form">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="message-input"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default App

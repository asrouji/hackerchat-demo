import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'
import { Tables } from './supabase.types'
import './App.css'

// Define our Message type that matches our Supabase database schema
type Message = Tables<'message'> & {
  hacker: Tables<'hacker'>
}

function App() {
  // ============= State Management =============
  const [user, setUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // ============= Authentication Setup =============
  useEffect(() => {
    // Check for existing session on component mount
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

    // Set up real-time auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        createHackerIfNotExists(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    // Cleanup subscription on unmount
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Fetch messages and set up real-time subscription when user is authenticated
  useEffect(() => {
    if (user) {
      // Initial fetch of messages
      fetchMessages()

      // Set up real-time subscription
      const channel = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'message',
          },
          async () => {
            // Fetch the latest messages when any change occurs
            await fetchMessages()
          }
        )
        .subscribe()

      // Cleanup subscription on unmount
      return () => {
        channel.unsubscribe()
      }
    }
  }, [user])

  // ============= Database Operations =============
  // Create a new hacker profile if it doesn't exist
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

  // Fetch all messages with hacker information
  async function fetchMessages() {
    const { data, error } = await supabase
      .from('message')
      .select('*, hacker(*)')
      .order('created_at', { ascending: true })

    if (error) console.error('Error fetching messages:', error)
    else setMessages(data)
  }

  // ============= User Actions =============
  // Handle GitHub OAuth sign in
  async function signInWithGithub() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
    })
    if (error) console.error('Error signing in:', error)
  }

  // Handle user sign out
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error signing out:', error)
  }

  // Handle new message submission
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
      // Removed fetchMessages() call since the subscription will handle it
    }
  }

  // ============= Render UI =============
  return (
    <div>
      <h1>HackerChat</h1>

      {!user ? (
        // Show sign in button if user is not authenticated
        <button onClick={signInWithGithub}>Sign in with GitHub</button>
      ) : (
        // Show chat interface if user is authenticated
        <div>
          {/* User profile section */}
          <div className="user-info flex">
            <img src={user.user_metadata.avatar_url} alt="Avatar" className="avatar" />
            <span className="username">{user.user_metadata.preferred_username}</span>
            <button onClick={signOut} className="sign-out-btn">
              Sign out
            </button>
          </div>

          {/* Messages display section */}
          <div className="messages-container">
            {messages.map(msg => (
              <div key={msg.id} className="message flex">
                <img src={msg.hacker.github_avatar_url} alt="Avatar" className="avatar" />
                <strong className="message-username">{msg.hacker.github_login}:</strong>
                <span>{msg.content}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input form */}
          <form onSubmit={sendMessage} className="message-form flex">
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

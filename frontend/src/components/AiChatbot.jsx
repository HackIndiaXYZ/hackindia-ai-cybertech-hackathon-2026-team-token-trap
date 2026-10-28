import { useEffect, useRef, useState } from 'react'
import {
  Bot,
  Check,
  ChevronDown,
  CornerDownLeft,
  Key,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { api } from '../api/client.js'

const QUICK_QUESTIONS = [
  'What is TokenTrap and how does it work?',
  'Explain the current live telemetry metrics',
  'What are honey-tokens and canary documents?',
  'How do I simulate an intruder attack?',
  'How are genuine and decoy JWTs separated?',
]

export default function AiChatbot({ metrics, recentEvents = [], isLight }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '👋 **Hello! I am your TokenTrap AI Security Copilot powered by Google Gemini.**\n\n' +
        'I have real-time visibility into the Security Operations Center. You can ask me questions about this website, our deception architecture, live threat metrics, or how to test honey-tokens.\n\n' +
        'Click any quick question below or type your inquiry!',
      source: 'copilot',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('tokentrap_gemini_key') || ''
  })
  const [tempKey, setTempKey] = useState('')
  const [savedKeyNotice, setSavedKeyNotice] = useState(false)

  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  function handleSaveKey(e) {
    e.preventDefault()
    const cleanKey = tempKey.trim()
    setApiKey(cleanKey)
    if (cleanKey) {
      localStorage.setItem('tokentrap_gemini_key', cleanKey)
    } else {
      localStorage.removeItem('tokentrap_gemini_key')
    }
    setSavedKeyNotice(true)
    setTimeout(() => {
      setSavedKeyNotice(false)
      setShowSettings(false)
    }, 1200)
  }

  async function handleSend(textToSend) {
    const query = (textToSend || input).trim()
    if (!query || loading) return

    const newMessages = [...messages, { role: 'user', content: query }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      // Build history for multi-turn context
      const history = newMessages.slice(-6).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }))

      const res = await api.chatWithAi(
        query,
        apiKey || undefined,
        history,
        { metrics, recent_events_count: recentEvents.length },
      )

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply || 'No response generated.',
          source: res.source === 'gemini' ? 'Gemini AI' : 'SOC Intelligence',
          model: res.model,
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Error connecting to AI service:** ${err.message || 'Check your network or Gemini API key.'}`,
          source: 'error',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleClearChat() {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat session cleared. How can I help you investigate TokenTrap today?',
        source: 'copilot',
      },
    ])
  }

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-2xl transition hover:scale-105 ${
            isLight
              ? 'border border-emerald-300 bg-white text-slate-900 shadow-emerald-500/10'
              : 'border border-emerald-400/30 bg-[#0d131d]/95 text-white shadow-emerald-500/20 glow-green'
          }`}
          aria-label="Open TokenTrap AI Copilot"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white shadow-xs">
            <Bot size={17} />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-[#080b10] bg-emerald-400" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span>TokenTrap AI</span>
              <span className="rounded bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-500">
                GEMINI
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Ask about website & telemetry</div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-4 sm:right-6 z-50 flex h-[620px] w-[92vw] max-w-[440px] flex-col rounded-2xl border shadow-2xl backdrop-blur-2xl transition-all duration-200 ${
            isLight
              ? 'border-slate-200 bg-white/95 text-slate-900 shadow-slate-900/15'
              : 'border-white/[0.09] bg-[#0b0f17]/95 text-slate-100 shadow-black/80'
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between border-b px-4 py-3.5 ${
              isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/[0.07] bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white shadow-xs">
                <Sparkles size={16} />
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span>AI Security Copilot</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold ${
                      apiKey
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                        : 'bg-cyan-500/15 text-cyan-500 border border-cyan-500/30'
                    }`}
                  >
                    {apiKey ? 'GEMINI CONNECTED' : 'SOC COPILOT'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Deception intelligence assistant
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setTempKey(apiKey)
                  setShowSettings(!showSettings)
                }}
                title="Configure Gemini API Key"
                className={`rounded-lg p-1.5 transition ${
                  showSettings
                    ? 'bg-emerald-500/20 text-emerald-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Key size={14} />
              </button>

              <button
                onClick={handleClearChat}
                title="Clear conversation"
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition"
              >
                <Trash2 size={14} />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition"
                aria-label="Close AI Copilot"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Gemini API Key Configuration Drawer */}
          {showSettings && (
            <div
              className={`border-b p-3.5 text-xs ${
                isLight ? 'border-slate-200 bg-emerald-50/50' : 'border-emerald-500/20 bg-emerald-950/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-emerald-500 flex items-center gap-1">
                  <Key size={12} /> Google Gemini API Key
                </span>
                <span className="text-[10px] text-slate-400">Free tier supported</span>
              </div>

              <form onSubmit={handleSaveKey} className="flex gap-2">
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="Paste AIzaSy... key (or leave empty)"
                  className={`flex-1 rounded-lg border px-2.5 py-1.5 text-xs outline-none ${
                    isLight
                      ? 'border-slate-300 bg-white text-slate-900'
                      : 'border-white/10 bg-black/40 text-white'
                  }`}
                />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-400 transition"
                >
                  {savedKeyNotice ? <Check size={14} /> : 'Save'}
                </button>
              </form>

              <div className="mt-1.5 text-[10px] text-slate-400">
                Key is stored safely in browser local storage. If no key is set, smart built-in SOC intelligence handles queries.
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-xs leading-relaxed">
            {messages.map((m, idx) => {
              const isAssistant = m.role === 'assistant'

              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  {isAssistant && (
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Bot size={13} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                      isAssistant
                        ? isLight
                          ? 'border border-slate-200 bg-slate-50 text-slate-800'
                          : 'border border-white/[0.07] bg-[#121824] text-slate-200'
                        : 'bg-emerald-500 text-white font-medium'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>

                    {isAssistant && m.source && (
                      <div className="mt-1.5 text-[9px] font-mono text-slate-400 flex items-center gap-1">
                        <Sparkles size={9} />
                        <span>Source: {m.source}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 p-2">
                <RefreshCw size={12} className="animate-spin text-emerald-500" />
                <span className="text-[11px]">Analyzing with TokenTrap AI...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div
            className={`flex gap-1.5 overflow-x-auto border-t px-3 py-2 ${
              isLight ? 'border-slate-200 bg-slate-50/50' : 'border-white/[0.05] bg-black/20'
            }`}
          >
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={loading}
                className={`whitespace-nowrap rounded-lg border px-2.5 py-1 text-[10px] transition ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40 hover:text-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className={`flex items-center gap-2 border-t p-3 ${
              isLight ? 'border-slate-200 bg-white' : 'border-white/[0.07] bg-[#0c1018]'
            }`}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about TokenTrap or alerts..."
              className={`flex-1 rounded-xl border px-3 py-2 text-xs outline-none transition ${
                isLight
                  ? 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
                  : 'border-white/10 bg-black/30 text-white placeholder:text-slate-500 focus:border-emerald-400/40'
              }`}
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white transition hover:bg-emerald-400 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

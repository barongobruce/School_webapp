import React, { useEffect, useRef, useState } from 'react'
import { Bot, Languages, LoaderCircle, Send, UserRound } from 'lucide-react'
import { api, getErrorMessage } from '../../../../lib/api'
import AiLearningTools from './AiLearningTools'
import AiTutorPreferences from './AiTutorPreferences'

const languageOptions = ['English', 'Kiswahili', 'Sheng']
const tutorTools = [
  { id: 'chat', label: 'Chat' },
  { id: 'quiz', label: 'Practice Quiz' },
  { id: 'lesson', label: 'Learn a Topic' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'study-plan', label: 'Study Plan' },
  { id: 'preferences', label: 'Preferences' },
]

const AiTutor = () => {
  const [messages, setMessages] = useState([])
  const [activeTool, setActiveTool] = useState('chat')
  const [question, setQuestion] = useState('')
  const [language, setLanguage] = useState('English')
  const [isSending, setIsSending] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    api.get('/api/user/ai/preferences')
      .then(({ data }) => {
        if (isMounted && data.preferences?.language) setLanguage(data.preferences.language)
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingPreferences(false)
      })

    const loadHistory = async () => {
      try {
        const { data } = await api.get('/api/user/ai/chat')
        if (isMounted) setMessages(data.messages || [])
      } catch (requestError) {
        if (isMounted) setError(getErrorMessage(requestError))
      } finally {
        if (isMounted) setIsLoadingHistory(false)
      }
    }

    loadHistory()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isSending])

  const sendQuestion = async (event) => {
    event.preventDefault()
    const text = question.trim()
    if (!text || isSending || isLoadingHistory || isLoadingPreferences) return

    setMessages((current) => [...current, { role: 'user', content: text }])
    setQuestion('')
    setError('')
    setIsSending(true)

    try {
      const { data } = await api.post('/api/user/ai/chat', {
        question: text,
        language,
      })
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: data.reply },
      ])
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className='flex min-h-0 flex-1 flex-col bg-slate-50 dark:bg-[#081120]'>
      <header className='border-b border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-[#0c1528] sm:px-8'>
        <div className='mx-auto flex max-w-4xl items-center justify-between gap-4'>
          <div>
            <p className='text-xs font-semibold tracking-wide text-blue-600 uppercase'>Your study helper</p>
            <h1 className='mt-1 text-xl font-bold text-slate-900 dark:text-white'>AI Tutor</h1>
            <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>Get help with a question or choose a learning tool.</p>
          </div>
          <label className='flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-[#101c31] dark:text-slate-200'>
            <Languages className='size-4 text-blue-600' aria-hidden='true' />
            <span className='sr-only'>Answer language</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className='max-w-28 bg-transparent outline-none'
              aria-label='Answer language'
            >
              {languageOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <nav aria-label='AI Tutor tools' className='shrink-0 overflow-x-auto border-b border-slate-200 bg-white px-4 dark:border-white/10 dark:bg-[#0c1528] sm:px-8'>
        <div className='mx-auto flex max-w-4xl gap-2'>
          {tutorTools.map((tool) => (
            <button
              key={tool.id}
              type='button'
              onClick={() => setActiveTool(tool.id)}
              aria-current={activeTool === tool.id ? 'page' : undefined}
              className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold transition ${activeTool === tool.id ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-300' : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              {tool.label}
            </button>
          ))}
        </div>
      </nav>

      {activeTool === 'chat' ? (
        <>
      <div className='min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8'>
        <div className='mx-auto flex max-w-4xl flex-col gap-4'>
          {messages.length === 0 && (
            <div className='my-auto rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm dark:border-blue-900/60 dark:bg-[#0c1528]'>
              <Bot className='mx-auto size-10 text-blue-600' aria-hidden='true' />
              <h2 className='mt-3 text-lg font-semibold text-slate-900 dark:text-white'>Karibu! What would you like to learn?</h2>
              <p className='mt-2 text-sm text-slate-600 dark:text-slate-300'>Try asking about a lesson, a difficult topic, or a homework question.</p>
            </div>
          )}

          {isLoadingHistory && (
            <p className='text-center text-sm text-slate-500 dark:text-slate-400' role='status'>Loading your saved conversation…</p>
          )}

          {messages.map((message, index) => {
            const isStudent = message.role === 'user'
            return (
              <div key={`${index}-${message.role}`} className={`flex items-start gap-3 ${isStudent ? 'flex-row-reverse' : ''}`}>
                <span className={`mt-1 flex size-8 shrink-0 items-center justify-center rounded-full ${isStudent ? 'bg-blue-700 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300'}`}>
                  {isStudent ? <UserRound className='size-4' aria-hidden='true' /> : <Bot className='size-4' aria-hidden='true' />}
                </span>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${isStudent ? 'bg-blue-700 text-white' : 'border border-slate-200 bg-white text-slate-800 dark:border-white/10 dark:bg-[#0c1528] dark:text-slate-100'}`}>
                  {message.content}
                </div>
              </div>
            )
          })}

          {isSending && (
            <div className='flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400' role='status'>
              <LoaderCircle className='size-4 animate-spin' aria-hidden='true' /> AI Tutor is preparing an answer…
            </div>
          )}
          {error && <p className='rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300' role='alert'>{error}</p>}
          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={sendQuestion} className='border-t border-slate-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#0c1528] sm:px-8'>
        <div className='mx-auto flex max-w-4xl items-end gap-3'>
          <label className='sr-only' htmlFor='ai-tutor-question'>Your question</label>
          <textarea
            id='ai-tutor-question'
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            maxLength={2000}
            rows={2}
            placeholder='Write your question here…'
            className='min-h-12 flex-1 resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-white/15 dark:bg-[#101c31] dark:text-white dark:focus:ring-blue-900'
          />
          <button
            type='submit'
            disabled={!question.trim() || isSending || isLoadingHistory || isLoadingPreferences}
            className='inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Send className='size-4' aria-hidden='true' />
            <span className='hidden sm:inline'>Send</span>
          </button>
        </div>
        <p className='mx-auto mt-2 max-w-4xl text-xs text-slate-400'>Your conversation is saved to your account. AI Tutor can make mistakes; ask your teacher if an answer is unclear.</p>
      </form>
        </>
      ) : (
        activeTool === 'preferences'
          ? <AiTutorPreferences onLanguageChange={setLanguage} />
          : <AiLearningTools tool={activeTool} language={language} />
      )}
    </section>
  )
}

export default AiTutor

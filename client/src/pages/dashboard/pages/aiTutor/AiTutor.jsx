import React, { useEffect, useRef, useState } from 'react'
import { Bot, Languages, LoaderCircle, Send, UserRound } from 'lucide-react'
import { api, getErrorMessage } from '../../../../lib/api'
import AiLearningTools from './AiLearningTools'
import AiTutorPreferences from './AiTutorPreferences'

const languageOptions = ['English', 'Kiswahili', 'Sheng']
const tutorTools = [
  { id: 'chat', label: 'Chat', shortLabel: 'Chat' },
  { id: 'quiz', label: 'Practice Quiz', shortLabel: 'Quiz' },
  { id: 'lesson', label: 'Learn a Topic', shortLabel: 'Learn' },
  { id: 'flashcards', label: 'Flashcards', shortLabel: 'Cards' },
  { id: 'study-plan', label: 'Study Plan', shortLabel: 'Plan' },
  { id: 'preferences', label: 'Preferences', shortLabel: 'Prefs' },
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
    <section className='flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-[#081120]'>
      <header className='shrink-0 border-b border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-[#0c1528] sm:px-6 sm:py-2.5 lg:px-8'>
        <div className='mx-auto flex max-w-[1440px] items-center justify-between gap-3'>
          <div className='min-w-0'>
            <h1 className='truncate text-base font-bold text-slate-900 dark:text-white sm:text-lg'>AI Tutor</h1>
          </div>
          <label className='flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 dark:border-white/10 dark:bg-[#101c31] dark:text-slate-200 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm'>
            <Languages className='size-3.5 text-blue-600 sm:size-4' aria-hidden='true' />
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

      <nav aria-label='AI Tutor tools' className='shrink-0 overflow-x-auto border-b border-slate-200 bg-white [scrollbar-width:none] dark:border-white/10 dark:bg-[#0c1528] [&::-webkit-scrollbar]:hidden'>
        <div className='mx-auto flex w-full max-w-[1440px] gap-0.5 px-1 sm:gap-2 sm:px-6 lg:px-8'>
          {tutorTools.map((tool) => (
            <button
              key={tool.id}
              type='button'
              onClick={() => setActiveTool(tool.id)}
              aria-current={activeTool === tool.id ? 'page' : undefined}
              aria-label={tool.label}
              className={`shrink-0 border-b-2 px-2.5 py-2.5 text-xs font-semibold transition sm:px-3 sm:py-3 sm:text-sm ${activeTool === tool.id ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-300' : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              <span className='sm:hidden'>{tool.shortLabel}</span>
              <span className='hidden sm:inline'>{tool.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {activeTool === 'chat' ? (
        <>
      <div className='min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-5 lg:px-8'>
        <div className='mx-auto flex min-h-full w-full max-w-[1440px] flex-col gap-3 sm:gap-4'>
          {messages.length === 0 && (
            <div className='flex flex-1 flex-col items-center justify-center py-8 text-center'>
              <Bot className='size-8 text-blue-600' aria-hidden='true' />
              <h2 className='mt-2 text-base font-semibold text-slate-900 dark:text-white'>What would you like to learn?</h2>
              <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>Ask a question below to start.</p>
            </div>
          )}

          {isLoadingHistory && (
            <p className='text-center text-sm text-slate-500 dark:text-slate-400' role='status'>Loading your saved conversation…</p>
          )}

          {messages.map((message, index) => {
            const isStudent = message.role === 'user'
            return (
              <div key={`${index}-${message.role}`} className={`flex items-start gap-2.5 sm:gap-3 ${isStudent ? 'flex-row-reverse' : ''}`}>
                <span className={`mt-1 flex size-7 shrink-0 items-center justify-center rounded-full sm:size-8 ${isStudent ? 'bg-blue-700 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300'}`}>
                  {isStudent ? <UserRound className='size-4' aria-hidden='true' /> : <Bot className='size-4' aria-hidden='true' />}
                </span>
                <div className={`max-w-[92%] whitespace-pre-wrap rounded-2xl px-3.5 py-3 text-sm leading-6 shadow-sm sm:max-w-[90%] sm:px-4 sm:py-3.5 sm:text-[15px] ${isStudent ? 'bg-blue-700 text-white' : 'border border-slate-200 bg-white text-slate-800 dark:border-white/10 dark:bg-[#0c1528] dark:text-slate-100'}`}>
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

      <form onSubmit={sendQuestion} className='shrink-0 border-t border-slate-200 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-[#0c1528] sm:px-6 sm:py-3 lg:px-8'>
        <div className='mx-auto flex w-full max-w-[1440px] items-end gap-2 sm:gap-3'>
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
            placeholder='Write your question…'
            className='min-h-12 max-h-32 flex-1 resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-white/15 dark:bg-[#101c31] dark:text-white dark:focus:ring-blue-900 sm:px-4 sm:py-3'
          />
          <button
            type='submit'
            disabled={!question.trim() || isSending || isLoadingHistory || isLoadingPreferences}
            aria-label='Send question'
            className='inline-flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-0 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-4'
          >
            <Send className='size-4' aria-hidden='true' />
            <span className='hidden sm:inline'>Send</span>
          </button>
        </div>
        <p className='mx-auto mt-1.5 hidden w-full max-w-[1440px] text-xs text-slate-400 sm:block'>Your conversation is saved to your account. AI Tutor can make mistakes; ask your teacher if an answer is unclear.</p>
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

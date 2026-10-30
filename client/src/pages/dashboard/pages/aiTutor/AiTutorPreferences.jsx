import React, { useEffect, useState } from 'react'
import { Save, Sparkles } from 'lucide-react'
import { api, getErrorMessage } from '../../../../lib/api'

const defaultPreferences = {
  language: 'English',
  learningStyle: 'Interactive',
  favoriteSubject: '',
  weakSubject: '',
}

const AiTutorPreferences = ({ onLanguageChange }) => {
  const [preferences, setPreferences] = useState(defaultPreferences)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    api.get('/api/user/ai/preferences')
      .then(({ data }) => {
        if (isMounted) {
          const next = { ...defaultPreferences, ...data.preferences }
          setPreferences(next)
          onLanguageChange(next.language)
        }
      })
      .catch((requestError) => {
        if (isMounted) setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => { isMounted = false }
  }, [onLanguageChange])

  const updateField = (field, value) => {
    setPreferences((current) => ({ ...current, [field]: value }))
    if (field === 'language') onLanguageChange(value)
  }

  const savePreferences = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setMessage('')
    try {
      const { data } = await api.patch('/api/user/ai/preferences', preferences)
      const next = { ...defaultPreferences, ...data.preferences }
      setPreferences(next)
      onLanguageChange(next.language)
      setMessage('Your preferences are saved and will guide future AI Tutor replies.')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-6 dark:bg-[#081120] sm:px-8'>
      <div className='mx-auto max-w-3xl space-y-5'>
        <div>
          <h2 className='text-lg font-bold text-slate-900 dark:text-white'>Your learning preferences</h2>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>These settings help AI Tutor choose language, examples and explanations that suit you.</p>
        </div>

        <form onSubmit={savePreferences} className='space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0c1528] sm:p-6'>
          {isLoading ? (
            <p className='text-sm text-slate-500 dark:text-slate-400' role='status'>Loading your preferences…</p>
          ) : (
            <>
              <label className='flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200'>
                Preferred language
                <select value={preferences.language} onChange={(event) => updateField('language', event.target.value)} className='rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal dark:border-white/15 dark:bg-[#101c31] dark:text-white'>
                  {['English', 'Kiswahili', 'Sheng'].map((language) => <option key={language}>{language}</option>)}
                </select>
              </label>

              <label className='flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200'>
                How do you like to learn?
                <select value={preferences.learningStyle} onChange={(event) => updateField('learningStyle', event.target.value)} className='rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal dark:border-white/15 dark:bg-[#101c31] dark:text-white'>
                  {['Interactive', 'Visual', 'Practical', 'Reading/Writing', 'Story-based'].map((style) => <option key={style}>{style}</option>)}
                </select>
              </label>

              <div className='grid gap-4 sm:grid-cols-2'>
                <label className='flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200'>
                  Favourite subject (optional)
                  <input value={preferences.favoriteSubject} onChange={(event) => updateField('favoriteSubject', event.target.value)} maxLength={80} placeholder='For example: Science' className='rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal dark:border-white/15 dark:bg-[#101c31] dark:text-white' />
                </label>
                <label className='flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200'>
                  Subject you want help with (optional)
                  <input value={preferences.weakSubject} onChange={(event) => updateField('weakSubject', event.target.value)} maxLength={80} placeholder='For example: Mathematics' className='rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal dark:border-white/15 dark:bg-[#101c31] dark:text-white' />
                </label>
              </div>

              <button type='submit' disabled={isSaving} className='inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50'>
                {isSaving ? <Sparkles className='size-4 animate-pulse' aria-hidden='true' /> : <Save className='size-4' aria-hidden='true' />}
                {isSaving ? 'Saving…' : 'Save preferences'}
              </button>
            </>
          )}
        </form>

        {message && <p className='rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-950/30 dark:text-green-200' role='status'>{message}</p>}
        {error && <p className='rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300' role='alert'>{error}</p>}
      </div>
    </div>
  )
}

export default AiTutorPreferences

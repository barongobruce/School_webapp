import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { BookOpen, CheckCircle2, CircleHelp, RotateCcw, Sparkles } from 'lucide-react'
import { api, getErrorMessage } from '../../../../lib/api'

const toolDetails = {
  quiz: {
    title: 'Practice Quiz',
    description: 'Create a five-question multiple-choice quiz and check your answers.',
    topicLabel: 'Quiz topic',
    button: 'Create quiz',
  },
  lesson: {
    title: 'Learn a Topic',
    description: 'Get a clear lesson with examples and practice questions.',
    topicLabel: 'What would you like to learn?',
    button: 'Create lesson',
  },
  flashcards: {
    title: 'Flashcards',
    description: 'Make a set of revision cards. Select a card to reveal its answer.',
    topicLabel: 'Flashcard topic',
    button: 'Create flashcards',
  },
  'study-plan': {
    title: 'Study Plan',
    description: 'Create a daily study plan focused on a subject or topic.',
    topicLabel: 'Subject or topic to focus on',
    button: 'Create study plan',
  },
}

const TextResult = ({ text }) => (
  <div className='space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-200'>
    {String(text).split('\n').map((rawLine, index) => {
      const line = rawLine.trim().replaceAll('**', '')
      if (!line) return <div key={index} className='h-2' />
      if (line.startsWith('#')) {
        return <h3 key={index} className='pt-2 text-base font-bold text-slate-900 dark:text-white'>{line.replace(/^#+\s*/, '')}</h3>
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <p key={index} className='pl-4'>• {line.slice(2)}</p>
      }
      return <p key={index}>{line}</p>
    })}
  </div>
)

const AiLearningTools = ({ tool, language }) => {
  const userRole = useSelector((state) => state.user.user?.role)
  const isTeacher = userRole === 'teacher'
  const details = toolDetails[tool]
  const [topic, setTopic] = useState('')
  const [targetGrade, setTargetGrade] = useState('')
  const [difficulty, setDifficulty] = useState('Medium')
  const [result, setResult] = useState(null)
  const [activityId, setActivityId] = useState('')
  const [savedActivities, setSavedActivities] = useState([])
  const [scoreResult, setScoreResult] = useState(null)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [revealedCards, setRevealedCards] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [isScoring, setIsScoring] = useState(false)
  const [error, setError] = useState('')

  const loadSavedActivities = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/user/ai/tools/${tool}`)
      setSavedActivities(data.activities || [])
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }, [tool])

  useEffect(() => {
    setResult(null)
    setActivityId('')
    setScoreResult(null)
    setSelectedAnswers({})
    setIsSubmitted(false)
    setError('')
    loadSavedActivities()
  }, [tool, loadSavedActivities])

  const openSavedActivity = async (id) => {
    if (!id) return
    setError('')
    try {
      const { data } = await api.get(`/api/user/ai/activities/${id}`)
      const activity = data.activity
      setResult(activity.result)
      setActivityId(activity.id)
      setScoreResult(activity.score
        ? { ...activity.score, correctAnswers: activity.result.map((item) => item.answer) }
        : null)
      setIsSubmitted(Boolean(activity.score))
      setSelectedAnswers(
        Object.fromEntries((activity.answers || []).map((answer, index) => [index, answer])),
      )
      setTopic(activity.topic)
      setDifficulty(activity.difficulty || 'Medium')
      setRevealedCards({})
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  const generate = async (event) => {
    event.preventDefault()
    const cleanTopic = topic.trim()
    if (!cleanTopic || isGenerating) return
    setError('')
    setResult(null)
    setActivityId('')
    setScoreResult(null)
    setIsSubmitted(false)
    setSelectedAnswers({})
    setRevealedCards({})
    setIsGenerating(true)

    try {
      const { data } = await api.post(`/api/user/ai/tools/${tool}`, {
        topic: cleanTopic,
        difficulty,
        language,
        ...(isTeacher && targetGrade.trim() ? { targetGrade: targetGrade.trim() } : {}),
      })
      setResult(data.result)
      setActivityId(data.activityId)
      setSavedActivities((current) => [
        { id: data.activityId, topic: cleanTopic, difficulty, score: null, createdAt: data.createdAt },
        ...current.filter((activity) => activity.id !== data.activityId),
      ].slice(0, 10))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsGenerating(false)
    }
  }

  const quizQuestions = tool === 'quiz' && Array.isArray(result) ? result : []
  const flashcards = tool === 'flashcards' && Array.isArray(result) ? result : []
  const score = quizQuestions.reduce(
    (total, _item, index) => total + (selectedAnswers[index] === scoreResult?.correctAnswers?.[index] ? 1 : 0),
    0,
  )

  const checkAnswers = async () => {
    if (!activityId || Object.keys(selectedAnswers).length !== quizQuestions.length) return
    setError('')
    setIsScoring(true)
    try {
      const answers = quizQuestions.map((_, index) => selectedAnswers[index])
      const { data } = await api.post(`/api/user/ai/activities/${activityId}/score`, { answers })
      setScoreResult({ ...data.score, correctAnswers: data.correctAnswers })
      setIsSubmitted(true)
      setSavedActivities((current) => current.map((activity) => activity.id === activityId
        ? { ...activity, score: data.score }
        : activity))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsScoring(false)
    }
  }

  return (
    <div className='min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-6 dark:bg-[#081120] sm:px-8'>
      <div className='mx-auto max-w-4xl space-y-5'>
        <div>
          <h2 className='text-lg font-bold text-slate-900 dark:text-white'>{details.title}</h2>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>{details.description}</p>
        </div>

        <form onSubmit={generate} className='grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0c1528] sm:grid-cols-2 sm:p-5'>
          <label className='flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2'>
            {details.topicLabel}
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              maxLength={160}
              required
              placeholder={tool === 'study-plan' ? 'For example: fractions or Biology' : 'For example: fractions, plants, or the solar system'}
              className='rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-white/15 dark:bg-[#101c31] dark:text-white dark:focus:ring-blue-900'
            />
          </label>

          {isTeacher && (
            <label className='flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200'>
              Learner grade (optional)
              <input
                value={targetGrade}
                onChange={(event) => setTargetGrade(event.target.value)}
                maxLength={50}
                placeholder='For example: Grade 7'
                className='rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-white/15 dark:bg-[#101c31] dark:text-white dark:focus:ring-blue-900'
              />
            </label>
          )}

          {tool === 'quiz' && (
            <label className='flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200'>
              Difficulty
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
                className='rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500 dark:border-white/15 dark:bg-[#101c31] dark:text-white'
              >
                {['Easy', 'Medium', 'Hard'].map((level) => <option key={level}>{level}</option>)}
              </select>
            </label>
          )}

          <div className='flex items-end sm:col-span-2'>
            <button
              type='submit'
              disabled={!topic.trim() || isGenerating}
              className='inline-flex h-11 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Sparkles className='size-4' aria-hidden='true' />
              {isGenerating ? 'Preparing…' : details.button}
            </button>
          </div>
        </form>

        {savedActivities.length > 0 && (
          <label className='flex max-w-2xl flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200'>
            Saved {details.title.toLowerCase()}
            <select
              value={activityId}
              onChange={(event) => openSavedActivity(event.target.value)}
              className='rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal dark:border-white/15 dark:bg-[#101c31] dark:text-white'
            >
              <option value=''>Choose a saved item…</option>
              {savedActivities.map((activity) => {
                const date = new Date(activity.createdAt).toLocaleString()
                const scoreLabel = activity.score
                  ? ` · Score ${activity.score.correct}/${activity.score.total}`
                  : ''
                return <option key={activity.id} value={activity.id}>{activity.topic} · {date}{scoreLabel}</option>
              })}
            </select>
          </label>
        )}

        {isGenerating && <p className='text-sm text-slate-500 dark:text-slate-400' role='status'>AI Tutor is preparing this for you…</p>}
        {error && <p className='rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300' role='alert'>{error}</p>}

        {tool === 'quiz' && quizQuestions.length > 0 && (
          <div className='space-y-4'>
            {quizQuestions.map((item, index) => (
              <fieldset key={`${index}-${item.question}`} className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0c1528] sm:p-5'>
                <legend className='px-1 text-sm font-semibold text-slate-900 dark:text-white'>{index + 1}. {item.question}</legend>
                <div className='mt-3 space-y-2'>
                  {(item.options || []).map((option) => {
                    const correctAnswer = scoreResult?.correctAnswers?.[index]
                    const isCorrect = isSubmitted && option === correctAnswer
                    const isWrongChoice = isSubmitted && selectedAnswers[index] === option && !isCorrect
                    return (
                      <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${isCorrect ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200' : isWrongChoice ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200' : 'border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-200'}`}>
                        <input
                          type='radio'
                          name={`quiz-question-${index}`}
                          value={option}
                          checked={selectedAnswers[index] === option}
                          disabled={isSubmitted}
                          onChange={() => setSelectedAnswers((current) => ({ ...current, [index]: option }))}
                          className='accent-blue-700'
                        />
                        <span className='flex-1'>{option}</span>
                        {isCorrect && <CheckCircle2 className='size-4' aria-label='Correct answer' />}
                      </label>
                    )
                  })}
                </div>
                {isSubmitted && selectedAnswers[index] !== scoreResult?.correctAnswers?.[index] && (
                  <p className='mt-3 text-sm text-slate-600 dark:text-slate-300'>Correct answer: <strong>{scoreResult?.correctAnswers?.[index]}</strong></p>
                )}
              </fieldset>
            ))}
            {isSubmitted ? (
              <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/30'>
                <p className='font-semibold text-blue-900 dark:text-blue-100'>Your score: {scoreResult?.correct ?? score} out of {scoreResult?.total ?? quizQuestions.length}{scoreResult ? ` (${scoreResult.percentage}%)` : ''}</p>
                <button type='button' onClick={() => { setIsSubmitted(false); setScoreResult(null); setSelectedAnswers({}) }} className='inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-900/50'>
                  <RotateCcw className='size-4' aria-hidden='true' /> Try again
                </button>
              </div>
            ) : (
              <button
                type='button'
                disabled={Object.keys(selectedAnswers).length !== quizQuestions.length}
                onClick={checkAnswers}
                disabled={isScoring}
                className='rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isScoring ? 'Saving score…' : 'Check my answers'}
              </button>
            )}
          </div>
        )}

        {tool === 'flashcards' && flashcards.length > 0 && (
          <div className='grid gap-3 sm:grid-cols-2'>
            {flashcards.map((card, index) => (
              <button
                type='button'
                key={`${index}-${card.question}`}
                onClick={() => setRevealedCards((current) => ({ ...current, [index]: !current[index] }))}
                className='min-h-40 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-white/10 dark:bg-[#0c1528] dark:hover:border-blue-800'
                aria-expanded={Boolean(revealedCards[index])}
              >
                <span className='text-xs font-semibold tracking-wide text-blue-600 uppercase'>Card {index + 1} · {revealedCards[index] ? 'Answer' : 'Question'}</span>
                <span className='mt-3 block text-sm leading-6 text-slate-800 dark:text-slate-100'>{revealedCards[index] ? card.answer : card.question}</span>
                <span className='mt-4 block text-xs text-slate-400'>{revealedCards[index] ? 'Select to show question' : 'Select to reveal answer'}</span>
              </button>
            ))}
          </div>
        )}

        {(tool === 'lesson' || tool === 'study-plan') && typeof result === 'string' && (
          <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0c1528] sm:p-7'>
            <TextResult text={result} />
          </article>
        )}

        {tool === 'quiz' && result && !quizQuestions.length && (
          <p className='rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100'>The quiz could not be displayed. Please create it again.</p>
        )}
        {tool === 'flashcards' && result && !flashcards.length && (
          <p className='rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100'>The flashcards could not be displayed. Please create them again.</p>
        )}
        {(tool === 'lesson' || tool === 'study-plan') && result && typeof result !== 'string' && (
          <div className='rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100'>The result could not be displayed. Please generate it again.</div>
        )}
        {!result && !isGenerating && !error && (
          <div className='flex items-center gap-2 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-white/15 dark:text-slate-400'>
            {tool === 'quiz' ? <CircleHelp className='size-4' aria-hidden='true' /> : <BookOpen className='size-4' aria-hidden='true' />}
            Your generated {tool === 'study-plan' ? 'study plan' : tool} will appear here.
          </div>
        )}
      </div>
    </div>
  )
}

export default AiLearningTools

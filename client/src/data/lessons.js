/**
 * Static demo lessons for the dashboard timetable preview.
 * Dates are anchored to the current work week (Mon–Fri) so the grid stays populated.
 */

const startOfDay = (date) => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const startOfWeekMonday = (date = new Date()) => {
  const day = startOfDay(date)
  const weekday = day.getDay()
  const diff = weekday === 0 ? -6 : 1 - weekday
  return addDays(day, diff)
}

const atTime = (day, hour, minute = 0) => {
  const next = new Date(day)
  next.setHours(hour, minute, 0, 0)
  return next.toISOString()
}

/** [dayOffset 0=Mon..4=Fri, hour, minute, duration, subject, title?, className?] */
const SLOTS = [
  // Monday
  [0, 8, 0, 45, 'Math'],
  [0, 9, 0, 45, 'English'],
  [0, 10, 0, 45, 'Biology'],
  [0, 11, 0, 45, 'Physics'],
  [0, 13, 0, 45, 'Music'],
  [0, 14, 0, 45, 'Geography'],

  // Tuesday
  [1, 8, 0, 45, 'English'],
  [1, 9, 0, 45, 'Math'],
  [1, 10, 0, 45, 'Physics'],
  [1, 11, 0, 45, 'Chemistry'],
  [1, 13, 0, 45, 'History'],
  [1, 14, 0, 45, 'History'],

  // Wednesday
  [2, 8, 0, 45, 'Math'],
  [2, 9, 0, 45, 'English'],
  [2, 10, 0, 45, 'Chemistry'],
  [2, 11, 0, 45, 'Geography'],
  [2, 13, 0, 45, 'Physics'],
  [2, 14, 0, 45, 'Music'],

  // Thursday
  [3, 8, 0, 45, 'English'],
  [3, 9, 0, 45, 'Math'],
  [3, 10, 0, 45, 'English'],
  [3, 11, 0, 45, 'History'],
  [3, 13, 0, 45, 'Chemistry'],
  [3, 14, 0, 45, 'English'],

  // Friday
  [4, 8, 0, 45, 'Math'],
  [4, 9, 0, 45, 'English'],
  [4, 10, 0, 45, 'Music'],
  [4, 11, 0, 45, 'Chemistry'],
  [4, 13, 0, 45, 'Geography'],
  [4, 14, 0, 45, 'Biology'],
]

const buildDemoLessons = () => {
  const weekStart = startOfWeekMonday(new Date())

  return SLOTS.map(([dayOffset, hour, minute, duration, subject], index) => {
    const day = addDays(weekStart, dayOffset)
    return {
      id: `demo-lesson-${index + 1}`,
      title: subject,
      subject,
      courseName: subject,
      className: '4A',
      classCode: '4A',
      teacher: 'Demo Teacher',
      scheduledAt: atTime(day, hour, minute),
      durationMinutes: duration,
    }
  })
}

const demoLessons = buildDemoLessons()

export default demoLessons
export { buildDemoLessons }

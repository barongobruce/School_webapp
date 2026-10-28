const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

const mondayOf = (date) => {
  const day = new Date(date)
  day.setHours(0, 0, 0, 0)
  const offset = day.getDay() === 0 ? -6 : 1 - day.getDay()
  day.setDate(day.getDate() + offset)
  return day
}

const localDateTime = (date, time) => {
  const [hour, minute] = String(time || '00:00').split(':').map(Number)
  const result = new Date(date)
  result.setHours(hour, minute, 0, 0)
  return result.toISOString()
}

/**
 * The existing DashboardTimetable is date-based and allows navigation through
 * this week and next week. Recurring slots have no lesson IDs, so mark them as
 * timetable slots; DashboardTimetable renders them as non-links.
 */
export const toDashboardCalendarLessons = (entries = [], timetables = [], now = new Date()) => {
  const currentMonday = mondayOf(now)
  const dayOffset = Object.fromEntries(DAYS.map((day, index) => [day, index]))
  const classById = new Map(timetables.map((item) => [String(item.classId), item]))
  const result = []

  for (let week = 0; week <= 1; week += 1) {
    for (const entry of entries) {
      const offset = dayOffset[String(entry.dayOfWeek || '').toLowerCase()]
      if (offset === undefined) continue
      const date = new Date(currentMonday)
      date.setDate(date.getDate() + week * 7 + offset)
      const start = localDateTime(date, entry.startTime)
      const end = localDateTime(date, entry.endTime)
      const durationMinutes = Math.max((new Date(end) - new Date(start)) / 60000, 1)
      const timetable = classById.get(String(entry.classId))
      const name = entry.courseName || entry.label || (entry.slotType === 'lunch' ? 'Lunch' : 'Break')
      result.push({
        id: `timetable-${entry.id || `${entry.dayOfWeek}-${entry.startTime}-${entry.courseId || entry.slotType}`}-${week}`,
        isTimetableSlot: true,
        slotType: entry.slotType || 'lesson',
        title: name,
        subject: name,
        courseName: name,
        className: entry.className || timetable?.className || '',
        teacher: entry.teacherName || '',
        room: entry.room || '',
        scheduledAt: start,
        durationMinutes,
      })
    }
  }
  return result
}

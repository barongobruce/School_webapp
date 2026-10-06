import React, { useMemo } from 'react'
import { Save } from 'lucide-react'
import { updateLesson } from '../../../../../lib/lesson.requests'
import LessonForm, { lessonToFormValues } from './LessonForm'

const EditLesson = ({ lesson, onSuccess }) => {
  const initialValues = useMemo(() => lessonToFormValues(lesson), [lesson])

  return (
    <LessonForm
      initialValues={initialValues}
      submitLabel='Save changes'
      submitIcon={Save}
      onSubmit={async (payload) => {
        await updateLesson(lesson._id || lesson.id, payload)
        onSuccess?.()
      }}
    />
  )
}

export default EditLesson

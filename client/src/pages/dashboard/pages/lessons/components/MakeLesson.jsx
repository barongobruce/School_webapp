import React from 'react'
import { FilePlus2 } from 'lucide-react'
import { createLesson } from '../../../../../lib/lesson.requests'
import LessonForm, { emptyLessonForm } from './LessonForm'

const MakeLesson = ({ onSuccess }) => (
  <LessonForm
    initialValues={emptyLessonForm}
    submitLabel='Create lesson'
    submitIcon={FilePlus2}
    onSubmit={async (payload) => {
      await createLesson(payload)
      onSuccess?.()
    }}
  />
)

export default MakeLesson

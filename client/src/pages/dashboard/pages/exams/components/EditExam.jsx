import React, { useMemo } from 'react'
import { Save } from 'lucide-react'
import { updateExam } from '../../../../../lib/exam.requests'
import ExamForm, { examToFormValues } from './ExamForm'

const EditExam = ({ exam, onSuccess }) => {
  const initialValues = useMemo(() => examToFormValues(exam), [exam])

  return (
    <ExamForm
      initialValues={initialValues}
      submitLabel='Save changes'
      submitIcon={Save}
      onSubmit={async (payload) => {
        await updateExam(exam._id || exam.id, payload)
        onSuccess?.()
      }}
    />
  )
}

export default EditExam

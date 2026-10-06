import React from 'react'
import { FilePlus2 } from 'lucide-react'
import { createExam } from '../../../../../lib/exam.requests'
import ExamForm, { emptyExamForm } from './ExamForm'

const MakeExam = ({ onSuccess }) => (
  <ExamForm
    initialValues={emptyExamForm}
    submitLabel='Schedule exam'
    submitIcon={FilePlus2}
    onSubmit={async (payload) => {
      await createExam(payload)
      onSuccess?.()
    }}
  />
)

export default MakeExam

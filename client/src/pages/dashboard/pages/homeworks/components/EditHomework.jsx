import React, { useMemo } from 'react'
import { Save } from 'lucide-react'
import { updateHomework } from '../../../../../lib/homework.requests'
import HomeworkForm, { homeworkToFormValues } from './HomeworkForm'

const EditHomework = ({ homework, onSuccess }) => {
  const initialValues = useMemo(
    () => homeworkToFormValues(homework),
    [homework],
  )

  return (
    <HomeworkForm
      initialValues={initialValues}
      submitLabel='Save changes'
      submitIcon={Save}
      onSubmit={async (payload) => {
        await updateHomework(homework._id || homework.id, payload)
        onSuccess?.()
      }}
    />
  )
}

export default EditHomework

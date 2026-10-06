import React from 'react'
import { FilePlus2 } from 'lucide-react'
import { createHomework } from '../../../../../lib/homework.requests'
import HomeworkForm, { emptyHomeworkForm } from './HomeworkForm'

const MakeHomework = ({ onSuccess }) => (
  <HomeworkForm
    initialValues={emptyHomeworkForm}
    submitLabel='Create homework'
    submitIcon={FilePlus2}
    onSubmit={async (payload) => {
      await createHomework(payload)
      onSuccess?.()
    }}
  />
)

export default MakeHomework

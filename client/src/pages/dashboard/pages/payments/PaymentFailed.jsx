import React, { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertTriangle, LoaderCircle, RotateCcw } from 'lucide-react'
import Button from '../../../../components/Button'
import { checkoutPayment } from '../../../../lib/payment.requests'

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }

const reasonCopy = {
  cancelled: {
    title: 'Payment cancelled',
    body: 'You left Stripe checkout before the payment was completed. No charge was made.',
  },
  incomplete: {
    title: 'Payment incomplete',
    body: 'The checkout finished without a confirmed payment. You can try again when ready.',
  },
  failed: {
    title: 'Payment failed',
    body: 'Stripe could not complete this payment. Check your card details or try another method.',
  },
  error: {
    title: 'Payment interrupted',
    body: 'Something went wrong while returning from Stripe. Your invoice may still be unpaid.',
  },
}

const PaymentFailed = () => {
  const [searchParams] = useSearchParams()
  const paymentId = searchParams.get('payment_id') || ''
  const reason = searchParams.get('reason') || 'cancelled'

  const copy = useMemo(
    () => reasonCopy[reason] || reasonCopy.cancelled,
    [reason],
  )

  const [isRetrying, setIsRetrying] = useState(false)
  const [retryError, setRetryError] = useState('')

  const handleRetry = async () => {
    if (!paymentId) return
    setRetryError('')
    setIsRetrying(true)
    try {
      const data = await checkoutPayment(paymentId)
      if (data.url) {
        window.location.assign(data.url)
        return
      }
      setRetryError('Could not start a new checkout session.')
    } catch (err) {
      setRetryError(err.message || 'Could not retry payment.')
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <section className='flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-3 py-8 sm:px-4'>
      <div
        className='w-full max-w-lg bg-white px-6 py-8 text-center shadow-[var(--shadow-soft)] dark:bg-[#152238] sm:px-8'
        style={cardRadius}
      >
        <span className='mx-auto grid size-14 place-items-center rounded-[1.2rem_0.4rem_1.2rem_0.4rem] bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'>
          <AlertTriangle className='size-7' strokeWidth={1.75} />
        </span>

        <h1 className='mt-4 text-[22px] font-semibold tracking-tight text-gray-900 dark:text-white'>
          {copy.title}
        </h1>
        <p className='mt-2 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400'>
          {copy.body}
        </p>

        {retryError ? (
          <p className='mt-4 text-[13px] text-rose-600 dark:text-rose-400'>
            {retryError}
          </p>
        ) : null}

        <div className='mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center'>
          {paymentId ? (
            <Button
              type='button'
              variant='primary'
              size='sm'
              disabled={isRetrying}
              onClick={handleRetry}
            >
              {isRetrying ? (
                <>
                  <LoaderCircle className='size-3.5 animate-spin' />
                  Opening Stripe…
                </>
              ) : (
                <>
                  <RotateCcw className='size-3.5' strokeWidth={1.75} />
                  Try again
                </>
              )}
            </Button>
          ) : null}
          <Button to='/dashboard/payments' variant='outline' size='sm'>
            Back to payments
          </Button>
        </div>

        <p className='mt-5 text-[12px] text-gray-400 dark:text-gray-500'>
          Need help? Return to your{' '}
          <Link
            to='/dashboard'
            className='font-medium text-blue-600 hover:underline dark:text-blue-400'
          >
            dashboard
          </Link>{' '}
          or contact the school office.
        </p>
      </div>
    </section>
  )
}

export default PaymentFailed

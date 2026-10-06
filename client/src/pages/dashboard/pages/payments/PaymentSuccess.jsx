import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, LoaderCircle, Receipt, XCircle } from 'lucide-react'
import Button from '../../../../components/Button'
import { confirmCheckoutSession } from '../../../../lib/payment.requests'

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }

const formatCurrency = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount || 0)
  } catch {
    return `USD ${Number(amount || 0).toFixed(2)}`
  }
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id') || ''

  const [status, setStatus] = useState('loading')
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const confirm = async () => {
      if (!sessionId) {
        setStatus('error')
        setError('Missing checkout session. Return to payments and try again.')
        return
      }

      try {
        const data = await confirmCheckoutSession(sessionId)
        if (cancelled) return

        setPayment(data.payment || null)
        setStatus(data.paid ? 'success' : 'incomplete')
        if (!data.paid) {
          setError(
            'Stripe has not marked this checkout as paid yet. If you were charged, refresh in a moment or check Payments.',
          )
        }
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        setError(err.message || 'Could not confirm payment.')
      }
    }

    confirm()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  return (
    <section className='flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-3 py-8 sm:px-4'>
      <div
        className='w-full max-w-lg bg-white px-6 py-8 text-center shadow-[var(--shadow-soft)] dark:bg-[#152238] sm:px-8'
        style={cardRadius}
      >
        {status === 'loading' ? (
          <>
            <LoaderCircle
              className='mx-auto size-10 animate-spin text-blue-600 dark:text-blue-400'
              strokeWidth={1.5}
            />
            <h1 className='mt-4 text-[20px] font-semibold tracking-tight text-gray-900 dark:text-white'>
              Confirming payment…
            </h1>
            <p className='mt-2 text-[13px] text-gray-500 dark:text-gray-400'>
              Please wait while we verify your Stripe checkout.
            </p>
          </>
        ) : null}

        {status === 'success' ? (
          <>
            <span className='mx-auto grid size-14 place-items-center rounded-[1.2rem_0.4rem_1.2rem_0.4rem] bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'>
              <CheckCircle2 className='size-7' strokeWidth={1.75} />
            </span>
            <h1 className='mt-4 text-[22px] font-semibold tracking-tight text-gray-900 dark:text-white'>
              Payment successful
            </h1>
            <p className='mt-2 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400'>
              Thank you. Your invoice
              {payment?.student?.name
                ? ` for ${payment.student.name}`
                : ''}{' '}
              has been paid.
            </p>

            {payment ? (
              <div className='mt-6 rounded-[1.1rem_0.35rem_1.1rem_0.35rem] border border-gray-100 bg-gray-50 px-4 py-4 text-left dark:border-white/8 dark:bg-white/5'>
                <div className='flex items-start gap-3'>
                  <Receipt
                    className='mt-0.5 size-4 shrink-0 text-gray-400'
                    strokeWidth={1.75}
                  />
                  <div className='min-w-0 flex-1'>
                    <p className='text-[13px] font-semibold text-gray-900 dark:text-white'>
                      {payment.title || payment.feeType}
                    </p>
                    <p className='mt-1 text-[12px] text-gray-500 dark:text-gray-400'>
                      {[payment.feeType, payment.term, payment.academicYear]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <p className='mt-3 text-[16px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400'>
                      {formatCurrency(payment.amountPaid || payment.amount, payment.currency)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className='mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center'>
              <Button to='/dashboard/payments' variant='primary' size='sm'>
                Back to payments
              </Button>
              <Button to='/dashboard' variant='outline' size='sm'>
                Dashboard
              </Button>
            </div>
          </>
        ) : null}

        {status === 'incomplete' || status === 'error' ? (
          <>
            <span className='mx-auto grid size-14 place-items-center rounded-[1.2rem_0.4rem_1.2rem_0.4rem] bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'>
              <XCircle className='size-7' strokeWidth={1.75} />
            </span>
            <h1 className='mt-4 text-[22px] font-semibold tracking-tight text-gray-900 dark:text-white'>
              {status === 'incomplete'
                ? 'Payment not confirmed'
                : 'Something went wrong'}
            </h1>
            <p className='mt-2 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400'>
              {error || 'We could not confirm this payment.'}
            </p>
            <div className='mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center'>
              <Button to='/dashboard/payments' variant='primary' size='sm'>
                View payments
              </Button>
              <Button
                to={
                  payment?.id
                    ? `/dashboard/payments/failed?payment_id=${payment.id}&reason=incomplete`
                    : '/dashboard/payments/failed?reason=error'
                }
                variant='outline'
                size='sm'
              >
                Payment help
              </Button>
            </div>
            <p className='mt-4 text-[12px] text-gray-400 dark:text-gray-500'>
              Or{' '}
              <Link
                to='/dashboard/payments'
                className='font-medium text-blue-600 hover:underline dark:text-blue-400'
              >
                return to payments
              </Link>
              .
            </p>
          </>
        ) : null}
      </div>
    </section>
  )
}

export default PaymentSuccess

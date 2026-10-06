import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import studentA from '../../../assets/student2.jpg'
import studentB from '../../../assets/graduate6.jpg'
import studentC from '../../../assets/student8.jpg'
import studentD from '../../../assets/graduate7.jpg'
import studentE from '../../../assets/student4.jpg'

const shellRadius = { borderRadius: '3rem 0.4rem 3rem 0.4rem' }
const stageRadius = { borderRadius: '3.25rem 0.45rem 3.25rem 0.45rem' }
const iconRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const controlRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }
const thumbRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const accentRadius = { borderRadius: '0.5rem 0.15rem 0.5rem 0.15rem' }

const testimonials = [
  {
    id: 'ama',
    quote:
      'My daughter came home excited about science for the first time. ADESUA did not just teach her — they lit something lasting.',
    name: 'Abena S.',
    role: 'Parent · Tema Campus',
    image: studentA,
  },
  {
    id: 'kofi',
    quote:
      'Teachers here notice the quiet students too. I went from shy in class to leading our debate team in one year.',
    name: 'Kofi A.',
    role: 'Student · High School',
    image: studentB,
  },
  {
    id: 'efua',
    quote:
      'Choosing ADESUA was the best decision we made. The care, the standards, and the community feel like family.',
    name: 'Efua D.',
    role: 'Parent · Koforidua',
    image: studentC,
  },
  {
    id: 'yaw',
    quote:
      'Alumni week reminded me how deep these roots go. The mentors I met here still answer when I call.',
    name: 'Yaw B.',
    role: 'Alumnus · Class of 2023',
    image: studentD,
  },
  {
    id: 'akosua',
    quote:
      'Every morning feels purposeful. Staff greet students by name — that small thing builds confidence you carry all day.',
    name: 'Akosua M.',
    role: 'Teacher · Greater Accra',
    image: studentE,
  },
]

const Testimonials = () => {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const current = testimonials[active]

  useEffect(() => {
    if (paused) return undefined
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % testimonials.length)
    }, 6500)
    return () => window.clearInterval(id)
  }, [paused])

  const go = (dir) => {
    setActive((i) => (i + dir + testimonials.length) % testimonials.length)
  }

  return (
    <section
      className='featured-panel relative w-full overflow-hidden py-20 md:py-28'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false)
      }}
    >
      <div className='container relative z-10'>
        <header className='mx-auto max-w-xl text-center'>
          <h2 className='font-heading text-[clamp(1.85rem,3.5vw,2.75rem)] font-black tracking-tight text-white'>
            Testimonials
          </h2>
          <p className='mt-2 text-sm font-semibold leading-relaxed text-white/90 md:text-base'>
            Honest words from parents, students, teachers, and alumni who live
            the ADESUA promise every day.
          </p>
        </header>

        <div className='relative mx-auto mt-12 max-w-5xl md:mt-16'>
          <div className='grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14'>
            {/* Portrait stage */}
            <div className='relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none'>
              <div
                aria-hidden='true'
                className='absolute -inset-3 bg-white/10'
                style={stageRadius}
              />
              <div
                className='relative aspect-[4/5] overflow-hidden bg-blue-900/40 shadow-[0_24px_60px_rgba(0,0,0,0.25)] ring-1 ring-white/15'
                style={shellRadius}
              >
                <AnimatePresence mode='wait'>
                  <motion.img
                    key={current.id}
                    src={current.image}
                    alt=''
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className='absolute inset-0 !h-full !w-full object-cover'
                  />
                </AnimatePresence>
                <div className='absolute inset-0 bg-gradient-to-t from-[#041536]/50 via-transparent to-transparent' />
                <div className='absolute right-4 bottom-4 left-4 flex items-end justify-between gap-3 lg:hidden'>
                  <div>
                    <p className='font-heading text-sm font-bold text-white'>
                      {current.name}
                    </p>
                    <p className='text-xs font-semibold text-white/80'>
                      {current.role}
                    </p>
                  </div>
                  <span className='text-[11px] font-semibold tracking-wider text-white/70'>
                    {String(active + 1).padStart(2, '0')}
                    <span className='text-white/40'>
                      /{String(testimonials.length).padStart(2, '0')}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quote content */}
            <div className='relative flex min-h-[14rem] flex-col justify-center text-center lg:min-h-[18rem] lg:text-left'>
              <span
                className='mx-auto mb-5 grid size-11 place-items-center bg-yellow-400 text-[#1a1a1a] shadow-[var(--shadow-soft)] lg:mx-0'
                style={iconRadius}
              >
                <Quote className='size-5' strokeWidth={2.25} />
              </span>

              <div aria-live='polite' aria-atomic='true'>
                <AnimatePresence mode='wait'>
                  <motion.figure
                    key={current.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <blockquote className='font-heading text-[clamp(1.25rem,2.8vw,1.85rem)] font-bold leading-snug tracking-tight text-white'>
                      “{current.quote}”
                    </blockquote>
                    <figcaption className='mt-8 hidden lg:block'>
                      <p className='font-heading text-base font-bold text-white'>
                        {current.name}
                      </p>
                      <p className='mt-1 text-sm font-semibold text-white/80'>
                        {current.role}
                      </p>
                      <div
                        className='mt-5 h-1 w-12 bg-yellow-400'
                        style={accentRadius}
                      />
                    </figcaption>
                  </motion.figure>
                </AnimatePresence>
              </div>

              {/* Progress */}
              <div className='mt-8 hidden items-center gap-3 lg:flex'>
                <span className='font-heading text-xs font-bold tracking-wide text-white'>
                  {String(active + 1).padStart(2, '0')}
                </span>
                <div className='h-px flex-1 overflow-hidden bg-white/20'>
                  <motion.div
                    key={current.id}
                    className='h-full bg-yellow-400'
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 6.5, ease: 'linear' }}
                  />
                </div>
                <span className='text-xs font-semibold text-white/70'>
                  {String(testimonials.length).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className='mt-12 flex items-center justify-center gap-4 md:mt-14'>
            <button
              type='button'
              onClick={() => go(-1)}
              aria-label='Previous testimonial'
              className='grid size-11 place-items-center border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
              style={controlRadius}
            >
              <ChevronLeft className='size-5' strokeWidth={1.75} />
            </button>

            <ul
              className='flex items-center gap-2.5'
              role='tablist'
              aria-label='Choose testimonial'
            >
              {testimonials.map((item, index) => {
                const isActive = index === active
                return (
                  <li key={item.id}>
                    <button
                      type='button'
                      role='tab'
                      aria-selected={isActive}
                      aria-label={`Show testimonial from ${item.name}`}
                      onClick={() => setActive(index)}
                      className={`overflow-hidden transition-all duration-300 ease-spring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                        isActive
                          ? 'size-12 shadow-[var(--shadow-brand)] ring-2 ring-white ring-offset-2 ring-offset-[#08214e] dark:ring-offset-[#041536]'
                          : 'size-9 opacity-50 hover:opacity-90'
                      }`}
                      style={thumbRadius}
                    >
                      <img
                        src={item.image}
                        alt=''
                        className='!h-full !w-full object-cover'
                      />
                    </button>
                  </li>
                )
              })}
            </ul>

            <button
              type='button'
              onClick={() => go(1)}
              aria-label='Next testimonial'
              className='grid size-11 place-items-center border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
              style={controlRadius}
            >
              <ChevronRight className='size-5' strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials

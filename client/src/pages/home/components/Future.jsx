import { Trophy, GraduationCap, Medal, Mic2 } from 'lucide-react'
import Button from '../../../components/Button'
import graduateImage from '../../../assets/graduate2.jpg'
import nsmqImage from '../../../assets/student3.jpg'
import athleticsImage from '../../../assets/activity1.jpg'
import debateImage from '../../../assets/student5.jpg'
import artsImage from '../../../assets/graduate4.jpg'

const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const iconRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }

const featured = {
  eyebrow: 'National champions',
  title: '2025 NSMQ Winners',
  description:
    'ADESUA took the National Science and Maths Quiz title — proof that curiosity, coaching, and grit open doors far beyond the classroom.',
  image: nsmqImage,
  imageAlt: 'ADESUA students celebrating academic excellence',
}

const achievements = [
  {
    icon: GraduationCap,
    title: 'Top WASSCE Class of 2025',
    description:
      'A record share of A1s and university placements across Ghana’s leading campuses.',
    image: graduateImage,
    imageAlt: 'Graduates in blue and gold',
  },
  {
    icon: Medal,
    title: 'Greater Accra Athletics Champions',
    description:
      'Track and field gold built on discipline, teamwork, and pride in school colors.',
    image: athleticsImage,
    imageAlt: 'Students in school activities',
  },
  {
    icon: Mic2,
    title: 'National Debate Champions',
    description:
      'Clear argument and composure that win on the national secondary stage.',
    image: debateImage,
    imageAlt: 'Student focused in study',
  },
  {
    icon: Trophy,
    title: 'Arts & Culture Grand Prize',
    description:
      'Dance, music, and drama ensembles celebrated at the National Cultural Festival.',
    image: artsImage,
    imageAlt: 'Students performing and celebrating',
  },
]

const Future = () => {
  return (
    <section className='relative w-full overflow-hidden bg-surface py-20 md:py-24'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.16),transparent_70%)]'
      />

      <div className='container relative'>
        <header className='mx-auto max-w-2xl text-center'>
          <h2 className='font-heading text-[clamp(1.85rem,3.5vw,2.75rem)] font-black tracking-tight text-ink'>
            Your Child's Future is Bright!
          </h2>
          <p className='text-sm font-semibold leading-relaxed text-muted md:text-base'>
            From national quiz titles to WASSCE excellence, athletics, debate,
            robotics, and the arts — recent wins at ADESUA Academy show what your
            child can achieve here.
          </p>
        </header>

        {/* Featured achievement */}
        <article className='mt-14 grid overflow-hidden rounded-3xl border border-line shadow-[var(--shadow-soft)] lg:grid-cols-2'>
          <div className='relative min-h-[18rem] lg:min-h-[26rem]'>
            <img
              src={featured.image}
              alt={featured.imageAlt}
              className='absolute inset-0 !h-full !w-full object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-[#08214e]/85 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#08214e]/55' />
          </div>
          <div className='featured-panel relative flex flex-col justify-center px-8 py-10 text-white sm:px-10 md:px-12 md:py-14'>
            <div className='relative z-10'>
              <span
                className='inline-flex w-fit items-center gap-2 border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-yellow-300 backdrop-blur-sm'
                style={chipRadius}
              >
                <Trophy className='size-3.5' strokeWidth={2} />
                {featured.eyebrow}
              </span>
              <h3 className='font-heading mt-5 text-3xl font-black tracking-tight md:text-4xl'>
                {featured.title}
              </h3>
              <p className='mt-4 max-w-md text-sm font-semibold leading-relaxed text-white/90 md:text-base'>
                {featured.description}
              </p>
              <div className='mt-8'>
                <Button
                  to='/programs'
                  size='lg'
                  variant='secondary'
                  className='border-transparent bg-white !text-[#1a1a1a] hover:bg-white/90'
                >
                  Explore our programs
                </Button>
              </div>
            </div>
          </div>
        </article>

        {/* Supporting achievements */}
        <ul className='mt-8 grid gap-5 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-6'>
          {achievements.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.title} className='group flex flex-col'>
                <div className='relative aspect-[4/5] overflow-hidden rounded-2xl bg-blue-100 shadow-[0_16px_40px_rgba(8,33,78,0.12)] dark:bg-blue-950 dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)]'>
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    className='!h-full !w-full object-cover transition-transform duration-500 ease-spring group-hover:scale-[1.04]'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-[#08214e]/75 via-[#08214e]/10 to-transparent' />
                  <span
                    className='absolute top-4 left-4 grid size-10 place-items-center bg-white/95 text-blue-700 shadow-[var(--shadow-soft)] dark:bg-[#0c1528]/95 dark:text-blue-300'
                    style={iconRadius}
                  >
                    <Icon className='size-5' strokeWidth={1.75} />
                  </span>
                </div>
                <h4 className='font-heading mt-4 text-base font-bold tracking-tight text-ink md:text-lg'>
                  {item.title}
                </h4>
                <p className='mt-1.5 text-xs font-semibold leading-relaxed text-muted md:text-sm'>
                  {item.description}
                </p>
              </li>
            )
          })}
        </ul>

        <div className='mt-14 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center'>
          <p className='text-xs font-semibold text-muted md:text-sm'>
            Ready to write the next chapter here?
          </p>
          <Button to='/contact' size='lg'>
            Enroll Now
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Future

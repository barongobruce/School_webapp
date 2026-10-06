import { Quote } from 'lucide-react'
import Button from '../../../components/Button'
import CommunityImage1 from '../../../assets/graduate5.jpg'
import CommunityImage2 from '../../../assets/student1.jpg'
import CommunityImage3 from '../../../assets/graduate3.jpg'

const shellRadius = { borderRadius: '3rem 0.4rem 3rem 0.4rem' }
const mediaRadius = { borderRadius: '1.75rem 0.3rem 1.75rem 0.3rem' }

const featured = {
  eyebrow: 'Student voice',
  title: 'A place where belief becomes belonging',
  quote:
    'ADESUA helped me grow academically and emotionally. Even when I doubted myself, teachers and staff kept encouraging me — and those opportunities opened doors I never thought I would walk through.',
  name: 'Ama K.',
  detail: 'Alumna · University of Ghana, Class of 2025',
  image: CommunityImage1,
  imageAlt: 'ADESUA Academy student at her desk',
}

const voices = [
  {
    title: 'Teachers who stay present',
    quote:
      'What sets ADESUA apart is how closely teachers know each learner. Support here is personal, steady, and built for every child’s next step.',
    name: 'Kwame O.',
    detail: 'Parent · Greater Accra',
    image: CommunityImage2,
    imageAlt: 'ADESUA Academy student in school',
  },
  {
    title: 'Alumni who keep rising',
    quote:
      'The habits I built here — discipline, curiosity, and community — still guide me. ADESUA does not just prepare you for exams; it prepares you for life.',
    name: 'Efua M.',
    detail: 'Alumna · KNUST, Class of 2024',
    image: CommunityImage3,
    imageAlt: 'ADESUA Academy graduate with a book',
  },
]

const OurCommunity = () => {
  return (
    <section className='relative w-full overflow-hidden bg-surface py-20 md:py-24'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.07),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.16),transparent_70%)]'
      />

      <div className='container relative'>
        <header className='mx-auto max-w-2xl text-center'>
          <h2 className='font-heading text-[clamp(1.85rem,3.5vw,2.75rem)] font-black tracking-tight text-ink'>
            Become Part of Our Community
          </h2>
          <p className='text-sm font-semibold leading-relaxed text-muted md:text-base'>
            Families, teachers, and alumni share one promise — every child is
            seen, stretched, and supported toward a brighter tomorrow.
          </p>
        </header>

        {/* Featured voice */}
        <article className='mt-14 grid items-center gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16'>
          <div
            className='group relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden bg-blue-100 shadow-[0_20px_50px_rgba(8,33,78,0.12)] dark:bg-blue-950 dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] lg:mx-0 lg:max-w-none'
            style={shellRadius}
          >
            <img
              src={featured.image}
              alt={featured.imageAlt}
              className='!h-full !w-full object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.03]'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-[#08214e]/45 via-transparent to-transparent' />
          </div>

          <div className='flex flex-col text-center lg:text-left'>
            <span className='inline-flex items-center justify-center gap-2 self-center text-[11px] font-semibold tracking-[0.16em] text-blue-700 uppercase dark:text-blue-300 lg:justify-start lg:self-start'>
              <Quote className='size-3.5 text-yellow-500' strokeWidth={2.5} />
              {featured.eyebrow}
            </span>
            <h3 className='font-heading mt-4 text-2xl font-black tracking-tight text-ink md:text-3xl'>
              {featured.title}
            </h3>
            <blockquote className='mt-5 text-sm font-semibold leading-relaxed text-ink md:text-base'>
              “{featured.quote}”
            </blockquote>
            <footer className='mt-6'>
              <p className='font-heading text-sm font-bold text-ink'>
                {featured.name}
              </p>
              <p className='mt-0.5 text-xs font-semibold text-muted md:text-sm'>
                {featured.detail}
              </p>
            </footer>
            <div className='mt-8 flex justify-center lg:justify-start'>
              <Button to='/contact' size='lg'>
                Join our community
              </Button>
            </div>
          </div>
        </article>

        {/* Supporting voices */}
        <ul className='mt-16 grid gap-12 border-t border-line pt-14 sm:mt-20 sm:pt-16 md:grid-cols-2 md:gap-10 lg:gap-16'>
          {voices.map((voice) => (
            <li key={voice.title} className='group flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-7'>
              <div
                className='mx-auto aspect-square w-28 shrink-0 overflow-hidden bg-blue-100 shadow-[var(--shadow-soft)] dark:bg-blue-950 sm:mx-0 sm:w-32'
                style={mediaRadius}
              >
                <img
                  src={voice.image}
                  alt={voice.imageAlt}
                  className='!h-full !w-full object-cover transition-transform duration-500 ease-spring group-hover:scale-[1.04]'
                />
              </div>
              <div className='min-w-0 flex-1 text-center sm:text-left'>
                <h4 className='font-heading text-lg font-bold tracking-tight text-ink'>
                  {voice.title}
                </h4>
                <blockquote className='mt-2 text-sm font-semibold leading-relaxed text-ink'>
                  “{voice.quote}”
                </blockquote>
                <footer className='mt-4'>
                  <p className='text-sm font-bold text-ink'>{voice.name}</p>
                  <p className='mt-0.5 text-xs font-semibold text-muted'>
                    {voice.detail}
                  </p>
                </footer>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default OurCommunity

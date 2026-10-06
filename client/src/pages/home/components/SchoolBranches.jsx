import { useState } from 'react'
import {
  MapPin,
  Phone,
  GraduationCap,
  BookOpen,
  School,
  ArrowUpRight,
} from 'lucide-react'
import Button from '../../../components/Button'
import { cn } from '../../../lib/utils'

const levelIcons = {
  elementary: School,
  middle: BookOpen,
  high: GraduationCap,
}

const iconRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const rowRadius = { borderRadius: '1.2rem 0.4rem 1.2rem 0.4rem' }
const tabRadius = { borderRadius: '1.4rem 0.45rem 1.4rem 0.45rem' }

const schoolBranchesData = [
  {
    id: 'accra',
    region: 'Greater Accra',
    cities: 'Tema & Accra',
    schools: [
      {
        level: 'elementary',
        name: 'Egator Elementary School',
        phone: '(233) 123-456789',
        tel: '+233123456789',
      },
      {
        level: 'middle',
        name: 'Egator Middle School',
        phone: '(233) 123-456789',
        tel: '+233123456789',
      },
      {
        level: 'high',
        name: 'Egator High School',
        phone: '(233) 123-456789',
        tel: '+233123456789',
      },
    ],
  },
  {
    id: 'volta',
    region: 'Volta Region',
    cities: 'Keta',
    schools: [
      {
        level: 'elementary',
        name: 'Volta Elementary School',
        phone: '(233) 123-456789',
        tel: '+233123456789',
      },
      {
        level: 'middle',
        name: 'Volta Middle School',
        phone: '(233) 123-456789',
        tel: '+233123456789',
      },
      {
        level: 'high',
        name: 'Volta High School',
        phone: '(233) 123-456789',
        tel: '+233123456789',
      },
    ],
  },
  {
    id: 'eastern',
    region: 'Eastern Region',
    cities: 'Koforidua',
    schools: [
      {
        level: 'elementary',
        name: 'Koftown Elementary School',
        phone: '(233) 123-456789',
        tel: '+233123456789',
      },
      {
        level: 'middle',
        name: 'Koftown Middle School',
        phone: '(233) 123-456789',
        tel: '+233123456789',
      },
      {
        level: 'high',
        name: 'Koftown High School',
        phone: '(233) 123-456789',
        tel: '+233123456789',
      },
    ],
  },
]

const SchoolBranches = () => {
  const [activeId, setActiveId] = useState(schoolBranchesData[0].id)
  const activeBranch =
    schoolBranchesData.find((b) => b.id === activeId) ?? schoolBranchesData[0]

  return (
    <section className='relative w-full overflow-hidden brand-atmosphere py-20 md:py-28'>
      <div className='container relative z-10'>
        <header className='mx-auto max-w-2xl text-center'>
          <h2 className='font-heading text-[clamp(1.85rem,3.5vw,2.75rem)] font-black tracking-tight text-white'>
            Campuses Across Ghana
          </h2>
          <p className='text-sm font-semibold leading-relaxed text-white/90 md:text-base'>
            Joyful, high-quality schools from transitional kindergarten to
            tertiary — serving families in Greater Accra, Volta, and the Eastern
            Region.
          </p>
        </header>

        {/* Region selector — desktop: all visible; mobile: tabs */}
        <div className='mt-12 md:mt-16'>
          <div
            role='tablist'
            aria-label='School regions'
            className='flex gap-1 overflow-x-auto pb-1 md:hidden'
          >
            {schoolBranchesData.map((branch) => (
              <button
                key={branch.id}
                type='button'
                role='tab'
                aria-selected={activeId === branch.id}
                onClick={() => setActiveId(branch.id)}
                className={cn(
                  'shrink-0 px-4 py-2.5 text-sm font-semibold tracking-tight transition-colors duration-200 ease-spring',
                  activeId === branch.id
                    ? 'bg-white text-blue-800 shadow-[var(--shadow-soft)]'
                    : 'text-white/65 hover:text-white',
                )}
                style={tabRadius}
              >
                {branch.region}
              </button>
            ))}
          </div>

          {/* Mobile: active region panel */}
          <div
            role='tabpanel'
            className='mt-6 md:hidden'
            key={activeBranch.id}
          >
            <RegionPanel branch={activeBranch} animate />
          </div>

          {/* Desktop: all regions */}
          <ul className='hidden gap-8 md:grid md:grid-cols-3 lg:gap-10'>
            {schoolBranchesData.map((branch, index) => (
              <li
                key={branch.id}
                className='opacity-0 animate-[branchFadeIn_0.55s_var(--ease-spring)_forwards]'
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <RegionPanel branch={branch} />
              </li>
            ))}
          </ul>
        </div>

        <div className='mt-14 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center'>
          <p className='text-xs font-semibold text-white/90 md:text-sm'>
            Not sure which campus fits your family?
          </p>
          <Button
            to='/contact'
            size='lg'
            variant='secondary'
            className='border-transparent bg-white !text-[#1a1a1a] hover:bg-white/90'
          >
            Talk to admissions
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes branchFadeIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes schoolRowIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  )
}

function RegionPanel({ branch, animate = false }) {
  return (
    <div>
      <div className='mb-5 flex items-start gap-3'>
        <span
          className='mt-0.5 grid size-10 shrink-0 place-items-center bg-white/15 text-yellow-300 ring-1 ring-white/20'
          style={iconRadius}
        >
          <MapPin className='size-5' strokeWidth={2} />
        </span>
        <div>
          <h3 className='font-heading text-xl font-black tracking-tight text-white'>
            {branch.region}
          </h3>
          <p className='mt-0.5 text-xs font-semibold text-white/90'>{branch.cities}</p>
        </div>
      </div>

      <ul className='flex flex-col'>
        {branch.schools.map((school, i) => {
          const Icon = levelIcons[school.level] ?? School
          return (
            <li
              key={school.name}
              className={cn(
                'border-t border-white/10 first:border-t-0',
                animate &&
                  'opacity-0 animate-[schoolRowIn_0.4s_var(--ease-spring)_forwards]',
              )}
              style={animate ? { animationDelay: `${i * 70}ms` } : undefined}
            >
              <a
                href={`tel:${school.tel}`}
                className='group flex items-center gap-4 py-4 transition-colors duration-200 ease-spring hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 md:px-3'
                style={rowRadius}
              >
                <span
                  className='grid size-11 shrink-0 place-items-center bg-yellow-400 text-[#1a1a1a] transition-transform duration-300 ease-spring group-hover:scale-105'
                  style={iconRadius}
                >
                  <Icon className='size-5' strokeWidth={1.75} />
                </span>
                <div className='min-w-0 flex-1 text-left'>
                  <h4 className='font-heading truncate text-[15px] font-bold tracking-tight text-white md:text-base'>
                    {school.name}
                  </h4>
                  <p className='mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-white/90'>
                    <Phone className='size-3.5 shrink-0' strokeWidth={2} />
                    {school.phone}
                  </p>
                </div>
                <ArrowUpRight
                  className='size-4 shrink-0 text-white/40 transition-all duration-300 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-yellow-300'
                  strokeWidth={2}
                />
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default SchoolBranches

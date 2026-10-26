import { motion } from 'framer-motion'
import {
    BookOpen,
    Bot,
    CalendarDays,
    Drama,
    Flag,
    HeartHandshake,
    Music4,
    Sparkles,
    Trophy,
    Users,
    Volleyball,
} from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'

import ActivitiesHeaderImage from '../../assets/header5.jpg'
import SportsImage from '../../assets/New folder/pexels-cottonbro-7318726.jpg'
import ArtsImage from '../../assets/New folder/activity2.jpg'
import ClubsImage from '../../assets/New folder/pexels-tima-miroshnichenko-9572726.jpg'
import LeadershipImage from '../../assets/New folder/pexels-zen-chung-5537533.jpg'
import DramaImage from '../../assets/New folder/DramaImage.jpg'
import ChristianUnionImage from "../../assets/Christian-Union.jpg";


/* ------------------------------------------------------------------ */
/* Radii — TL · TR · BR · BL                                           */
/* ------------------------------------------------------------------ */

const radius = {
    icon: { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' },
    chip: { borderRadius: '1.2rem 0.4rem 1.2rem 0.4rem' },
    card: { borderRadius: '2.2rem 0.4rem 2.2rem 0.4rem' },
    panel: { borderRadius: '3rem 0.5rem 3rem 0.5rem' },
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const stats = [
    { value: '20+', label: 'Clubs, teams & ensembles' },
    { value: '100%', label: 'Of students in at least one activity' },
    { value: '4', label: 'Houses competing all year long' },
    { value: '12', label: 'Inter-school trophies since 2020' },
]

const pillars = [
    {
        title: 'Sports & Athletics',
        description:
            'Football, athletics, volleyball, and the dance squad — coached properly, played fairly, and celebrated loudly at inter-house and inter-school level.',
        image: SportsImage,
        imageAlt: 'Barongo Academy cheer and dance squad on the stands',
        tags: ['Football', 'Track & Field', 'Volleyball',],
    },
    {
        title: 'Creative & Performing Arts',
        description:
            'Choir, traditional drumming, drama, and open studio afternoons. Students who create learn to see — and to be seen.',
        image: ArtsImage,
        imageAlt: 'Young Barongo academy pupil drawing in the art studio',
        tags: ['Choir & Drumming', 'Drama', 'Art Studio', 'Spoken Word'],
    },
    {
        title: 'Clubs & Societies',
        description:
            'From robotics to readers, debate to chess — weekly sessions where curiosity gets time on the timetable and friendships form around ideas.',
        image: ClubsImage,
        imageAlt: 'Barongo  students working together in the library',
        tags: ['STEM & Robotics', 'Debate', 'Readers Guild', 'Chess'],
    },
 {
        title: 'Drama Club',
        description:
            'Formal drama training and performance opportunities for students interested in theatre.',
        image: DramaImage,
        imageAlt: 'Barongo  students working together in the library',
        tags: ['Dance squad', 'Spoken word', 'drumming',],
    },

    {
        title: 'Leadership & Service',
        description:
            'Prefectship, the student council, and service projects in every region we call home. Responsibility is not given at Barongo  — it is practised.',
        image: LeadershipImage,
        imageAlt: 'Barongo  student leader reviewing plans on a clipboard',
        tags: ['Student Council', 'Prefects', 'Community Service', 'Peer Mentoring'],
    },

    {
        title: 'Christian Union',
        description:
            'A vibrant community of students committed to living out their faith and serving others.',
        image: ChristianUnionImage,
        imageAlt: 'Barongo  students singing and praying together in a group',
        tags: ['Student Council', 'Prefects', 'Community Service', 'Peer Mentoring'],
    },
]

const terms = [
    {
        term: 'Term 1',
        months: 'September – December',
        events: [
            { icon: Users, name: 'Clubs & Societies Fair', detail: 'Every student explores and signs up' },
            { icon: Volleyball, name: 'Inter-house athletics heats', detail: 'Qualifiers for Sports Day' },
            { icon: BookOpen, name: 'Reading Week', detail: 'Guest authors and the house reading challenge' },
            { icon: Music4, name: 'End-of-term showcase', detail: 'Carols, choir, and drama previews' },
        ],
    },
    {
        term: 'Term 2',
        months: 'January – April',
        events: [
            { icon: Trophy, name: 'Inter-House Sports Day', detail: 'The biggest day on the calendar' },
            { icon: Bot, name: 'STEM fair & NSMQ season', detail: 'Projects, quizzes, and regional contests' },
            { icon: Drama, name: 'Cultural Festival', detail: 'Drumming, dance, and heritage displays' },
            { icon: Flag, name: 'Educational excursions', detail: 'Field trips for every division' },
        ],
    },
    {
        term: 'Term 3',
        months: 'May – August',
        events: [
            { icon: Sparkles, name: 'Our Day celebrations', detail: 'A joyful close to the academic year' },
            { icon: Trophy, name: 'Speech & Prize-Giving Day', detail: 'Honouring effort as much as results' },
            { icon: Drama, name: 'Annual drama production', detail: 'The theatre ensemble\u2019s main stage' },
            { icon: HeartHandshake, name: 'Community service week', detail: 'Student-led projects in all three regions' },
        ],
    },
]

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */

const fadeUp = {
    hidden: { opacity: 0, y: 26 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
}

const Reveal = ({ children, delay = 0, className }) => (
    <motion.div
        className={className}
        variants={fadeUp}
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-60px' }}
        transition={{ delay }}
    >
        {children}
    </motion.div>
)

const SectionHeading = ({ eyebrow, title, description, dark = false }) => (
    <Reveal className='mx-auto max-w-2xl text-center'>
        <span
            className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                dark ? 'text-yellow-300' : 'text-blue-700 dark:text-blue-300'
            }`}
        >
            <Sparkles className='size-3.5' strokeWidth={2.5} />
            {eyebrow}
        </span>
        <h2
            className={`font-heading mt-3 text-[clamp(1.85rem,3.5vw,2.75rem)] font-black tracking-tight ${
                dark ? 'text-white' : 'text-ink'
            }`}
        >
            {title}
        </h2>
        {description && (
            <p
                className={`mt-3 text-sm font-semibold leading-relaxed md:text-base ${
                    dark ? 'text-white/90' : 'text-muted'
                }`}
            >
                {description}
            </p>
        )}
    </Reveal>
)

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

const IntroSection = () => (
    <section className='relative w-full overflow-hidden bg-surface py-20 md:py-24'>
        <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.16),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.16),transparent_70%)]'
        />
        <div className='container relative'>
            <SectionHeading
                eyebrow='Life at BARONGO Academy'
                title='School does not end when the bell rings'
                description='Grades open doors; character walks through them. Our co-curricular program is where children find their voice, their team, and very often, their calling.'
            />

            <Reveal delay={0.1}>
                <dl className='mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-y-10 lg:grid-cols-4'>
                    {stats.map((stat) => (
                        <div key={stat.label} className='px-4 text-center'>
                            <dd className='font-heading text-3xl font-black tracking-tight text-blue-700 dark:text-blue-300 md:text-4xl'>
                                {stat.value}
                            </dd>
                            <dt className='mt-2 text-xs font-semibold text-muted md:text-sm'>
                                {stat.label}
                            </dt>
                        </div>
                    ))}
                </dl>
            </Reveal>
        </div>
    </section>
)

const PillarsSection = () => (
    <section className='relative w-full overflow-hidden bg-surface-2/60 py-20 md:py-24'>
        <div className='container relative'>
            <SectionHeading
                eyebrow='Our activities'
                title='Something for every kind of child'
                description='Sporty or bookish, loud or quietly observant — every student finds a place where effort is noticed and talent is grown.'
            />

            <div className='mt-14 grid gap-6 md:grid-cols-2'>
                {pillars.map((pillar, index) => (
                    <Reveal key={pillar.title} delay={0.06 * index} className='h-full'>
                        <article
                            className='group flex h-full flex-col overflow-hidden border border-line bg-surface shadow-[var(--shadow-soft)] transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(8,33,78,0.14)]'
                            style={radius.panel}
                        >
                            <div className='relative h-56 overflow-hidden sm:h-64'>
                                <img
                                    src={pillar.image}
                                    alt={pillar.imageAlt}
                                    className='!h-full !w-full object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.04]'
                                />
                                <div className='absolute inset-0 bg-gradient-to-t from-[#08214e]/60 via-transparent to-transparent' />
                                <h3 className='font-heading absolute bottom-5 left-6 text-xl font-black tracking-tight text-white md:text-2xl'>
                                    {pillar.title}
                                </h3>
                            </div>
                            <div className='flex flex-1 flex-col p-7'>
                                <p className='flex-1 text-sm font-semibold leading-relaxed text-muted md:text-base'>
                                    {pillar.description}
                                </p>
                                <div className='mt-5 flex flex-wrap gap-2'>
                                    {pillar.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className='border border-line bg-surface-2 px-3.5 py-1.5 text-xs font-semibold text-ink'
                                            style={radius.chip}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </article>
                    </Reveal>
                ))}
            </div>
        </div>
    </section>
)

const CalendarSection = () => (
    <section className='relative w-full overflow-hidden bg-surface py-20 md:py-24'>
        <div className='container relative'>
            <SectionHeading
                eyebrow='The year at a glance'
                title='A calendar worth looking forward to'
                description='Three terms, each with its own headline moments — so families can plan, and students always have something to work toward.'
            />

            <div className='mt-14 grid gap-6 md:grid-cols-3'>
                {terms.map((term, index) => (
                    <Reveal key={term.term} delay={0.06 * index} className='h-full'>
                        <article
                            className='flex h-full flex-col border border-line bg-surface p-8 shadow-[var(--shadow-soft)]'
                            style={radius.card}
                        >
                            <div className='flex items-center gap-3'>
                                <span
                                    className='brand-gradient grid size-11 place-items-center text-white shadow-[var(--shadow-brand)]'
                                    style={radius.icon}
                                >
                                    <CalendarDays className='size-5' strokeWidth={1.75} />
                                </span>
                                <div>
                                    <h3 className='font-heading text-lg font-bold tracking-tight text-ink'>
                                        {term.term}
                                    </h3>
                                    <p className='text-xs font-semibold uppercase tracking-[0.1em] text-blue-700 dark:text-blue-300'>
                                        {term.months}
                                    </p>
                                </div>
                            </div>
                            <ul className='mt-6 space-y-4 border-t border-line pt-6'>
                                {term.events.map((event) => {
                                    const Icon = event.icon
                                    return (
                                        <li key={event.name} className='flex items-start gap-3'>
                                            <span
                                                className='mt-0.5 grid size-8 shrink-0 place-items-center bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                                                style={radius.icon}
                                            >
                                                <Icon className='size-4' strokeWidth={2} />
                                            </span>
                                            <div>
                                                <p className='text-sm font-bold text-ink'>
                                                    {event.name}
                                                </p>
                                                <p className='text-xs font-semibold leading-relaxed text-muted'>
                                                    {event.detail}
                                                </p>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </article>
                    </Reveal>
                ))}
            </div>
        </div>
    </section>
)

const ClosingCta = () => (
    <section className='brand-atmosphere relative w-full overflow-hidden py-20 md:py-24'>
        <div className='container relative z-10'>
            <SectionHeading
                dark
                eyebrow='Come and see'
                title='Every child finds their thing here'
                description='Visit any campus on a club afternoon and watch it for yourself — or ask our team which activities fit your child best.'
            />

            <Reveal delay={0.12} className='mt-10 text-center'>
                <div className='flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center'>
                    <Button to='/contact' size='xl' variant='secondary' className='border-transparent bg-white !text-[#1a1a1a] hover:bg-white/90'>
                        Plan a visit
                    </Button>
                    <Button
                        to='/programs'
                        size='xl'
                        variant='outline'
                        className='border-white/25 text-white hover:bg-white/10'
                    >
                        Explore our programs
                    </Button>
                </div>
            </Reveal>
        </div>
    </section>
)

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const ActivitiesPage = () => {
    return (
        <main>
            <PageHeader
                title='Student Activities'
                description='Sports, clubs, houses, and the arts — the part of school your child will still be talking about at dinner.'
                backgroundImage={ActivitiesHeaderImage}
            />
            <IntroSection />
            <PillarsSection />
            <CalendarSection />
            <ClosingCta />
        </main>
    )
}

export default ActivitiesPage


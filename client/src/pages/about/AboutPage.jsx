import { motion } from 'framer-motion'
import {
    Award,
    Compass,
    GraduationCap,
    HeartHandshake,
    Lightbulb,
    MapPin,
    Quote,
    ShieldCheck,
    Sparkles,
    Target,
    Telescope,
    Users,
} from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'

import AboutHeaderImage from '../../assets/about-header.jpg'
import StoryImageA from '../../assets/student6.jpg'
import StoryImageB from '../../assets/activity1.jpg'
import HeadOfSchoolImage from '../../assets/board11.jpg'
import Board1 from '../../assets/board1.jpg'
import Board2 from '../../assets/board2.jpg'
import Board5 from '../../assets/board5.jpg'
import Board6 from '../../assets/board6.jpg'
import Board9 from '../../assets/board9.jpg'
import Board10 from '../../assets/board10.jpg'
import Staff3 from '../../assets/board3.jpg'
import Staff4 from '../../assets/board4.jpg'
import Staff7 from '../../assets/board7.jpg'
import Staff8 from '../../assets/board8.jpg'

/* ------------------------------------------------------------------ */
/* Radii — TL · TR · BR · BL                                           */
/* ------------------------------------------------------------------ */

const radius = {
    icon: { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' },
    chip: { borderRadius: '1.2rem 0.4rem 1.2rem 0.4rem' },
    media: { borderRadius: '1.8rem 0.35rem 1.8rem 0.35rem' },
    card: { borderRadius: '2.2rem 0.4rem 2.2rem 0.4rem' },
    panel: { borderRadius: '3rem 0.5rem 3rem 0.5rem' },
    frame: { borderRadius: '3.4rem 0.55rem 3.4rem 0.55rem' },
    dot: { borderRadius: '0.55rem 0.18rem 0.55rem 0.18rem' },
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const stats = [
    { value: '1998', label: 'Founded in Egator' },
    { value: '2,400+', label: 'Students across Ghana' },
    { value: '190+', label: 'Educators & mentors' },
    { value: '3', label: 'Campuses, nine schools' },
]

const values = [
    {
        icon: Users,
        title: 'Diversity',
        description:
            'Every background, faith, and ability is welcomed here — difference is something we learn from, not merely tolerate.',
    },
    {
        icon: Award,
        title: 'Quality & improvement',
        description:
            'We measure ourselves honestly, invest in our teachers, and refuse to let “good enough” be the standard for any child.',
    },
    {
        icon: HeartHandshake,
        title: 'Collegiality',
        description:
            'Teachers, families, and staff work as one team. When adults collaborate openly, children learn to do the same.',
    },
    {
        icon: Compass,
        title: 'Leadership',
        description:
            'From class prefects to quiz captains, every learner gets real responsibility — and the coaching to carry it well.',
    },
    {
        icon: ShieldCheck,
        title: 'Integrity',
        description:
            'We do the right thing when no one is watching, and we expect the same of every student who wears our colors.',
    },
    {
        icon: Lightbulb,
        title: 'Curiosity',
        description:
            'Questions are celebrated before answers. Wonder is the engine of every laboratory, library, and studio we run.',
    },
]

const boardMembers = [
    {
        image: Board1,
        name: 'Mr. Daniel Haddad',
        role: 'Chair of the Board',
        focus: 'Strategy & Governance',
    },
    {
        image: Board2,
        name: 'Mrs. Vera Ansah-Quaye',
        role: 'Vice Chair',
        focus: 'Academic Standards',
    },
    {
        image: Board5,
        name: 'Mrs. Isabella Fiadjoe',
        role: 'Trustee',
        focus: 'Finance & Audit',
    },
    {
        image: Board10,
        name: 'Mr. Thomas Reindorf',
        role: 'Trustee',
        focus: 'Legal & Compliance',
    },
    {
        image: Board6,
        name: 'Ms. Amina Suleiman',
        role: 'Trustee',
        focus: 'Community & Inclusion',
    },
    {
        image: Board9,
        name: 'Mr. Nathan Cheng',
        role: 'Trustee',
        focus: 'Technology & Innovation',
    },
]

const seniorStaff = [
    {
        image: Staff8,
        name: 'Ms. Selina Ho',
        role: 'Head of Guidance & Counselling',
        note: 'Champions student wellbeing across all three campuses.',
    },
    {
        image: Staff4,
        name: 'Coach Marco Vieira',
        role: 'Director of Athletics',
        note: 'Built the track programme behind our regional gold medals.',
    },
    {
        image: Staff3,
        name: 'Ms. Louisa Hammond',
        role: 'Director of Creative Arts',
        note: 'Leads the ensembles honored at the National Cultural Festival.',
    },
    {
        image: Staff7,
        name: 'Mr. Elias Darko',
        role: 'Head of Music & Performance',
        note: 'Turns first-time performers into confident stage presences.',
    },
]

const milestones = [
    {
        year: '1998',
        title: 'ADESUA opens its doors',
        description: 'One classroom in Egator, 42 students, and a promise to their parents.',
    },
    {
        year: '2008',
        title: 'Volta campus opens',
        description: 'Our second home brings elementary through high school to the Volta region.',
    },
    {
        year: '2016',
        title: 'Koftown campus opens',
        description: 'Three campuses, nine schools — one shared standard of care.',
    },
    {
        year: '2023',
        title: 'National debate title',
        description: 'Our debaters win on the national secondary stage for the first time.',
    },
    {
        year: '2025',
        title: 'NSMQ national champions',
        description: 'ADESUA lifts the National Science & Maths Quiz trophy.',
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

const StorySection = () => (
    <section className='relative w-full overflow-hidden bg-surface py-20 md:py-24'>
        <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.16),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.16),transparent_70%)]'
        />

        <div className='container relative'>
            <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-16'>
                <Reveal>
                    <span className='inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300'>
                        <Sparkles className='size-3.5' strokeWidth={2.5} />
                        Our story · Since 1998
                    </span>
                    <h2 className='font-heading mt-3 text-[clamp(1.85rem,3.5vw,2.75rem)] font-black leading-[1.1] tracking-tight text-ink'>
                        Rooted in Ghana,
                        <br />
                        built for the world.
                    </h2>
                    <p className='mt-5 text-sm font-semibold leading-relaxed text-ink md:text-base'>
                        ADESUA Academy began in 1998 with a single classroom in
                        Egator and a conviction our founders refused to
                        compromise: every child deserves teachers who know
                        their name, their story, and their potential.
                    </p>
                    <p className='mt-4 text-sm font-semibold leading-relaxed text-muted md:text-base'>
                        Nearly three decades later, that one classroom has
                        grown into three campuses and nine schools across
                        Ghana — yet the promise has not changed. We pair
                        rigorous academics with character formation, so our
                        graduates leave not only with results, but with
                        direction.
                    </p>
                    <div className='mt-8 flex flex-wrap items-center gap-3'>
                        <Button to='/programs' size='lg'>
                            Explore our programs
                        </Button>
                        <Button to='/contact' size='lg' variant='outline'>
                            Plan a campus visit
                        </Button>
                    </div>
                </Reveal>

                <Reveal delay={0.1} className='relative mx-auto w-full max-w-lg lg:max-w-none'>
                    <div className='grid grid-cols-[1.2fr_1fr] items-end gap-4 sm:gap-5'>
                        <div
                            className='group relative aspect-[4/5] overflow-hidden bg-blue-100 shadow-[0_20px_50px_rgba(8,33,78,0.14)] dark:bg-blue-950 dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] dark:bg-blue-950 dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]'
                            style={radius.panel}
                        >
                            <img
                                src={StoryImageA}
                                alt='ADESUA Academy student on campus'
                                className='!h-full !w-full object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.03]'
                            />
                            <div className='absolute inset-0 bg-gradient-to-t from-[#08214e]/40 via-transparent to-transparent' />
                        </div>
                        <div className='flex flex-col gap-4 sm:gap-5'>
                            <div
                                className='group relative aspect-square overflow-hidden bg-blue-100 shadow-[var(--shadow-soft)] dark:bg-blue-950'
                                style={radius.card}
                            >
                                <img
                                    src={StoryImageB}
                                    alt='ADESUA Academy students at play'
                                    className='!h-full !w-full object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.04]'
                                />
                            </div>
                            <div
                                className='brand-gradient flex flex-col justify-center px-6 py-6 text-white shadow-[var(--shadow-brand)]'
                                style={radius.card}
                            >
                                <span className='font-heading text-3xl font-black tracking-tight md:text-4xl'>
                                    27
                                </span>
                                <span className='mt-1 text-xs font-semibold leading-snug text-white/85'>
                                    years of shaping curious minds and strong
                                    character
                                </span>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>

            {/* Stats band */}
            <Reveal delay={0.15}>
                <dl
                    className='mt-16 grid grid-cols-2 gap-y-10 border border-line bg-surface px-6 py-10 shadow-[var(--shadow-soft)] sm:px-10 lg:mt-20 lg:grid-cols-4'
                    style={radius.panel}
                >
                    {stats.map((stat) => (
                        <div key={stat.label} className='text-center'>
                            <dd className='font-heading text-3xl font-black tracking-tight text-blue-800 dark:text-blue-300 md:text-4xl'>
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

const MissionVisionValues = () => (
    <section className='relative w-full overflow-hidden bg-surface-2/60 py-20 md:py-24'>
        <div className='container relative'>
            <SectionHeading
                eyebrow='What guides us'
                title='Mission, vision & the values in between'
                description='These are not wall posters. They are the standards every teacher, trustee, and student at ADESUA is held to.'
            />

            <div className='mt-14 grid gap-6 lg:grid-cols-2'>
                <Reveal className='h-full'>
                    <article
                        className='featured-panel relative flex h-full flex-col justify-center overflow-hidden px-8 py-10 text-white sm:px-10 md:py-12'
                        style={radius.panel}
                    >
                        <div className='relative z-10'>
                            <span
                                className='grid size-12 place-items-center bg-yellow-400 text-[#1a1a1a] shadow-[var(--shadow-soft)]'
                                style={radius.chip}
                            >
                                <Target className='size-6' strokeWidth={2} />
                            </span>
                            <h3 className='font-heading mt-6 text-2xl font-black tracking-tight md:text-3xl'>
                                Our mission
                            </h3>
                            <p className='mt-4 max-w-lg text-sm font-semibold leading-relaxed text-white/90 md:text-base'>
                                To give every child in our care a rigorous
                                education and an unshakeable sense of self —
                                nurturing curious minds, building strong
                                character, and preparing each learner to serve
                                their community and compete anywhere in the
                                world.
                            </p>
                        </div>
                    </article>
                </Reveal>

                <Reveal delay={0.1} className='h-full'>
                    <article
                        className='flex h-full flex-col justify-center border border-line bg-surface px-8 py-10 shadow-[var(--shadow-soft)] sm:px-10 md:py-12'
                        style={radius.panel}
                    >
                        <span
                            className='brand-gradient grid size-12 place-items-center text-white shadow-[var(--shadow-brand)]'
                            style={radius.chip}
                        >
                            <Telescope className='size-6' strokeWidth={2} />
                        </span>
                        <h3 className='font-heading mt-6 text-2xl font-black tracking-tight text-ink md:text-3xl'>
                            Our vision
                        </h3>
                        <p className='mt-4 max-w-lg text-sm font-semibold leading-relaxed text-ink md:text-base'>
                            To be West Africa’s most trusted family of schools —
                            a place where excellence is ordinary, kindness is
                            expected, and every graduate leaves ready to lead
                            with both competence and conscience.
                        </p>
                    </article>
                </Reveal>
            </div>

            <ul className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                {values.map((value, index) => {
                    const Icon = value.icon
                    return (
                        <Reveal
                            key={value.title}
                            delay={0.05 * index}
                            className='h-full'
                        >
                            <li
                                className='group flex h-full flex-col border border-line bg-surface p-7 shadow-[var(--shadow-soft)] transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(8,33,78,0.14)]'
                                style={radius.card}
                            >
                                <span
                                    className='grid size-11 place-items-center bg-blue-50 text-blue-700 transition-colors duration-300 group-hover:bg-blue-700 group-hover:text-white dark:bg-blue-500/15 dark:text-blue-300 dark:group-hover:bg-blue-600 dark:group-hover:text-white'
                                    style={radius.icon}
                                >
                                    <Icon className='size-5' strokeWidth={1.75} />
                                </span>
                                <h4 className='font-heading mt-5 text-lg font-bold tracking-tight text-ink'>
                                    {value.title}
                                </h4>
                                <p className='mt-2 text-sm font-semibold leading-relaxed text-muted'>
                                    {value.description}
                                </p>
                            </li>
                        </Reveal>
                    )
                })}
            </ul>
        </div>
    </section>
)

const HeadOfSchool = () => (
    <section className='featured-panel relative w-full overflow-hidden py-20 md:py-28'>
        <div className='container relative z-10'>
            <div className='grid items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16'>
                <Reveal className='relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none'>
                    <div
                        aria-hidden='true'
                        className='absolute -inset-3 bg-white/10'
                        style={radius.frame}
                    />
                    <div
                        className='relative aspect-[4/5] overflow-hidden bg-blue-900/40 shadow-[0_24px_60px_rgba(0,0,0,0.3)] ring-1 ring-white/15'
                        style={radius.panel}
                    >
                        <img
                            src={HeadOfSchoolImage}
                            alt='Dr. Naana Owusu-Ansah, Head of School at ADESUA Academy'
                            className='!h-full !w-full object-cover'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-[#041536]/60 via-transparent to-transparent' />
                        <div
                            className='absolute right-4 bottom-4 left-4 border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md'
                            style={radius.chip}
                        >
                            <p className='font-heading text-sm font-bold text-white'>
                                Dr. Naana Owusu-Ansah
                            </p>
                            <p className='text-xs font-semibold text-white/80'>
                                Head of School · Since 2015
                            </p>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={0.1}>
                    <span className='inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-300'>
                        <Quote className='size-3.5' strokeWidth={2.5} />
                        From the Head of School
                    </span>
                    <h2 className='font-heading mt-4 text-[clamp(1.75rem,3.2vw,2.5rem)] font-black leading-tight tracking-tight text-white'>
                        “Every child arrives with a spark. Our job is to
                        protect it, feed it, and hand it back brighter.”
                    </h2>
                    <div className='mt-6 space-y-4 text-sm font-semibold leading-relaxed text-white/90 md:text-base'>
                        <p>
                            When families entrust us with their children, they
                            are giving us the most important thing they have. I
                            never let our staff forget that. Behind every
                            trophy in our cabinet is a quieter victory — a shy
                            child who found their voice, a struggling reader
                            who now leads the library club.
                        </p>
                        <p>
                            I walk our corridors every morning, and what I hope
                            you would notice is not the results on the wall but
                            the way our people speak to children: with
                            patience, with high expectations, and with genuine
                            delight in who they are becoming.
                        </p>
                    </div>
                    <div className='mt-8 flex flex-wrap items-center gap-3'>
                        <span
                            className='inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm'
                            style={radius.chip}
                        >
                            <GraduationCap className='size-4' strokeWidth={2} />
                            Ed.D., Educational Leadership
                        </span>
                        <span
                            className='inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm'
                            style={radius.chip}
                        >
                            <MapPin className='size-4' strokeWidth={2} />
                            28 years in Ghanaian education
                        </span>
                    </div>
                </Reveal>
            </div>
        </div>
    </section>
)

const BoardSection = () => (
    <section className='relative w-full overflow-hidden bg-surface py-20 md:py-24'>
        <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.07),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.16),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.16),transparent_70%)]'
        />
        <div className='container relative'>
            <SectionHeading
                eyebrow='Governance'
                title='The Board of Governors'
                description='Six volunteers who hold the school to its promise — overseeing standards, finances, and the long-term health of every campus.'
            />

            <ul className='mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7'>
                {boardMembers.map((member, index) => (
                    <Reveal
                        key={member.name}
                        delay={0.05 * index}
                        className='h-full'
                    >
                        <li
                            className='group relative h-full overflow-hidden bg-blue-100 shadow-[0_16px_40px_rgba(8,33,78,0.12)] dark:bg-blue-950 dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)] dark:bg-blue-950 dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)]'
                            style={radius.card}
                        >
                            <div className='relative aspect-[4/5]'>
                                <img
                                    src={member.image}
                                    alt={`${member.name}, ${member.role} at ADESUA Academy`}
                                    className='!h-full !w-full object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.05]'
                                />
                                <div className='absolute inset-0 bg-gradient-to-t from-[#041536]/90 via-[#08214e]/25 to-transparent' />
                            </div>
                            <div className='absolute right-0 bottom-0 left-0 p-6'>
                                <span
                                    className='inline-flex items-center bg-yellow-400 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink'
                                    style={radius.chip}
                                >
                                    {member.focus}
                                </span>
                                <h3 className='font-heading mt-3 text-lg font-bold tracking-tight text-white'>
                                    {member.name}
                                </h3>
                                <p className='mt-0.5 text-xs font-semibold text-white/80'>
                                    {member.role}
                                </p>
                            </div>
                        </li>
                    </Reveal>
                ))}
            </ul>
        </div>
    </section>
)

const StaffSection = () => (
    <section className='relative w-full overflow-hidden bg-surface-2/60 py-20 md:py-24'>
        <div className='container relative'>
            <SectionHeading
                eyebrow='The people your child will know'
                title='Senior staff & campus leads'
                description='Beyond the classroom, these are the specialists shaping wellbeing, sport, music, and the arts across our campuses.'
            />

            <ul className='mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                {seniorStaff.map((person, index) => (
                    <Reveal
                        key={person.name}
                        delay={0.05 * index}
                        className='h-full'
                    >
                        <li
                            className='group flex h-full flex-col border border-line bg-surface p-4 shadow-[var(--shadow-soft)] transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(8,33,78,0.14)]'
                            style={radius.card}
                        >
                            <div
                                className='relative aspect-square overflow-hidden bg-blue-100 dark:bg-blue-950'
                                style={radius.media}
                            >
                                <img
                                    src={person.image}
                                    alt={`${person.name}, ${person.role} at ADESUA Academy`}
                                    className='!h-full !w-full object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.05]'
                                />
                            </div>
                            <div className='flex flex-1 flex-col px-2 pt-5 pb-3'>
                                <h3 className='font-heading text-base font-bold tracking-tight text-ink'>
                                    {person.name}
                                </h3>
                                <p className='mt-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300'>
                                    {person.role}
                                </p>
                                <p className='mt-3 text-xs font-semibold leading-relaxed text-muted md:text-sm'>
                                    {person.note}
                                </p>
                            </div>
                        </li>
                    </Reveal>
                ))}
            </ul>

            <Reveal delay={0.15} className='mt-12 text-center'>
                <p className='text-xs font-semibold text-muted md:text-sm'>
                    190+ educators and support staff work across our three
                    campuses — these are just a few of the faces your family
                    will meet first.
                </p>
            </Reveal>
        </div>
    </section>
)

const Milestones = () => (
    <section className='relative w-full overflow-hidden bg-surface py-20 md:py-24'>
        <div className='container relative'>
            <SectionHeading
                eyebrow='Milestones'
                title='27 years, five defining moments'
                description='A short history of how one classroom in Egator became a family of schools trusted across Ghana.'
            />

            <ol className='relative mx-auto mt-14 max-w-3xl space-y-10 border-l-2 border-line pl-8 md:mt-20 md:max-w-none md:grid md:grid-cols-5 md:gap-8 md:space-y-0 md:border-t-2 md:border-l-0 md:pt-10 md:pl-0'>
                {milestones.map((milestone, index) => (
                    <li key={milestone.year} className='relative'>
                        <span
                            aria-hidden='true'
                            className='absolute top-1 -left-[2.45rem] grid size-5 place-items-center border-4 border-surface bg-blue-700 shadow-[var(--shadow-soft)] md:-top-[3.35rem] md:left-0'
                            style={radius.dot}
                        />
                        <Reveal delay={0.06 * index}>
                            <span className='font-heading text-2xl font-black tracking-tight text-blue-800 dark:text-blue-300'>
                                {milestone.year}
                            </span>
                            <h3 className='font-heading mt-2 text-base font-bold tracking-tight text-ink'>
                                {milestone.title}
                            </h3>
                            <p className='mt-1.5 text-xs font-semibold leading-relaxed text-muted md:text-sm'>
                                {milestone.description}
                            </p>
                        </Reveal>
                    </li>
                ))}
            </ol>
        </div>
    </section>
)

const ClosingCta = () => (
    <section className='brand-atmosphere relative w-full overflow-hidden py-20 md:py-24'>
        <div className='container relative z-10'>
            <Reveal className='mx-auto max-w-2xl text-center'>
                <h2 className='font-heading text-[clamp(1.85rem,3.5vw,2.75rem)] font-black tracking-tight text-white'>
                    Come see learning in action.
                </h2>
                <p className='mt-3 text-sm font-semibold leading-relaxed text-white/90 md:text-base'>
                    Reading about a school is one thing. Walking its corridors
                    is another. Book a visit to any of our three campuses and
                    meet the people behind the promise.
                </p>
                <div className='mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center'>
                    <Button
                        to='/contact'
                        size='xl'
                        variant='secondary'
                        className='border-transparent bg-white !text-[#1a1a1a] hover:bg-white/90'
                    >
                        Book a campus visit
                    </Button>
                    <Button
                        to='/programs'
                        size='xl'
                        variant='outline'
                        className='border-white/25 text-white hover:bg-white/10'
                    >
                        Browse our programs
                    </Button>
                </div>
            </Reveal>
        </div>
    </section>
)

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const AboutPage = () => {
    return (
        <main>
            <PageHeader
                title='About ADESUA Academy'
                description='Three campuses, nine schools, one promise — every child is seen, stretched, and supported toward a brighter tomorrow.'
                backgroundImage={AboutHeaderImage}
            />
            <StorySection />
            <MissionVisionValues />
            <HeadOfSchool />
            <BoardSection />
            <StaffSection />
            <Milestones />
            <ClosingCta />
        </main>
    )
}

export default AboutPage

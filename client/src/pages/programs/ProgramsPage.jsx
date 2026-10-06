import { motion } from 'framer-motion'
import {
    Atom,
    BookOpen,
    Bot,
    Brush,
    Calculator,
    CheckCircle2,
    Clock,
    Compass,
    FlaskConical,
    Globe2,
    GraduationCap,
    HandHeart,
    HeartPulse,
    Landmark,
    Laptop,
    Mic2,
    Music4,
    Palette,
    School,
    Sparkles,
    Sprout,
    Trophy,
    Users,
} from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'

import ProgramsHeaderImage from '../../assets/header4.jpg'
import ElementaryImage from '../../assets/student8.jpg'
import MiddleImage from '../../assets/student12.jpg'
import HighImage from '../../assets/student5.jpg'

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

const divisions = [
    {
        id: 'elementary',
        icon: Sprout,
        badge: 'Ages 4 – 11 · KG 1 to Basic 6',
        title: 'Elementary School',
        tagline: 'Where the love of learning takes root.',
        description:
            'The early years decide how a child feels about school for the rest of their life. Our elementary classrooms are joyful, structured, and deliberately small — every child reads, counts, questions, and belongs.',
        highlights: [
            'Phonics-first literacy with daily guided reading',
            'Hands-on numeracy built on the Ghanaian standards-based curriculum',
            'Inquiry science, ICT, and French from Basic 1',
            'Character education woven into every classroom routine',
        ],
        subjects: ['Literacy', 'Numeracy', 'Science', 'ICT', 'French', 'Creative Arts', 'OWOP'],
        classSize: 'Max 25 per class',
        image: ElementaryImage,
        imageAlt: 'ADESUA Academy elementary pupil reading',
    },
    {
        id: 'middle',
        icon: BookOpen,
        badge: 'Ages 12 – 14 · Basic 7 to 9 (JHS)',
        title: 'Middle School',
        tagline: 'Independence, identity, and the BECE — handled with care.',
        description:
            'Adolescence is when learners either switch on or switch off. Our middle school pairs rigorous BECE preparation with mentorship, real responsibility, and room to explore — so students arrive in high school confident and self-directed.',
        highlights: [
            'Structured BECE preparation from Basic 7, not a final-year scramble',
            'Core mathematics, English, integrated science, and social studies',
            'Career technology, computing, and creative arts and design',
            'Advisory groups — every student is known by a mentor teacher',
        ],
        subjects: ['Mathematics', 'English', 'Integrated Science', 'Social Studies', 'Computing', 'Career Tech', 'Ghanaian Language', 'RME'],
        classSize: 'Max 30 per class',
        image: MiddleImage,
        imageAlt: 'ADESUA Academy middle school student with her books',
    },
    {
        id: 'high',
        icon: GraduationCap,
        badge: 'Ages 15 – 18 · SHS 1 to 3',
        title: 'High School',
        tagline: 'WASSCE excellence and a clear road to university.',
        description:
            'Our high school produced the 2025 NSMQ national champions and a record class of WASSCE A1s — but the real work is individual. Every student picks a pathway, gets a university counsellor, and graduates with a plan, not just a certificate.',
        highlights: [
            'Four elective pathways matched to strengths and ambitions',
            'Dedicated university and career counselling from SHS 1',
            'Leadership positions, national competitions, and internships',
            'Evening prep and boarding options on every campus',
        ],
        subjects: ['Core Maths', 'English', 'Integrated Science', 'Social Studies', 'Electives by pathway'],
        classSize: 'Max 30 per class',
        image: HighImage,
        imageAlt: 'ADESUA Academy high school student in the library',
    },
]

const pathways = [
    {
        icon: FlaskConical,
        title: 'General Science',
        description:
            'Physics, chemistry, biology, and elective maths — the route to medicine, engineering, and the sciences.',
        electives: 'Physics · Chemistry · Biology · E-Maths',
    },
    {
        icon: Landmark,
        title: 'Business',
        description:
            'Accounting, business management, and economics for future founders, bankers, and analysts.',
        electives: 'Accounting · Business Mgmt · Economics · E-Maths',
    },
    {
        icon: Globe2,
        title: 'General Arts',
        description:
            'Literature, government, history, and languages — for the lawyers, diplomats, and storytellers.',
        electives: 'Literature · Government · History · Economics',
    },
    {
        icon: Palette,
        title: 'Visual Arts',
        description:
            'Graphic design, textiles, and studio practice for students who think with their hands and eyes.',
        electives: 'Graphic Design · Textiles · Picture Making · GKA',
    },
]

const enrichment = [
    {
        icon: Bot,
        title: 'STEM & Robotics Club',
        description:
            'Coding, robotics kits, and the training ground of our NSMQ champions.',
    },
    {
        icon: Mic2,
        title: 'Debate & Public Speaking',
        description:
            'Weekly debates and national competitions — composure is a skill we teach.',
    },
    {
        icon: Music4,
        title: 'Music & Performance',
        description:
            'Choir, drumming, and drama ensembles celebrated at the National Cultural Festival.',
    },
    {
        icon: Trophy,
        title: 'Athletics',
        description:
            'Football, track and field, and volleyball — Greater Accra athletics champions.',
    },
    {
        icon: Brush,
        title: 'Art & Design Studio',
        description:
            'Open studio afternoons for painting, sculpture, and digital illustration.',
    },
    {
        icon: HandHeart,
        title: 'Community Service',
        description:
            'Student-led service projects in every region we call home. Leadership starts local.',
    },
]

const dayRhythm = [
    {
        time: '7:15',
        title: 'Arrival & morning assembly',
        description: 'A calm, purposeful start — announcements, reflection, and singing together.',
        icon: School,
    },
    {
        time: '8:00',
        title: 'Core academic blocks',
        description: 'Literacy, maths, and sciences taught when minds are freshest.',
        icon: Calculator,
    },
    {
        time: '10:30',
        title: 'Break & supervised play',
        description: 'Movement, snacks, and friendships — recess is part of the curriculum.',
        icon: HeartPulse,
    },
    {
        time: '12:30',
        title: 'Lunch & clubs',
        description: 'Hot meals, then chess, robotics, choir, or quiet reading.',
        icon: Users,
    },
    {
        time: '13:30',
        title: 'Labs, electives & projects',
        description: 'Afternoons are for doing — experiments, studios, and group work.',
        icon: Atom,
    },
    {
        time: '15:30',
        title: 'Sports & enrichment',
        description: 'Training, rehearsals, and prep. Dismissal from 16:30.',
        icon: Trophy,
    },
]

const support = [
    {
        icon: Compass,
        title: 'Guidance & counselling',
        description:
            'A full-time counsellor on every campus supports wellbeing, friendships, and the transitions between divisions.',
    },
    {
        icon: Sparkles,
        title: 'Learning support',
        description:
            'Small-group intervention and extension work — we meet learners where they are, whether catching up or racing ahead.',
    },
    {
        icon: Laptop,
        title: 'University & career guidance',
        description:
            'From SHS 1, every student builds a university shortlist, sits mock interviews, and meets alumni in their target fields.',
    },
]

const outcomes = [
    { value: '98%', label: 'WASSCE pass rate, Class of 2025' },
    { value: '1st', label: 'NSMQ national champions, 2025' },
    { value: '85%', label: 'Graduates placed in top universities' },
    { value: '20+', label: 'Clubs and teams across campuses' },
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

const DivisionsSection = () => (
    <section className='relative w-full overflow-hidden bg-surface py-20 md:py-24'>
        <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.16),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.16),transparent_70%)]'
        />
        <div className='container relative'>
            <SectionHeading
                eyebrow='Academic divisions'
                title='One journey, three chapters'
                description='Kindergarten to WASSCE under one roof — each division designed for the age it serves, each handing your child confidently to the next.'
            />

            <div className='mt-16 flex flex-col gap-20 lg:gap-24'>
                {divisions.map((division, index) => {
                    const Icon = division.icon
                    const imageRight = index % 2 === 0
                    return (
                        <article
                            key={division.id}
                            className='grid items-center gap-10 lg:grid-cols-2 lg:gap-16'
                        >
                            <Reveal
                                className={`relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none ${
                                    imageRight ? 'lg:order-2' : ''
                                }`}
                            >
                                <div
                                    className='group relative aspect-[4/5] overflow-hidden bg-blue-100 shadow-[0_20px_50px_rgba(8,33,78,0.14)] dark:bg-blue-950 dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] dark:bg-blue-950 dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] sm:aspect-[5/5]'
                                    style={radius.panel}
                                >
                                    <img
                                        src={division.image}
                                        alt={division.imageAlt}
                                        className='!h-full !w-full object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.03]'
                                    />
                                    <div className='absolute inset-0 bg-gradient-to-t from-[#08214e]/45 via-transparent to-transparent' />
                                    <span
                                        className='absolute top-5 left-5 inline-flex items-center gap-2 bg-white/95 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-blue-800 shadow-[var(--shadow-soft)] dark:bg-[#0c1528]/95 dark:text-blue-200'
                                        style={radius.chip}
                                    >
                                        <Icon className='size-4' strokeWidth={2} />
                                        {division.badge}
                                    </span>
                                    <span
                                        className='absolute bottom-5 left-5 inline-flex items-center gap-2 bg-[#041536]/70 px-4 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm'
                                        style={radius.chip}
                                    >
                                        <Users className='size-3.5' strokeWidth={2} />
                                        {division.classSize}
                                    </span>
                                </div>
                            </Reveal>

                            <Reveal delay={0.1} className={imageRight ? 'lg:order-1' : ''}>
                                <h3 className='font-heading text-2xl font-black tracking-tight text-ink md:text-3xl'>
                                    {division.title}
                                </h3>
                                <p className='mt-1.5 text-sm font-bold text-blue-700 dark:text-blue-300 md:text-base'>
                                    {division.tagline}
                                </p>
                                <p className='mt-4 text-sm font-semibold leading-relaxed text-muted md:text-base'>
                                    {division.description}
                                </p>

                                <ul className='mt-6 space-y-3'>
                                    {division.highlights.map((point) => (
                                        <li key={point} className='flex items-start gap-3'>
                                            <CheckCircle2
                                                className='mt-0.5 size-4.5 shrink-0 text-yellow-500'
                                                strokeWidth={2.25}
                                            />
                                            <span className='text-sm font-semibold leading-relaxed text-ink'>
                                                {point}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <div className='mt-7 flex flex-wrap gap-2'>
                                    {division.subjects.map((subject) => (
                                        <span
                                            key={subject}
                                            className='border border-line bg-surface-2 px-3.5 py-1.5 text-xs font-semibold text-ink'
                                            style={radius.chip}
                                        >
                                            {subject}
                                        </span>
                                    ))}
                                </div>
                            </Reveal>
                        </article>
                    )
                })}
            </div>
        </div>
    </section>
)

const PathwaysSection = () => (
    <section className='featured-panel relative w-full overflow-hidden py-20 md:py-28'>
        <div className='container relative z-10'>
            <SectionHeading
                dark
                eyebrow='SHS elective pathways'
                title='Four routes to the future'
                description='In SHS 1, every student chooses a pathway with their counsellor and family — built around strengths, not guesswork.'
            />

            <ul className='mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6'>
                {pathways.map((pathway, index) => {
                    const Icon = pathway.icon
                    return (
                        <Reveal
                            key={pathway.title}
                            delay={0.06 * index}
                            className='h-full'
                        >
                            <li
                                className='group flex h-full flex-col border border-white/15 bg-white/10 p-7 backdrop-blur-sm transition-all duration-300 ease-spring hover:-translate-y-1 hover:bg-white/15'
                                style={radius.card}
                            >
                                <span
                                    className='grid size-12 place-items-center bg-yellow-400 text-[#1a1a1a] shadow-[var(--shadow-soft)] transition-transform duration-300 ease-spring group-hover:scale-105'
                                    style={radius.chip}
                                >
                                    <Icon className='size-6' strokeWidth={1.75} />
                                </span>
                                <h3 className='font-heading mt-5 text-lg font-bold tracking-tight text-white'>
                                    {pathway.title}
                                </h3>
                                <p className='mt-2 flex-1 text-sm font-semibold leading-relaxed text-white/85'>
                                    {pathway.description}
                                </p>
                                <p className='mt-5 border-t border-white/15 pt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-yellow-300'>
                                    {pathway.electives}
                                </p>
                            </li>
                        </Reveal>
                    )
                })}
            </ul>
        </div>
    </section>
)

const EnrichmentSection = () => (
    <section className='relative w-full overflow-hidden bg-surface-2/60 py-20 md:py-24'>
        <div className='container relative'>
            <SectionHeading
                eyebrow='Beyond the classroom'
                title='Enrichment that builds the whole child'
                description='Grades open doors; character walks through them. Every student joins at least one club, team, or ensemble.'
            />

            <ul className='mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                {enrichment.map((item, index) => {
                    const Icon = item.icon
                    return (
                        <Reveal
                            key={item.title}
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
                                <h3 className='font-heading mt-5 text-lg font-bold tracking-tight text-ink'>
                                    {item.title}
                                </h3>
                                <p className='mt-2 text-sm font-semibold leading-relaxed text-muted'>
                                    {item.description}
                                </p>
                            </li>
                        </Reveal>
                    )
                })}
            </ul>
        </div>
    </section>
)

const DayRhythmSection = () => (
    <section className='relative w-full overflow-hidden bg-surface py-20 md:py-24'>
        <div className='container relative'>
            <SectionHeading
                eyebrow='A day at ADESUA'
                title='The rhythm of a school day'
                description='Structure gives children security; variety keeps them curious. Here is how a typical day flows on every campus.'
            />

            <ol className='mx-auto mt-14 max-w-3xl'>
                {dayRhythm.map((slot, index) => {
                    const Icon = slot.icon
                    const isLast = index === dayRhythm.length - 1
                    return (
                        <li key={slot.time} className='relative flex gap-5 sm:gap-7'>
                            {/* Rail */}
                            <div className='flex flex-col items-center'>
                                <span
                                    className='grid size-12 shrink-0 place-items-center bg-blue-50 text-blue-700 ring-1 ring-line dark:bg-blue-500/15 dark:text-blue-300'
                                    style={radius.chip}
                                >
                                    <Icon className='size-5' strokeWidth={1.75} />
                                </span>
                                {!isLast && (
                                    <span
                                        aria-hidden='true'
                                        className='w-px flex-1 bg-line'
                                    />
                                )}
                            </div>

                            <Reveal
                                delay={0.05 * index}
                                className={isLast ? 'pb-0' : 'pb-10'}
                            >
                                <span className='inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-yellow-600 dark:text-yellow-400'>
                                    <Clock className='size-3.5' strokeWidth={2.25} />
                                    {slot.time}
                                </span>
                                <h3 className='font-heading mt-1.5 text-lg font-bold tracking-tight text-ink'>
                                    {slot.title}
                                </h3>
                                <p className='mt-1.5 text-sm font-semibold leading-relaxed text-muted'>
                                    {slot.description}
                                </p>
                            </Reveal>
                        </li>
                    )
                })}
            </ol>
        </div>
    </section>
)

const SupportSection = () => (
    <section className='relative w-full overflow-hidden bg-surface-2/60 py-20 md:py-24'>
        <div className='container relative'>
            <SectionHeading
                eyebrow='Every child, fully supported'
                title='The safety net under every program'
                description='Great programs only work when every learner can access them. These services run quietly under everything we do.'
            />

            <ul className='mt-14 grid gap-6 md:grid-cols-3'>
                {support.map((service, index) => {
                    const Icon = service.icon
                    return (
                        <Reveal
                            key={service.title}
                            delay={0.06 * index}
                            className='h-full'
                        >
                            <li
                                className='flex h-full flex-col border border-line bg-surface p-8 shadow-[var(--shadow-soft)]'
                                style={radius.card}
                            >
                                <span
                                    className='brand-gradient grid size-12 place-items-center text-white shadow-[var(--shadow-brand)]'
                                    style={radius.chip}
                                >
                                    <Icon className='size-6' strokeWidth={1.75} />
                                </span>
                                <h3 className='font-heading mt-6 text-lg font-bold tracking-tight text-ink'>
                                    {service.title}
                                </h3>
                                <p className='mt-2 text-sm font-semibold leading-relaxed text-muted'>
                                    {service.description}
                                </p>
                            </li>
                        </Reveal>
                    )
                })}
            </ul>
        </div>
    </section>
)

const OutcomesCta = () => (
    <section className='brand-atmosphere relative w-full overflow-hidden py-20 md:py-24'>
        <div className='container relative z-10'>
            <SectionHeading
                dark
                eyebrow='Proof, not promises'
                title='Where our programs lead'
            />

            <Reveal delay={0.1}>
                <dl className='mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-y-10 lg:grid-cols-4'>
                    {outcomes.map((stat) => (
                        <div key={stat.label} className='px-4 text-center'>
                            <dd className='font-heading text-3xl font-black tracking-tight text-yellow-300 md:text-4xl'>
                                {stat.value}
                            </dd>
                            <dt className='mt-2 text-xs font-semibold text-white/85 md:text-sm'>
                                {stat.label}
                            </dt>
                        </div>
                    ))}
                </dl>
            </Reveal>

            <Reveal delay={0.15} className='mt-14 text-center'>
                <p className='mx-auto max-w-xl text-sm font-semibold leading-relaxed text-white/90 md:text-base'>
                    The right program starts with a conversation. Talk to our
                    admissions team and find the fit for your child.
                </p>
                <div className='mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center'>
                    <Button
                        to='/contact'
                        size='xl'
                        variant='secondary'
                        className='border-transparent bg-white !text-[#1a1a1a] hover:bg-white/90'
                    >
                        Talk to admissions
                    </Button>
                    <Button
                        to='/activities'
                        size='xl'
                        variant='outline'
                        className='border-white/25 text-white hover:bg-white/10'
                    >
                        See student activities
                    </Button>
                </div>
            </Reveal>
        </div>
    </section>
)

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const ProgramsPage = () => {
    return (
        <main>
            <PageHeader
                title='Our Programs'
                description='From the first day of kindergarten to the last WASSCE paper — a connected journey designed around how children actually grow.'
                backgroundImage={ProgramsHeaderImage}
            />
            <DivisionsSection />
            <PathwaysSection />
            <EnrichmentSection />
            <DayRhythmSection />
            <SupportSection />
            <OutcomesCta />
        </main>
    )
}

export default ProgramsPage

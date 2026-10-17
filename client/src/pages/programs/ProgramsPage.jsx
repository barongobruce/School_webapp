import { motion } from 'framer-motion'
import {
    BookOpen,
    CheckCircle2,
    GraduationCap,
    Sparkles,
    Sprout,
    Users,
} from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'

import ProgramsHeaderImage from '../../assets/header4.jpg'
import ElementaryImage from '../../assets/student13.jpg'
import MiddleImage from '../../assets/student12.jpg'
import earlyprimary from '../../assets/student14.jpg'
import HighImage from '../../assets/student5.jpg'


/* ------------------------------------------------------------------ */
/* Radii — TL · TR · BR · BL                                           */
/* ------------------------------------------------------------------ */

const radius = {
    chip: { borderRadius: '1.2rem 0.4rem 1.2rem 0.4rem' },
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
            'Speaking, listening, vocabulary development',
            'Phonics, early reading, mark-making',
            'Numbers, patterns, shapes, problem-solving',
            'Exploration, environment, basic science',
            'Art, music, movement, creativity',
        ],
        subjects: ['Literacy', 'Communication & Language', 'Science', 'Understanding the World', 'Mathematics', 'Creative Arts', 'Physical Development'],
        classSize: 'Max 25 per class',
        image: ElementaryImage,
        imageAlt: 'Barongo Academy elementary pupil reading',
    },
    {
        id: 'Early Primary',
        icon: BookOpen,
        badge: 'Ages 12 – 14 · Basic 7 to 9 (JHS)',
        title: 'Early Primary',
        tagline: 'Building strong academic and personal foundations.',
        description:
            'Our early primary school pairs good preparation with mentorship to learners, real responsibility, and room to explore — so learners arrive in middle school confident and self-directed.',
        highlights: [
            'Reading, writing, speaking, listening',
            'Number, algebra, geometry, problem-solving',
            'Biology, chemistry, physics foundations',
            'Computing, online safety, digital skills',
            'Fitness, teamwork, coordination',
        ],
        subjects: ['Mathematics', 'English', 'Integrated Science', 'Social Studies', 'ICT & Digital Literacy', 'Physical Education',],
        classSize: 'Max 30 per class',
        image: MiddleImage,
        imageAlt: 'Barongo Academy middle school student with her books',
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
            'Advanced literacy and communication skills',
            'Core mathematics, English, integrated science, and social studies',
            'Coding, digital literacy, problem-solving',
            'Engineering concepts and practical skills',
            'Research, analysis, collaboration',
        ],
        subjects: ['Mathematics', 'English', 'Integrated Science', 'Social Studies', 'ICT & Digital Literacy', 'Design & Technology', 'Global Perspectives', 'Creative Arts'],
        classSize: 'Max 30 per class',
        image: earlyprimary,
        imageAlt: 'Barongo Academy middle school student',
    },
    {
        id: 'high',
        icon: GraduationCap,
        badge: 'Ages 15 – 18 · SHS 1 to 3',
        title: 'High School',
        tagline: 'KCSE excellence and a clear road to university.',
        description:
            'Our high school produced the 2025 national champion and a record mean score of 10.0 — but the real work is individual. Every student picks a pathway, gets a university counsellor, and graduates with a plan, not just a certificate.',
        highlights: [
            'Optional subject offerings (STEM)',
            'Dedicated university and career counselling',
            'Leadership positions, national competitions, and internships',
            'Evening prep and boarding options on every branch',
        ],
        subjects: ['Core Maths', 'English', 'Integrated Sciences', 'Business Studies', 'Humanities', 'Electives by pathway'],
        classSize: 'Max 30 per class',
        image: HighImage,
        imageAlt: 'Barongo Academy high school student in the library',
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

const DivisionsSection = () => (
    <section className='relative w-full overflow-hidden bg-surface py-20 md:py-24'>
        <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.16),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.16),transparent_70%)]'
        />
        <div className='container relative'>
            <SectionHeading
                eyebrow='Academic divisions'
                title='One journey, Four chapters'
                description='Kindergarten to Highschool under one roof — each division designed for the age it serves, each handing your child confidently to the next.'
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

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const ProgramsPage = () => {
    return (
        <main>
            <PageHeader
                title='Our Programs'
                description='From the first day of kindergarten to the last KCSE paper — a connected journey designed around how children actually grow.'
                backgroundImage={ProgramsHeaderImage}
            />
            <DivisionsSection />
            <section className='relative w-full overflow-hidden bg-surface pb-20 md:pb-24'>
                <div className='container relative'>
                    <div
                        className='featured-panel flex flex-col items-center px-6 py-10 text-center text-white shadow-[var(--shadow-soft)] sm:px-10 md:py-12'
                        style={radius.panel}
                    >
                        <h2 className='font-heading text-2xl font-black tracking-tight md:text-3xl'>
                            Discover life beyond the classroom
                        </h2>
                        <p className='mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-white/90 md:text-base'>
                            Explore the activities that help our students build confidence, develop new interests, and grow together.
                        </p>
                        <div className='mt-6'>
                            <Button
                                to='/activities'
                                size='lg'
                                variant='secondary'
                                className='border-transparent bg-white !text-[#1a1a1a] hover:bg-white/90'
                            >
                                Explore student activities
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default ProgramsPage

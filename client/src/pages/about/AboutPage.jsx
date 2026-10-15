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
    { value: '2000', label: 'Founded in Nairobi' },
    { value: '5,400+', label: 'Students across Kenya' },
    { value: '190+', label: 'Educators & mentors' },
    { value: '3', label: 'Branches' },
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
                        Our story · Since 2000
                    </span>
                    <h2 className='font-heading mt-3 text-[clamp(1.85rem,3.5vw,2.75rem)] font-black leading-[1.1] tracking-tight text-ink'>
                        Rooted in Kenya,
                        <br />
                        built for the world.
                    </h2>
                    <p className='mt-5 text-sm font-semibold leading-relaxed text-ink md:text-base'>
                        Barongo Academy began in 2000 with a single classroom in
                        Nairobi and a conviction our founders refused to
                        compromise: every child deserves teachers who know
                        their name, their story, and their potential.
                    </p>
                    <p className='mt-4 text-sm font-semibold leading-relaxed text-muted md:text-base'>
                        Nearly three decades later, that one classroom has
                        grown into three branches across
                        Kenya — yet the promise has not changed. Our
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
                                alt='Barongo Academy student on campus'
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
                                    alt='Barongo Academy students at play'
                                    className='!h-full !w-full object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.04]'
                                />
                            </div>
                            <div
                                className='brand-gradient flex flex-col justify-center px-6 py-6 text-white shadow-[var(--shadow-brand)]'
                                style={radius.card}
                            >
                                <span className='font-heading text-3xl font-black tracking-tight md:text-4xl'>
                                    26
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
                title='Our mission, vision, values & motto'
            />

            <div className='mt-14 grid auto-rows-fr items-stretch gap-6 md:grid-cols-2'>
                <Reveal className='h-full'>
                    <article
                        className='featured-panel flex h-full min-h-[18rem] flex-col justify-center px-8 py-10 text-white sm:px-10 md:py-12'
                        style={radius.panel}
                    >
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
                    </article>
                </Reveal>

                <Reveal delay={0.1} className='h-full'>
                    <article
                        className='flex h-full min-h-[18rem] flex-col justify-center border border-line bg-surface px-8 py-10 shadow-[var(--shadow-soft)] sm:px-10 md:py-12'
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
                            To be Kenya’s most trusted family of schools — a
                            place where excellence is ordinary, kindness is
                            expected, and every graduate leaves ready to lead
                            with both competence and conscience.
                        </p>
                    </article>
                </Reveal>

                <Reveal delay={0.15} className='h-full'>
                    <article
                        className='flex h-full min-h-[18rem] flex-col justify-center border border-line bg-surface px-8 py-10 shadow-[var(--shadow-soft)] sm:px-10 md:py-12'
                        style={radius.panel}
                    >
                        <span
                            className='grid size-12 place-items-center bg-blue-50 text-blue-700 shadow-[var(--shadow-soft)] dark:bg-blue-500/15 dark:text-blue-300'
                            style={radius.chip}
                        >
                            <HeartHandshake className='size-6' strokeWidth={2} />
                        </span>
                        <h3 className='font-heading mt-6 text-2xl font-black tracking-tight text-ink md:text-3xl'>
                            Our values
                        </h3>
                        <p className='mt-4 max-w-lg text-sm font-semibold leading-relaxed text-muted md:text-base'>
                            Integrity and respect, excellence in learning and teaching, care and well-being, collaboration with families, inclusivity, and global awareness.
                        </p>
                    </article>
                </Reveal>

                <Reveal delay={0.2} className='h-full'>
                    <article
                        className='featured-panel flex h-full min-h-[18rem] flex-col justify-center px-8 py-10 text-white sm:px-10 md:py-12'
                        style={radius.panel}
                    >
                        <span
                            className='grid size-12 place-items-center bg-yellow-400 text-[#1a1a1a] shadow-[var(--shadow-soft)]'
                            style={radius.chip}
                        >
                            <Sparkles className='size-6' strokeWidth={2} />
                        </span>
                        <h3 className='font-heading mt-6 text-2xl font-black tracking-tight md:text-3xl'>
                            Our motto
                        </h3>
                        <p className='mt-4 text-xl font-bold leading-relaxed text-white md:text-2xl'>
                            To the Uttermost
                        </p>
                    </article>
                </Reveal>
            </div>
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
                            alt='Dr. Naana Owusu-Ansah, Head of School at Barongo Academy'
                            className='!h-full !w-full object-cover'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-[#041536]/60 via-transparent to-transparent' />
                        <div
                            className='absolute right-4 bottom-4 left-4 border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md'
                            style={radius.chip}
                        >
                            <p className='font-heading text-sm font-bold text-white'>
                                Dr. Selina Amos
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
                            PHD., Educational Leadership
                        </span>
                        <span
                            className='inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm'
                            style={radius.chip}
                        >
                            <MapPin className='size-4' strokeWidth={2} />
                            20 years in Kenyan education
                        </span>
                    </div>
                </Reveal>
            </div>
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
                title='About  BARONGO  Academy'
                description='Three branches, one promise — every child is seen, stretched, and supported toward a brighter tomorrow.'
                backgroundImage={AboutHeaderImage}
            />
            <StorySection />
            <MissionVisionValues />
            <HeadOfSchool />
            <ClosingCta />
        </main>
    )
}

export default AboutPage

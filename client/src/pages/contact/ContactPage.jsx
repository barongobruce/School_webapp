import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowUpRight,
    Banknote,
    CalendarCheck,
    CheckCircle2,
    ChevronDown,
    Clock,
    GraduationCap,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    School,
    Sparkles,
} from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import { cn } from '../../lib/utils'
import ContactHeaderImage from '../../assets/graduate4.jpg'

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const departments = [
    {
        icon: GraduationCap,
        title: 'Admissions',
        description: 'Applications, entrance assessments, and enrolment for all three campuses.',
        lines: ['admissions@adesuaacademy.edu', '(233) 123-456789'],
        href: 'mailto:admissions@adesuaacademy.edu',
        action: 'Email admissions',
    },
    {
        icon: School,
        title: 'General Enquiries',
        description: 'School life, programs, activities, and anything else on your mind.',
        lines: ['info@adesuaacademy.edu', '(233) 123-456789'],
        href: 'mailto:info@adesuaacademy.edu',
        action: 'Email the office',
    },
    {
        icon: Banknote,
        title: 'Fees & Accounts',
        description: 'Fee schedules, payment plans, scholarships, and receipts.',
        lines: ['accounts@adesuaacademy.edu', 'Mon – Fri, 8:00 – 15:00'],
        href: 'mailto:accounts@adesuaacademy.edu',
        action: 'Email accounts',
    },
    {
        icon: MessageCircle,
        title: 'WhatsApp Line',
        description: 'Quick questions answered on school days between 8:00 and 16:00.',
        lines: ['(233) 123-456789', 'Replies within the school day'],
        href: 'https://wa.me/233123456789',
        action: 'Chat on WhatsApp',
    },
]

const officeHours = [
    { days: 'Monday – Friday', hours: '7:30 – 16:30' },
    { days: 'Saturday', hours: '9:00 – 12:00 (admissions only)' },
    { days: 'Sunday & public holidays', hours: 'Closed' },
]

const subjects = [
    'Admissions & enrolment',
    'Campus visit or tour',
    'Fees & payment plans',
    'Student wellbeing',
    'Partnership or media',
    'Something else',
]

const campuses = [
    {
        id: 'accra',
        region: 'Greater Accra Campus',
        cities: 'Tema & Accra',
        address: '1 Education Drive, Community 6, Tema',
        landmark: 'Off the Tema Motorway, near Community 6 Police Station',
        phone: '(233) 123-456789',
        tel: '+233123456789',
        mapQuery: 'Tema, Greater Accra, Ghana',
    },
    {
        id: 'volta',
        region: 'Volta Campus',
        cities: 'Keta',
        address: 'Lagoon Road, Keta, Volta Region',
        landmark: 'Five minutes from Keta Lagoon, beside the district library',
        phone: '(233) 123-456789',
        tel: '+233123456789',
        mapQuery: 'Keta, Volta Region, Ghana',
    },
    {
        id: 'eastern',
        region: 'Eastern Campus',
        cities: 'Koforidua',
        address: 'Galloway Avenue, Koforidua, Eastern Region',
        landmark: 'Near Jackson Park, on the road to the Koforidua Technical University',
        phone: '(233) 123-456789',
        tel: '+233123456789',
        mapQuery: 'Koforidua, Eastern Region, Ghana',
    },
]

const faqs = [
    {
        question: 'When can my child join ADESUA Academy?',
        answer: 'Our main intake is September, but we accept applications all year round and admit mid-year when places are available. Start with the admissions team and they will walk you through assessment dates for your campus.',
    },
    {
        question: 'Can we visit a campus before applying?',
        answer: 'Please do — it is the best way to feel the difference. Campus tours run on weekdays between 9:00 and 14:00, and Saturday mornings during admissions season. Book through the form on this page or call the campus directly.',
    },
    {
        question: 'How quickly will I get a response?',
        answer: 'We reply to every message within two working days — usually the same day. Urgent matters are best handled on the phone or WhatsApp line during school hours.',
    },
    {
        question: 'Do you offer scholarships or payment plans?',
        answer: 'Yes. Merit and needs-based scholarships are reviewed each term, and termly fees can be split into monthly payments. The fees & accounts office will gladly take you through the options.',
    },
]

/* ------------------------------------------------------------------ */
/* Radii — TL · TR · BR · BL                                           */
/* ------------------------------------------------------------------ */

const radius = {
    icon: { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' },
    chip: { borderRadius: '1.2rem 0.4rem 1.2rem 0.4rem' },
    field: { borderRadius: '1.4rem 0.45rem 1.4rem 0.45rem' },
    card: { borderRadius: '2.2rem 0.4rem 2.2rem 0.4rem' },
    panel: { borderRadius: '3rem 0.5rem 3rem 0.5rem' },
}

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

const DepartmentsSection = () => (
    <section className='relative w-full overflow-hidden bg-surface py-20 md:py-24'>
        <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.16),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.16),transparent_70%)]'
        />
        <div className='container relative'>
            <SectionHeading
                eyebrow='Talk to the right people'
                title='One school, four front doors'
                description='Skip the switchboard — reach the team that can actually help, whether it is enrolment, fees, or a quick question on WhatsApp.'
            />

            <ul className='mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                {departments.map((dept, index) => {
                    const Icon = dept.icon
                    return (
                        <Reveal key={dept.title} delay={0.05 * index} className='h-full'>
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
                                    {dept.title}
                                </h3>
                                <p className='mt-2 flex-1 text-sm font-semibold leading-relaxed text-muted'>
                                    {dept.description}
                                </p>
                                <div className='mt-5 space-y-1 border-t border-line pt-4'>
                                    {dept.lines.map((line) => (
                                        <p key={line} className='truncate text-xs font-semibold text-ink'>
                                            {line}
                                        </p>
                                    ))}
                                </div>
                                <Button
                                    href={dept.href}
                                    size='md'
                                    className='mt-5 w-full'
                                    target={dept.href.startsWith('http') ? '_blank' : undefined}
                                    rel={dept.href.startsWith('http') ? 'noreferrer' : undefined}
                                >
                                    {dept.action}
                                    <ArrowUpRight className='size-4' strokeWidth={2.25} />
                                </Button>
                            </li>
                        </Reveal>
                    )
                })}
            </ul>
        </div>
    </section>
)

const fieldClass =
    'w-full border border-line bg-[var(--color-bg)] px-4 py-3.5 text-sm font-semibold text-ink outline-none transition-all duration-200 placeholder:font-medium placeholder:text-faint focus:border-blue-500 focus:bg-surface focus:ring-2 focus:ring-blue-500/15 dark:focus:border-blue-400 dark:focus:ring-blue-400/20'

const labelClass =
    'flex flex-col gap-2 text-left text-xs font-bold tracking-wide text-ink uppercase'

const emptyForm = { name: '', email: '', phone: '', subject: subjects[0], message: '' }

const FormSection = () => {
    const [formData, setFormData] = useState(emptyForm)
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setSubmitted(true)
        setFormData(emptyForm)
    }

    return (
        <section className='relative w-full overflow-hidden bg-surface-2/60 py-20 md:py-24'>
            <div className='container relative'>
                <SectionHeading
                    eyebrow='Send a message'
                    title='Tell us how we can help'
                    description='Fill in the form and the right team member will get back to you within two working days — usually much sooner.'
                />

                <div className='mt-14 grid items-start gap-8 lg:grid-cols-5 lg:gap-10'>
                    {/* Form */}
                    <Reveal className='lg:col-span-3'>
                        {submitted ? (
                            <div
                                role='status'
                                className='flex flex-col items-center border border-blue-100 bg-blue-50 px-8 py-16 text-center dark:border-blue-500/25 dark:bg-blue-500/10'
                                style={radius.panel}
                            >
                                <CheckCircle2 className='size-10 text-blue-700 dark:text-blue-300' strokeWidth={1.75} />
                                <p className='font-heading mt-4 text-2xl font-black tracking-tight text-ink'>
                                    Message sent
                                </p>
                                <p className='mt-2 max-w-sm text-sm font-semibold text-muted'>
                                    Thank you for reaching out. Our team will get back to you shortly.
                                </p>
                                <Button
                                    type='button'
                                    size='lg'
                                    className='mt-8'
                                    onClick={() => setSubmitted(false)}
                                >
                                    Send another message
                                </Button>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className='border border-line bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8 md:p-10'
                                style={radius.panel}
                            >
                                <div className='grid gap-5 sm:grid-cols-2'>
                                    <label className={labelClass}>
                                        Full name
                                        <input
                                            type='text'
                                            name='name'
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder='Your full name'
                                            className={fieldClass}
                                            style={radius.field}
                                            autoComplete='name'
                                        />
                                    </label>
                                    <label className={labelClass}>
                                        Email address
                                        <input
                                            type='email'
                                            name='email'
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder='you@example.com'
                                            className={fieldClass}
                                            style={radius.field}
                                            autoComplete='email'
                                        />
                                    </label>
                                    <label className={labelClass}>
                                        Phone number
                                        <input
                                            type='tel'
                                            name='phone'
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder='(233) 000-000000'
                                            className={fieldClass}
                                            style={radius.field}
                                            autoComplete='tel'
                                        />
                                    </label>
                                    <label className={labelClass}>
                                        What is this about?
                                        <select
                                            name='subject'
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className={`${fieldClass} appearance-none`}
                                            style={radius.field}
                                        >
                                            {subjects.map((subject) => (
                                                <option key={subject} value={subject}>
                                                    {subject}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className={`${labelClass} sm:col-span-2`}>
                                        Message
                                        <textarea
                                            name='message'
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            placeholder='Write your message here…'
                                            className={`${fieldClass} min-h-[8.5rem] resize-y`}
                                            style={radius.field}
                                        />
                                    </label>
                                </div>

                                <div className='mt-8 flex justify-center sm:justify-start'>
                                    <Button type='submit' size='xl' className='w-full sm:w-auto'>
                                        Send Message
                                    </Button>
                                </div>
                            </form>
                        )}
                    </Reveal>

                    {/* Aside: hours + direct lines */}
                    <Reveal delay={0.1} className='lg:col-span-2'>
                        <div className='flex flex-col gap-6'>
                            <div
                                className='border border-line bg-surface p-8 shadow-[var(--shadow-soft)]'
                                style={radius.panel}
                            >
                                <span
                                    className='brand-gradient grid size-12 place-items-center text-white shadow-[var(--shadow-brand)]'
                                    style={radius.chip}
                                >
                                    <Clock className='size-6' strokeWidth={1.75} />
                                </span>
                                <h3 className='font-heading mt-5 text-lg font-bold tracking-tight text-ink'>
                                    Office hours
                                </h3>
                                <ul className='mt-4 divide-y divide-line'>
                                    {officeHours.map((slot) => (
                                        <li
                                            key={slot.days}
                                            className='flex items-baseline justify-between gap-4 py-3'
                                        >
                                            <span className='text-sm font-bold text-ink'>
                                                {slot.days}
                                            </span>
                                            <span className='text-right text-xs font-semibold text-muted'>
                                                {slot.hours}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div
                                className='featured-panel relative overflow-hidden p-8'
                                style={radius.panel}
                            >
                                <div className='relative z-10'>
                                    <span
                                        className='grid size-12 place-items-center bg-yellow-400 text-[#1a1a1a] shadow-[var(--shadow-soft)]'
                                        style={radius.chip}
                                    >
                                        <CalendarCheck className='size-6' strokeWidth={1.75} />
                                    </span>
                                    <h3 className='font-heading mt-5 text-lg font-bold tracking-tight text-white'>
                                        Prefer to see it in person?
                                    </h3>
                                    <p className='mt-2 text-sm font-semibold leading-relaxed text-white/85'>
                                        Campus tours run every weekday from 9:00 to 14:00. Come and
                                        watch a normal school day — no polish, no rehearsal.
                                    </p>
                                    <div className='mt-6 flex flex-col gap-2.5'>
                                        <a
                                            href='tel:+233123456789'
                                            className='inline-flex items-center gap-2.5 text-sm font-bold text-white transition-colors hover:text-yellow-300'
                                        >
                                            <Phone className='size-4' strokeWidth={2} />
                                            (233) 123-456789
                                        </a>
                                        <a
                                            href='mailto:admissions@adesuaacademy.edu'
                                            className='inline-flex items-center gap-2.5 text-sm font-bold text-white transition-colors hover:text-yellow-300'
                                        >
                                            <Mail className='size-4' strokeWidth={2} />
                                            admissions@adesuaacademy.edu
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    )
}

const MapSection = () => {
    const [activeId, setActiveId] = useState(campuses[0].id)
    const activeCampus = campuses.find((c) => c.id === activeId) ?? campuses[0]

    return (
        <section className='relative w-full overflow-hidden bg-surface py-20 md:py-24'>
            <div className='container relative'>
                <SectionHeading
                    eyebrow='Find us'
                    title='Three campuses, one warm welcome'
                    description='Pick a campus to see it on the map — and call ahead so we can have someone waiting at the gate for you.'
                />

                {/* Campus tabs */}
                <div
                    role='tablist'
                    aria-label='Campus locations'
                    className='mt-10 flex flex-wrap justify-center gap-2'
                >
                    {campuses.map((campus) => (
                        <button
                            key={campus.id}
                            type='button'
                            role='tab'
                            aria-selected={activeId === campus.id}
                            onClick={() => setActiveId(campus.id)}
                            style={radius.field}
                            className={cn(
                                'px-5 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200 ease-spring',
                                activeId === campus.id
                                    ? 'brand-gradient text-white shadow-[var(--shadow-brand)]'
                                    : 'border border-line bg-surface-2 text-ink hover:bg-surface',
                            )}
                        >
                            {campus.region}
                        </button>
                    ))}
                </div>

                <Reveal className='mt-10'>
                    <div
                        className='grid overflow-hidden border border-line shadow-[0_20px_50px_rgba(8,33,78,0.12)] lg:grid-cols-3'
                        style={radius.panel}
                    >
                        {/* Campus details */}
                        <div className='featured-panel relative p-8 lg:p-10'>
                            <div className='relative z-10'>
                                <span
                                    className='inline-flex items-center gap-2 bg-white/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-yellow-300 ring-1 ring-white/20'
                                    style={radius.chip}
                                >
                                    <MapPin className='size-3.5' strokeWidth={2.25} />
                                    {activeCampus.cities}
                                </span>
                                <h3 className='font-heading mt-5 text-2xl font-black tracking-tight text-white'>
                                    {activeCampus.region}
                                </h3>
                                <p className='mt-4 text-sm font-semibold leading-relaxed text-white/90'>
                                    {activeCampus.address}
                                </p>
                                <p className='mt-2 text-xs font-semibold leading-relaxed text-white/70'>
                                    {activeCampus.landmark}
                                </p>

                                <div className='mt-8 space-y-3 border-t border-white/15 pt-6'>
                                    <a
                                        href={`tel:${activeCampus.tel}`}
                                        className='inline-flex items-center gap-2.5 text-sm font-bold text-white transition-colors hover:text-yellow-300'
                                    >
                                        <Phone className='size-4' strokeWidth={2} />
                                        {activeCampus.phone}
                                    </a>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeCampus.mapQuery)}`}
                                        target='_blank'
                                        rel='noreferrer'
                                        className='flex items-center gap-2.5 text-sm font-bold text-white transition-colors hover:text-yellow-300'
                                    >
                                        <MapPin className='size-4' strokeWidth={2} />
                                        Get directions
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className='relative h-[320px] sm:h-[400px] lg:col-span-2 lg:h-auto lg:min-h-[440px]'>
                            <iframe
                                key={activeCampus.id}
                                title={`Map showing ${activeCampus.region}`}
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(activeCampus.mapQuery)}&z=14&output=embed`}
                                className='absolute inset-0 h-full w-full border-0'
                                loading='lazy'
                                allowFullScreen
                                referrerPolicy='no-referrer-when-downgrade'
                            />
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState(0)

    return (
        <section className='relative w-full overflow-hidden bg-surface-2/60 py-20 md:py-24'>
            <div className='container relative'>
                <SectionHeading
                    eyebrow='Before you ask'
                    title='Questions we hear every week'
                    description='If yours is not here, the form above reaches a real person — not an inbox that nobody checks.'
                />

                <div className='mx-auto mt-12 max-w-3xl space-y-4'>
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index
                        return (
                            <Reveal key={faq.question} delay={0.04 * index}>
                                <div
                                    className='overflow-hidden border border-line bg-surface shadow-[var(--shadow-soft)]'
                                    style={radius.card}
                                >
                                    <button
                                        type='button'
                                        aria-expanded={isOpen}
                                        onClick={() => setOpenIndex(isOpen ? -1 : index)}
                                        className='flex w-full items-center justify-between gap-4 px-7 py-5 text-left'
                                    >
                                        <span className='font-heading text-base font-bold tracking-tight text-ink md:text-lg'>
                                            {faq.question}
                                        </span>
                                        <ChevronDown
                                            className={cn(
                                                'size-5 shrink-0 text-blue-700 transition-transform duration-300 ease-spring dark:text-blue-300',
                                                isOpen && 'rotate-180',
                                            )}
                                            strokeWidth={2.25}
                                        />
                                    </button>
                                    <div
                                        className={cn(
                                            'grid transition-all duration-300 ease-spring',
                                            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                                        )}
                                    >
                                        <div className='overflow-hidden'>
                                            <p className='px-7 pb-6 text-sm font-semibold leading-relaxed text-muted'>
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

const ClosingCta = () => (
    <section className='brand-atmosphere relative w-full overflow-hidden py-20 md:py-24'>
        <div className='container relative z-10'>
            <SectionHeading
                dark
                eyebrow='We are ready when you are'
                title='The next step is a conversation'
                description='Call, write, or walk in — every great ADESUA story starts with a family saying hello.'
            />

            <Reveal delay={0.12} className='mt-10 text-center'>
                <div className='flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center'>
                    <Button to='/programs' size='xl' variant='secondary' className='border-transparent bg-white !text-[#1a1a1a] hover:bg-white/90'>
                        Explore our programs
                    </Button>
                    <Button
                        to='/about'
                        size='xl'
                        variant='outline'
                        className='border-white/25 text-white hover:bg-white/10'
                    >
                        Meet the school
                    </Button>
                </div>
            </Reveal>
        </div>
    </section>
)

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const ContactPage = () => {
    return (
        <main>
            <PageHeader
                title='Contact Us'
                description='Questions about enrolment, fees, or a campus visit? Real people answer here — usually the same day.'
                backgroundImage={ContactHeaderImage}
            />
            <DepartmentsSection />
            <FormSection />
            <MapSection />
            <FaqSection />
            <ClosingCta />
        </main>
    )
}

export default ContactPage

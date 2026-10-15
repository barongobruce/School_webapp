import Button from '../../../components/Button'
import featureImage from '../../../assets/student3.jpg'

const Future = () => {
  return (
    <section className='relative w-full overflow-hidden bg-surface py-16 md:py-20'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.16),transparent_70%)]'
      />

      <div className='container relative'>
        {/* Plain page copy: no card border or gradient panel */}
        <div className='space-y-4 text-sm font-semibold leading-relaxed text-ink md:text-base'>
          <h1 className='font-heading text-[clamp(2rem,4vw,4.2rem)] font-black leading-[1.05] tracking-tight text-white'>
            Your child`s future is bright!
          </h1>
          <p className='font-heading text-base font-bold leading-snug md:text-xl'>
            Barongo Academy is a progressive, multicultural, day and boarding school located in Kenya.
          </p>
          <p>
            We offer our students the highest standard of education, from Kindergarten to High School accommodating all cultures and religions from Kenya and around the world while providing the best programs that transform a child into a responsible young person and, in turn, impact the community positively.
          </p>
          <p>We strive to achieve our Mission based on our Vision.</p>
        </div>

        <div className='mt-7'>
          <Button to='/programs' size='lg'>
            Explore our programs
          </Button>
        </div>

        {/* Only the image has the asymmetrical rounded-corner design */}
        <div className='relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-[3rem_0.4rem_3rem_0.4rem] bg-[#173F76] shadow-[var(--shadow-soft)] md:mt-12'>
          <img
            src={featureImage}
            alt='Barongo Academy student on campus'
            className='absolute inset-0 h-full w-full object-cover'
          />
        </div>
      </div>
    </section>
  )
}

export default Future



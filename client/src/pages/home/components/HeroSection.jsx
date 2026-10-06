import Button from '../../../components/Button'
import HeroImage1 from '../../../assets/student7.jpg'
import HeroImage2 from '../../../assets/graduate3.jpg'
import HeroImage3 from '../../../assets/student1.jpg'
import HeroImage4 from '../../../assets/student12.jpg'

const HeroSection = () => {
  return (
    <section className='relative grid min-h-screen w-full place-items-center overflow-hidden brand-atmosphere py-24 pt-28 sm:py-28 sm:pt-32 lg:h-[88vh] lg:min-h-fit lg:py-24 lg:pt-20'>
      <div className='container relative z-10 flex flex-col items-center gap-10 sm:gap-12 lg:flex-row lg:items-stretch lg:gap-16 xl:gap-24'>
        <article className='w-full flex-1 text-center lg:flex lg:max-w-xl lg:flex-col lg:justify-center lg:text-left xl:max-w-none'>
          <h1 className='font-heading text-[clamp(2rem,7vw,4.2rem)] font-black leading-[1.05] tracking-tight text-white'>
            Better Future
            <br />
            For Your Kids
          </h1>
          <p className='mx-auto mt-3 max-w-md text-xs font-semibold leading-relaxed text-white/90 sm:mt-2 sm:text-sm md:text-base lg:mx-0'>
            At ADESUA Academy, we nurture curious minds, build strong character,
            and prepare every child for a brighter tomorrow.
          </p>
          <div className='mt-7 flex w-full flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start'>
            <Button
              to='/programs'
              size='xl'
              variant='outline'
              className='w-full border-white/25 text-white hover:bg-white/10 sm:w-auto'
            >
              Our Programs
            </Button>
            <Button
              to='/contact'
              size='xl'
              variant='secondary'
              className='animate-bounce-y w-full border-transparent bg-white !text-[#1a1a1a] hover:bg-white/90 sm:w-auto'
            >
              Enroll Now
            </Button>
          </div>
        </article>

        <article className='grid h-64 w-full max-w-[18rem] flex-1 grid-cols-2 gap-3 sm:h-80 sm:max-w-md sm:gap-5 md:h-96 md:max-w-lg lg:h-auto lg:max-w-none lg:gap-6 lg:py-8 xl:gap-8'>
          <div className='h-full w-full overflow-hidden bg-blue-900/40 ring-1 ring-white/10 rounded-full'>
            <img src={HeroImage1} alt='ADESUA Academy student' />
          </div>
          <div className='h-full w-full overflow-hidden bg-blue-900/40 ring-1 ring-white/10 rounded-tl-[50%] rounded-tr-3xl rounded-bl-3xl rounded-br-[50%]'>
            <img src={HeroImage2} alt='ADESUA Academy graduate' />
          </div>
          <div className='h-full w-full overflow-hidden bg-blue-900/40 ring-1 ring-white/10 rounded-3xl'>
            <img src={HeroImage3} alt='ADESUA Academy student in class' />
          </div>
          <div className='h-full w-full overflow-hidden bg-blue-900/40 ring-1 ring-white/10 rounded-tl-[50%] rounded-tr-3xl rounded-bl-3xl rounded-br-3xl'>
            <img src={HeroImage4} alt='ADESUA Academy student' />
          </div>
        </article>
      </div>
    </section>
  )
}

export default HeroSection

import React from 'react'
import HeroSection from './components/HeroSection'
import Future from './components/Future'
import SchoolBranches from './components/SchoolBranches'
import OurCommunity from './components/OurCommunity'
import Testimonials from './components/Testimonials'

const HomePage = () => {
  return (
    <main>
      <HeroSection />
      <Future />
      <SchoolBranches />
      <OurCommunity />
      <Testimonials />
    </main>
  )
}

export default HomePage
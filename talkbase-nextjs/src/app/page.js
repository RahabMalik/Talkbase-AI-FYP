import Hero from '@/components/sections/Hero'
import Navbar from '@/components/ui/Navbar'
import Landingpage from '@/components/sections/Landingpage'
import Footer from '@/components/sections/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero/>
      <Landingpage />
      <Footer />
    </>
  )
}
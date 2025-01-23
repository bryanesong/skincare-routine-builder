'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from "@/app/components/ui/button"
import { ArrowRight, Star, Shield, Sparkles, Users, Search } from 'lucide-react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
}

function AnimatedSection({ children }: { children: React.ReactNode }) {
  const controls = useAnimation()
  const [ref, inView] = useInView({ triggerOnce: true })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={stagger}
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-pink-50 to-white py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection>
                <motion.div className="space-y-8" variants={fadeInUp}>
                  <motion.div className="space-y-4" variants={fadeInUp}>
                    <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900" variants={fadeInUp}>
                      Build Your Perfect Skincare Routine
                    </motion.h1>
                    <motion.p className="text-lg sm:text-xl text-gray-600" variants={fadeInUp}>
                      Create, customize, and share your skincare routine with our powerful builder. Find products that work together perfectly for your skin type.
                    </motion.p>
                  </motion.div>
                  <motion.div className="flex flex-col sm:flex-row gap-4" variants={fadeInUp}>
                    <Button size="lg" asChild>
                      <Link href="/build">
                        Start Building <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/products">Browse Products</Link>
                    </Button>
                  </motion.div>
                  <motion.div className="flex items-center gap-8 text-sm text-gray-600" variants={fadeInUp}>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>4.9/5 rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>10k+ users</span>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatedSection>
              <motion.div
                className="relative lg:h-[600px]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Image
                  src="https://media.istockphoto.com/id/1409860515/vector/male-skin-care-concept-vector-poster-man-and-woman-applying-face-cream-while-standing-in.jpg?s=612x612&w=0&k=20&c=vfrIEF06GhiV-Px_UWJ5GiYFouTCedVTds2H2mfoom0="
                  alt="Skincare products arrangement"
                  width={600}
                  height={600}
                  className="rounded-2xl shadow-2xl"
                  priority
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-32 bg-white">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <motion.div className="text-center max-w-3xl mx-auto mb-16" variants={fadeInUp}>
                <motion.h2 className="text-3xl sm:text-4xl font-bold mb-4" variants={fadeInUp}>Everything you need to build the perfect routine</motion.h2>
                <motion.p className="text-gray-600" variants={fadeInUp}>Our powerful tools help you create a skincare routine that works for your unique needs.</motion.p>
              </motion.div>
            </AnimatedSection>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Search, title: "Smart Product Finder", description: "Find products that match your skin type and concerns with our intelligent search system." },
                { icon: Shield, title: "Compatibility Check", description: "Ensure all your products work together safely with our compatibility checker." },
                { icon: Sparkles, title: "Personalized Recommendations", description: "Get product suggestions based on your skin type, concerns, and budget." }
              ].map((feature, index) => (
                <AnimatedSection key={index}>
                  <motion.div
                    className="bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    variants={fadeInUp}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 sm:py-32 bg-gray-50">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <motion.div className="text-center max-w-3xl mx-auto mb-16" variants={fadeInUp}>
                <motion.h2 className="text-3xl sm:text-4xl font-bold mb-4" variants={fadeInUp}>Build your routine in minutes</motion.h2>
                <motion.p className="text-gray-600" variants={fadeInUp}>Follow our simple process to create your perfect skincare routine.</motion.p>
              </motion.div>
            </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: 1, title: "Select Your Products", description: "Browse our curated selection of skincare products filtered by your needs." },
                { step: 2, title: "Check Compatibility", description: "Our system ensures all your selected products work well together." },
                { step: 3, title: "Save & Share", description: "Save your routine and share it with the community." }
              ].map((item, index) => (
                <AnimatedSection key={index}>
                  <motion.div className="text-center" variants={fadeInUp}>
                    <motion.div
                      className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {item.step}
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <motion.div
                className="bg-primary rounded-3xl px-8 py-16 text-center text-white"
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.h2 className="text-3xl sm:text-4xl font-bold mb-4" variants={fadeInUp}>Ready to build your perfect routine?</motion.h2>
                <motion.p className="text-primary-foreground mb-8 max-w-2xl mx-auto" variants={fadeInUp}>
                  Join thousands of others who have found their perfect skincare routine using SkincarePicker.
                </motion.p>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/build">
                    Start Building Your Routine <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}


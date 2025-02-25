import Image from 'next/image'
import { Button } from "../components/ui/button"
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-16">
        <section className="py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <h1 className="text-4xl font-bold mb-6">About BuildMySkincare</h1>
              <p className="text-xl text-gray-600 mb-8">
                We're on a mission to simplify skincare routines and help everyone achieve their best skin.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                <p className="text-gray-600 mb-4">
                BuildMySkincare was born out of frustration with the overwhelming world of skincare products. Our founders, all skincare enthusiasts, realized that finding the right products and building an effective routine was far too complicated.
                </p>
                <p className="text-gray-600 mb-4">
                  We set out to create a platform that would make it easy for anyone to build a personalized skincare routine, regardless of their skin type or concerns. By combining expert knowledge with user data and advanced algorithms, we've created a tool that takes the guesswork out of skincare.
                </p>
                <Button>Learn More About Our Technology</Button>
              </div>
              <div className="relative h-[400px] animate-fade-in">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="BuildMySkincare team"
                  fill
                  className="object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", title: "Simplicity", description: "We believe skincare should be simple and accessible to everyone." },
                { icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z", title: "Science-Backed", description: "Our recommendations are based on scientific research and expert knowledge." },
                { icon: "M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4", title: "Personalization", description: "We understand that everyone's skin is unique and provide tailored solutions." },
              ].map((value, index) => (
                <div key={index} className="text-center animate-fade-in">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={value.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-4 text-center animate-fade-in">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-xl mb-8">
              Be part of a growing community of skincare enthusiasts. Share routines, get advice, and achieve your best skin together.
            </p>
            <Button size="lg" variant="secondary">
              Sign Up Now
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}


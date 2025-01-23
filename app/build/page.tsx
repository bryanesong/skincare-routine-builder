import RoutineBuilder from '../components/RoutineBuilder'

export default function BuildPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-white">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-pink-800">Build Your Perfect Skincare Routine</h1>
        <p className="text-lg text-center mb-8 text-gray-700">
          Answer a few questions about your skin, and we'll help you create a personalized skincare routine.
        </p>
        <RoutineBuilder />
      </main>
    </div>
  )
}


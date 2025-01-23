import Product from '../../components/Product'

// This would typically come from a database or API
const productDatabase = {
  cleanser: {
    dry: { name: "Gentle Hydrating Cleanser", description: "A creamy cleanser that doesn't strip the skin", usage: "Use morning and night" },
    oily: { name: "Foaming Oil Control Cleanser", description: "A foaming cleanser that removes excess oil", usage: "Use morning and night" },
    combination: { name: "Balanced pH Cleanser", description: "A cleanser that maintains skin's natural balance", usage: "Use morning and night" },
    normal: { name: "Refreshing Gel Cleanser", description: "A gentle gel cleanser for all skin types", usage: "Use morning and night" },
  },
  moisturizer: {
    dry: { name: "Rich Hydrating Cream", description: "A thick cream to deeply moisturize dry skin", usage: "Apply a generous amount morning and night" },
    oily: { name: "Oil-Free Gel Moisturizer", description: "A lightweight gel that hydrates without adding oil", usage: "Apply a thin layer morning and night" },
    combination: { name: "Balancing Lotion", description: "A lotion that hydrates dry areas without overwhelming oily areas", usage: "Apply to entire face morning and night" },
    normal: { name: "All-Purpose Moisturizer", description: "A versatile moisturizer suitable for normal skin", usage: "Apply morning and night" },
  },
  sunscreen: { name: "Broad Spectrum SPF 50", description: "A non-greasy sunscreen for all skin types", usage: "Apply generously as the last step of your morning routine" },
}

export default function RoutinePage({ searchParams }: { searchParams: { skinType: string, concerns: string } }) {
  const { skinType, concerns } = searchParams
  const skinConcerns = concerns ? concerns.split(',') : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-white">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-pink-800">Your Personalized Skincare Routine</h1>
        <p className="text-lg text-center mb-8 text-gray-700">
          Based on your {skinType} skin type and concerns with {skinConcerns.join(', ')}, here's your recommended routine:
        </p>
        <div className="space-y-6">
          <Product {...productDatabase.cleanser[skinType as keyof typeof productDatabase.cleanser]} />
          <Product {...productDatabase.moisturizer[skinType as keyof typeof productDatabase.moisturizer]} />
          <Product {...productDatabase.sunscreen} />
        </div>
      </main>
    </div>
  )
}


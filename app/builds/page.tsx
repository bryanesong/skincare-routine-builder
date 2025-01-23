import Link from 'next/link'
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardFooter } from "@/app/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

export default function CommunityBuilds() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center animate-fade-in">Community Builds</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((build) => (
              <Card key={build} className="animate-fade-in hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar>
                      <AvatarImage src={`https://i.pravatar.cc/40?img=${build}`} />
                      <AvatarFallback>U{build}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">User{build}</h3>
                      <p className="text-sm text-gray-500">Dry Skin Routine</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4">
                    <li className="text-sm flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Gentle Foaming Cleanser</li>
                    <li className="text-sm flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Hydrating Toner</li>
                    <li className="text-sm flex items-center"><span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>Vitamin C Serum</li>
                    <li className="text-sm flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>Moisturizing Cream</li>
                  </ul>
                  <p className="text-sm text-gray-600">This routine has helped me manage my dry skin and achieve a healthy glow!</p>
                </CardContent>
                <CardFooter className="bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between w-full text-gray-500">
                    <Button variant="ghost" size="sm" className="hover:text-red-500 transition-colors">
                      <Heart className="h-4 w-4 mr-2" />
                      24
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:text-blue-500 transition-colors">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      3
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:text-green-500 transition-colors">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}


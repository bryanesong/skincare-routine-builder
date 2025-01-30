'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from 'lucide-react'

export default function BuildList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Routine</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">Cleanser</h3>
                <p className="text-sm text-gray-500">No product selected</p>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">Toner</h3>
                <p className="text-sm text-gray-500">No product selected</p>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">Serum</h3>
                <p className="text-sm text-gray-500">No product selected</p>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">Moisturizer</h3>
                <p className="text-sm text-gray-500">No product selected</p>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Total</span>
            <span>$0.00</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


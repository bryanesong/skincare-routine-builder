import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"

interface ProductProps {
  name: string
  description: string
  usage: string
}

export default function Product({ name, description, usage }: ProductProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p><strong>How to use:</strong> {usage}</p>
      </CardContent>
    </Card>
  )
}


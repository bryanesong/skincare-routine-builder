import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"

export default function PrivacyPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Privacy Policy</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none">
                    <h2>1. Information We Collect</h2>
                    <p>
                        We collect information that you provide directly to us when you 
                        create an account and use our services.
                    </p>

                    <h2>2. How We Use Your Information</h2>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do 
                        eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>

                    <h2>3. Data Protection</h2>
                    <p>
                        We implement appropriate technical and organizational measures to 
                        protect your personal information.
                    </p>

                    {/* Add more sections as needed */}
                </CardContent>
            </Card>
        </div>
    )
} 
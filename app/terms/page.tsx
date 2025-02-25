import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"

export default function TermsPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Terms of Service</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none">
                    <h2>1. Introduction</h2>
                    <p>
                        These Terms of Service govern your use of our website and services. 
                        By using our services, you agree to these terms.
                    </p>

                    <h2>2. User Agreements</h2>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do 
                        eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>

                    <h2>3. Privacy Policy</h2>
                    <p>
                        Your privacy is important to us. Please review our Privacy Policy 
                        to understand how we collect and use your information.
                    </p>

                    {/* Add more sections as needed */}
                </CardContent>
            </Card>
        </div>
    )
} 
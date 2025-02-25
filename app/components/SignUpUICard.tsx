import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { login, signup } from '../login/action'
import Link from "next/link"

export default function SignUpUICard() {
    /*
        When a user signs up for the first time, they will get a confirmation email, and you probably will show a snack bar or something 
        telling the user to check their email inbox and confirm the email. When a user who has already signed up tries to sign up again, 
        Supabase will send them a magic link login email to the user, and upon clicking the link will sign them in. As far as you, the application 
        developer does not need to know if the user has already signed up or not. Supabase will handle the case automatically.

        More on this behavior here: https://github.com/supabase/supabase-js/issues/296#issuecomment-976200828
    */
    return (
        <Card className="w-full flex flex-row">
            <div className="flex-1 border-r">
                <CardHeader>
                    <CardTitle>Get Started Now</CardTitle>
                    <CardDescription>
                        Enter your credentials to create an account
                    </CardDescription>
                </CardHeader>
                <form>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 flex items-center justify-center gap-2"
                                onClick={() => {/* Add Google sign-in logic */}}
                            >
                                <img 
                                    src="https://authjs.dev/img/providers/google.svg" 
                                    alt="Google logo" 
                                    className="w-5 h-5"
                                />
                                Google
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 flex items-center justify-center gap-2"
                                onClick={() => {/* Add Facebook sign-in logic */}}
                            >
                                <img 
                                    src="https://authjs.dev/img/providers/facebook.svg" 
                                    alt="Facebook logo" 
                                    className="w-5 h-5"
                                />
                                Facebook
                            </Button>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">Or</span>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email*
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Display Name*
                            </label>
                            <input
                                id="display_name"
                                name="display_name"
                                type="text"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password*
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                            />
                        </div>
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                            </div>
                            <div className="ml-3">
                                <label htmlFor="terms" className="text-sm text-gray-700">
                                    I agree to the{' '}
                                    <Link href="/terms" className="font-medium text-primary hover:text-primary/80">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className="font-medium text-primary hover:text-primary/80">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full"
                            formAction={signup}
                        >
                            {false ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Creating account...
                                </span>
                            ) : (
                                "Sign Up"
                            )}
                        </Button>
                        <div className="text-sm text-center">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                                Log in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <span className="text-gray-500">Placeholder Image</span>
            </div>
        </Card>
    )
}


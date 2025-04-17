'use client'

import { motion } from "framer-motion"
import Image from 'next/image'
import { Alert, AlertDescription } from "@/components/ui/alert"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.message || "Invalid credentials")
            } else {
                router.push("/dashboard")
            }
        } catch (err) {
            console.error(err)
            setError("An unexpected error has occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-blue-500 items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0 ,scale: 0.9}}
                animate={{ opacity:1, scale:1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className={`flex justify-center mb-6`}
            >
                <div className={`bg-white/10 backdrop-blur-md rounded-full p-2 shadow-xl`}>
                    <Image
                        src="/logo.jpg"
                        alt="Logo"
                        width={90}
                        height={90}
                        className="rounded-full object-cover"
                    />

                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-md"
            >
                <Card className={`bg-blue-200 text-blue-800  backdrop-blur-md`}>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">
                            G-45 Main
                        </CardTitle>
                        <CardDescription className="text-center">
                            Enter Your Credentials to sign in to your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full max-w-md"
                                >
                                    <Alert variant="destructive" className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 mt-1" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}
                            <div className="space-y-2">
                                <input
                                    id="email"
                                    type="text"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div className="space-y-2">
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                        </form>
                    </CardContent>
                    <CardFooter className="text-center">
                        <Button className="w-full bg-blue-500 text-white" type="submit" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>

                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}

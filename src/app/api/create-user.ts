// pages/api/create-user.ts (or admin route)
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcrypt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { name, email, password, role } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const client = await clientPromise
        const db = client.db("churchdb")
        await db.collection("users").insertOne({
            name,
            email,
            password: hashedPassword,
            role: role || "leader",
        })
        res.status(201).json({ message: "User created" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Error creating user" })
    }
}

import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' })
  }

  const token = authHeader.split(' ')[1]

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }

  const { content } = req.body
  if (!content) {
    return res.status(400).json({ message: 'Comment content is required' })
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        content,
        userId: decoded.userId
      }
    })

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong' })
  }
}

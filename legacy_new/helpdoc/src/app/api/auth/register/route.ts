import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/api-response'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  clinicName: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, firstName, lastName, clinicName } = registerSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return errorResponse('EMAIL_EXISTS', 400)

    const hashedPassword = await bcrypt.hash(password, 12)

    // Transaction to create clinic + user + membership
    const result = await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: {
          name: clinicName,
          slug: clinicName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        }
      })

      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          role: 'CLINIC_ADMIN',
        }
      })

      await tx.clinicMember.create({
        data: {
          clinicId: clinic.id,
          userId: user.id,
          role: 'CLINIC_ADMIN',
        }
      })

      return { user, clinic }
    })

    return successResponse({ 
      id: result.user.id, 
      clinicId: result.clinic.id,
      email: result.user.email 
    }, 'Account created successfully', 201)

  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse('VALIDATION_ERROR', 422, error.message)
    return errorResponse('INTERNAL_SERVER_ERROR', 500)
  }
}

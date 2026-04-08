import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { successResponse, unauthorized } from '@/lib/api-response'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.clinicId) return unauthorized()

  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''

    if (!q) return successResponse([])

    const patients = await prisma.patient.findMany({
      where: {
        clinicId: session.user.clinicId,
        isActive: true,
        OR: [
          { firstName: { contains: q, mode: 'insensitive' as const } },
          { lastName: { contains: q, mode: 'insensitive' as const } },
          { phone: { contains: q } },
        ]
      },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
      }
    })

    const results = patients.map(p => ({
      ...p,
      name: `${p.firstName} ${p.lastName}`,
      age: Math.floor((new Date().getTime() - new Date(p.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)),
    }))

    return successResponse(results)
  } catch (error) {
    return successResponse([])
  }
}

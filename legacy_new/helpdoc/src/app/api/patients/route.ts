import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { errorResponse, successResponse, unauthorized, validationError } from '@/lib/api-response'
import { patientSchema } from '@/lib/validations'
import { audit, AUDIT_ACTIONS } from '@/lib/audit'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.clinicId) return unauthorized()

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const where = {
      clinicId: session.user.clinicId,
      isActive: true,
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search } },
      ]
    }

    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      })
    ])

    return successResponse({
      patients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    return errorResponse('INTERNAL_SERVER_ERROR', 500)
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.clinicId) return unauthorized()

  try {
    const body = await req.json()
    const validated = patientSchema.parse(body)

    const patient = await prisma.patient.create({
      data: {
        ...validated,
        clinicId: session.user.clinicId,
        dateOfBirth: new Date(validated.dateOfBirth),
        allergies: validated.allergies ? validated.allergies.split(',').map(s => s.trim()) : [],
        chronicConditions: validated.chronicConditions ? validated.chronicConditions.split(',').map(s => s.trim()) : [],
      }
    })

    await audit(session.user.clinicId, {
      userId: session.user.id,
      action: AUDIT_ACTIONS.CREATE_PATIENT,
      resource: 'PATIENT',
      resourceId: patient.id,
      metadata: { patientName: `${patient.firstName} ${patient.lastName}` }
    })

    return successResponse(patient, 'Patient created successfully', 201)
  } catch (error: any) {
    if (error.name === 'ZodError') return validationError(error.errors)
    return errorResponse('INTERNAL_SERVER_ERROR', 500)
  }
}

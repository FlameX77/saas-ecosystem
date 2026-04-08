import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { errorResponse, successResponse, unauthorized, notFound } from '@/lib/api-response'
import { audit, AUDIT_ACTIONS } from '@/lib/audit'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.clinicId) return unauthorized()

  const { id } = await params

  try {
    const patient = await prisma.patient.findUnique({
      where: { id: id, clinicId: session.user.clinicId }
    })

    if (!patient) return notFound('Patient not found')

    await audit(session.user.clinicId, {
      userId: session.user.id,
      action: AUDIT_ACTIONS.VIEW_PATIENT,
      resource: 'PATIENT',
      resourceId: patient.id,
    })

    return successResponse(patient)
  } catch (error) {
    return errorResponse('INTERNAL_SERVER_ERROR', 500)
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.clinicId) return unauthorized()

  const { id } = await params

  try {
    const body = await req.json()
    const { id: _, ...data } = body

    const patient = await prisma.patient.update({
      where: { id: id, clinicId: session.user.clinicId },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      }
    })

    await audit(session.user.clinicId, {
      userId: session.user.id,
      action: AUDIT_ACTIONS.UPDATE_PATIENT,
      resource: 'PATIENT',
      resourceId: patient.id,
      metadata: { changes: Object.keys(data) }
    })

    return successResponse(patient, 'Patient updated successfully')
  } catch (error) {
    return errorResponse('INTERNAL_SERVER_ERROR', 500)
  }
}

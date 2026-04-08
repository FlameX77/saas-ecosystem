import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { success, error as apiError } from '@/lib/api-response'
import { z } from 'zod'
import { authRateLimit } from '@/lib/ratelimit'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy')

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'doctor']).default('doctor'),
})


export async function POST(request: NextRequest) {
  try {
    const { clinicId, user, doctor } = await getAuthenticatedUser(request)
    
    // Rate limit per clinic (authRateLimit for invitations as well)
    const { success: limitOk } = await authRateLimit.limit(`invite_${clinicId}`)
    if (!limitOk) {
      return apiError('Too many invitations sent. Please wait.', 429)
    }

    const userRole = doctor.role

    if (userRole !== 'admin' && userRole !== 'owner') {
      return apiError('Only admins can invite new doctors.', 403)
    }

    const { email, role } = inviteSchema.parse(await request.json())

    const supabase = await createClient()

    // Create invitation record
    const { data: invite, error } = await supabase.from('invitations').insert({
      clinic_id: clinicId,
      inviter_id: user.id,
      email,
      role,
    }).select().single()

    if (error || !invite) throw error

    // Send email using Resend
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/join?token=${invite.token}`
    
    // In dev or valid env:
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'ScribeAI <onboarding@scribeai.com>',
        to: email,
        subject: 'You have been invited to ScribeAI',
        html: `<p>You have been invited to join a clinic on ScribeAI as a ${role}.</p>
               <p><a href="${inviteLink}">Click here to join</a></p>`,
      })
    } else {
      console.log('Sending invite linking:', inviteLink)
    }

    return success({ sent: true, token: invite.token }) // return token only for debugging if no email set up
  } catch (err) {
    console.error('Invite failed:', err)
    return apiError(err instanceof Error ? err.message : 'Failed to send invite', 500)
  }
}

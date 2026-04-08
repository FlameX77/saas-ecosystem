import { NextResponse } from 'next/server'
import { ApiResponse, PaginatedResponse } from './types'

export const successResponse = <T>(data: T, message?: string, status = 200) => {
  return NextResponse.json<ApiResponse<T>>({
    success: true,
    data,
    message,
  }, { status })
}

export const errorResponse = (error: string, status = 400, message?: string) => {
  return NextResponse.json<ApiResponse>({
    success: false,
    error,
    message,
  }, { status })
}

export const paginatedResponse = <T>(
  data: T[],
  pagination: PaginatedResponse<T>['pagination'],
  message?: string
) => {
  return NextResponse.json<PaginatedResponse<T>>({
    success: true,
    data,
    pagination,
    message,
  })
}

export const unauthorized = (message = 'Unauthorized') => errorResponse('UNAUTHORIZED', 401, message)
export const forbidden = (message = 'Forbidden') => errorResponse('FORBIDDEN', 403, message)
export const notFound = (message = 'Not Found') => errorResponse('NOT_FOUND', 404, message)
export const internalError = (message = 'Internal Server Error') => errorResponse('INTERNAL_SERVER_ERROR', 500, message)
export const badRequest = (message = 'Bad Request') => errorResponse('BAD_REQUEST', 400, message)
export const validationError = (error: any) => errorResponse('VALIDATION_ERROR', 422, JSON.stringify(error))

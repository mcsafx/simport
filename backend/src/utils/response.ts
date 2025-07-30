import { Response } from 'express'
import { ApiResponse } from '../types'

export const successResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data
  }
  return res.status(statusCode).json(response)
}

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 400,
  error?: string
) => {
  const response: ApiResponse = {
    success: false,
    message,
    error
  }
  return res.status(statusCode).json(response)
}
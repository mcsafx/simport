import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { successResponse, errorResponse } from '../utils/response'

const router = Router()
const prisma = new PrismaClient()

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    // For MVP, we'll use a mock user
    const mockUser = {
      id: 'mock-user-id',
      nome: 'Magnus Silva',
      email: 'magnus@biocol.com.br',
      role: 'coordenador' as const
    }

    // Mock password check (demo123)
    const mockPasswordHash = await bcrypt.hash('demo123', 10)
    const isValidPassword = await bcrypt.compare(password, mockPasswordHash)

    if (email !== 'magnus@biocol.com.br' || !isValidPassword) {
      return errorResponse(res, 'Credenciais inválidas', 401)
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
    
    const token = jwt.sign(
      { 
        userId: mockUser.id, 
        email: mockUser.email, 
        role: mockUser.role 
      },
      jwtSecret
    )

    return successResponse(res, {
      user: mockUser,
      token
    }, 'Login realizado com sucesso')

  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'Dados inválidos', 400, error.issues[0].message)
    }
    
    console.error('Login error:', error)
    return errorResponse(res, 'Erro interno do servidor', 500)
  }
})

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return errorResponse(res, 'Token não fornecido', 401)
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
    const decoded = jwt.verify(token, jwtSecret) as any
    
    return successResponse(res, {
      user: {
        id: decoded.userId,
        nome: 'Magnus Silva',
        email: decoded.email,
        role: decoded.role
      }
    }, 'Token válido')

  } catch (error) {
    return errorResponse(res, 'Token inválido', 401)
  }
})

export default router
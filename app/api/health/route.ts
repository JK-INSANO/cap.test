import { NextResponse } from 'next/server'
import {prisma} from '@/lib/server/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json(
      { 
        status: 'ok', 
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: 'connected'
      }, 
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        database: 'disconnected',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 503 }
    )
  }
}
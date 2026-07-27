import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/dbConnect'
import ClientModel from '@/lib/models/ClientModel'

export const DELETE = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.isSuperAdmin) {
      return NextResponse.json(
        { message: 'Solo el superAdministrador puede eliminar clientes' },
        { status: 403 }
      )
    }

    await dbConnect()
    const { id } = await params

    const deletedClient = await ClientModel.findByIdAndDelete(id)

    if (!deletedClient) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'Cliente eliminado exitosamente' },
      { status: 200 }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}

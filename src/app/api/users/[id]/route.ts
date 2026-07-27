import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/dbConnect'
import UserModel from '@/lib/models/UserModel'
import { Types } from 'mongoose'

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.isSuperAdmin) {
      return Response.json(
        { message: 'Solo el superAdministrador puede eliminar usuarios' },
        { status: 403 }
      )
    }

    const { id } = await params

    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    await dbConnect()
    const deletedUser = await UserModel.findByIdAndDelete(id).select('-password')

    if (!deletedUser) {
      return Response.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return Response.json(
      { message: 'Usuario eliminado exitosamente', user: deletedUser },
      { status: 200 }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message: errorMessage }, { status: 500 })
  }
}

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.isSuperAdmin) {
      return Response.json(
        { message: 'Solo el superAdministrador puede cambiar roles de usuario' },
        { status: 403 }
      )
    }

    const { id } = await params
    
    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { isAdmin } = body

    if (typeof isAdmin !== 'boolean') {
      return Response.json(
        { message: 'El campo isAdmin debe ser un booleano' },
        { status: 422 }
      )
    }

    await dbConnect()
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { isAdmin },
      { returnDocument: 'after' }
    ).select('-password')

    if (!updatedUser) {
      return Response.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return Response.json(
      { message: 'Usuario actualizado exitosamente', user: updatedUser },
      { status: 200 }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message: errorMessage }, { status: 500 })
  }
}

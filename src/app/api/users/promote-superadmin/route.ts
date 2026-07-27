import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/dbConnect'
import UserModel from '@/lib/models/UserModel'

export const POST = async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.isAdmin) {
      return Response.json(
        { message: 'Solo los administradores pueden promover superAdministradores' },
        { status: 403 }
      )
    }

    await dbConnect()

    const existingSuperAdmin = await UserModel.findOne({ isSuperAdmin: true })
    if (existingSuperAdmin) {
      return Response.json(
        { message: 'Ya existe un superAdministrador en el sistema. Use el panel de usuarios para gestionar roles.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return Response.json(
        { message: 'Se requiere el ID del usuario a promover' },
        { status: 400 }
      )
    }

    const user = await UserModel.findById(userId)
    if (!user) {
      return Response.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    if (user.isSuperAdmin) {
      return Response.json(
        { message: 'Este usuario ya es superAdministrador' },
        { status: 400 }
      )
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isSuperAdmin: true, isAdmin: true },
      { returnDocument: 'after' }
    ).select('-password')

    return Response.json(
      { message: `${user.name} ha sido promovido a superAdministrador exitosamente`, user: updatedUser },
      { status: 200 }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message: errorMessage }, { status: 500 })
  }
}

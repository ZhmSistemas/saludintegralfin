'use client'

import { useEffect, useState } from 'react'
import { User } from '@/lib/models/UserModel'
import { showToast } from 'nextjs-toast-notify'
import { AlertTriangle } from 'lucide-react'

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    userId: string | null
    userName: string
    currentStatus: boolean
  }>({
    isOpen: false,
    userId: null,
    userName: '',
    currentStatus: false
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/users')
      
      if (!response.ok) {
        throw new Error('Error al cargar los usuarios')
      }
      
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      showToast.error(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    const user = users.find(u => u._id === userId)
    if (!user) return

    setConfirmModal({
      isOpen: true,
      userId,
      userName: user.name,
      currentStatus
    })
  }

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      userId: null,
      userName: '',
      currentStatus: false
    })
  }

  const confirmToggleAdmin = async () => {
    if (!confirmModal.userId) return

    const { userId, currentStatus } = confirmModal

    try {
      setUpdating(userId)
      closeConfirmModal()

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAdmin: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el usuario')
      }

      const updatedUser = await response.json()
      setUsers(users.map(user => 
        user._id === userId ? updatedUser.user : user
      ))

      const successMessage = currentStatus 
        ? 'Permisos de administrador removidos exitosamente'
        : 'Permisos de administrador otorgados exitosamente'
      
      showToast.success(successMessage)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      showToast.error(errorMessage)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return <div className="p-4">Cargando usuarios...</div>
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>
  }

  if (users.length === 0) {
    return <div className="p-4">No hay usuarios registrados</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
              <th className="border border-gray-300 px-4 py-2 text-left">WhatsApp</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Administrador</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                <td className="border border-gray-300 px-4 py-2">{user.whatsapp}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <span className={`px-3 py-1 rounded text-white text-sm font-semibold ${
                    user.isAdmin ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    {user.isAdmin ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    onClick={() => toggleAdmin(user._id, user.isAdmin)}
                    disabled={updating === user._id}
                    className={`px-4 py-2 rounded text-white font-semibold transition ${
                      user.isAdmin
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } ${updating === user._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {updating === user._id ? 'Actualizando...' : (
                      user.isAdmin ? 'Quitar Admin' : 'Hacer Admin'
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar cambio de permisos
              </h3>
            </div>
            <p className="mb-6 text-sm text-gray-600">
              ¿Está seguro que desea {confirmModal.currentStatus ? 'quitar' : 'otorgar'} permisos de administrador al usuario{" "}
              <span className="font-semibold">{confirmModal.userName}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeConfirmModal}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmToggleAdmin}
                disabled={updating === confirmModal.userId}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
                  confirmModal.currentStatus
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-70`}
              >
                {updating === confirmModal.userId ? 'Actualizando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

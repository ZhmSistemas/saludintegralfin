'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { showToast } from 'nextjs-toast-notify'
import { Pencil, Trash2 } from 'lucide-react'
import { Product } from '@/lib/models/ProductModel'

export default function ProductList({ products }: { products: Product[] }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const isSuperAdmin = session?.user?.isSuperAdmin === true

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Error al eliminar producto')

      router.refresh()
      showToast.success('Producto eliminado exitosamente')
    } catch {
      showToast.error('Error al eliminar el producto')
    } finally {
      setIsDeleting(false)
      setProductToDelete(null)
    }
  }

  if (products.length === 0) {
    return <p className="text-center text-gray-500">No hay productos registrados</p>
  }

  return (
    <>
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product._id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-600">Precio: ${product.price}</p>
              </div>
              <div className="text-sm text-gray-600">
                <p>Stock: {product.stock}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => router.push(`/dashboard/productos/editaproducto/${product._id}`)}
                className="flex items-center gap-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => setProductToDelete(product._id)}
                  className="flex items-center gap-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Confirmar eliminación</h3>
            <p className="mb-6 text-gray-600">¿Estás seguro de eliminar este producto?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setProductToDelete(null)}
                className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(productToDelete)}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

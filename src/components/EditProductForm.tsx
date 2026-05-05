'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { showToast } from 'nextjs-toast-notify'
import { Save, ArrowLeft } from 'lucide-react'
import type { Product } from '@/lib/models/ProductModel'

type FormData = {
  name: string
  price: number
  description: string
  stock: number
}

export default function EditProductForm({ product }: { product: Product }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: product.name,
      price: product.price,
      description: product.description || '',
      stock: product.stock || 0,
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al actualizar el producto')
      }

      showToast.success('Producto actualizado exitosamente')
      setTimeout(() => {
        // Notificar al dashboard padre que debe cambiar la selección
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'UPDATE_DASHBOARD_SELECTION',
            option: 'muestraproducto'
          }, '*')
        }
        router.push('/dashboard/productos/mostrarproductos')
      }, 1500)
    } catch (error) {
      if (error instanceof Error) {
        showToast.error(error.message)
      } else {
        showToast.error('Ocurrió un error inesperado')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Producto
            </label>
            <input
              type="text"
              {...register('name', { required: 'El nombre es obligatorio' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register('price', { 
                  required: 'El precio es obligatorio',
                  min: { value: 0, message: 'El precio debe ser mayor a 0' }
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stock
              </label>
              <input
                type="number"
                min="0"
                {...register('stock', { 
                  required: 'El stock es obligatorio',
                  min: { value: 0, message: 'El stock no puede ser negativo' }
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  )
}

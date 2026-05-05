import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import ProductModel from '@/lib/models/ProductModel'

export const GET = async (request: NextRequest) => {
  try {
    await dbConnect()
    const products = await ProductModel.find({}).sort({ createdAt: -1 })
    return Response.json(products, { status: 200 })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { image_url, name, price, description, stock } = body

    if (!name || !price) {
      return Response.json(
        { message: 'Nombre y precio son obligatorios' },
        { status: 422 }
      )
    }

    await dbConnect()
    const newProduct = new ProductModel({      
      name,
      price: Number(price),
      description,
      stock: Number(stock) || 0,
      image: image_url,
    })

    await newProduct.save()
    return Response.json(
      { message: 'Producto creado exitosamente', product: newProduct },
      { status: 201 }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}

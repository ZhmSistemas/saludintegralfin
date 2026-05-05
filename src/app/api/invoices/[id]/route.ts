import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import InvoiceModel from '@/lib/models/InvoiceModel'

export const GET = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await dbConnect()
    const { id } = await params
    const invoice = await InvoiceModel.findById(id)

    if (!invoice) {
      return Response.json(
        { message: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    return Response.json(invoice, { status: 200 })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}

export const PATCH = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const body = await request.json()
    const { payment } = body

    if (!payment || !payment.amount) {
      return Response.json(
        { message: 'Monto de pago es obligatorio' },
        { status: 422 }
      )
    }

    await dbConnect()
    const { id } = await params
    const invoice = await InvoiceModel.findById(id)

    if (!invoice) {
      return Response.json(
        { message: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    invoice.payments.push({
      amount: Number(payment.amount),
      date: new Date(),
      method: payment.method || 'cash',
    })

    invoice.paidAmount = invoice.payments.reduce((acc: number, p: { amount: number }) => acc + p.amount, 0)
    invoice.balance = invoice.total - invoice.paidAmount
    invoice.status = invoice.balance <= 0 ? 'paid' : invoice.paidAmount > 0 ? 'partial' : 'pending'

    await invoice.save()

    return Response.json(
      { message: 'Pago registrado exitosamente', invoice },
      { status: 200 }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}

export const DELETE = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await dbConnect()
    const { id } = await params
    const invoice = await InvoiceModel.findById(id)

    if (!invoice) {
      return Response.json(
        { message: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    await InvoiceModel.findByIdAndDelete(id)

    return Response.json(
      { message: 'Factura eliminada exitosamente' },
      { status: 200 }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}

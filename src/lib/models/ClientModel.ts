import mongoose, { Schema } from 'mongoose'

export type Client = {
  _id: string
  establishmentName: string
  contactName: string
  whatsapp?: string
  address: string
  createdAt: Date
  updatedAt: Date
}

const ClientSchema = new Schema({
  _id: { type: String, required: true },
  establishmentName: { type: String, required: true },
  contactName: { type: String, required: true },
  address: { type: String, required: true },
}, { timestamps: true })

const ClientModel = mongoose.models?.Client || mongoose.model('Client', ClientSchema)

export default ClientModel

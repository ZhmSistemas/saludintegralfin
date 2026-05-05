import mongoose from 'mongoose'

async function dbConnect() {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URI!)
    if (connect) {
      console.log('Conectado a la Base de Datos')
    }
  } catch (error) {
    throw new Error('Fallo la conexión!' + error)
    console.log(error)
  }
}

export default dbConnect

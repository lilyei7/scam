// Database configuration
// Este archivo puede ser usado para configurar una conexión a base de datos real
// como MongoDB, PostgreSQL, o Supabase

// Para MongoDB (mongoose)
/*
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Por favor define la variable MONGODB_URI en .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
*/

// Para Supabase
/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
*/

// Configuración actual: Almacenamiento en memoria (solo para desarrollo)
export const dbConfig = {
  type: 'memory',
  note: 'Para producción, configurar una base de datos real como MongoDB o Supabase'
};

// Esquema de comentario para referencia
export const commentSchema = {
  id: 'string', // UUID
  name: 'string', // Máximo 100 caracteres
  email: 'string', // Opcional, válido formato email
  comment: 'string', // Máximo 1000 caracteres
  timestamp: 'ISO string', // Fecha de creación
  // Campos adicionales que se pueden agregar:
  // likes: 'number',
  // replies: 'array',
  // isApproved: 'boolean',
  // userId: 'string'
};

export default dbConfig;

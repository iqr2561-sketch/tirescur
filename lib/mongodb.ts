import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';

const uri: string = process.env.MONGODB_URI || '';

if (!uri) {
  console.error('MONGODB_URI no está configurada. Verifica las variables de entorno en Vercel.');
  throw new Error('MONGODB_URI environment variable is not set. Please configure it in Vercel settings.');
}

const options: MongoClientOptions = {
  appName: "devrel.vercel.integration",
  maxIdleTimeMS: 5000,
  maxPoolSize: 10, // Mantener conexiones en el pool
  serverSelectionTimeoutMS: 5000, // Timeout para seleccionar servidor
  socketTimeoutMS: 45000, // Timeout para operaciones de socket
  connectTimeoutMS: 10000, // Timeout para establecer conexión
  retryWrites: true, // Reintentos automáticos para escrituras
  retryReads: true, // Reintentos automáticos para lecturas
};

const client = new MongoClient(uri, options);

// Attach the client to ensure proper cleanup on function suspension
attachDatabasePool(client);

// Export a module-scoped MongoClient to ensure the client can be shared across functions.
export default client;

// Funciones auxiliares para mantener compatibilidad con el código existente
export async function getDatabase(): Promise<Db> {
  try {
    // El cliente se conecta automáticamente cuando se necesite con attachDatabasePool
    // MongoDB driver maneja la conexión de forma eficiente
    const db = client.db('tires'); // Nombre de la base de datos
    console.log('✅ Conectado exitosamente a la base de datos "tires"');
    return db;
  } catch (error: any) {
    console.error('❌ Error connecting to MongoDB:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      code: error?.code
    });
    
    // Proporcionar mensajes más específicos según el tipo de error
    if (error?.message?.includes('MONGODB_URI')) {
      throw new Error('MONGODB_URI environment variable is not set. Please configure it in Vercel settings.');
    }
    
    if (error?.name === 'MongoServerError' || error?.name === 'MongoNetworkError') {
      throw new Error(`MongoDB connection error: ${error.message}`);
    }
    
    throw new Error(`Failed to connect to MongoDB database: ${error?.message || 'Unknown error'}`);
  }
}

export async function getCollection<T>(collectionName: string) {
  try {
    const db = await getDatabase();
    return db.collection<T>(collectionName);
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    throw error;
  }
}

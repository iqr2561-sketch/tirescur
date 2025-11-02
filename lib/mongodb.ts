import { MongoClient, Db } from 'mongodb';

const uri: string = process.env.MONGODB_URI || '';

if (!uri) {
  console.error('MONGODB_URI no está configurada. Verifica las variables de entorno en Vercel.');
  throw new Error('MONGODB_URI environment variable is not set. Please configure it in Vercel settings.');
}

const options = {
  maxPoolSize: 10, // Mantener conexiones en el pool
  serverSelectionTimeoutMS: 5000, // Timeout para seleccionar servidor
  socketTimeoutMS: 45000, // Timeout para operaciones de socket
  connectTimeoutMS: 10000, // Timeout para establecer conexión
  retryWrites: true, // Reintentos automáticos para escrituras
  retryReads: true, // Reintentos automáticos para lecturas
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Para Vercel serverless functions, usar un patrón singleton
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, también usar global para Vercel serverless
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise;
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


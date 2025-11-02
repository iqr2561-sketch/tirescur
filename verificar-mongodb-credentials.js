// Script para verificar las credenciales de MongoDB localmente
// Uso: node verificar-mongodb-credentials.js

import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';

// Cargar variables de entorno si existe archivo .env
try {
  const envFile = readFileSync('.env', 'utf8');
  const envLines = envFile.split('\n');
  envLines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  });
} catch (error) {
  console.log('⚠️  No se encontró archivo .env, usando variables del sistema o URI por defecto');
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Vercel-Admin-tires:Efqvml4VDrEQiXKh@tires.4gopjvs.mongodb.net/?retryWrites=true&w=majority';

console.log('🔍 Verificando credenciales de MongoDB...\n');
console.log('URI (sin contraseña visible):', MONGODB_URI.replace(/:\w+@/, ':****@'));
console.log('');

// Función para parsear la URI y extraer información
function parseMongoURI(uri) {
  try {
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)?\?*(.*)/);
    if (match) {
      return {
        username: match[1],
        password: match[2],
        host: match[3],
        database: match[4] || '',
        params: match[5] || ''
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

const parsed = parseMongoURI(MONGODB_URI);
if (parsed) {
  console.log('📋 Información de la URI:');
  console.log(`   Usuario: ${parsed.username}`);
  console.log(`   Contraseña: ${parsed.password.substring(0, 3)}****`);
  console.log(`   Host: ${parsed.host}`);
  console.log(`   Base de datos: ${parsed.database || '(definida en conexión)'}`);
  console.log(`   Parámetros: ${parsed.params}`);
  console.log('');
}

// Intentar conectar
async function testConnection() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Test 1: Verificar que la URI está presente
  if (!MONGODB_URI) {
    results.tests.push({
      test: 'MONGODB_URI presente',
      status: '❌ ERROR',
      details: 'La variable MONGODB_URI no está definida'
    });
    return results;
  }

  results.tests.push({
    test: 'MONGODB_URI presente',
    status: '✅ OK',
    details: 'URI encontrada'
  });

  // Test 2: Verificar formato de la URI
  if (!MONGODB_URI.startsWith('mongodb+srv://') && !MONGODB_URI.startsWith('mongodb://')) {
    results.tests.push({
      test: 'Formato de URI',
      status: '❌ ERROR',
      details: 'La URI no tiene el formato correcto (debe comenzar con mongodb+srv:// o mongodb://)'
    });
    return results;
  }

  results.tests.push({
    test: 'Formato de URI',
    status: '✅ OK',
    details: 'Formato válido'
  });

  // Test 3: Intentar conectar
  let client;
  try {
    console.log('🔄 Intentando conectar a MongoDB...');
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });

    await client.connect();
    console.log('✅ Conexión exitosa!\n');

    results.tests.push({
      test: 'Conexión a MongoDB',
      status: '✅ OK',
      details: 'Conexión establecida correctamente'
    });

    // Test 4: Verificar base de datos
    const db = client.db('tires');
    results.tests.push({
      test: 'Acceso a base de datos "tires"',
      status: '✅ OK',
      details: 'Base de datos accesible'
    });

    // Test 5: Listar colecciones
    const collections = await db.listCollections().toArray();
    results.tests.push({
      test: 'Colecciones disponibles',
      status: '✅ OK',
      details: `Encontradas ${collections.length} colecciones: ${collections.map(c => c.name).join(', ') || 'ninguna'}`
    });

    // Test 6: Probar operaciones de lectura
    try {
      const productsCollection = db.collection('products');
      const productCount = await productsCollection.countDocuments();
      results.tests.push({
        test: 'Operación de lectura',
        status: '✅ OK',
        details: `${productCount} productos en la colección`
      });
    } catch (error) {
      results.tests.push({
        test: 'Operación de lectura',
        status: '⚠️ ADVERTENCIA',
        details: `Error al leer: ${error.message}`
      });
    }

    await client.close();
    console.log('✅ Conexión cerrada correctamente\n');

  } catch (error) {
    results.tests.push({
      test: 'Conexión a MongoDB',
      status: '❌ ERROR',
      details: error.message || 'Error desconocido'
    });

    // Mensajes de ayuda según el tipo de error
    if (error.message?.includes('authentication')) {
      results.help = '❌ Error de autenticación: Usuario o contraseña incorrectos';
      results.solution = 'Verifica en MongoDB Atlas que el usuario "Vercel-Admin-tires" existe y la contraseña es correcta';
    } else if (error.message?.includes('timeout')) {
      results.help = '❌ Timeout: No se pudo conectar en el tiempo esperado';
      results.solution = 'Verifica en MongoDB Atlas → Network Access que tu IP esté permitida (o agrega 0.0.0.0/0 temporalmente)';
    } else if (error.message?.includes('IP')) {
      results.help = '❌ IP no permitida';
      results.solution = 'Ve a MongoDB Atlas → Network Access y agrega tu IP o 0.0.0.0/0 para permitir todas las IPs';
    }
  }

  return results;
}

// Ejecutar pruebas
testConnection()
  .then(results => {
    console.log('📊 Resultados de las pruebas:\n');
    results.tests.forEach(test => {
      console.log(`${test.status} ${test.test}`);
      console.log(`   ${test.details}`);
    });

    if (results.help) {
      console.log('\n' + results.help);
      console.log('💡 Solución: ' + results.solution);
    }

    const passed = results.tests.filter(t => t.status.includes('✅')).length;
    const total = results.tests.length;
    console.log(`\n✅ ${passed}/${total} pruebas pasadas`);

    if (passed < total) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Error ejecutando las pruebas:', error);
    process.exit(1);
  });


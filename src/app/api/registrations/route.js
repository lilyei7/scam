import { NextRequest, NextResponse } from 'next/server';

// Simulación de base de datos (en producción usar MongoDB, PostgreSQL, etc.)
const registrations = new Map();

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Generar ID único para el registro
    const registrationId = `REG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Estructura de datos del registro
    const registrationData = {
      id: registrationId,
      timestamp: new Date().toISOString(),
      personalData: {
        nombre: data.nombre || '',
        telefono: data.telefono || '',
        ine: data.ine || '',
        domicilio: data.domicilio || '',
        verificacion: data.verificacion || ''
      },
      faceVerification: {
        verified: data.faceVerification?.verified || false,
        method: data.faceVerification?.method || 'unknown',
        quality: data.faceVerification?.quality || 0,
        timestamp: data.faceVerification?.timestamp || new Date().toISOString(),
        faceData: data.faceVerification?.faceData || null
      },
      status: 'pending_ine_verification', // pending_ine_verification, verified, rejected
      ineComparison: null, // Se llenará después de la comparación
      metadata: {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        browser: detectBrowser(request.headers.get('user-agent')),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    };
    
    // Guardar en "base de datos"
    registrations.set(registrationId, registrationData);
    
    console.log(`📝 Nuevo registro guardado: ${registrationId}`);
    console.log(`👤 Usuario: ${data.nombre}`);
    console.log(`📞 Teléfono: ${data.telefono}`);
    console.log(`🆔 INE: ${data.ine}`);
    console.log(`✅ Verificación facial: ${data.faceVerification?.verified ? 'Exitosa' : 'Pendiente'}`);
    
    return NextResponse.json({
      success: true,
      registrationId: registrationId,
      message: 'Registro guardado exitosamente',
      data: {
        id: registrationId,
        status: registrationData.status,
        personalData: registrationData.personalData,
        faceVerification: {
          verified: registrationData.faceVerification.verified,
          quality: registrationData.faceVerification.quality
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error guardando registro:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('id');
    
    if (registrationId) {
      // Obtener un registro específico
      const registration = registrations.get(registrationId);
      
      if (!registration) {
        return NextResponse.json({
          success: false,
          error: 'Registro no encontrado'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        data: registration
      });
    } else {
      // Obtener todos los registros (para admin)
      const allRegistrations = Array.from(registrations.values());
      
      return NextResponse.json({
        success: true,
        count: allRegistrations.length,
        data: allRegistrations
      });
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo registros:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// Función auxiliar para detectar navegador
function detectBrowser(userAgent) {
  if (!userAgent) return 'unknown';
  
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  
  return 'unknown';
}

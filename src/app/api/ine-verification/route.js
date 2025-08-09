import { NextRequest, NextResponse } from 'next/server';

// Simulación de base de datos (importar la misma que registrations)
const registrations = new Map();

export async function POST(request) {
  try {
    const data = await request.json();
    const { registrationId, ineData, comparisonResult } = data;
    
    // Verificar que existe el registro
    const registration = registrations.get(registrationId);
    if (!registration) {
      return NextResponse.json({
        success: false,
        error: 'Registro no encontrado'
      }, { status: 404 });
    }
    
    // Procesar comparación con INE
    const ineComparison = {
      timestamp: new Date().toISOString(),
      ineData: {
        number: ineData?.number || registration.personalData.ine,
        photo: ineData?.photo || null,
        name: ineData?.name || null,
        verified: ineData?.verified || false
      },
      comparison: {
        similarity: comparisonResult?.similarity || 0,
        isMatch: comparisonResult?.isMatch || false,
        confidence: comparisonResult?.confidence || 0,
        method: comparisonResult?.method || 'manual',
        details: comparisonResult?.details || {}
      },
      status: determineVerificationStatus(comparisonResult),
      processedAt: new Date().toISOString()
    };
    
    // Actualizar registro con comparación INE
    registration.ineComparison = ineComparison;
    registration.status = ineComparison.status;
    registration.metadata.lastUpdated = new Date().toISOString();
    
    // Guardar actualización
    registrations.set(registrationId, registration);
    
    console.log(`🔍 Comparación INE procesada para: ${registrationId}`);
    console.log(`📊 Similitud: ${ineComparison.comparison.similarity}%`);
    console.log(`✅ Estado: ${ineComparison.status}`);
    console.log(`🎯 Match: ${ineComparison.comparison.isMatch ? 'Sí' : 'No'}`);
    
    // Determinar próximos pasos según el resultado
    const nextSteps = determineNextSteps(ineComparison.status);
    
    return NextResponse.json({
      success: true,
      registrationId: registrationId,
      message: 'Comparación INE procesada exitosamente',
      data: {
        status: registration.status,
        ineComparison: ineComparison,
        nextSteps: nextSteps,
        summary: {
          personalDataComplete: isPersonalDataComplete(registration.personalData),
          faceVerified: registration.faceVerification.verified,
          ineVerified: ineComparison.comparison.isMatch,
          overallStatus: registration.status
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error procesando comparación INE:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error procesando comparación INE',
      message: error.message
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('id');
    
    if (!registrationId) {
      return NextResponse.json({
        success: false,
        error: 'ID de registro requerido'
      }, { status: 400 });
    }
    
    const registration = registrations.get(registrationId);
    if (!registration) {
      return NextResponse.json({
        success: false,
        error: 'Registro no encontrado'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: registrationId,
        status: registration.status,
        ineComparison: registration.ineComparison,
        summary: {
          personalDataComplete: isPersonalDataComplete(registration.personalData),
          faceVerified: registration.faceVerification.verified,
          ineVerified: registration.ineComparison?.comparison.isMatch || false,
          overallStatus: registration.status
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo estado INE:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// Funciones auxiliares
function determineVerificationStatus(comparisonResult) {
  if (!comparisonResult) return 'pending_ine_verification';
  
  const similarity = comparisonResult.similarity || 0;
  const isMatch = comparisonResult.isMatch || false;
  const confidence = comparisonResult.confidence || 0;
  
  if (isMatch && similarity >= 80 && confidence >= 70) {
    return 'verified';
  } else if (similarity >= 60 && confidence >= 50) {
    return 'pending_manual_review';
  } else {
    return 'rejected';
  }
}

function determineNextSteps(status) {
  const steps = {
    verified: [
      'Registro completado exitosamente',
      'Usuario puede proceder con servicios',
      'Notificar aprobación al usuario'
    ],
    pending_manual_review: [
      'Requiere revisión manual',
      'Enviar a equipo de verificación',
      'Notificar al usuario sobre revisión'
    ],
    rejected: [
      'Verificación falló',
      'Solicitar nuevos documentos',
      'Permitir reintento de verificación'
    ],
    pending_ine_verification: [
      'Esperando comparación con INE',
      'Procesar documentos subidos',
      'Iniciar verificación automática'
    ]
  };
  
  return steps[status] || ['Estado desconocido'];
}

function isPersonalDataComplete(personalData) {
  const required = ['nombre', 'telefono', 'ine', 'domicilio'];
  return required.every(field => personalData[field] && personalData[field].trim() !== '');
}

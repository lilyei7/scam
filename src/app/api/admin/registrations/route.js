import { NextRequest, NextResponse } from 'next/server';

// Simulación de base de datos (la misma instancia)
const registrations = new Map();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;
    
    // Obtener todos los registros
    const allRegistrations = Array.from(registrations.values());
    
    // Filtrar por estado si se especifica
    let filteredRegistrations = allRegistrations;
    if (status) {
      filteredRegistrations = allRegistrations.filter(reg => reg.status === status);
    }
    
    // Ordenar por fecha más reciente
    filteredRegistrations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRegistrations = filteredRegistrations.slice(startIndex, endIndex);
    
    // Estadísticas generales
    const stats = generateStats(allRegistrations);
    
    return NextResponse.json({
      success: true,
      stats: stats,
      pagination: {
        total: filteredRegistrations.length,
        page: page,
        limit: limit,
        pages: Math.ceil(filteredRegistrations.length / limit)
      },
      data: paginatedRegistrations.map(reg => ({
        id: reg.id,
        timestamp: reg.timestamp,
        personalData: {
          nombre: reg.personalData.nombre,
          telefono: reg.personalData.telefono,
          ine: reg.personalData.ine
        },
        status: reg.status,
        faceVerification: {
          verified: reg.faceVerification.verified,
          quality: reg.faceVerification.quality
        },
        ineComparison: reg.ineComparison ? {
          similarity: reg.ineComparison.comparison.similarity,
          isMatch: reg.ineComparison.comparison.isMatch,
          processedAt: reg.ineComparison.processedAt
        } : null,
        metadata: {
          browser: reg.metadata.browser,
          createdAt: reg.metadata.createdAt
        }
      }))
    });
    
  } catch (error) {
    console.error('❌ Error en dashboard admin:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { registrationId, action, adminNotes } = data;
    
    const registration = registrations.get(registrationId);
    if (!registration) {
      return NextResponse.json({
        success: false,
        error: 'Registro no encontrado'
      }, { status: 404 });
    }
    
    // Acciones administrativas
    switch (action) {
      case 'approve':
        registration.status = 'verified';
        break;
      case 'reject':
        registration.status = 'rejected';
        break;
      case 'review':
        registration.status = 'pending_manual_review';
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Acción no válida'
        }, { status: 400 });
    }
    
    // Agregar notas administrativas
    if (!registration.adminActions) {
      registration.adminActions = [];
    }
    
    registration.adminActions.push({
      action: action,
      timestamp: new Date().toISOString(),
      notes: adminNotes || '',
      admin: 'system' // En producción, usar el ID del admin autenticado
    });
    
    registration.metadata.lastUpdated = new Date().toISOString();
    
    // Guardar cambios
    registrations.set(registrationId, registration);
    
    console.log(`👨‍💼 Acción administrativa: ${action} en registro ${registrationId}`);
    
    return NextResponse.json({
      success: true,
      message: `Registro ${action === 'approve' ? 'aprobado' : action === 'reject' ? 'rechazado' : 'marcado para revisión'}`,
      data: {
        id: registrationId,
        status: registration.status,
        lastAction: registration.adminActions[registration.adminActions.length - 1]
      }
    });
    
  } catch (error) {
    console.error('❌ Error en acción administrativa:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error procesando acción administrativa'
    }, { status: 500 });
  }
}

// Función para generar estadísticas
function generateStats(registrations) {
  const total = registrations.length;
  const statusCounts = {};
  const dailyRegistrations = {};
  const browserStats = {};
  
  registrations.forEach(reg => {
    // Contar por estado
    statusCounts[reg.status] = (statusCounts[reg.status] || 0) + 1;
    
    // Contar por día
    const date = reg.timestamp.split('T')[0];
    dailyRegistrations[date] = (dailyRegistrations[date] || 0) + 1;
    
    // Contar por navegador
    const browser = reg.metadata.browser;
    browserStats[browser] = (browserStats[browser] || 0) + 1;
  });
  
  return {
    total: total,
    statusBreakdown: statusCounts,
    dailyRegistrations: dailyRegistrations,
    browserStats: browserStats,
    verificationRate: total > 0 ? Math.round(((statusCounts.verified || 0) / total) * 100) : 0,
    pendingCount: (statusCounts.pending_ine_verification || 0) + (statusCounts.pending_manual_review || 0)
  };
}

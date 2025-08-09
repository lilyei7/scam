import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const faceData = await request.json();
    
    // Validar datos requeridos
    if (!faceData.userId || !faceData.image || !faceData.descriptor) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos (userId, image, descriptor)' },
        { status: 400 }
      );
    }
    
    // En producción, aquí guardarías en tu base de datos
    // Por ahora, simularemos el guardado exitoso
    
    const response = {
      success: true,
      message: 'Datos faciales guardados exitosamente',
      userId: faceData.userId,
      purpose: faceData.purpose,
      timestamp: new Date().toISOString(),
      dataId: `face_${faceData.userId}_${Date.now()}`,
      metadata: {
        confidence: faceData.confidence,
        quality: faceData.quality || 'unknown',
        automatic: faceData.automatic || false
      }
    };
    
    // Registrar en consola para desarrollo
    console.log('📸 Datos faciales recibidos:', {
      userId: faceData.userId,
      purpose: faceData.purpose,
      confidence: faceData.confidence,
      hasDescriptor: !!faceData.descriptor,
      hasLandmarks: !!faceData.landmarks,
      imageSize: faceData.image ? faceData.image.length : 0,
      timestamp: response.timestamp
    });
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error guardando datos faciales:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

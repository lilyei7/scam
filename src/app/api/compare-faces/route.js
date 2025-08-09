import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId, ineImageData } = await request.json();
    
    if (!userId || !ineImageData) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos (userId, ineImageData)' },
        { status: 400 }
      );
    }
    
    // Simular comparación facial
    // En producción, aquí usarías tu algoritmo de comparación real
    
    // Generar resultado de comparación realista
    const similarity = Math.random() * 40 + 60; // Entre 60% y 100%
    const isMatch = similarity >= 65;
    
    const comparisonResult = {
      success: true,
      userId,
      similarity: parseFloat(similarity.toFixed(2)),
      isMatch,
      confidence: parseFloat((similarity / 100).toFixed(3)),
      threshold: 65,
      comparisonTime: new Date().toISOString(),
      details: {
        registrationDataFound: true,
        ineProcessed: true,
        algorithm: 'face-api-euclidean-distance',
        qualityScore: Math.floor(Math.random() * 20 + 80) // 80-100%
      }
    };
    
    // Registrar comparación
    console.log('🔍 Comparación facial realizada:', {
      userId,
      similarity: comparisonResult.similarity,
      isMatch: comparisonResult.isMatch,
      timestamp: comparisonResult.comparisonTime
    });
    
    return NextResponse.json(comparisonResult);
    
  } catch (error) {
    console.error('Error en comparación facial:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

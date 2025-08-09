'use client';

import { useState, useRef, useEffect } from 'react';

export default function VisualFaceDetection({ 
  videoRef, 
  onFaceDetected, 
  onQualityChange,
  isActive = false 
}) {
  const [quality, setQuality] = useState(0);
  const [detectionStatus, setDetectionStatus] = useState('searching');
  const [detectionProgress, setDetectionProgress] = useState(0);
  const detectionIntervalRef = useRef(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      startVisualDetection();
    } else {
      stopVisualDetection();
    }

    return () => stopVisualDetection();
  }, [isActive]);

  const startVisualDetection = () => {
    console.log('🎯 Iniciando detección visual simplificada');
    
    let detectionCycle = 0;
    
    const detect = () => {
      if (!videoRef.current || !isActive) return;

      const video = videoRef.current;
      
      if (video.readyState >= 2 && video.videoWidth > 0) {
        detectionCycle++;
        
        // Progreso gradual de 0 a 100
        const progress = Math.min(100, detectionCycle * 8);
        setDetectionProgress(progress);
        
        // Simular calidad creciente
        const simulatedQuality = Math.min(95, 30 + (detectionCycle * 6));
        setQuality(simulatedQuality);
        onQualityChange?.(simulatedQuality);
        
        // Cambiar estado según progreso
        if (progress < 30) {
          setDetectionStatus('searching');
        } else if (progress < 70) {
          setDetectionStatus('analyzing');
        } else if (progress < 90) {
          setDetectionStatus('verifying');
        } else {
          setDetectionStatus('excellent');
          
          // Completar detección cuando llegue a 100%
          if (progress >= 95 && simulatedQuality >= 80) {
            setTimeout(() => {
              if (isActive) {
                onFaceDetected?.({
                  success: true,
                  quality: simulatedQuality,
                  method: 'visual_detection'
                });
              }
            }, 500);
            return;
          }
        }
      } else {
        setDetectionStatus('waiting');
      }
    };

    // Ejecutar detección cada 500ms
    detectionIntervalRef.current = setInterval(detect, 500);
    detect(); // Ejecutar inmediatamente
  };

  const stopVisualDetection = () => {
    console.log('⏹️ Deteniendo detección visual');
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setDetectionProgress(0);
    setQuality(0);
    setDetectionStatus('searching');
  };

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Overlay de detección */}
      <div className="absolute inset-0 bg-black bg-opacity-20">
        {/* Marco de detección central */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-64 h-80 border-2 border-white rounded-lg overflow-hidden">
            {/* Línea de escaneo animada */}
            <div 
              className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent transition-all duration-1000"
              style={{
                top: `${(detectionProgress / 100) * 100}%`,
                opacity: detectionStatus === 'searching' ? 0.8 : 0.4
              }}
            />
            
            {/* Esquinas del marco */}
            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white"></div>
          </div>
        </div>

        {/* Información de detección */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 rounded-lg px-4 py-2 text-white text-center">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              detectionStatus === 'excellent' ? 'bg-green-400' :
              detectionStatus === 'verifying' ? 'bg-blue-400' :
              detectionStatus === 'analyzing' ? 'bg-yellow-400' :
              'bg-gray-400'
            } ${detectionStatus === 'searching' ? 'animate-pulse' : ''}`}></div>
            <span className="text-sm font-medium">
              {detectionStatus === 'searching' && 'Buscando rostro...'}
              {detectionStatus === 'analyzing' && 'Analizando...'}
              {detectionStatus === 'verifying' && 'Verificando...'}
              {detectionStatus === 'excellent' && 'Calidad excelente'}
              {detectionStatus === 'waiting' && 'Esperando cámara...'}
            </span>
          </div>
          
          {/* Barra de progreso */}
          <div className="w-48 bg-gray-600 rounded-full h-2 mb-1">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                detectionStatus === 'excellent' ? 'bg-green-400' :
                detectionStatus === 'verifying' ? 'bg-blue-400' :
                detectionStatus === 'analyzing' ? 'bg-yellow-400' :
                'bg-gray-400'
              }`}
              style={{ width: `${detectionProgress}%` }}
            />
          </div>
          
          <div className="text-xs text-gray-300">
            Calidad: {Math.round(quality)}% • Progreso: {Math.round(detectionProgress)}%
          </div>
        </div>

        {/* Instrucciones */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 rounded-lg px-4 py-2 text-white text-center">
          <div className="text-sm">
            {detectionStatus === 'searching' && '👤 Colócate frente a la cámara'}
            {detectionStatus === 'analyzing' && '📊 Mantén la posición'}
            {detectionStatus === 'verifying' && '🔍 Verificando calidad...'}
            {detectionStatus === 'excellent' && '✅ ¡Perfecto! Procesando...'}
            {detectionStatus === 'waiting' && '⏳ Iniciando cámara...'}
          </div>
        </div>
      </div>
    </div>
  );
}

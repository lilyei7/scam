'use client';

import { useState, useRef, useEffect } from 'react';
import { detectFaceInVideo, analyzeFaceQuality } from '../config/simpleFaceDetection';

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
    console.log('🔄 VisualFaceDetection useEffect ejecutado:', {
      isActive,
      hasVideo: !!videoRef.current,
      hasInterval: !!detectionIntervalRef.current
    });
    
    if (isActive && videoRef.current) {
      // Solo iniciar si no hay detección activa
      if (!detectionIntervalRef.current) {
        console.log('🚀 Iniciando detección visual desde useEffect');
        startVisualDetection();
      } else {
        console.log('⚠️ Detección ya activa, saltando inicio');
      }
    } else {
      console.log('🛑 Deteniendo detección visual desde useEffect');
      stopVisualDetection();
    }

    return () => {
      // Cleanup solo si hay detección activa
      if (detectionIntervalRef.current) {
        console.log('🧹 Cleanup VisualFaceDetection');
        stopVisualDetection();
      }
    };
  }, [isActive]);

  const startVisualDetection = () => {
    console.log('🎯 VisualFaceDetection: Iniciando detección visual real');
    
    let detectionCount = 0;
    const maxDetections = 3; // Reducir para ser más rápido
    
    const detect = async () => {
      if (!videoRef.current || !isActive) {
        console.log('❌ Detección cancelada - video o isActive falso');
        return;
      }

      const video = videoRef.current;
      
      if (video.readyState >= 2 && video.videoWidth > 0) {
        try {
          detectionCount++;
          console.log(`🔍 Ciclo de detección ${detectionCount}...`);
          
          // Usar detección real
          const faceResult = await detectFaceInVideo(video);
          console.log('📊 Resultado detección:', faceResult);
          
          if (faceResult.faceDetected) {
            const quality = faceResult.detection?.quality || 75;
            console.log(`✅ ¡Rostro detectado! Calidad: ${quality.toFixed(1)}%`);
            
            setQuality(quality);
            onQualityChange?.(quality);
            setDetectionProgress(100);
            setDetectionStatus('excellent');
            
            // Completar inmediatamente si detectamos rostro
            setTimeout(() => {
              if (isActive) {
                console.log('🎉 Enviando resultado de detección exitosa');
                onFaceDetected?.({
                  success: true,
                  quality: quality,
                  method: 'real_detection',
                  detections: detectionCount
                });
              }
            }, 500);
            return;
          } else {
            console.log('❌ No se detectó rostro en este ciclo');
            // Actualizar progreso gradualmente
            const progress = Math.min(80, (detectionCount / maxDetections) * 50);
            setDetectionProgress(progress);
            setDetectionStatus('searching');
            setQuality(progress);
            onQualityChange?.(progress);
          }
          
        } catch (error) {
          console.error('❌ Error en detección:', error);
          setDetectionStatus('searching');
        }
      } else {
        console.log('⏳ Video no está listo:', {
          readyState: video.readyState,
          videoWidth: video.videoWidth
        });
        setDetectionStatus('waiting');
      }
    };

    // Ejecutar detección cada 1 segundo para ser menos intensivo
    console.log('⏰ Configurando intervalo de detección cada 1000ms');
    detectionIntervalRef.current = setInterval(detect, 1000);
    detect(); // Ejecutar inmediatamente
  };

  const stopVisualDetection = () => {
    if (detectionIntervalRef.current) {
      console.log('⏹️ Deteniendo detección visual');
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
      setDetectionProgress(0);
      setQuality(0);
      setDetectionStatus('searching');
    }
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

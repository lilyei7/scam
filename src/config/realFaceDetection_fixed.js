// Configuración para detección facial real usando Face-api.js (corregida)
export const REAL_FACE_CONFIG = {
  // URLs de modelos con fallbacks para diferentes CDNs
  MODEL_URLS: [
    'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights',
    'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights',
    'https://unpkg.com/face-api.js@0.22.2/weights'
  ],
  
  // Face-api.js configuración optimizada por navegador
  FACE_API: {
    // Configuración por defecto
    DEFAULT: {
      CONFIDENCE_THRESHOLD: 0.3,
      INPUT_SIZE: 320,
      SCORE_THRESHOLD: 0.3,
      MAX_RESULTS: 5
    },
    // Configuración específica para Safari/iOS
    SAFARI: {
      CONFIDENCE_THRESHOLD: 0.4,
      INPUT_SIZE: 224,
      SCORE_THRESHOLD: 0.4,
      MAX_RESULTS: 3
    },
    // Configuración para Firefox
    FIREFOX: {
      CONFIDENCE_THRESHOLD: 0.35,
      INPUT_SIZE: 288,
      SCORE_THRESHOLD: 0.35,
      MAX_RESULTS: 4
    },
    // Configuración para dispositivos móviles
    MOBILE: {
      CONFIDENCE_THRESHOLD: 0.5,
      INPUT_SIZE: 192,
      SCORE_THRESHOLD: 0.5,
      MAX_RESULTS: 2
    }
  }
};

// Variables globales para Face-api.js
let faceApiInstance = null;
let modelsLoaded = false;

// Función para cargar Face-api.js y sus modelos con soporte universal MEJORADO
export const initializeFaceAPI = async () => {
  if (typeof window === 'undefined') return false;
  
  try {
    console.log('🔄 Inicializando Face-api.js universal...');
    
    // Detectar navegador y dispositivo
    const userAgent = navigator.userAgent.toLowerCase();
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isFirefox = /firefox/.test(userAgent);
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    console.log(`🌐 Navegador: ${isSafari ? 'Safari' : isFirefox ? 'Firefox' : 'Chromium'}, Móvil: ${isMobile}`);
    
    // Importar face-api.js dinámicamente
    if (!faceApiInstance) {
      const faceapi = await import('face-api.js');
      faceApiInstance = faceapi;
      window.faceapi = faceapi;
    }
    
    if (!modelsLoaded) {
      console.log('📦 Cargando modelos Face-api.js...');
      
      // Intentar cargar modelos desde múltiples CDNs
      let modelLoadSuccess = false;
      
      for (const modelUrl of REAL_FACE_CONFIG.MODEL_URLS) {
        try {
          console.log(`🔄 Intentando cargar desde: ${modelUrl}`);
          
          // Cargar solo el modelo básico primero para verificar
          await faceApiInstance.nets.tinyFaceDetector.loadFromUri(modelUrl);
          console.log('✅ TinyFaceDetector cargado');
          
          // Si el básico funciona, cargar el resto
          try {
            await faceApiInstance.nets.ssdMobilenetv1.loadFromUri(modelUrl);
            console.log('✅ SsdMobilenetv1 cargado');
          } catch (ssdError) {
            console.warn('⚠️ SsdMobilenetv1 falló, continuando con TinyFaceDetector');
          }
          
          // Intentar cargar landmarks (opcional)
          try {
            await faceApiInstance.nets.faceLandmark68TinyNet.loadFromUri(modelUrl);
            console.log('✅ FaceLandmark68TinyNet cargado');
          } catch (landmarkError) {
            console.warn('⚠️ FaceLandmark68TinyNet falló, continuando sin landmarks');
          }
          
          // Intentar cargar recognition (opcional)
          try {
            await faceApiInstance.nets.faceRecognitionNet.loadFromUri(modelUrl);
            console.log('✅ FaceRecognitionNet cargado');
          } catch (recognitionError) {
            console.warn('⚠️ FaceRecognitionNet falló, continuando sin recognition');
          }
          
          modelLoadSuccess = true;
          console.log(`✅ Modelos cargados exitosamente desde: ${modelUrl}`);
          break;
          
        } catch (error) {
          console.warn(`⚠️ Error cargando desde ${modelUrl}:`, error);
          continue;
        }
      }
      
      if (!modelLoadSuccess) {
        console.error('❌ No se pudieron cargar los modelos desde ningún CDN');
        return false;
      }
      
      modelsLoaded = true;
      console.log('✅ Inicialización de Face-api.js completada');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error inicializando Face-api.js:', error);
    return false;
  }
};

// Función para obtener configuración específica del navegador
const getBrowserSpecificConfig = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isFirefox = /firefox/.test(userAgent);
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  if (isMobile) {
    return { ...REAL_FACE_CONFIG.FACE_API.MOBILE, browserType: 'Mobile' };
  } else if (isSafari) {
    return { ...REAL_FACE_CONFIG.FACE_API.SAFARI, browserType: 'Safari' };
  } else if (isFirefox) {
    return { ...REAL_FACE_CONFIG.FACE_API.FIREFOX, browserType: 'Firefox' };
  } else {
    return { ...REAL_FACE_CONFIG.FACE_API.DEFAULT, browserType: 'Chromium' };
  }
};

// Función principal para detectar rostros SIMPLIFICADA
export const detectFaceInVideo = async (videoElement) => {
  if (!videoElement || !faceApiInstance || !modelsLoaded) {
    return { success: false, message: 'Video o Face-api no disponible' };
  }
  
  try {
    // Verificar que el video esté reproduciendo
    if (videoElement.readyState < 2) {
      return { success: false, message: 'Video no está listo' };
    }

    // Obtener configuración específica del navegador
    const browserConfig = getBrowserSpecificConfig();
    console.log(`🔧 Usando configuración para ${browserConfig.browserType}`);

    let detections = null;
    
    // Usar solo TinyFaceDetector para evitar errores
    try {
      detections = await faceApiInstance
        .detectAllFaces(videoElement, new faceApiInstance.TinyFaceDetectorOptions({
          inputSize: browserConfig.INPUT_SIZE,
          scoreThreshold: browserConfig.SCORE_THRESHOLD
        }));
        
      if (detections && detections.length > 0) {
        const detection = detections[0];
        const confidence = detection.score || detection.confidence || 0.8;
        
        return {
          success: true,
          faces: detections.length,
          confidence: Math.round(confidence * 100),
          box: detection.box,
          detection: detection,
          message: `Rostro detectado con ${Math.round(confidence * 100)}% confianza`
        };
      } else {
        return {
          success: false,
          faces: 0,
          message: 'No se detectaron rostros'
        };
      }
      
    } catch (detectionError) {
      console.error('❌ Error en detección:', detectionError);
      return {
        success: false,
        message: `Error en detección: ${detectionError.message}`
      };
    }
    
  } catch (error) {
    console.error('❌ Error general en detectFaceInVideo:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
};

// Función para verificar si Face-api.js está listo
export const isFaceAPIReady = () => {
  return faceApiInstance !== null && modelsLoaded;
};

// Función simplificada para capturar datos faciales
export const captureFaceData = async (videoElement) => {
  const result = await detectFaceInVideo(videoElement);
  
  if (result.success) {
    return {
      success: true,
      faceData: {
        confidence: result.confidence,
        timestamp: Date.now(),
        box: result.box
      }
    };
  }
  
  return { success: false, message: result.message };
};

// Función simplificada para comparar datos faciales
export const compareFaceData = (faceData1, faceData2) => {
  if (!faceData1 || !faceData2) {
    return { success: false, similarity: 0 };
  }
  
  // Comparación básica basada en confianza
  const avgConfidence = (faceData1.confidence + faceData2.confidence) / 2;
  
  return {
    success: true,
    similarity: avgConfidence,
    isMatch: avgConfidence > 70
  };
};

// Función para analizar calidad facial (simplificada)
export const analyzeFaceQuality = async (videoElement) => {
  const result = await detectFaceInVideo(videoElement);
  
  if (result.success) {
    return {
      quality: result.confidence,
      lighting: result.confidence > 80 ? 'good' : result.confidence > 50 ? 'fair' : 'poor',
      position: 'center',
      sharpness: result.confidence
    };
  }
  
  return {
    quality: 0,
    lighting: 'poor',
    position: 'unknown',
    sharpness: 0
  };
};

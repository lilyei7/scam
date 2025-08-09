// Configuración para CompreFace
export const COMPREFACE_CONFIG = {
  // URL base de tu servidor CompreFace
  API_URL: process.env.NEXT_PUBLIC_COMPREFACE_URL || 'http://localhost:8000',
  
  // API Key de CompreFace (obténla de tu panel de administración)
  API_KEY: process.env.NEXT_PUBLIC_COMPREFACE_API_KEY || 'tu-api-key-aqui',
  
  // Modo de prueba (cambia a false cuando tengas CompreFace configurado)
  DEMO_MODE: true,
  
  // Configuración de detección
  DETECTION_CONFIG: {
    // Confianza mínima para considerar un rostro válido (0.0 a 1.0)
    MIN_CONFIDENCE: 0.8,
    
    // Configuración de la cámara
    CAMERA_CONFIG: {
      width: 640,
      height: 480,
      facingMode: 'user' // 'user' para cámara frontal, 'environment' para trasera
    },
    
    // Configuración de captura
    IMAGE_QUALITY: 0.8, // Calidad JPEG (0.0 a 1.0)
    IMAGE_FORMAT: 'image/jpeg'
  },
  
  // Endpoints de CompreFace
  ENDPOINTS: {
    DETECT: '/api/v1/detection/detect',
    VERIFY: '/api/v1/recognition/verify',
    ADD_SUBJECT: '/api/v1/recognition/subjects',
    FACE_COLLECTION: '/api/v1/recognition/faces'
  }
};

// Funciones de simulación para modo demo
const simulateDetection = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        result: [
          {
            age_high: 35,
            age_low: 25,
            embedding: [],
            box: {
              probability: 0.95,
              x_max: 400,
              y_max: 350,
              x_min: 200,
              y_min: 150
            },
            landmarks: [],
            gender: {
              probability: 0.9,
              value: "male"
            }
          }
        ]
      });
    }, 1000 + Math.random() * 1000); // Simula 1-2 segundos de procesamiento
  });
};

const simulateRecognition = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        result: [
          {
            age_high: 35,
            age_low: 25,
            box: {
              probability: 0.95,
              x_max: 400,
              y_max: 350,
              x_min: 200,
              y_min: 150
            },
            landmarks: [],
            subjects: [
              {
                similarity: 0.85 + Math.random() * 0.1, // Simula confianza variable
                subject: "demo_user"
              }
            ]
          }
        ]
      });
    }, 1500 + Math.random() * 1000); // Simula 1.5-2.5 segundos de procesamiento
  });
};

// Función helper para hacer peticiones a CompreFace
export const compreFaceRequest = async (endpoint, options = {}) => {
  // Si está en modo demo, devolver respuestas simuladas
  if (COMPREFACE_CONFIG.DEMO_MODE) {
    console.log(`🤖 DEMO MODE: Simulando petición a ${endpoint}`);
    
    if (endpoint.includes('/detect')) {
      return await simulateDetection();
    } else if (endpoint.includes('/recognize') || endpoint.includes('/verify')) {
      return await simulateRecognition();
    }
    
    // Para otros endpoints, devolver respuesta genérica
    return { result: [], status: 'success' };
  }
  
  // Código real para CompreFace (cuando no esté en modo demo)
  const url = `${COMPREFACE_CONFIG.API_URL}${endpoint}`;
  
  const defaultHeaders = {
    'x-api-key': COMPREFACE_CONFIG.API_KEY,
  };
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`CompreFace API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('CompreFace request failed:', error);
    throw error;
  }
};

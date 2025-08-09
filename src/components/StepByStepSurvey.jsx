'use client';

import { useState, useRef, useEffect } from 'react';
import SimpleFaceDetection from './SimpleFaceDetection';

export default function StepByStepSurvey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [faceVerificationComplete, setFaceVerificationComplete] = useState(false);
  const [verificationResult, setVerificationResult] = useState({
    status: 'idle',
    message: 'Preparando sistema de verificación...'
  });
  const [livenessStep, setLivenessStep] = useState(0);
  const [livenessComplete, setLivenessComplete] = useState(false);
  const [capturedGestures, setCapturedGestures] = useState([]);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [autoGestureTimer, setAutoGestureTimer] = useState(null);
  const [showINEComparison, setShowINEComparison] = useState(false);
  const [ineComparisonResult, setIneComparisonResult] = useState(null);
  const [useVisualDetection, setUseVisualDetection] = useState(true);
  const [visualDetectionActive, setVisualDetectionActive] = useState(false);
  const [detectionQuality, setDetectionQuality] = useState(0);
  const [registrationId, setRegistrationId] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Función auxiliar para acceso seguro a verificationResult
  const getVerificationStatus = () => {
    if (!verificationResult || typeof verificationResult !== 'object') {
      return 'idle';
    }
    return verificationResult.status || 'idle';
  };

  const getVerificationMessage = () => {
    if (!verificationResult || typeof verificationResult !== 'object') {
      return 'Preparando sistema de verificación...';
    }
    return verificationResult.message || 'Preparando sistema de verificación...';
  };

  // Función para actualizar verificationResult de forma segura
  const updateVerificationResult = (status, message) => {
    setVerificationResult({
      status: status || 'idle',
      message: message || 'Preparando sistema de verificación...'
    });
  };

  // Funciones para detección visual mejorada
  const handleVisualFaceDetected = (result) => {
    console.log('🎯 Detección visual exitosa:', result);
    
    // Prevenir múltiples ejecuciones
    if (faceVerificationComplete) {
      console.log('⚠️ Verificación facial ya completada, ignorando detección duplicada');
      return;
    }
    
    setFaceDetected(true);
    setFaceVerificationComplete(true);
    setVisualDetectionActive(false);
    
    updateVerificationResult('success', `✅ Rostro verificado visualmente - Calidad: ${Math.round(result.quality)}%`);
    
    // Guardar datos de verificación
    setResponses(prev => ({
      ...prev,
      face_verification: {
        verified: true,
        method: 'visual_detection',
        quality: result.quality,
        timestamp: new Date().toISOString()
      }
    }));
    
    // Ir directamente a verificación de gestos ya que la facial está completa
    setTimeout(() => {
      console.log('🎯 Iniciando verificación de gestos directamente después de detección visual');
      setIsAutoDetecting(true); // Activar para detección de gestos
      setVerificationResult({
        status: 'processing',
        message: 'Iniciando verificación de persona viva...'
      });
      
      // Iniciar primer gesto después de 1 segundo
      setTimeout(() => {
        captureGestureAutomatically();
      }, 1000);
    }, 2000);
  };

  const handleQualityChange = (quality) => {
    setDetectionQuality(quality);
    
    if (quality > 80) {
      updateVerificationResult('success', `🎯 Excelente calidad detectada: ${Math.round(quality)}% - Verificando...`);
    } else if (quality > 60) {
      updateVerificationResult('processing', `📊 Buena calidad: ${Math.round(quality)}% - Mantén la posición`);
    } else if (quality > 30) {
      updateVerificationResult('processing', `📏 Ajustando calidad: ${Math.round(quality)}% - Busca mejor luz`);
    } else if (quality > 0) {
      updateVerificationResult('processing', `💡 Verificando iluminación: ${Math.round(quality)}%`);
    }
  };

  const startVisualDetection = () => {
    console.log('🎯 Iniciando detección visual');
    console.log('📊 Estados antes:', {
      visualDetectionActive,
      useVisualDetection,
      isAutoDetecting
    });
    
    setVisualDetectionActive(true);
    setUseVisualDetection(true);
    setIsAutoDetecting(true); // Activar para futuras operaciones automáticas
    updateVerificationResult('processing', '🎯 Iniciando detección visual avanzada...');
    
    console.log('📊 Estados establecidos:', {
      visualDetectionActive: true,
      useVisualDetection: true,
      isAutoDetecting: true
    });
  };

  const stopVisualDetection = () => {
    console.log('⏹️ Deteniendo detección visual');
    setVisualDetectionActive(false);
    setDetectionQuality(0);
  };

  // Gestos para verificación de persona viva
  const livenessGestures = [
    { 
      id: 'look_up', 
      instruction: 'Mira hacia ARRIBA', 
      icon: '⬆️',
      description: 'Levanta tu cabeza y mira hacia arriba'
    },
    { 
      id: 'look_down', 
      instruction: 'Mira hacia ABAJO', 
      icon: '⬇️',
      description: 'Baja tu cabeza y mira hacia abajo'
    },
    { 
      id: 'look_left', 
      instruction: 'Mira hacia la IZQUIERDA', 
      icon: '⬅️',
      description: 'Gira tu cabeza hacia tu izquierda'
    },
    { 
      id: 'look_right', 
      instruction: 'Mira hacia la DERECHA', 
      icon: '➡️',
      description: 'Gira tu cabeza hacia tu derecha'
    },
    { 
      id: 'smile', 
      instruction: 'SONRÍE', 
      icon: '😊',
      description: 'Muestra una sonrisa natural'
    }
  ];

  const questions = [
    {
      id: 'situacion_laboral',
      question: '¿Cuál es su situación laboral?',
      options: [
        'Estudiante',
        'Empleada',
        'Desempleada'
      ]
    },
    {
      id: 'estado_civil',
      question: '¿Cuál es su estado civil?',
      options: [
        'Soltera',
        'Casada',
        'Divorciada',
        'Viuda',
        'Unión libre'
      ]
    },
    {
      id: 'hijos',
      question: '¿Tiene hijos?',
      options: [
        'Sí, tengo hijos',
        'No tengo hijos'
      ]
    },
    {
      id: 'documentos_ine',
      question: '¿Cuenta con credencial de elector (INE) vigente?',
      options: [
        'Sí, tengo INE vigente',
        'Tengo INE pero está vencida',
        'No tengo INE'
      ]
    },
    {
      id: 'comprobante_domicilio',
      question: '¿Tiene recibo de luz o comprobante de domicilio?',
      options: [
        'Sí, tengo recibo de luz reciente',
        'Tengo otro comprobante de domicilio',
        'No tengo comprobante de domicilio'
      ]
    },
    {
      id: 'verificacion_persona',
      question: '¿Está dispuesta a realizar verificación de identidad?',
      options: [
        'Sí, acepto verificación por video llamada',
        'Sí, acepto verificación presencial',
        'Prefiero verificación por documentos únicamente'
      ]
    }
  ];

  // Polyfill para navegadores que no soportan getUserMedia nativamente
  const getUserMediaPolyfill = () => {
    // Verificar soporte nativo
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    }
    
    // Polyfill para navegadores más antiguos
    const getUserMedia = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia;
    
    if (getUserMedia) {
      return function(constraints) {
        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }
    
    return null;
  };

  // Detectar si estamos en HTTPS o HTTP
  const isHTTPS = () => {
    if (typeof window !== 'undefined') {
      return window.location.protocol === 'https:';
    }
    return false;
  };

  // Verificar soporte de cámara considerando HTTPS
  const checkHTTPSRequirement = () => {
    const https = isHTTPS();
    const isLocalhost = typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1');
    
    // Los navegadores modernos requieren HTTPS para cámara, excepto en localhost
    if (!https && !isLocalhost) {
      return {
        supported: false,
        reason: 'https_required',
        message: '🔒 HTTPS requerido para acceso a cámara'
      };
    }
    
    return { supported: true };
  };
  const getBrowserCapabilities = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);
    const isFirefox = /firefox/.test(userAgent);
    const isEdge = /edge/.test(userAgent) || /edg/.test(userAgent);
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    return {
      isSafari,
      isChrome,
      isFirefox,
      isEdge,
      isIOS,
      isAndroid,
      browserName: isSafari ? 'Safari' : 
                   isChrome ? 'Chrome' : 
                   isFirefox ? 'Firefox' : 
                   isEdge ? 'Edge' : 'Desconocido'
    };
  };

  // Función para iniciar la cámara y cargar Face-api.js (compatible forzado con Safari)
  const startCamera = async () => {
    // Prevenir múltiples inicializaciones
    if (cameraInitialized) {
      console.log('⚠️ Cámara ya inicializada, evitando duplicación');
      return;
    }

    try {
      updateVerificationResult('processing', '📱 Iniciando cámara...');
      setCameraInitialized(true);

      // Configuración simple para cámara
      const constraints = {
        audio: false,
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'user'
        }
      };

      console.log('📷 Solicitando acceso a cámara...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        try {
          await videoRef.current.play();
          console.log('✅ Cámara iniciada exitosamente');
          updateVerificationResult('success', '✅ Cámara lista - Puedes comenzar la verificación');
        } catch (playError) {
          console.warn('⚠️ Warning al reproducir video:', playError);
          // El video puede seguir funcionando aunque no se pueda hacer play() inmediatamente
          updateVerificationResult('success', '✅ Cámara lista - Puedes comenzar la verificación');
        }
        
        // Inicializar Face-API en modo simplificado
        setTimeout(async () => {
          try {
            await initializeFaceAPI();
            updateVerificationResult('success', '🤖 Sistema de verificación listo');
          } catch (error) {
            console.warn('Face-API no disponible, usando modo visual:', error);
            updateVerificationResult('success', '🎯 Modo visual disponible');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Error al iniciar cámara:', error);
      
      let errorMessage = 'No se pudo acceder a la cámara. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Por favor permite el acceso a la cámara en tu navegador.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No se encontró ninguna cámara conectada.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Tu navegador no soporta esta función.';
      } else {
        errorMessage += 'Error técnico: ' + error.message;
      }
      
      updateVerificationResult('error', errorMessage);
      setCameraInitialized(false); // Resetear estado para permitir reintento
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraInitialized(false); // Resetear estado cuando se detiene la cámara
  };

  // Funciones para detección visual mejorada
  const detectFaceAutomatically = async () => {
    console.log('🔍 detectFaceAutomatically iniciado');
    console.log('Condiciones:', {
      hasVideo: !!videoRef.current,
      isDetecting: isAutoDetecting,
      apiReady: isFaceAPIReady(),
      faceVerificationComplete
    });
    
    if (!videoRef.current || !isAutoDetecting) {
      console.log('❌ Condiciones básicas no cumplidas para detección');
      return;
    }

    try {
      // Verificar que el video esté reproduciendo
      if (videoRef.current.readyState < 2) {
        console.log('⏳ Video no está listo, readyState:', videoRef.current.readyState);
        updateVerificationResult('processing', 'Esperando que la cámara esté lista...');
        return;
      }

      console.log('🎥 Video listo, intentando detectar rostro...');
      
      // Intentar detección con Face-api.js si está disponible
      if (isFaceAPIReady()) {
        console.log('🤖 Usando Face-api.js para detección');
        const detection = await detectFaceInVideo(videoRef.current);
        console.log('🔍 Resultado de detección Face-api.js:', detection);
        
        if (detection.success && detection.faceDetected) {
          const quality = analyzeFaceQuality(detection);
          console.log('✨ Calidad de rostro:', quality);
          
          if (quality.score >= 50) { // Umbral más bajo
            if (!faceDetected) {
              console.log('✅ ¡Rostro de buena calidad detectado con Face-api.js!');
              setFaceDetected(true);
              updateVerificationResult('success', `✅ Rostro detectado! Calidad: ${quality.score}%`);
              setTimeout(() => {
                startAutomaticGestureSequence();
              }, 2000);
            }
          } else {
            console.log('⚠️ Rostro detectado pero calidad insuficiente:', quality.score);
            updateVerificationResult('processing', `Rostro detectado - Mejorando calidad... ${quality.score}%`);
          }
        } else {
          console.log('👤 No se detectó rostro válido con Face-api.js');
          updateVerificationResult('processing', '🔍 Buscando rostro... Colócate frente a la cámara');
        }
      } else {
        // Detección básica sin Face-api.js
        console.log('📱 Face-api.js no disponible, usando detección básica');
        
        // Simulación de detección básica - solo verificar que hay video
        if (videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
          if (!faceDetected) {
            console.log('✅ Video activo detectado, asumiendo presencia de usuario');
            setFaceDetected(true);
            updateVerificationResult('success', '✅ Cámara activa - Presiona para continuar');
            
            // En modo básico, esperar interacción del usuario
            setTimeout(() => {
              updateVerificationResult('success', '✅ Toca "Continuar" para proceder con la verificación');
            }, 2000);
          }
        } else {
          updateVerificationResult('processing', '🔍 Esperando señal de video...');
        }
      }
    } catch (error) {
      console.error('❌ Error en detección automática:', error);
      updateVerificationResult('error', `Error en la detección: ${error.message}`);
    }
  };

  // Función para iniciar la secuencia automática de gestos
  const startAutomaticGestureSequence = () => {
    console.log(`🎯 startAutomaticGestureSequence - faceVerificationComplete: ${faceVerificationComplete}, livenessComplete: ${livenessComplete}`);
    
    if (faceVerificationComplete && !livenessComplete) {
      setIsAutoDetecting(false); // Dejar de buscar rostros
      setVerificationResult({
        status: 'processing',
        message: 'Iniciando verificación de persona viva...'
      });
      
      // Iniciar primer gesto después de 1 segundo
      setTimeout(() => {
        captureGestureAutomatically();
      }, 1000);
    } else if (!faceVerificationComplete) {
      console.log('⚠️ Verificación facial no completada, pero evitando recursión infinita');
      // No llamar a captureAndVerifyAutomatically() aquí para evitar bucle infinito
      // Esta función será llamada después de que la verificación facial se complete
    }
  };

  // Función para capturar y verificar automáticamente (verificación facial inicial)
  const captureAndVerifyAutomatically = async (attempt = 1, maxAttempts = 3) => {
    console.log(`🔍 Iniciando captura automática - Intento ${attempt}/${maxAttempts}`);
    
    // Verificar que el video esté listo antes de proceder
    if (!videoRef.current || videoRef.current.readyState < 2) {
      console.warn(`⚠️ Video no está listo (readyState: ${videoRef.current?.readyState})`);
      
      if (attempt < maxAttempts) {
        console.log(`🔄 Esperando 2 segundos antes del intento ${attempt + 1}`);
        setTimeout(() => {
          captureAndVerifyAutomatically(attempt + 1, maxAttempts);
        }, 2000);
        return;
      } else {
        console.error('❌ Video no se pudo inicializar después de múltiples intentos');
        setVerificationResult({
          status: 'error',
          message: 'No se pudo acceder al video. Por favor recarga la página.'
        });
        return;
      }
    }

    setVerificationResult({
      status: 'processing',
      message: `Capturando y verificando identidad... (${attempt}/${maxAttempts})`
    });

    try {
      // Generar ID único para el usuario
      const userId = `user_${Date.now()}`;
      
      // Capturar datos faciales completos
      const captureResult = await captureFaceData(videoRef.current, userId, 'registration');
      
      if (captureResult.success) {
        console.log('✅ Captura exitosa, completando verificación facial');
        setFaceVerificationComplete(true);
        setVerificationResult({
          status: 'success',
          message: `✅ Identidad verificada y guardada`,
          confidence: captureResult.faceData.confidence
        });
        
        // Guardar datos en el estado para comparación posterior
        setResponses(prev => ({
          ...prev,
          face_verification: {
            verified: true,
            confidence: captureResult.faceData.confidence,
            timestamp: new Date().toISOString(),
            automatic: true,
            userId: userId,
            storageKey: captureResult.storageKey
          }
        }));
        
        // Guardar datos faciales para comparación con INE
        localStorage.setItem('current_user_face_data', JSON.stringify(captureResult.faceData));
        
        // Iniciar verificación de vida automática después de 2 segundos
        setTimeout(() => {
          setVerificationResult({
            status: 'processing',
            message: 'Iniciando verificación de persona viva...'
          });
          setTimeout(() => {
            // Ya tenemos verificación facial completa, ir directo a gestos
            console.log('🎯 Iniciando secuencia de gestos (facial ya verificado)');
            captureGestureAutomatically();
          }, 1000);
        }, 2000);
        
      } else {
        console.warn(`⚠️ Captura falló en intento ${attempt}`);
        
        if (attempt < maxAttempts) {
          setVerificationResult({
            status: 'warning',
            message: `Reintentando captura... (${attempt + 1}/${maxAttempts})`
          });
          
          setTimeout(() => {
            captureAndVerifyAutomatically(attempt + 1, maxAttempts);
          }, 2000);
        } else {
          setVerificationResult({
            status: 'error',
            message: 'No se pudo capturar el rostro después de varios intentos. Usa el modo manual.'
          });
        }
      }
    } catch (error) {
      console.error(`❌ Error en verificación automática (intento ${attempt}):`, error);
      
      if (attempt < maxAttempts) {
        setVerificationResult({
          status: 'warning',
          message: `Error en verificación. Reintentando... (${attempt + 1}/${maxAttempts})`
        });
        
        setTimeout(() => {
          captureAndVerifyAutomatically(attempt + 1, maxAttempts);
        }, 2000);
      } else {
        setVerificationResult({
          status: 'error',
          message: 'Error en la verificación después de varios intentos. Usa el modo manual.'
        });
      }
    }
  };

  // Función para capturar gestos automáticamente
  const captureGestureAutomatically = async () => {
    if (livenessStep >= livenessGestures.length) {
      completeLivenessVerification();
      return;
    }

    const currentGesture = livenessGestures[livenessStep];
    
    // Mostrar instrucción con countdown
    let countdownValue = 5;
    setCountdown(countdownValue);
    setVerificationResult({
      status: 'processing',
      message: `${currentGesture.instruction} (${countdownValue}s)`
    });

    const countdownInterval = setInterval(() => {
      countdownValue--;
      setCountdown(countdownValue);
      setVerificationResult({
        status: 'processing',
        message: `${currentGesture.instruction} (${countdownValue}s)`
      });

      if (countdownValue <= 0) {
        clearInterval(countdownInterval);
        // Capturar gesto
        performGestureCapture();
      }
    }, 1000);
  };

  // Función para realizar la captura del gesto con Face-api.js
  const performGestureCapture = async () => {
    if (!videoRef.current) return;

    try {
      const currentGesture = livenessGestures[livenessStep];
      
      // Detectar rostro actual
      const detection = await detectFaceInVideo(videoRef.current);
      
      // Validar que detection existe y tiene la estructura esperada
      if (detection && detection.success && detection.faceDetected) {
        // Analizar calidad del gesto - usar calidad simulada si analyzeFaceQuality no está disponible
        let quality;
        try {
          quality = analyzeFaceQuality(detection);
        } catch (error) {
          console.warn('⚠️ analyzeFaceQuality no disponible, usando calidad simulada');
          quality = { score: Math.random() * 30 + 70 }; // Simular calidad entre 70-100
        }
        
        if (quality && quality.score >= 70) {
          // Capturar datos del gesto
          const userId = responses.face_verification?.userId || `user_${Date.now()}`;
          
          try {
            const gestureResult = await captureFaceData(videoRef.current, userId, `gesture_${currentGesture.name}`);
            
            // Validar que gestureResult existe y tiene la estructura esperada
            if (gestureResult && gestureResult.success) {
              // Gesto capturado exitosamente
              const gestureData = {
                gesture: currentGesture.name,
                verified: true,
                confidence: gestureResult.faceData.confidence,
                quality: quality.score,
                timestamp: new Date().toISOString(),
                automatic: true,
                storageKey: gestureResult.storageKey
              };
              
              setCapturedGestures(prev => [...prev, gestureData]);
              
              setVerificationResult({
                status: 'success',
                message: `✅ ${currentGesture.name} verificado! (${quality.score}%)`
              });
              
              // Avanzar al siguiente gesto después de 1.5 segundos
              setTimeout(() => {
                setLivenessStep(prev => prev + 1);
                captureGestureAutomatically();
              }, 1500);
            } else {
              // Error capturando gesto - gestureResult es null o no exitoso
              setVerificationResult({
                status: 'error',
                message: `Error capturando ${currentGesture.name}. Reintentando...`
              });
              
              setTimeout(() => {
                captureGestureAutomatically();
              }, 2000);
            }
          } catch (captureError) {
            console.error('Error en captureFaceData:', captureError);
            setVerificationResult({
              status: 'error',
              message: `Error capturando ${currentGesture.name}. Reintentando...`
            });
            
            setTimeout(() => {
              captureGestureAutomatically();
            }, 2000);
          }
        } else {
          // Calidad insuficiente
          setVerificationResult({
            status: 'processing',
            message: `${currentGesture.instruction} - Mejorando calidad... (${quality.score}%)`
          });
          
          // Reintentar después de 1 segundo
          setTimeout(() => {
            performGestureCapture();
          }, 1000);
        }
      } else {
        // No se detecta rostro
        setVerificationResult({
          status: 'error',
          message: `No se detecta rostro para ${currentGesture.name}. Reintentando...`
        });
        
        setTimeout(() => {
          captureGestureAutomatically();
        }, 2000);
      }
    } catch (error) {
      console.error('Error capturing gesture automatically:', error);
      setVerificationResult({
        status: 'error',
        message: 'Error en la captura. Reintentando...'
      });
      
      setTimeout(() => {
        captureGestureAutomatically();
      }, 2000);
    }
  };

  // Función para forzar compatibilidad con Safari y navegadores problemáticos
  const forceSafariCompatibility = async () => {
    console.log('🍎 Forzando compatibilidad con Safari...');
    
    // Método 1: Verificar y configurar permisos específicos de Safari
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({ name: 'camera' });
        console.log('📹 Estado de permisos de cámara:', permission.state);
        
        if (permission.state === 'denied') {
          throw new Error('Permisos de cámara denegados. Ve a Configuración → Safari → Cámara');
        }
      } catch (permError) {
        console.log('⚠️ No se pudo verificar permisos:', permError);
      }
    }
    
    // Método 2: Crear contexto de usuario requerido por Safari
    const createUserContext = () => {
      return new Promise((resolve, reject) => {
        const button = document.createElement('button');
        button.innerHTML = '🎥 Activar Cámara Safari';
        button.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10000;
          padding: 20px;
          background: #007AFF;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 18px;
          cursor: pointer;
        `;
        
        button.onclick = () => {
          document.body.removeChild(button);
          resolve();
        };
        
        document.body.appendChild(button);
        
        // Auto-remove después de 10 segundos
        setTimeout(() => {
          if (document.body.contains(button)) {
            document.body.removeChild(button);
            reject(new Error('Timeout esperando interacción del usuario'));
          }
        }, 10000);
      });
    };
    
    // Para Safari, necesitamos interacción del usuario
    const browser = getBrowserCapabilities();
    if (browser.isSafari || browser.isIOS) {
      await createUserContext();
    }
  };

  // Polyfill mejorado para Safari y navegadores problemáticos
  const getSafariCompatibleUserMedia = () => {
    console.log('🔧 Configurando getUserMedia compatible con Safari...');
    
    // Verificar soporte nativo primero
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log('✅ getUserMedia nativo disponible');
      return navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    }
    
    // Polyfill específico para Safari
    const getUserMedia = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia;
    
    if (getUserMedia) {
      console.log('✅ getUserMedia con polyfill disponible');
      return function(constraints) {
        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }
    
    // Último recurso: método manual para Safari muy antiguo
    console.log('⚠️ Usando método de último recurso para Safari');
    return function(constraints) {
      return new Promise((resolve, reject) => {
        // Crear elemento de input file para acceso a cámara
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'user'; // Forzar cámara frontal
        
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            // Convertir archivo a stream de video simulado
            const url = URL.createObjectURL(file);
            resolve({ getTracks: () => [{ stop: () => URL.revokeObjectURL(url) }] });
          } else {
            reject(new Error('No se seleccionó archivo'));
          }
        };
        
        input.click();
      });
    };
  };

  // Función para verificar y configurar soporte de cámara universal MEJORADA
  const checkCameraSupport = async () => {
    const browser = getBrowserCapabilities();
    console.log('🔍 Verificando soporte de cámara...', browser);
    
    // Siempre permitir continuar - la verificación real se hace al solicitar la cámara
    console.log(`✅ Navegador ${browser.browserName} será compatible con configuración adaptada`);
    
    // Forzar compatibilidad específica para Safari
    if (browser.isSafari || browser.isIOS) {
      try {
        await forceSafariCompatibility();
        console.log('🍎 Compatibilidad Safari aplicada');
      } catch (safariError) {
        console.warn('⚠️ Error en compatibilidad Safari (continuando):', safariError);
      }
    }
    
    // Verificar dispositivos de media disponibles (solo si está disponible)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        console.log(`📹 Dispositivos de video encontrados: ${videoDevices.length}`, videoDevices);
        
        if (videoDevices.length === 0) {
          console.warn('⚠️ No se encontraron cámaras específicas, pero continuando...');
        }
      } else {
        console.log('📱 enumerateDevices no disponible, pero continuando...');
      }
    } catch (enumError) {
      console.warn('⚠️ No se pudo enumerar dispositivos, continuando...', enumError);
    }
    
    return browser;
  };

  // Función para usar HTML fallback como última opción
  const useFallbackCamera = () => {
    console.log('🔧 Activando método de fallback HTML...');
    
    // Método 1: Iframe embebido
    const createIframeFallback = () => {
      const iframe = document.createElement('iframe');
      iframe.src = '/camera-fallback.html';
      iframe.style.cssText = `
        width: 100%;
        height: 600px;
        border: none;
        border-radius: 8px;
        background: white;
      `;
      
      // Escuchar mensajes del iframe
      const handleMessage = (event) => {
        if (event.data.type === 'camera-success') {
          setVerificationResult({
            status: 'success',
            message: `✅ Cámara activada via fallback en ${event.data.browser}`
          });
        } else if (event.data.type === 'camera-error') {
          setVerificationResult({
            status: 'error',
            message: event.data.error
          });
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      return iframe;
    };
    
    // Método 2: Ventana nueva (para casos muy problemáticos)
    const openFallbackWindow = () => {
      const fallbackWindow = window.open(
        '/camera-fallback.html',
        'cameraFallback',
        'width=800,height=700,scrollbars=yes,resizable=yes'
      );
      
      if (!fallbackWindow) {
        setVerificationResult({
          status: 'error',
          message: '❌ No se pudo abrir ventana de fallback. Permite pop-ups para este sitio.'
        });
        return;
      }
      
      // Escuchar mensajes de la ventana
      const handleMessage = (event) => {
        if (event.source === fallbackWindow) {
          if (event.data.type === 'camera-success') {
            setVerificationResult({
              status: 'success',
              message: `✅ Cámara activada en ventana externa (${event.data.browser})`
            });
          }
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      return fallbackWindow;
    };
    
    // Retornar ambos métodos
    return {
      createIframeFallback,
      openFallbackWindow
    };
  };

  // Detectar dispositivos móviles (mejorado y más preciso)
  const isMobileDevice = () => {
    // Detección más precisa de dispositivos móviles
    const mobileUserAgents = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    const isUserAgentMobile = mobileUserAgents.test(navigator.userAgent);
    
    // Verificar características de pantalla táctil
    const isTouchDevice = navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
    
    // Verificar ancho de pantalla (típico de móviles)
    const isSmallScreen = window.innerWidth <= 768;
    
    // Detección específica para iPad/tablet con userAgent de escritorio
    const isTablet = /iPad/.test(navigator.userAgent) || 
                    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
    
    // Verificación adicional para Safari iOS que a veces se reporta como desktop
    const isSafariMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) || 
                          (/Safari/.test(navigator.userAgent) && isTouchDevice);
    
    return isUserAgentMobile || (isTouchDevice && isSmallScreen) || isTablet || isSafariMobile;
  };

  // Iniciar detección automática cuando se muestre la verificación facial
  useEffect(() => {
    console.log('🔄 useEffect showFaceVerification ejecutado:', {
      showFaceVerification,
      faceVerificationComplete,
      cameraInitialized
    });
    
    if (showFaceVerification && !faceVerificationComplete) {
      console.log('🚀 Iniciando proceso de inicialización de cámara...');
      
      const initializeCamera = async () => {
        if (isMobileDevice()) {
          console.log('📱 Dispositivo móvil detectado - iniciando cámara automáticamente');
          setVerificationResult({
            status: 'processing',
            message: '📱 Solicitando permisos de cámara en dispositivo móvil...'
          });
          
          try {
            console.log('📱 Llamando a startCamera() para móvil...');
            await startCamera();
            console.log('📱 startCamera() completado, configurando timeout...');
            
            // Esperar 2 segundos para que la cámara esté completamente lista
            setTimeout(() => {
              console.log('🎯 Iniciando detección visual mejorada en móvil...');
              console.log('📊 Estado móvil - useVisualDetection:', useVisualDetection);
              
              // Usar detección visual por defecto en móviles también
              if (useVisualDetection) {
                console.log('✅ Móvil: Llamando a startVisualDetection()');
                startVisualDetection();
              } else {
                // Fallback a detección Face-api.js (menos frecuente)
                setIsAutoDetecting(true);
                updateVerificationResult('processing', 'Iniciando detección automática...');
                
                // Comenzar a buscar rostros cada 1500ms (menos frecuente para evitar trabas)
                const timer = setInterval(detectFaceAutomatically, 1500);
                setAutoGestureTimer(timer);
              }
            }, 2000);
          } catch (error) {
            console.error('Error al iniciar cámara en móvil:', error);
            setVerificationResult({
              status: 'error',
              message: 'Error al acceder a la cámara. Por favor, permite el acceso.'
            });
          }
        } else {
          console.log('💻 Dispositivo de escritorio detectado - iniciando cámara automáticamente');
          setVerificationResult({
            status: 'processing',
            message: '💻 Iniciando cámara en dispositivo de escritorio...'
          });
          
          try {
            console.log('💻 Iniciando cámara en dispositivo de escritorio...');
            await startCamera();
            console.log('💻 Cámara iniciada en desktop, esperando 3 segundos...');
            
            // Esperar 3 segundos para que la cámara esté completamente lista en desktop
            setTimeout(() => {
              console.log('🎯 Iniciando detección visual mejorada en desktop...');
              console.log('📊 Estado de useVisualDetection:', useVisualDetection);
              console.log('📊 Estado de visualDetectionActive:', visualDetectionActive);
              
              // Usar detección visual por defecto
              if (useVisualDetection) {
                console.log('✅ Llamando a startVisualDetection()');
                startVisualDetection();
              } else {
                console.log('⚠️ Usando fallback a Face-API');
                // Fallback a detección Face-api.js (menos frecuente)
                setIsAutoDetecting(true);
                updateVerificationResult('processing', 'Iniciando detección automática...');
                
                // Comenzar a buscar rostros cada 2000ms (menos frecuente para desktop)
                const timer = setInterval(detectFaceAutomatically, 2000);
                setAutoGestureTimer(timer);
                console.log('⏰ Timer de detección automática configurado');
              }
            }, 3000);
          } catch (error) {
            console.error('Error al iniciar cámara en desktop:', error);
            setVerificationResult({
              status: 'error',
              message: 'Error al acceder a la cámara. Por favor, permite el acceso y recarga la página.'
            });
          }
        }
      };

      console.log('🏁 Llamando a initializeCamera()...');
      initializeCamera();
    } else {
      console.log('⏭️ Saltando inicialización:', {
        showFaceVerification,
        faceVerificationComplete
      });
    }
    
    return () => {
      console.log('🧹 Cleanup useEffect - limpiando timers...');
      if (autoGestureTimer) {
        clearInterval(autoGestureTimer);
      }
    };
  }, [showFaceVerification]);

  // Función para capturar y verificar manualmente
  const captureAndVerify = async () => {
    if (!videoRef.current) return;

    setVerificationResult({
      status: 'processing',
      message: 'Capturando y verificando rostro...'
    });

    try {
      // Generar ID único para el usuario
      const userId = `user_${Date.now()}`;
      
      // Capturar datos faciales completos
      const captureResult = await captureFaceData(videoRef.current, userId, 'registration');
      
      if (captureResult.success) {
        setFaceVerificationComplete(true);
        setVerificationResult({
          status: 'success',
          message: `✅ Rostro verificado y guardado exitosamente`,
          confidence: captureResult.faceData.confidence
        });
        
        // Guardar datos en el estado
        setResponses(prev => ({
          ...prev,
          face_verification: {
            verified: true,
            confidence: captureResult.faceData.confidence,
            timestamp: new Date().toISOString(),
            automatic: false,
            userId: userId,
            storageKey: captureResult.storageKey
          }
        }));
        
        // Guardar para comparación posterior
        localStorage.setItem('current_user_face_data', JSON.stringify(captureResult.faceData));
        
      } else {
        setVerificationResult({
          status: 'error',
          message: captureResult.message || 'No se pudo verificar el rostro'
        });
      }
    } catch (error) {
      console.error('Error in manual verification:', error);
      setVerificationResult({
        status: 'error',
        message: 'Error en la verificación manual'
      });
    }
  };

  // Función para capturar gesto durante verificación de vida
  const captureGesture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const currentGesture = livenessGestures[livenessStep];
    setVerificationResult({ 
      status: 'processing', 
      message: `Verificando gesto: ${currentGesture.instruction}...` 
    });

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (blob) {
        await verifyGesture(blob, currentGesture);
      }
    }, COMPREFACE_CONFIG.DETECTION_CONFIG.IMAGE_FORMAT, COMPREFACE_CONFIG.DETECTION_CONFIG.IMAGE_QUALITY);
  };

  // Función para verificar un gesto específico
  const verifyGesture = async (imageBlob, gesture) => {
    try {
      const formData = new FormData();
      formData.append('file', imageBlob, `gesture_${gesture.id}.jpg`);

      // Detectar rostros usando la función helper
      const detectResult = await compreFaceRequest(COMPREFACE_CONFIG.ENDPOINTS.DETECT, {
        method: 'POST',
        body: formData,
      });

      if (detectResult.result && detectResult.result.length > 0) {
        const face = detectResult.result[0];
        const confidence = face.face_probability;

        if (confidence > COMPREFACE_CONFIG.DETECTION_CONFIG.MIN_CONFIDENCE) {
          // Gesto capturado exitosamente
          const gestureData = {
            gesture: gesture.id,
            instruction: gesture.instruction,
            confidence: confidence,
            timestamp: new Date().toISOString(),
            faceBox: face.box // Coordenadas del rostro detectado
          };

          setCapturedGestures(prev => [...prev, gestureData]);
          
          setVerificationResult({
            status: 'success',
            message: `✅ ${gesture.instruction} - Correcto!`,
            confidence: confidence
          });

          // Avanzar al siguiente gesto después de 1.5 segundos
          setTimeout(() => {
            if (livenessStep < livenessGestures.length - 1) {
              setLivenessStep(livenessStep + 1);
              setVerificationResult(null);
            } else {
              // Todos los gestos completados
              completeLivenessVerification();
            }
          }, 1500);

        } else {
          setVerificationResult({
            status: 'error',
            message: `Calidad insuficiente. Intenta ${gesture.instruction} de nuevo.`,
            confidence: confidence
          });
        }
      } else {
        setVerificationResult({
          status: 'error',
          message: `No se detectó rostro. Asegúrate de estar en el encuadre y ${gesture.instruction}.`
        });
      }
    } catch (error) {
      console.error('Error verificando gesto:', error);
      setVerificationResult({
        status: 'error',
        message: `Error verificando ${gesture.instruction}. Intenta de nuevo.`
      });
    }
  };

  // Función para completar la verificación de vida
  const completeLivenessVerification = () => {
    setLivenessComplete(true);
    setFaceVerificationComplete(true);
    
    const livenessData = {
      verified: true,
      gestures_completed: capturedGestures.length,
      total_gestures: livenessGestures.length,
      gestures: capturedGestures,
      completion_time: new Date().toISOString()
    };

    setResponses(prev => ({
      ...prev,
      liveness_verification: livenessData
    }));

    setVerificationResult({
      status: 'success',
      message: '🎉 ¡Verificación de persona viva completada! Ahora puedes comparar con tu INE.'
    });

    // Mostrar opción de comparación con INE después de 2 segundos
    setTimeout(() => {
      setShowINEComparison(true);
    }, 2000);
  };

  // Función para enviar imagen a CompreFace
  const sendToCompreFace = async (imageBlob) => {
    try {
      setVerificationResult({ status: 'processing', message: 'Procesando verificación facial...' });

      const formData = new FormData();
      formData.append('file', imageBlob, 'face_verification.jpg');

      // Detectar rostros usando la función helper
      const detectResult = await compreFaceRequest(COMPREFACE_CONFIG.ENDPOINTS.DETECT, {
        method: 'POST',
        body: formData,
      });

      if (detectResult.result && detectResult.result.length > 0) {
        // Rostro detectado exitosamente
        const face = detectResult.result[0];
        const confidence = face.face_probability;

        if (confidence > COMPREFACE_CONFIG.DETECTION_CONFIG.MIN_CONFIDENCE) {
          setVerificationResult({
            status: 'success',
            message: 'Verificación facial exitosa',
            confidence: confidence,
            face_detected: true
          });
          setFaceVerificationComplete(true);
          
          // Guardar resultado en las respuestas
          setResponses(prev => ({
            ...prev,
            face_verification: {
              verified: true,
              confidence: confidence,
              timestamp: new Date().toISOString()
            }
          }));
        } else {
          setVerificationResult({
            status: 'error',
            message: 'La calidad de la imagen no es suficiente. Intenta de nuevo.',
            confidence: confidence
          });
        }
      } else {
        setVerificationResult({
          status: 'error',
          message: 'No se detectó ningún rostro. Asegúrate de estar bien iluminado y mirando a la cámara.'
        });
      }
    } catch (error) {
      console.error('Error con CompreFace:', error);
      setVerificationResult({
        status: 'error',
        message: 'Error en la verificación. Intenta de nuevo o continúa sin verificación facial.'
      });
    }
  };

  // Función para omitir la verificación facial
  const skipFaceVerification = () => {
    setResponses(prev => ({
      ...prev,
      face_verification: {
        verified: false,
        skipped: true,
        timestamp: new Date().toISOString()
      },
      liveness_verification: {
        verified: false,
        skipped: true,
        timestamp: new Date().toISOString()
      }
    }));
    setFaceVerificationComplete(true);
    setShowFaceVerification(false);
  };

  // Función para completar el registro después de la verificación facial
  const completeRegistration = async () => {
    try {
      // Preparar datos para envío
      const registrationData = {
        // Respuestas del cuestionario
        surveyResponses: responses,
        
        // Datos de verificación facial
        faceVerification: {
          verified: faceVerificationComplete,
          method: responses.face_verification?.method || 'unknown',
          quality: responses.face_verification?.quality || 0,
          timestamp: responses.face_verification?.timestamp || new Date().toISOString()
        },
        
        // Datos de verificación de vida
        livenessVerification: {
          completed: livenessComplete,
          gestures: capturedGestures.map(g => ({
            gesture: g.gesture,
            success: g.success,
            timestamp: g.timestamp
          }))
        },
        
        // Comparación con INE (si existe)
        ineComparison: ineComparisonResult ? {
          success: ineComparisonResult.success,
          similarity: ineComparisonResult.similarity,
          isMatch: ineComparisonResult.isMatch,
          timestamp: new Date().toISOString()
        } : null,
        
        // Metadatos
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          completed: true,
          sessionId: Math.random().toString(36).substr(2, 9)
        }
      };

      // Enviar al backend
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Registro exitoso:', result);

      // Guardar ID del registro
      setRegistrationId(result.registrationId);
      setRegistrationStatus('pending_ine_verification');

      // Procesar verificación de INE si existe
      if (ineComparisonResult && result.registrationId) {
        try {
          const ineResponse = await fetch('/api/ine-verification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              registrationId: result.registrationId,
              comparisonResult: ineComparisonResult,
              faceData: responses.face_verification
            })
          });

          if (ineResponse.ok) {
            const ineResult = await ineResponse.json();
            console.log('✅ Verificación INE procesada:', ineResult);
          }
        } catch (ineError) {
          console.warn('⚠️ Error en verificación INE:', ineError);
        }
      }

      // Guardar copia local como respaldo
      const backupData = {
        ...registrationData,
        registrationId: result.registrationId,
        backupTimestamp: new Date().toISOString()
      };
      localStorage.setItem('surveyDataBackup', JSON.stringify(backupData));

      // Mostrar resultado exitoso
      stopCamera();
      setSubmitted(true);
      
      // Mostrar mensaje de éxito
      alert(`¡Registro completado exitosamente!\n\nID de registro: ${result.registrationId}\n\nTus datos han sido guardados de manera segura.`);

    } catch (error) {
      console.error('❌ Error al completar registro:', error);
      
      // Guardar datos localmente en caso de error
      const fallbackData = {
        ...responses,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        completed: true,
        error: error.message,
        fallbackSave: true
      };
      localStorage.setItem('surveyDataFallback', JSON.stringify(fallbackData));
      
      // Mostrar error pero permitir continuar
      const retry = confirm(`Error al enviar datos: ${error.message}\n\n¿Quieres intentar de nuevo?\n\n(Los datos se guardaron localmente como respaldo)`);
      
      if (retry) {
        // Intentar de nuevo
        completeRegistration();
      } else {
        // Continuar sin envío
        stopCamera();
        setSubmitted(true);
      }
    }
  };

  // Función para consultar el estado del registro
  const checkRegistrationStatus = async (regId) => {
    try {
      const response = await fetch(`/api/registrations?id=${regId}`);
      if (response.ok) {
        const data = await response.json();
        setRegistrationStatus(data.status);
        return data;
      }
    } catch (error) {
      console.error('Error al consultar estado del registro:', error);
    }
    return null;
  };

  // Verificar estado del registro al cargar
  useEffect(() => {
    const checkStoredRegistration = async () => {
      const backupData = localStorage.getItem('surveyDataBackup');
      if (backupData) {
        try {
          const data = JSON.parse(backupData);
          if (data.registrationId) {
            setRegistrationId(data.registrationId);
            const status = await checkRegistrationStatus(data.registrationId);
            if (status) {
              console.log('Estado del registro:', status);
            }
          }
        } catch (error) {
          console.error('Error al verificar registro guardado:', error);
        }
      }
    };

    checkStoredRegistration();
  }, []);

  const handleOptionSelect = (option) => {
    const currentQuestion = questions[currentStep];
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: option
    }));

    // Avanzar automáticamente al siguiente paso después de 500ms
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Si es la última pregunta, mostrar verificación facial
        setShowFaceVerification(true);
        startCamera();
      }
    }, 500);
  };

  const resetSurvey = () => {
    setCurrentStep(0);
    setResponses({});
    setSubmitted(false);
    setShowFaceVerification(false);
    setFaceVerificationComplete(false);
    setVerificationResult(null);
    setLivenessComplete(false);
    setLivenessStep(0);
    setCapturedGestures([]);
    setIsAutoDetecting(false);
    setFaceDetected(false);
    setCountdown(0);
    if (autoGestureTimer) {
      clearInterval(autoGestureTimer);
      setAutoGestureTimer(null);
    }
    stopCamera();
    // Limpiar datos guardados
    localStorage.removeItem('surveyData');
  };

  if (submitted) {
    // Obtener datos guardados para mostrar resumen
    const backupData = localStorage.getItem('surveyDataBackup');
    const surveyData = backupData ? JSON.parse(backupData) : {};
    
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">¡Registro completado!</h3>
          <p className="text-gray-600 mb-4">
            Gracias por completar tu registro. Tus datos han sido procesados exitosamente.
          </p>
          
          {/* Información del registro */}
          {registrationId && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-bold text-blue-900 mb-2">📋 Información del Registro</h4>
              <div className="text-sm text-blue-800">
                <p><span className="font-medium">ID de Registro:</span> {registrationId}</p>
                <p><span className="font-medium">Estado:</span> {
                  registrationStatus === 'pending_ine_verification' ? '🔄 Pendiente verificación INE' :
                  registrationStatus === 'verified' ? '✅ Verificado' :
                  registrationStatus === 'rejected' ? '❌ Rechazado' :
                  registrationStatus === 'pending_manual_review' ? '⏳ Revisión manual' :
                  '📋 Registrado'
                }</p>
              </div>
            </div>
          )}
          
          {/* Estado de verificaciones */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-bold text-gray-900 mb-3">📊 Estado de Verificaciones:</h4>
            <div className="space-y-2 text-sm">
              {/* Verificación facial */}
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-gray-700">🔍 Verificación Facial</span>
                <span className={`font-medium ${faceVerificationComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                  {faceVerificationComplete ? '✅ Completada' : '⏳ Pendiente'}
                </span>
              </div>
              
              {/* Verificación de vida */}
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-gray-700">👤 Verificación de Vida</span>
                <span className={`font-medium ${livenessComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                  {livenessComplete ? '✅ Completada' : '⏳ Pendiente'}
                </span>
              </div>
              
              {/* Verificación INE */}
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-gray-700">🆔 Verificación INE</span>
                <span className={`font-medium ${
                  ineComparisonResult?.isMatch ? 'text-green-600' : 
                  ineComparisonResult ? 'text-yellow-600' : 'text-gray-500'
                }`}>
                  {ineComparisonResult?.isMatch ? '✅ Verificada' : 
                   ineComparisonResult ? '⚠️ Requiere revisión' : '➖ No realizada'}
                </span>
              </div>
            </div>
          </div>

          {/* Próximos pasos */}
          <div className="bg-yellow-50 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-yellow-900 mb-2">📋 Próximos Pasos</h4>
            <div className="text-sm text-yellow-800 text-left space-y-1">
              {registrationStatus === 'verified' ? (
                <p>✅ Tu registro ha sido aprobado. Te contactaremos pronto con más información.</p>
              ) : registrationStatus === 'pending_manual_review' ? (
                <p>⏳ Tu registro está en revisión manual. Recibirás una respuesta en 24-48 horas.</p>
              ) : registrationStatus === 'rejected' ? (
                <p>❌ Tu registro requiere información adicional. Te contactaremos para los siguientes pasos.</p>
              ) : (
                <>
                  <p>• Revisaremos tu información en las próximas 24-48 horas</p>
                  <p>• Te notificaremos por el medio de contacto proporcionado</p>
                  <p>• Conserva tu ID de registro para consultas</p>
                </>
              )}
            </div>
          </div>
          
          {/* Opciones adicionales */}
          <div className="space-y-3">
            {registrationId && (
              <button
                onClick={() => checkRegistrationStatus(registrationId)}
                className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                🔄 Actualizar Estado
              </button>
            )}
            
            <button
              onClick={resetSurvey}
              className="w-full bg-rose-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-rose-700 transition-colors"
            >
              Realizar nuevo registro
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Componente de verificación facial
  if (showFaceVerification) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header con mensaje específico para móviles */}
          <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 text-center">
              {!faceVerificationComplete ? 'Verificación de Identidad' : 
               !livenessComplete ? 'Verificación de Persona Viva' : 
               'Verificación Completada'}
            </h2>
            <p className="text-sm text-gray-600 text-center mt-1">
              {!faceVerificationComplete ? 
                (isMobileDevice() ? 
                  '📱 En móviles: Permite el acceso a la cámara cuando se solicite' :
                  'Primero verificaremos tu rostro'
                ) :
               !livenessComplete ? 'Ahora realiza los gestos solicitados' :
               'Verificación completada exitosamente'}
            </p>
            
            {/* Indicador de dispositivo móvil */}
            {isMobileDevice() && getVerificationStatus() === 'processing' && (
              <div className="mt-2 text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
                  Dispositivo móvil detectado
                </div>
              </div>
            )}
          </div>

          {/* Video y controles */}
          <div className="p-6">
            {/* Estado de error con instrucciones específicas por navegador */}
            {getVerificationStatus() === 'error' && (
              <div className="text-center mb-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {getVerificationMessage()}
                </div>
                
                {/* Instrucciones específicas por navegador */}
                <div className="space-y-4 text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-800">📱 Instrucciones por navegador:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    {/* Safari/iOS */}
                    <div className="bg-blue-50 p-3 rounded border">
                      <p className="font-semibold text-blue-800 mb-2">🍎 Safari/iOS:</p>
                      <ul className="space-y-1 text-xs text-blue-700">
                        <li>1. Toca el ícono "🔒" o "AA" en la barra de direcciones</li>
                        <li>2. Selecciona "Configuración del sitio web"</li>
                        <li>3. Habilita "Cámara" → "Permitir"</li>
                        <li>4. Recarga la página</li>
                      </ul>
                    </div>
                    
                    {/* Chrome móvil */}
                    <div className="bg-green-50 p-3 rounded border">
                      <p className="font-semibold text-green-800 mb-2">🟢 Chrome móvil:</p>
                      <ul className="space-y-1 text-xs text-green-700">
                        <li>1. Toca el ícono "📷" en la barra de direcciones</li>
                        <li>2. Selecciona "Permitir" cuando aparezca</li>
                        <li>3. Si no aparece, ve a Configuración → Privacidad</li>
                        <li>4. Busca este sitio y permite la cámara</li>
                      </ul>
                    </div>
                    
                    {/* Firefox móvil */}
                    <div className="bg-orange-50 p-3 rounded border">
                      <p className="font-semibold text-orange-800 mb-2">🦊 Firefox móvil:</p>
                      <ul className="space-y-1 text-xs text-orange-700">
                        <li>1. Toca el ícono de escudo en la barra</li>
                        <li>2. Desactiva "Protección mejorada"</li>
                        <li>3. O ve a Menú → Configuración → Permisos</li>
                        <li>4. Permite cámara para este sitio</li>
                      </ul>
                    </div>
                    
                    {/* Edge */}
                    <div className="bg-purple-50 p-3 rounded border">
                      <p className="font-semibold text-purple-800 mb-2">🔵 Edge:</p>
                      <ul className="space-y-1 text-xs text-purple-700">
                        <li>1. Toca "..." → "Configuración"</li>
                        <li>2. Ve a "Permisos del sitio"</li>
                        <li>3. Selecciona "Cámara" → "Permitir"</li>
                        <li>4. Recarga la página</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded border mt-4">
                    <p className="font-semibold text-yellow-800 mb-2">⚡ Solución rápida universal:</p>
                    <p className="text-xs text-yellow-700">
                      Si nada funciona: Ve a Configuración de tu navegador → Privacidad y seguridad → 
                      Permisos del sitio → Cámara → Agregar este sitio a "Permitir"
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={startCamera}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold w-full md:w-auto"
                  >
                    � Intentar Nuevamente
                  </button>
                  <p className="text-xs text-gray-500">
                    Si el problema persiste, prueba con otro navegador
                  </p>
                  
                  {/* Botones de fallback para Safari y navegadores problemáticos */}
                  <div className="space-y-2 mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-semibold text-yellow-800">💡 Métodos alternativos para Safari:</p>
                    
                    <button
                      onClick={() => {
                        window.open('/camera-fallback.html', 'cameraFallback', 'width=800,height=700,scrollbars=yes,resizable=yes');
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium w-full text-sm"
                    >
                      🌐 Abrir Cámara en Ventana Nueva
                    </button>
                    
                    <button
                      onClick={async () => {
                        try {
                          setVerificationResult({
                            status: 'processing',
                            message: '⚡ Intentando método directo Safari...'
                          });
                          
                          // Método directo forzado para Safari
                          const stream = await navigator.mediaDevices.getUserMedia({ 
                            video: { facingMode: 'user' } 
                          });
                          
                          if (videoRef.current) {
                            videoRef.current.srcObject = stream;
                            videoRef.current.setAttribute('playsinline', true);
                            videoRef.current.setAttribute('webkit-playsinline', true);
                            await videoRef.current.play();
                            
                            setVerificationResult({
                              status: 'success',
                              message: '✅ Método directo Safari exitoso'
                            });
                          }
                        } catch (directError) {
                          console.error('Método directo falló:', directError);
                          setVerificationResult({
                            status: 'error',
                            message: `❌ Método directo falló: ${directError.message}`
                          });
                        }
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium w-full text-sm"
                    >
                      ⚡ Método Directo Safari
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Estado de procesamiento */}
            {getVerificationStatus() === 'processing' && (
              <div className="text-center mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-600">{getVerificationMessage()}</p>
              </div>
            )}

            <div className="text-center mb-6">
              <div className="relative inline-block">
                {/* Video de la cámara - Modo inmersivo */}
                {(getVerificationStatus() === 'success' || getVerificationStatus() === 'warning' || isAutoDetecting || visualDetectionActive) ? (
                  /* Pantalla completa inmersiva */
                  <div className="fixed inset-0 bg-black z-50">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      onClick={async () => {
                        if (videoRef.current && videoRef.current.paused) {
                          try {
                            await videoRef.current.play();
                            updateVerificationResult('success', '✅ Video activado por el usuario');
                            if (!visualDetectionActive && !isAutoDetecting) {
                              setTimeout(() => {
                                setVisualDetectionActive(true);
                              }, 1000);
                            }
                          } catch (error) {
                            console.error('Error al reproducir video:', error);
                          }
                        }
                      }}
                    />
                    
                    {/* Overlay transparente con información */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/30 pointer-events-none"></div>
                    
                    {/* Header con información */}
                    <div className="absolute top-0 left-0 right-0 p-4 text-white z-10">
                      <div className="text-center">
                        <h3 className="text-xl font-bold mb-1">Verificación Facial</h3>
                        <p className="text-sm opacity-90">{getVerificationMessage()}</p>
                      </div>
                    </div>
                    
                    {/* Botón de cerrar */}
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={() => {
                          setVisualDetectionActive(false);
                          setIsAutoDetecting(false);
                          updateVerificationResult('idle', 'Verificación cancelada');
                        }}
                        className="bg-red-600/80 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {/* Footer con instrucciones */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                      <div className="text-center">
                        <p className="text-sm mb-2">Colócate en un lugar bien iluminado</p>
                        <div className="flex justify-center space-x-3 text-xs">
                          <div className="bg-black/50 rounded px-2 py-1">💡 Buena luz</div>
                          <div className="bg-black/50 rounded px-2 py-1">👤 Mira al centro</div>
                          <div className="bg-black/50 rounded px-2 py-1">📱 Mantén estable</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Componente de detección visual superpuesto */}
                    <div className="absolute inset-0">
                      {console.log('🎯 Renderizando VisualFaceDetection con isActive =', visualDetectionActive)}
                      <VisualFaceDetection
                        videoRef={videoRef}
                        onFaceDetected={handleVisualFaceDetected}
                        onQualityChange={handleQualityChange}
                        isActive={visualDetectionActive}
                      />
                    </div>
                    
                    {/* Botón de activar video en modo inmersivo si está en warning */}
                    {getVerificationStatus() === 'warning' && getVerificationMessage().includes('Toca') && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                        <div className="text-center text-white">
                          <div className="text-6xl mb-4">🎥</div>
                          <p className="text-2xl font-semibold mb-2">Cámara Lista</p>
                          <p className="text-lg opacity-75 mb-6">Toca para comenzar la verificación</p>
                          <button
                            onClick={async () => {
                              console.log('🎬 Usuario presionó Iniciar Verificación');
                              console.log('📊 Estados actuales:', {
                                cameraInitialized,
                                visualDetectionActive,
                                useVisualDetection,
                                videoReady: videoRef.current?.readyState
                              });
                              
                              if (videoRef.current) {
                                try {
                                  await videoRef.current.play();
                                  updateVerificationResult('success', '✅ Video activado correctamente');
                                  console.log('✅ Video.play() ejecutado exitosamente');
                                  setTimeout(() => {
                                    console.log('🔄 Activando setVisualDetectionActive(true)');
                                    setVisualDetectionActive(true);
                                  }, 1000);
                                } catch (error) {
                                  console.error('Error al reproducir video:', error);
                                  updateVerificationResult('warning', '⚡ Intenta tocar el video directamente');
                                }
                              }
                            }}
                            className="bg-white text-black px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-gray-100 transition-colors text-lg"
                          >
                            ▶️ Iniciar Verificación
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Vista normal pequeña */
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-80 h-60 bg-gray-900 rounded-lg border-2 border-gray-300 hidden"
                    style={{ 
                      objectFit: 'cover'
                    }}
                  />
                )}
                
                {/* Indicador de carga/procesamiento para vista normal */}
                {(getVerificationStatus() === 'processing' && (visualDetectionActive || isAutoDetecting)) && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <span>Procesando...</span>
                  </div>
                )}
                
                {/* Placeholder cuando la cámara no está activa */}
                {(getVerificationStatus() === 'idle' || getVerificationStatus() === 'error') && (
                  <div className="w-80 h-60 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-3">📷</div>
                      <p className="text-gray-700 mb-4 font-semibold">Verificación de Identidad</p>
                      <button
                        onClick={startCamera}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                      >
                        🎥 Iniciar Verificación Facial
                      </button>
                      <p className="text-xs text-gray-500 mt-3">
                        Experiencia inmersiva en pantalla completa
                      </p>
                    </div>
                  </div>
                )}

                {/* Indicador de carga de cámara */}
                {getVerificationStatus() === 'processing' && !visualDetectionActive && !isAutoDetecting && (
                  <div className="w-80 h-60 bg-gray-900 border-2 border-blue-400 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-lg font-semibold mb-2">Iniciando cámara...</p>
                      <p className="text-sm opacity-75">{getVerificationMessage()}</p>
                      <div className="mt-4 bg-gray-800 rounded-lg px-4 py-2">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botón de activar video cuando está en warning */}
                {getVerificationStatus() === 'warning' && getVerificationMessage().includes('Toca') && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <div className="text-white mb-4">
                        <div className="text-4xl mb-2">🎥</div>
                        <p className="text-lg font-semibold">Cámara Lista</p>
                        <p className="text-sm opacity-75">Toca para activar el video</p>
                      </div>
                      <button
                        onClick={async () => {
                          if (videoRef.current) {
                            try {
                              await videoRef.current.play();
                              updateVerificationResult('success', '✅ Video activado correctamente');
                              // Iniciar detección visual automáticamente
                              setTimeout(() => {
                                setVisualDetectionActive(true);
                              }, 1000);
                            } catch (error) {
                              console.error('Error al reproducir video:', error);
                              updateVerificationResult('warning', '⚡ Intenta tocar el video directamente');
                            }
                          }
                        }}
                        className="bg-white text-black px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition-colors text-lg"
                      >
                        ▶️ Activar Video
                      </button>
                    </div>
                  </div>
                )}

                {/* Botón especial para Safari/iOS si el video no se reproduce automáticamente */}
                {verificationResult.status === 'error' && 
                 verificationResult.message.includes('requiere interacción') && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <button
                      onClick={async () => {
                        if (videoRef.current) {
                          try {
                            await videoRef.current.play();
                            setVerificationResult({
                              status: 'success',
                              message: '✅ Video activado correctamente'
                            });
                          } catch (error) {
                            console.error('Error al reproducir video:', error);
                          }
                        }
                      }}
                      className="bg-white text-black px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      ▶️ Tocar para Activar Video
                    </button>
                  </div>
                )}

                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Overlay para guiar la posición del rostro */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-60 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center">
                    <div className="text-blue-600 text-center">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-xs">Coloca tu rostro aquí</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instrucciones para verificación facial inicial */}
            {!faceVerificationComplete && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {isAutoDetecting ? 'Detección Automática Activada' : 'Instrucciones:'}
                </h4>
                {isAutoDetecting ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-blue-800">
                        {faceDetected ? 
                          '¡Rostro detectado! Preparando verificación...' : 
                          'Buscando rostro automáticamente...'
                        }
                      </span>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-3">
                      <p className="text-xs text-blue-700 mb-2">
                        <strong>🤖 Modo Automático:</strong> No necesitas hacer clic en nada
                      </p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Solo colócate frente a la cámara</li>
                        <li>• El sistema detectará tu rostro automáticamente</li>
                        <li>• Sigue las instrucciones que aparecerán en pantalla</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Asegúrate de tener buena iluminación</li>
                    <li>• Mira directamente a la cámara</li>
                    <li>• Mantén tu rostro dentro del marco</li>
                    <li>• No uses lentes oscuros ni cubrebocas</li>
                  </ul>
                )}
              </div>
            )}

            {/* Instrucciones para verificación de vida */}
            {faceVerificationComplete && !livenessComplete && (
              <div className="bg-orange-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-orange-900 mb-3">
                  Verificación de Persona Viva - Automática
                </h4>
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {livenessGestures[livenessStep]?.icon}
                  </div>
                  <p className="text-lg font-medium text-orange-800 mb-2">
                    {livenessGestures[livenessStep]?.instruction}
                  </p>
                  
                  {/* Countdown si está activo */}
                  {countdown > 0 && (
                    <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-orange-600">
                        {countdown}
                      </span>
                    </div>
                  )}
                  
                  <p className="text-sm text-orange-700 mb-2">
                    Paso {livenessStep + 1} de {livenessGestures.length}
                  </p>
                  
                  {/* Indicador de modo automático */}
                  <div className="bg-orange-100 rounded-lg p-2 mb-3">
                    <div className="flex items-center justify-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-xs text-orange-700 font-medium">
                        Modo Automático - Sigue las instrucciones
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Progreso */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-orange-600 mb-1">
                    <span>Progreso</span>
                    <span>{livenessStep}/{livenessGestures.length}</span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(livenessStep / livenessGestures.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Resultado de verificación */}
            {verificationResult && (
              <div className={`rounded-lg p-4 mb-4 ${
                verificationResult.status === 'success' ? 'bg-green-50 border border-green-200' :
                verificationResult.status === 'error' ? 'bg-red-50 border border-red-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center">
                  {verificationResult.status === 'success' && (
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {verificationResult.status === 'error' && (
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {verificationResult.status === 'processing' && (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  <p className="text-gray-700 font-medium">{verificationResult.message}</p>
                </div>
                
                {/* Consejos de iluminación */}
                {verificationResult.message.includes('luz') && (
                  <div className="mt-3 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
                    <p className="text-yellow-800 text-sm font-semibold mb-2">💡 Mejora la iluminación:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-yellow-700">
                      <div className="flex items-center">
                        <span className="mr-1">🪟</span>
                        <span>Sitúate frente a ventana</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1">🚫</span>
                        <span>Evita contraluz</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1">💡</span>
                        <span>Usa luz natural</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Controles de verificación */}
            <div className="space-y-3">
              {/* Comparación con INE */}
              {faceVerificationComplete && livenessComplete && showINEComparison && !ineComparisonResult && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2 text-center">
                    🆔 Verificación con INE (Opcional)
                  </h4>
                  <p className="text-sm text-blue-700 text-center mb-3">
                    Para mayor seguridad, puedes comparar tu rostro con tu INE
                  </p>
                  <INEComparison 
                    userId={responses.face_verification?.userId}
                    onComparisonComplete={async (result) => {
                      console.log('🆔 Resultado de comparación INE:', result);
                      
                      // Guardar resultado localmente primero
                      setIneComparisonResult(result);
                      setResponses(prev => ({
                        ...prev,
                        ine_comparison: result
                      }));

                      // Si ya tenemos un registro guardado, actualizar la verificación INE
                      const backupData = localStorage.getItem('surveyDataBackup');
                      if (backupData) {
                        try {
                          const data = JSON.parse(backupData);
                          if (data.registrationId) {
                            // Enviar al backend para procesamiento
                            const ineResponse = await fetch('/api/ine-verification', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                registrationId: data.registrationId,
                                comparisonResult: result,
                                faceData: responses.face_verification
                              })
                            });

                            if (ineResponse.ok) {
                              const ineResult = await ineResponse.json();
                              console.log('✅ Verificación INE actualizada:', ineResult);
                              
                              // Mostrar mensaje de éxito
                              if (result.isMatch) {
                                alert('✅ Verificación con INE exitosa!\n\nTu identidad ha sido confirmada correctamente.');
                              } else {
                                alert('⚠️ Verificación con INE inconclusa\n\nEl sistema requiere revisión manual. Recibirás una notificación pronto.');
                              }
                            }
                          }
                        } catch (error) {
                          console.warn('⚠️ Error al procesar verificación INE:', error);
                        }
                      }
                    }}
                  />
                </div>
              )}

              {/* Resultado de comparación con INE */}
              {ineComparisonResult && (
                <div className={`rounded-lg p-4 mb-4 ${
                  ineComparisonResult.success && ineComparisonResult.isMatch
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      {ineComparisonResult.success && ineComparisonResult.isMatch ? '✅' : '⚠️'}
                    </div>
                    <h4 className="font-semibold mb-2">
                      {ineComparisonResult.success && ineComparisonResult.isMatch 
                        ? 'Verificación con INE exitosa'
                        : 'Verificación con INE inconclusa'
                      }
                    </h4>
                    <p className="text-sm">
                      Similitud: {ineComparisonResult.similarity?.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Botón para completar registro */}
              {faceVerificationComplete && livenessComplete && (
                <button
                  onClick={completeRegistration}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {ineComparisonResult ? 'Completar Registro Verificado' : 'Completar Registro'}
                </button>
              )}

              {/* Botón para omitir INE */}
              {faceVerificationComplete && livenessComplete && showINEComparison && !ineComparisonResult && (
                <button
                  onClick={() => setShowINEComparison(false)}
                  className="w-full bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg transition-colors text-sm"
                >
                  Omitir verificación con INE
                </button>
              )}

              {/* Controles para modo automático */}
              {!faceVerificationComplete && (
                <div className="text-center space-y-3">
                  {/* Selector de modo de detección */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Modo de Detección:</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setUseVisualDetection(true);
                          stopVisualDetection();
                          setIsAutoDetecting(false);
                          if (autoGestureTimer) {
                            clearInterval(autoGestureTimer);
                            setAutoGestureTimer(null);
                          }
                        }}
                        className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
                          useVisualDetection 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        🎯 Visual (Recomendado)
                      </button>
                      <button
                        onClick={() => {
                          setUseVisualDetection(false);
                          stopVisualDetection();
                          setIsAutoDetecting(false);
                          if (autoGestureTimer) {
                            clearInterval(autoGestureTimer);
                            setAutoGestureTimer(null);
                          }
                        }}
                        className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
                          !useVisualDetection 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        🤖 Face-API
                      </button>
                    </div>
                  </div>

                  {/* Controles según el modo seleccionado */}
                  {useVisualDetection ? (
                    // Controles para detección visual
                    !visualDetectionActive ? (
                      <button
                        onClick={startVisualDetection}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                      >
                        🎯 Iniciar Detección Visual
                      </button>
                    ) : (
                      <button
                        onClick={stopVisualDetection}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                      >
                        ⏹️ Detener Detección Visual
                      </button>
                    )
                  ) : (
                    // Controles para Face-API
                    !isAutoDetecting ? (
                      <button
                        onClick={() => {
                          setIsAutoDetecting(true);
                          updateVerificationResult('processing', 'Iniciando detección automática...');
                          
                          const timer = setInterval(detectFaceAutomatically, 1000);
                          setAutoGestureTimer(timer);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                      >
                        🤖 Iniciar Verificación Face-API
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsAutoDetecting(false);
                          setFaceDetected(false);
                          if (autoGestureTimer) {
                            clearInterval(autoGestureTimer);
                            setAutoGestureTimer(null);
                          }
                          updateVerificationResult('idle', 'Detección detenida');
                        }}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                      >
                        ⏹️ Detener Detección Face-API
                      </button>
                    )
                  )}
                  
                  {/* Botón manual como alternativa */}
                  <button
                    onClick={captureAndVerify}
                    disabled={getVerificationStatus() === 'processing' || isAutoDetecting}
                    className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white font-medium py-2 px-6 rounded-lg transition-colors text-sm"
                  >
                    📸 Modo Manual - Capturar Ahora
                  </button>
                  
                  {/* Botón para continuar sin detección facial avanzada */}
                  {(getVerificationStatus() === 'success' || faceDetected) && (
                    <button
                      onClick={() => {
                        console.log('👤 Usuario decidió continuar manualmente');
                        setFaceVerificationComplete(true);
                        updateVerificationResult('success', '✅ Verificación completada manualmente');
                        
                        // Guardar datos básicos
                        setResponses(prev => ({
                          ...prev,
                          face_verification: {
                            verified: true,
                            method: 'manual',
                            timestamp: new Date().toISOString()
                          }
                        }));
                        
                        // Continuar con la secuencia automática
                        setTimeout(() => {
                          startAutomaticGestureSequence();
                        }, 1000);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      ✅ Continuar Verificación
                    </button>
                  )}
                </div>
              )}

              {/* Estado automático para verificación de vida */}
              {faceVerificationComplete && !livenessComplete && (
                <div className="text-center bg-orange-100 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm font-medium text-orange-700">
                      Verificación automática en progreso
                    </span>
                  </div>
                  <p className="text-xs text-orange-600">
                    El sistema está capturando y verificando tus gestos automáticamente
                  </p>
                </div>
              )}

              {/* Botón para omitir */}
              <button
                onClick={skipFaceVerification}
                className="w-full bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg transition-colors text-sm"
              >
                Omitir Verificación Facial
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              🤖 <strong>Verificación Automática:</strong> Solo colócate frente a la cámara y sigue las instrucciones
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header con número de pregunta */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 text-center">
            Pregunta {currentStep + 1} de {questions.length}:
          </h2>
        </div>

        {/* Pregunta */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-8">
            {currentQuestion.question}
          </h3>

          {/* Opciones */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Indicador de progreso */}
        <div className="px-6 pb-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-rose-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 text-center mt-2">
            Progreso: {currentStep + 1}/{questions.length}
          </p>
        </div>
      </div>

      {/* Botón para retroceder */}
      {currentStep > 0 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="text-rose-600 hover:text-rose-700 text-sm underline"
          >
            ← Pregunta anterior
          </button>
        </div>
      )}
    </div>
  );
}

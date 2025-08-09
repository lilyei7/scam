'use client';

import { useState, useRef, useEffect } from 'react';
import SimpleFaceDetection from './SimpleFaceDetection';

export default function StepByStepSurvey() {
  // Estados simplificados - solo lo necesario
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [faceVerificationComplete, setFaceVerificationComplete] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('Preparando cámara...');
  const [cameraReady, setCameraReady] = useState(false);
  const [detectionActive, setDetectionActive] = useState(false);
  
  const videoRef = useRef(null);

  // Preguntas de la encuesta
  const questions = [
    {
      id: 'situacion_laboral',
      question: '¿Cuál es su situación laboral?',
      options: ['Estudiante', 'Empleada', 'Desempleada']
    },
    {
      id: 'estado_civil',
      question: '¿Cuál es su estado civil?',
      options: ['Soltera', 'Casada', 'Divorciada', 'Viuda']
    },
    {
      id: 'tiene_hijos',
      question: '¿Tiene hijos?',
      options: ['Sí', 'No']
    },
    {
      id: 'apoyo_gobierno',
      question: '¿Ha recibido apoyo del gobierno anteriormente?',
      options: ['Sí', 'No', 'No estoy segura']
    }
  ];

  // Función simple para iniciar cámara
  const startCamera = async () => {
    if (cameraReady) return;
    
    try {
      setVerificationMessage('📷 Solicitando acceso a cámara...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
        setVerificationMessage('✅ Cámara lista - Iniciando detección...');
        
        // Activar detección después de 1 segundo
        setTimeout(() => {
          setDetectionActive(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error al iniciar cámara:', error);
      setVerificationMessage('❌ Error: Permite el acceso a la cámara');
    }
  };

  // Función cuando se completa la detección
  const handleDetectionComplete = (result) => {
    console.log('✅ Detección completada:', result);
    setDetectionActive(false);
    setFaceVerificationComplete(true);
    setVerificationMessage('🎉 ¡Verificación facial exitosa!');
    
    // Guardar resultado
    setResponses(prev => ({
      ...prev,
      face_verification: {
        verified: true,
        quality: result.quality,
        timestamp: new Date().toISOString()
      }
    }));

    // Continuar al siguiente paso después de 2 segundos
    setTimeout(() => {
      handleNext();
    }, 2000);
  };

  // Iniciar verificación facial automáticamente
  useEffect(() => {
    if (showFaceVerification && !faceVerificationComplete && !cameraReady) {
      startCamera();
    }
  }, [showFaceVerification, faceVerificationComplete, cameraReady]);

  // Manejar respuesta de pregunta
  const handleAnswer = (questionId, answer) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Avanzar al siguiente paso
  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === questions.length - 1) {
      // Ir a verificación facial
      setShowFaceVerification(true);
    } else {
      // Completar encuesta
      console.log('Encuesta completada:', responses);
      alert('¡Encuesta completada exitosamente!');
    }
  };

  // Retroceder al paso anterior
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Renderizar pregunta actual
  const renderQuestion = () => {
    if (showFaceVerification) {
      return (
        <div className="bg-white rounded-xl shadow-md border border-zinc-200">
          <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-center flex items-center justify-center gap-3">
              <span className="text-2xl">👤</span>
              Verificación Facial
            </h2>
            <p className="text-center mt-2 text-rose-100">
              {verificationMessage}
            </p>
          </div>
          
          <div className="relative aspect-video bg-gray-900">
            {/* Video de la cámara */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* Componente de detección simple */}
            <SimpleFaceDetection
              videoRef={videoRef}
              onComplete={handleDetectionComplete}
              isActive={detectionActive}
            />
            
            {/* Botón manual si falla la auto-detección */}
            {cameraReady && !detectionActive && !faceVerificationComplete && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <button
                  onClick={() => setDetectionActive(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  🎯 Iniciar Verificación
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    const question = questions[currentStep];
    if (!question) return null;

    return (
      <div className="bg-white rounded-xl shadow-md border border-zinc-200">
        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <div className="text-sm text-zinc-500 mb-2">
              Pregunta {currentStep + 1} de {questions.length}
            </div>
            <div className="w-full bg-zinc-200 rounded-full h-2 mb-4">
              <div
                className="bg-rose-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-zinc-800 mb-6">
            {question.question}
          </h2>

          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  responses[question.id] === option
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-zinc-200 bg-zinc-50 hover:border-rose-300 hover:bg-rose-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    responses[question.id] === option
                      ? 'border-rose-500 bg-rose-500'
                      : 'border-zinc-300'
                  }`}>
                    {responses[question.id] === option && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                  {option}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-lg font-semibold ${
                currentStep === 0
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-zinc-500 text-white hover:bg-zinc-600'
              }`}
            >
              ← Anterior
            </button>

            <button
              onClick={handleNext}
              disabled={!responses[question.id]}
              className={`px-6 py-3 rounded-lg font-semibold ${
                responses[question.id]
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              }`}
            >
              {currentStep === questions.length - 1 ? 'Verificar Identidad →' : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return renderQuestion();
}

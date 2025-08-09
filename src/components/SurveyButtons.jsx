'use client';

import { useState } from 'react';

export default function SurveyButtons() {
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    {
      id: 'situacion',
      question: '¿Cuál es tu situación económica actual?',
      options: [
        'Soy madre soltera sin ingresos fijos',
        'Tengo trabajo pero ingresos insuficientes',
        'Estoy desempleada temporalmente',
        'Soy adulta mayor sin pensión',
        'Tengo familiares dependientes a mi cargo'
      ]
    },
    {
      id: 'ayuda_necesaria',
      question: '¿Para qué necesitas principalmente el apoyo económico?',
      options: [
        'Gastos básicos del hogar (comida, servicios)',
        'Gastos médicos y medicamentos',
        'Educación de mis hijos',
        'Emprender un pequeño negocio',
        'Emergencias familiares'
      ]
    },
    {
      id: 'familiares',
      question: '¿Cuántas personas dependen económicamente de ti?',
      options: [
        'Solo yo',
        '1-2 personas (hijos menores)',
        '3-4 personas',
        '5 o más personas',
        'Tengo adultos mayores a mi cargo'
      ]
    },
    {
      id: 'documentos',
      question: '¿Cuentas con la documentación necesaria?',
      options: [
        'Tengo CURP, INE y comprobante de domicilio',
        'Me falta algún documento',
        'Necesito actualizar mis documentos',
        'No estoy segura qué documentos necesito'
      ]
    }
  ];

  const handleOptionSelect = (questionId, option) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmit = () => {
    // Verificar que todas las preguntas estén respondidas
    const allAnswered = questions.every(q => responses[q.id]);
    
    if (allAnswered) {
      setSubmitted(true);
      // Aquí podrías enviar las respuestas a una API
      console.log('Respuestas de la encuesta:', responses);
    } else {
      alert('Por favor, responde todas las preguntas antes de continuar.');
    }
  };

  const resetSurvey = () => {
    setResponses({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-green-800">¡Registro completado!</h3>
        </div>
        <p className="text-green-700 mb-4">
          Gracias por completar tu registro para el programa Mujeres con Bienestar. 
          Hemos recibido tu información y nos pondremos en contacto contigo pronto para confirmar tu elegibilidad y proceder con el registro oficial.
        </p>
        <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-green-800 mb-2">Próximos pasos:</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Validación de datos (1-3 días hábiles)</li>
            <li>• Notificación de aprobación por SMS/correo</li>
            <li>• Activación de tu tarjeta de beneficiario</li>
            <li>• Primer depósito bimestral</li>
          </ul>
        </div>
        <button
          onClick={resetSurvey}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          Realizar nuevo registro
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-red-600 mb-6">
        Registro - Mujeres con Bienestar
      </h2>
      <p className="text-gray-600 mb-8">
        Para proceder con tu registro al programa, por favor responde las siguientes preguntas:
      </p>

      <div className="space-y-8">
        {questions.map((q, index) => (
          <div key={q.id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {index + 1}. {q.question}
            </h3>
            <div className="grid gap-3">
              {q.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  onClick={() => handleOptionSelect(q.id, option)}
                  className={`text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    responses[q.id] === option
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      responses[q.id] === option
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {responses[q.id] === option && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    {option}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleSubmit}
          disabled={Object.keys(responses).length < questions.length}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
            Object.keys(responses).length < questions.length
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          Enviar Registro
        </button>
        <p className="text-sm text-gray-500 mt-2 text-center">
          {Object.keys(responses).length} de {questions.length} preguntas respondidas
        </p>
      </div>
    </div>
  );
}

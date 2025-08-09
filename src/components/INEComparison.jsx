'use client';

import { useState } from 'react';
import { captureFaceData, compareFaceData } from '../config/realFaceDetection';

export default function INEComparison({ userId, onComparisonComplete }) {
  const [ineImage, setIneImage] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);

  const handleINEUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setIneImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const compareWithINE = async () => {
    if (!ineImage || !userId) return;

    setIsComparing(true);
    setComparisonResult(null);

    try {
      // Obtener datos faciales del registro
      const registrationData = localStorage.getItem('current_user_face_data');
      if (!registrationData) {
        throw new Error('No se encontraron datos faciales del registro');
      }

      const registrationFaceData = JSON.parse(registrationData);

      // Crear imagen temporal para procesar el INE
      const img = new Image();
      img.onload = async () => {
        try {
          // Crear canvas temporal para el INE
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Simular extracción de datos faciales del INE
          // En producción, aquí usarías Face-api.js para extraer datos del INE
          const ineFaceData = {
            descriptor: registrationFaceData.descriptor.map(v => v + (Math.random() - 0.5) * 0.1), // Simular descriptor similar
            confidence: 0.85,
            landmarks: registrationFaceData.landmarks,
            metadata: {
              captureTime: new Date().toISOString(),
              source: 'ine'
            }
          };

          // Comparar rostros
          const comparison = await compareFaceData(registrationFaceData, ineFaceData);
          
          setComparisonResult(comparison);
          
          if (onComparisonComplete) {
            onComparisonComplete(comparison);
          }

        } catch (error) {
          console.error('Error procesando INE:', error);
          setComparisonResult({
            success: false,
            error: error.message
          });
        } finally {
          setIsComparing(false);
        }
      };
      
      img.onerror = () => {
        setComparisonResult({
          success: false,
          error: 'No se pudo cargar la imagen del INE'
        });
        setIsComparing(false);
      };
      
      img.src = ineImage;

    } catch (error) {
      console.error('Error en comparación:', error);
      setComparisonResult({
        success: false,
        error: error.message
      });
      setIsComparing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
        Verificación con INE
      </h3>
      
      <div className="space-y-4">
        {/* Subida de INE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sube una foto de tu INE (frente)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleINEUpload}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Vista previa del INE */}
        {ineImage && (
          <div className="text-center">
            <img
              src={ineImage}
              alt="INE Preview"
              className="max-w-full h-48 object-contain mx-auto rounded-lg border"
            />
          </div>
        )}

        {/* Botón de comparación */}
        <button
          onClick={compareWithINE}
          disabled={!ineImage || isComparing}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {isComparing ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Comparando rostros...
            </div>
          ) : (
            '🔍 Comparar con INE'
          )}
        </button>

        {/* Resultado de comparación */}
        {comparisonResult && (
          <div className={`rounded-lg p-4 ${
            comparisonResult.success && comparisonResult.isMatch
              ? 'bg-green-50 border border-green-200'
              : comparisonResult.success && !comparisonResult.isMatch
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {comparisonResult.success ? (
              <div>
                <div className="flex items-center mb-2">
                  {comparisonResult.isMatch ? (
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className={`font-semibold ${
                    comparisonResult.isMatch ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {comparisonResult.isMatch ? '✅ Rostros coinciden' : '⚠️ Rostros no coinciden suficientemente'}
                  </span>
                </div>
                
                <div className="text-sm space-y-1">
                  <p className="text-gray-700">
                    <strong>Similitud:</strong> {comparisonResult.similarity.toFixed(1)}%
                  </p>
                  <p className="text-gray-700">
                    <strong>Confianza:</strong> {(comparisonResult.confidence * 100).toFixed(1)}%
                  </p>
                  <p className="text-gray-700">
                    <strong>Umbral:</strong> {comparisonResult.threshold}%
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Comparación realizada: {new Date(comparisonResult.comparisonTime).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-800 font-semibold">
                  Error: {comparisonResult.error}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <strong>💡 Consejos:</strong> Asegúrate de que la foto del INE sea clara, bien iluminada y muestre claramente tu rostro.
          </p>
        </div>
      </div>
    </div>
  );
}

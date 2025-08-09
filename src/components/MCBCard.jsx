"use client";

import React from "react";

export default function MujeresConBienestarCard() {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h1 className="text-red-600 text-2xl sm:text-3xl font-bold leading-tight font-serif mb-4">
          Mujeres con Bienestar
        </h1>
        <span className="inline-block bg-red-50 text-red-600 px-5 py-2 rounded-full text-sm border border-red-200">
           Julio 2025
        </span>
      </div>

      <div className="bg-red-50 rounded-lg border-l-4 border-red-600 p-6 text-center mb-6">
        <div className="text-red-600 text-4xl sm:text-5xl font-extrabold leading-none mb-2">
          $3,000.00 <span className="text-2xl sm:text-3xl">MXN</span>
        </div>
        <div className="text-red-600 text-xl font-semibold mb-1">Pago Bimestral</div>
        <div className="text-red-600 text-base italic">Nuevos depósitos a nivel nacional</div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-red-600 text-xl sm:text-2xl font-bold mb-2">¡Regístrate ahora!</h3>
        <p className="text-red-600 text-base font-medium">Únete al programa de apoyo gubernamental</p>
      </div>

      <div className="text-center mb-6">
        <a href="/registro" className="block">
          <button
            type="button"
            className="w-full bg-red-600 text-white font-bold text-lg rounded-lg py-4 shadow-md hover:bg-red-700 transition-colors"
          >
            Regístrate aquí
          </button>
        </a>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-200">
          Gratis
        </span>
        <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200">
          Oficial
        </span>
        <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold border border-purple-200">
          Rápido
        </span>
      </div>
    </div>
  );
}

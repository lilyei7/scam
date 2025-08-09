"use client";

import React from "react";

export default function MujeresConBienestarCard() {
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 bg-white">
      {/* Card container principal - tarjeta completa */}
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full"
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.2)",
          border: "1px solid #e5e7eb",
          width: "100%"
        }}
      >
        {/* Contenido interno de la card */}
        <div className="p-6 sm:p-8">
          {/* Encabezado */}
          <div className="text-center mb-5 sm:mb-6">
            <h1 
              className="font-bold mb-3 font-serif tracking-wide"
              style={{
                color: "#dc2626",
                fontSize: "clamp(24px, 6vw, 32px)",
                fontWeight: "700",
                marginBottom: "16px",
                lineHeight: "1.2"
              }}
            >
              Mujeres con Bienestar
            </h1>
            <div 
              className="inline-block rounded-full font-semibold"
              style={{
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                padding: "clamp(6px, 1.5vw, 8px) clamp(16px, 4vw, 20px)",
                borderRadius: "999px",
                fontSize: "clamp(13px, 3vw, 16px)",
                fontWeight: "600",
                border: "1px solid #fecaca"
              }}
            >
               Julio 2025 
            </div>
          </div>

          {/* Información de pago */}
          <div 
            className="rounded-lg mb-5 sm:mb-6"
            style={{
              backgroundColor: "#fef2f2",
              borderLeft: "clamp(5px, 1.5vw, 8px) solid #dc2626",
              borderRadius: "12px",
              padding: "clamp(20px, 5vw, 28px)",
              marginBottom: "clamp(20px, 5vw, 28px)"
            }}
          >
            <div className="text-center">
              <div 
                className="font-bold mb-2"
                style={{
                  color: "#dc2626",
                  fontSize: "clamp(32px, 10vw, 48px)",
                  fontWeight: "900",
                  lineHeight: "1",
                  marginBottom: "10px"
                }}
              >
                $3,000.00 <span style={{ fontSize: "clamp(18px, 5vw, 28px)" }}>MXN</span>
              </div>
              <div 
                className="font-medium"
                style={{
                  color: "#dc2626",
                  fontSize: "clamp(18px, 5vw, 22px)",
                  fontWeight: "700",
                  marginBottom: "6px"
                }}
              >
                Pago Bimestral
              </div>
              <div 
                className="italic"
                style={{
                  color: "#dc2626",
                  fontSize: "clamp(13px, 3.5vw, 16px)",
                  fontStyle: "italic",
                  fontWeight: "400"
                }}
              >
                Nuevos depósitos a nivel nacional
              </div>
            </div>
          </div>

          {/* Sección de registro */}
          <div className="text-center mb-5 sm:mb-6">
            <h3 
              className="font-semibold mb-2"
              style={{
                color: "#dc2626",
                fontSize: "clamp(22px, 6vw, 26px)",
                fontWeight: "700",
                marginBottom: "10px",
                lineHeight: "1.2"
              }}
            >
              ¡Regístrate ahora!
            </h3>
            <p 
              style={{
                color: "#dc2626",
                fontSize: "clamp(15px, 4vw, 18px)",
                fontWeight: "500"
              }}
            >
              Únete al programa de apoyo gubernamental
            </p>
          </div>

          {/* Botón de registro */}
          <div className="text-center mb-5 sm:mb-6">
            <a href="/registro">
              <button
                type="button"
                className="button-hover text-white rounded-lg font-semibold transition-all duration-200 w-full"
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  padding: "clamp(14px, 4vw, 16px) clamp(24px, 6vw, 28px)",
                  borderRadius: "10px",
                  fontSize: "clamp(17px, 4.5vw, 20px)",
                  fontWeight: "600",
                  border: "none",
                  width: "100%",
                  cursor: "pointer",
                  boxShadow: "0 6px 16px rgba(220, 38, 38, 0.4)",
                  transition: "all 0.2s ease"
                }}
              >
                Regístrate aquí
              </button>
            </a>
          </div>

          {/* Etiquetas adicionales */}
          <div className="flex flex-wrap justify-center gap-2">
            <span 
              className="rounded-full font-medium"
              style={{
                backgroundColor: "#dcfce7",
                color: "#166534",
                padding: "clamp(5px, 1.5vw, 7px) clamp(14px, 4vw, 18px)",
                borderRadius: "999px",
                fontSize: "clamp(13px, 3vw, 15px)",
                fontWeight: "600",
                border: "1px solid #bbf7d0"
              }}
            >
              Gratis
            </span>
            <span 
              className="rounded-full font-medium"
              style={{
                backgroundColor: "#dbeafe",
                color: "#1d4ed8",
                padding: "clamp(5px, 1.5vw, 7px) clamp(14px, 4vw, 18px)",
                borderRadius: "999px",
                fontSize: "clamp(13px, 3vw, 15px)",
                fontWeight: "600",
                border: "1px solid #bfdbfe"
              }}
            >
              Oficial
            </span>
            <span 
              className="rounded-full font-medium"
              style={{
                backgroundColor: "#f3e8ff",
                color: "#7c3aed",
                padding: "clamp(5px, 1.5vw, 7px) clamp(14px, 4vw, 18px)",
                borderRadius: "999px",
                fontSize: "clamp(13px, 3vw, 15px)",
                fontWeight: "600",
                border: "1px solid #d8b4fe"
              }}
            >
              Rápido
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

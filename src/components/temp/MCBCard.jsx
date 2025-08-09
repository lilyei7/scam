"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function MCBCard() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll("[data-reveal]"));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const delay = e.target.getAttribute("data-delay") || 0;
            setTimeout(() => {
              e.target.classList.add("revealed");
            }, Number(delay));
          }
        });
      },
      { threshold: 0.1 }
    );

    items.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="wrapper w-full max-w-[560px]" ref={rootRef}>
      <div className="bg-white">
        {/* Header */}
        <div className="pb-3 text-center">
          <h1
            className="reveal font-semibold mb-3"
            data-reveal
            data-delay="40"
            style={{
              color: "#9f2241",
              letterSpacing: "-0.015em",
              fontSize: "clamp(26px, 7vw, 36px)",
              lineHeight: 1.15,
            }}
          >
            Mujeres con Bienestar
          </h1>
          <span
            className="reveal inline-block px-4 py-1"
            data-reveal
            data-delay="140"
            style={{ 
              backgroundColor: "#fff1f2", 
              color: "#9f2241", 
              border: "1px solid #fecaca",
              fontSize: "clamp(13px, 3.2vw, 16px)",
              borderRadius: "99px"
            }}
          >
            | Marzo |
          </span>
        </div>

        {/* Monto */}
        <div className="py-0">
          <div className="bg-[#fff1f2] text-center px-4 py-6">
            <div className="reveal" data-reveal data-delay="160">
              <div
                className="font-extrabold tracking-tight"
                style={{ 
                  fontSize: "clamp(32px, 9vw, 46px)",
                  color: "#9f2241"
                }}
              >
                $3,000.00 <span style={{ fontSize: "clamp(16px, 4.2vw, 22px)" }}>MXN</span>
              </div>
            </div>
            <div
              className="reveal mt-2 font-semibold"
              data-reveal
              data-delay="220"
              style={{ color: "#9f2241", fontSize: "clamp(17px, 5vw, 20px)" }}
            >
              Pago Bimestral
            </div>
            <div
              className="reveal mt-1"
              data-reveal
              data-delay="280"
              style={{ color: "#9f2241", fontSize: "clamp(13px, 3.8vw, 15px)" }}
            >
              Nuevos depósitos a nivel nacional
            </div>
          </div>
        </div>

        {/* Llamado a la acción */}
        <div className="pt-3 pb-0 text-center">
          <div
            className="reveal font-semibold mb-2"
            data-reveal
            data-delay="200"
            style={{ color: "#9f2241", fontSize: "clamp(22px, 6vw, 28px)" }}
          >
            ¡Regístrate ahora!
          </div>
          <div
            className="reveal mb-4"
            data-reveal
            data-delay="260"
            style={{ color: "#9f2241", fontSize: "clamp(15px, 4.2vw, 17px)" }}
          >
            Únete al programa de apoyo gubernamental
          </div>
          <Link href="/registro">
            <button
              className="reveal w-full inline-flex items-center justify-center py-3 font-bold text-white"
              data-reveal
              data-delay="320"
              style={{ 
                backgroundColor: "#9f2241", 
                fontSize: "clamp(16px, 4.5vw, 18px)",
                width: "100%"
              }}
            >
              Regístrate aquí
            </button>
          </Link>
        </div>

        {/* Chips */}
        <div className="flex items-center justify-center">
          <div className="bg-[#00cc66] text-white px-3 py-0.5 text-sm">Gratis</div>
          <div className="bg-[#0066cc] text-white px-3 py-0.5 text-sm">Oficial</div>
          <div className="bg-[#cc33ff] text-white px-3 py-0.5 text-sm">Rápido</div>
        </div>
      </div>
    </div>
  );
}

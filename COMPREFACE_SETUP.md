# Integración con CompreFace - Guía de Instalación

## 🎯 ¿Qué es CompreFace?

CompreFace es una API de reconocimiento facial gratuita y open-source que permite:
- Detección de rostros en imágenes
- Verificación de identidad facial
- Reconocimiento y comparación de rostros
- Análisis de edad, género y emociones

## 📦 Instalación de CompreFace

### Opción 1: Docker (Recomendada)

1. **Instalar Docker Desktop**
   ```bash
   # Descargar desde: https://www.docker.com/products/docker-desktop/
   ```

2. **Ejecutar CompreFace**
   ```bash
   # Crear directorio para CompreFace
   mkdir compreface
   cd compreface

   # Descargar docker-compose.yml
   curl -L https://raw.githubusercontent.com/exadel-inc/CompreFace/master/docker-compose.yml -o docker-compose.yml

   # Iniciar servicios
   docker-compose up -d
   ```

3. **Verificar instalación**
   ```bash
   # CompreFace UI estará disponible en:
   http://localhost:8000
   ```

### Opción 2: Instalación Local

1. **Requisitos**
   - Java 11+
   - PostgreSQL 10+
   - Python 3.8+

2. **Pasos de instalación**
   ```bash
   # Clonar repositorio
   git clone https://github.com/exadel-inc/CompreFace.git
   cd CompreFace

   # Seguir instrucciones en:
   # https://github.com/exadel-inc/CompreFace/blob/master/docs/How-to-Use-CompreFace.md
   ```

## 🔧 Configuración del Proyecto

### 1. Crear archivo de configuración

1. **Copiar archivo de ejemplo**
   ```bash
   cp .env.example .env.local
   ```

2. **Configurar variables de entorno en `.env.local`**
   ```env
   NEXT_PUBLIC_COMPREFACE_URL=http://localhost:8000
   NEXT_PUBLIC_COMPREFACE_API_KEY=tu-api-key-real
   ```

### 2. Obtener API Key

1. **Abrir CompreFace UI**
   ```
   http://localhost:8000
   ```

2. **Crear cuenta de administrador**
   - Seguir el asistente de primera configuración

3. **Crear servicio de detección**
   - Ir a "Services" → "Create Service"
   - Tipo: "Detection"
   - Nombre: "Face Detection"
   - Copiar la API Key generada

4. **Configurar API Key**
   ```env
   # En .env.local
   NEXT_PUBLIC_COMPREFACE_API_KEY=12345678-1234-5678-9012-123456789012
   ```

## 🚀 Uso en el Formulario

### Flujo de Verificación

1. **Usuario completa cuestionario** → Se activa cámara
2. **Captura facial** → Se envía a CompreFace
3. **Detección de rostro** → Se valida calidad
4. **Resultado** → Se guarda en registro

### Características

- ✅ **Detección automática** de rostros
- ✅ **Validación de calidad** (confianza > 80%)
- ✅ **Interfaz intuitiva** con guías visuales
- ✅ **Opción de omitir** verificación
- ✅ **Guardado de resultados** en localStorage

## 🔒 Consideraciones de Seguridad

### Datos Personales
- Las imágenes se procesan localmente
- No se almacenan fotos permanentemente
- Solo se guarda el resultado de verificación

### Configuración Recomendada
```javascript
// En compreface.js
DETECTION_CONFIG: {
  MIN_CONFIDENCE: 0.8,    // 80% confianza mínima
  IMAGE_QUALITY: 0.8,     // Calidad media-alta
  CAMERA_CONFIG: {
    facingMode: 'user'    // Cámara frontal
  }
}
```

## 🛠️ Personalización

### Ajustar Confianza Mínima
```javascript
// Más estricto (95%)
MIN_CONFIDENCE: 0.95

// Más permisivo (70%)
MIN_CONFIDENCE: 0.70
```

### Cambiar Calidad de Imagen
```javascript
// Alta calidad (más lento)
IMAGE_QUALITY: 0.95

// Baja calidad (más rápido)
IMAGE_QUALITY: 0.6
```

## 🐛 Solución de Problemas

### CompreFace no inicia
```bash
# Verificar Docker
docker --version
docker-compose --version

# Revisar logs
docker-compose logs -f
```

### Error de API Key
```bash
# Verificar configuración
echo $NEXT_PUBLIC_COMPREFACE_API_KEY

# Regenerar API Key en UI
http://localhost:8000 → Services → Edit Service
```

### Problemas de cámara
- Verificar permisos de navegador
- Usar HTTPS en producción
- Comprobar que no hay otras apps usando la cámara

## 📚 Recursos Adicionales

- [Documentación oficial](https://github.com/exadel-inc/CompreFace)
- [API Reference](https://exadel-inc.github.io/CompreFace/)
- [Docker Hub](https://hub.docker.com/r/exadel/compreface)

## 🔄 Siguiente Paso

Una vez configurado CompreFace, reinicia tu servidor de desarrollo:

```bash
npm run dev
```

¡Tu formulario ahora tendrá verificación facial integrada! 🎉

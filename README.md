# 📜 Proyecto Next.js - Sistema de Ayuda Comunitaria

Una aplicación web construida con **Next.js 14** que incluye un sistema de encuestas y comentarios tipo Facebook para un programa de asistencia comunitaria.

## 🎯 Características

- **Página Principal**: Información sobre el programa de ayuda comunitaria
- **Sistema de Encuestas**: Evaluación de necesidades con botones interactivos
- **Sistema de Comentarios**: Estilo Facebook con formulario dinámico
- **API REST**: Endpoints para gestión de comentarios
- **Diseño Responsivo**: Implementado con Tailwind CSS
- **Navegación**: Router de Next.js 14 con App Directory

## 🚀 Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: Almacenamiento en memoria (configurable para MongoDB/Supabase)
- **Estilos**: Tailwind CSS con componentes personalizados
- **Validación**: Validación tanto en frontend como backend

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── page.js                 # Página principal
│   ├── layout.js               # Layout principal
│   ├── globals.css             # Estilos globales
│   ├── registro/
│   │   └── page.js             # Página de registro + encuesta + comentarios
│   └── api/
│       └── comments/
│           └── route.js        # API CRUD comentarios
├── components/
│   ├── Navbar.jsx              # Barra de navegación
│   ├── SurveyButtons.jsx       # Botones de encuesta
│   ├── CommentsSection.jsx     # Lista de comentarios
│   └── AddCommentForm.jsx      # Formulario para agregar comentario
└── lib/
    └── db.js                   # Configuración de base de datos
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18.0 o superior
- npm, yarn, pnpm o bun

### 1. Clonar o descargar el proyecto
```bash
# Si tienes git configurado
git clone <repository-url>
cd scam

# O simplemente usar la carpeta actual
```

### 2. Instalar dependencias
```bash
npm install
# o
yarn install
# o
pnpm install
```

### 3. Ejecutar en modo desarrollo
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 4. Construir para producción
```bash
npm run build
npm run start
```

## 🌐 Rutas de la Aplicación

- `/` - Página principal con información del programa
- `/registro` - Página de registro con encuesta y comentarios
- `/api/comments` - API endpoint para comentarios (GET, POST, DELETE)

## 📝 Flujo de Usuario

1. **Página Principal (`/`)**:
   - Información sobre el programa de ayuda
   - Servicios ofrecidos (alimentaria, educativa, médica)
   - Botón "Solicitar Ayuda" que lleva a `/registro`

2. **Página de Registro (`/registro`)**:
   - Encuesta de evaluación de necesidades
   - 4 preguntas con opciones múltiples
   - Sistema de comentarios debajo de la encuesta
   - Formulario para agregar nuevos comentarios

## 🔧 API Endpoints

### GET `/api/comments`
Obtiene todos los comentarios ordenados por fecha (más recientes primero).

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "name": "Nombre del usuario",
    "email": "email@ejemplo.com",
    "comment": "Texto del comentario",
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
]
```

### POST `/api/comments`
Crea un nuevo comentario.

**Body:**
```json
{
  "name": "Nombre (requerido)",
  "email": "email@ejemplo.com (opcional)",
  "comment": "Texto del comentario (requerido)"
}
```

**Validaciones:**
- `name`: máximo 100 caracteres
- `email`: formato válido si se proporciona
- `comment`: máximo 1000 caracteres

### DELETE `/api/comments?id=uuid`
Elimina un comentario específico (para administración).

## 🎨 Componentes Principales

### SurveyButtons
- Encuesta interactiva con 4 preguntas
- Validación que requiere responder todas las preguntas
- Estado de completado con opción de reiniciar
- Diseño tipo redes sociales con botones de selección

### CommentsSection
- Lista de comentarios con timestamps relativos
- Loading states y manejo de errores
- Integración con AddCommentForm
- Diseño estilo Facebook con avatares e interacciones

### AddCommentForm
- Formulario expandible/colapsable
- Validación en tiempo real
- Estados de carga durante envío
- Campos: nombre (requerido), email (opcional), comentario (requerido)

### Navbar
- Navegación responsiva
- Indicador de página activa
- Enlaces a todas las secciones principales

## 🔮 Futuras Mejoras

### Base de Datos Real
Actualmente usa almacenamiento en memoria. Para producción:

**MongoDB:**
```bash
npm install mongoose
```

**Supabase:**
```bash
npm install @supabase/supabase-js
```

Configuración disponible en `src/lib/db.js`.

### Características Adicionales
- [ ] Sistema de likes en comentarios
- [ ] Respuestas a comentarios (threading)
- [ ] Autenticación de usuarios
- [ ] Panel de administración
- [ ] Notificaciones en tiempo real
- [ ] Moderación de comentarios
- [ ] Analytics de encuestas
- [ ] Exportación de datos

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Subir carpeta .next/
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👥 Soporte

Si tienes preguntas o necesitas ayuda:
- Crear un Issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación de Next.js: [https://nextjs.org/docs](https://nextjs.org/docs)

---

Desarrollado con ❤️ usando Next.js y Tailwind CSS

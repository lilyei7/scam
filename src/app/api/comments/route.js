import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// En una aplicación real, esto sería una base de datos
// Para este demo, usamos una variable en memoria
let comments = [
  {
    id: '1',
    name: 'María Elena Rodríguez',
    email: 'maria.elena@email.com',
    comment: 'Gracias al programa Mujeres con Bienestar he podido salir adelante con mis tres hijos. El apoyo bimestral me ayuda mucho con los gastos del hogar. ¡Muy agradecida!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 horas atrás
  },
  {
    id: '2',
    name: 'Carmen Jiménez',
    comment: 'Soy madre soltera y este programa ha sido una bendición. Pude poner mi pequeño negocio de comida gracias al apoyo. Recomiendo a todas las mujeres que se registren.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 día atrás
  },
  {
    id: '3',
    name: 'Esperanza Morales',
    email: 'esperanza.m@email.com',
    comment: 'Tengo 65 años y cuido a mis nietos. El programa me ha dado la tranquilidad económica que necesitaba. Los depósitos siempre llegan puntualmente.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 días atrás
  },
  {
    id: '4',
    name: 'Rosa María Vázquez',
    comment: 'Al principio pensé que era falso, pero después de registrarme y recibir mi primer pago, puedo confirmar que el programa es real. Gracias por esta oportunidad.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 días atrás
  }
];

export async function GET() {
  try {
    // Ordenar comentarios por fecha (más recientes primero)
    const sortedComments = [...comments].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    return NextResponse.json(sortedComments);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validación básica
    if (!body.name || !body.comment) {
      return NextResponse.json(
        { error: 'El nombre y el comentario son obligatorios' },
        { status: 400 }
      );
    }

    // Validación de longitud
    if (body.name.length > 100) {
      return NextResponse.json(
        { error: 'El nombre no puede tener más de 100 caracteres' },
        { status: 400 }
      );
    }

    if (body.comment.length > 1000) {
      return NextResponse.json(
        { error: 'El comentario no puede tener más de 1000 caracteres' },
        { status: 400 }
      );
    }

    // Validación de email si se proporciona
    if (body.email && body.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: 'El formato del email no es válido' },
          { status: 400 }
        );
      }
    }

    // Sanitizar datos
    const sanitizedComment = {
      id: uuidv4(),
      name: body.name.trim(),
      email: body.email ? body.email.trim() : '',
      comment: body.comment.trim(),
      timestamp: new Date().toISOString()
    };

    // Agregar comentario al inicio del array
    comments.unshift(sanitizedComment);

    // Limitar a los últimos 100 comentarios para evitar problemas de memoria
    if (comments.length > 100) {
      comments = comments.slice(0, 100);
    }

    return NextResponse.json(sanitizedComment, { status: 201 });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Opcional: Endpoint para eliminar comentarios (para administración)
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const commentId = url.searchParams.get('id');

    if (!commentId) {
      return NextResponse.json(
        { error: 'ID del comentario requerido' },
        { status: 400 }
      );
    }

    const initialLength = comments.length;
    comments = comments.filter(comment => comment.id !== commentId);

    if (comments.length === initialLength) {
      return NextResponse.json(
        { error: 'Comentario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Comentario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

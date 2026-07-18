const { supabaseService } = require('../config/supabase');

// Obtiene una conversación existente entre dos usuarios o la crea si no existe
const obtenerOCrearConversacion = async (usuarioIdA, usuarioIdB) => {
    // Buscamos si ya existe una conversación entre los dos usuarios en cualquier orden
    const { data: existente, error: errorBusqueda } = await supabaseService
        .from('conversaciones')
        .select('*')
        .or(
            `and(usuario_a.eq.${usuarioIdA},usuario_b.eq.${usuarioIdB}),and(usuario_a.eq.${usuarioIdB},usuario_b.eq.${usuarioIdA})`
        )
        .single();

    if (errorBusqueda && errorBusqueda.code !== 'PGRST116') {
        throw errorBusqueda;
    }

    // Si ya existe la conversación, la devolvemos directamente
    if (existente) return existente;

    // Si no existe, la creamos
    const { data: creada, error: errorCreacion } = await supabaseService
        .from('conversaciones')
        .insert([{ usuario_a: usuarioIdA, usuario_b: usuarioIdB }])
        .select()
        .single();

    if (errorCreacion) throw errorCreacion;

    return creada;
};

// Guarda un mensaje nuevo en Supabase dentro de una conversación
const guardarMensaje = async ({ conversacion_id, emisor_id, contenido }) => {
    const { data, error } = await supabaseService
        .from('mensajes')
        .insert([{ conversacion_id, emisor_id, contenido }])
        .select()
        .single();

    if (error) throw error;

    return data;
};

// Trae el historial de mensajes de una conversación ordenados por fecha
const obtenerMensajes = async (conversacion_id, limite = 50) => {
    const { data, error } = await supabaseService
        .from('mensajes')
        .select('*')
        .eq('conversacion_id', conversacion_id)
        .order('created_at', { ascending: true })
        .limit(limite);

    if (error) throw error;

    return data || [];
};

// Trae todas las conversaciones de un usuario con los datos del otro participante
const obtenerConversacionesPorUsuario = async (usuarioId) => {
    const { data, error } = await supabaseService
        .from('conversaciones')
        .select(`
            *,
            perfil_a:profiles!usuario_a(id, nombre_completo, avatar_url),
            perfil_b:profiles!usuario_b(id, nombre_completo, avatar_url)
        `)
        .or(`usuario_a.eq.${usuarioId},usuario_b.eq.${usuarioId}`)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error("Error en obtenerConversacionesPorUsuario:", error);
        throw error;
    }
    return data || [];
};

// Marca todos los mensajes no leídos de una conversación como leídos para el usuario receptor
const marcarComoLeidos = async (conversacion_id, usuarioId) => {
    const { error } = await supabaseService
        .from('mensajes')
        .update({ leido: true })
        .eq('conversacion_id', conversacion_id)
        .neq('emisor_id', usuarioId)
        .eq('leido', false);

    if (error) throw error;
};
// Función para buscar usuarios por nombre o username
const buscarUsuarios = async (query, miId) => {
    const { data, error } = await supabaseService
        .from('profiles')
        .select('id, nombre_completo, avatar_url') // <-- Agregado avatar_url aquí
        .neq('id', miId)
        .ilike('nombre_completo', `%${query}%`)
        .limit(10);

    if (error) throw error;
    
    console.log(`Buscando "${query}"... Supabase encontró:`, data); 

    return data || [];
};

module.exports = {
    obtenerOCrearConversacion,
    guardarMensaje,
    obtenerMensajes,
    obtenerConversacionesPorUsuario,
    marcarComoLeidos,
    buscarUsuarios
};
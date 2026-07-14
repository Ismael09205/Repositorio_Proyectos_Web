const { supabaseService } = require('../config/supabase');

const getEcuadorTimestamp = () => {
  return new Date()
    .toLocaleString('sv-SE', {
      timeZone: 'America/Guayaquil',
      hour12: false,
    })
    .replace(' ', 'T');
};

/**
 * Service for managing authentication logs
 */
class AuthLogsService {
  /**
   * Create a log entry for user authentication events
   */
  async createLog(userId, action, email, ipAddress, userAgent, rol) {
  try {
    // 1. Validaciones rígidas de parámetros obligatorios
    if (!userId) {
      console.error('>>>> [LOGS ERROR] Intento de inserción rechazado: "userId" es requerido.');
      return null;
    }

    if (!action || !String(action).trim()) {
      console.error('>>>> [LOGS ERROR] Intento de inserción rechazado: "action" es requerida.');
      return null;
    }

    if (!email || !String(email).trim()) {
      console.error('>>>> [LOGS ERROR] Intento de inserción rechazado: "email" es requerido.');
      return null;
    }

    // 2. Validación estricta del ENUM del rol
    const rolesValidos = ['estudiante', 'administrador'];
    const rolNormalizado = rol ? String(rol).trim().toLowerCase() : null;

    if (!rolNormalizado || !rolesValidos.includes(rolNormalizado)) {
      console.error(`>>>> [LOGS ERROR] Intento de inserción rechazado: El rol "${rol}" no es válido en el sistema.`);
      return null;
    }

    // 3. Construcción limpia y normalizada del Payload[cite: 1]
    const payload = {
      user_id: userId,
      action: String(action).trim().toUpperCase(), // Ej: LOGIN, REGISTER, LOGOUT
      email: String(email).trim().toLowerCase(),
      ip_address: ipAddress ? String(ipAddress).trim() : '0.0.0.0', // Evitamos el null si es posible
      user_agent: userAgent ? String(userAgent).trim() : 'Desconocido',
      rol: rolNormalizado, // Persistencia nativa del rol[cite: 1]
      created_at: typeof getEcuadorTimestamp === 'function' ? getEcuadorTimestamp() : new Date().toISOString(),
    };

    // 4. Inserción en la Base de Datos[cite: 1]
    const { data, error } = await supabaseService
      .from('auth_logs')
      .insert([payload])
      .select('*')
      .maybeSingle(); // Usamos maybeSingle de forma segura por si acaso

    if (error) {
      // Mantenemos la política de no tumbar el login del usuario, pero con un log súper visible
      console.error('>>>> [SUPABASE ERROR] Error al guardar auth log persistentemente:', {
        code: error.code,
        message: error.message,
        details: error.details,
        payload
      });
      return null; 
    }
    
    if (!data) {
      console.warn('>>>> [LOGS WARN] El registro fue exitoso pero no retornó datos de confirmación.', payload);
      return null;
    }

    return data;
  } catch (error) {
    console.error('>>>> [CRITICAL ERROR] Fallo general en la capa del servicio de logs:', error);
    return null;
  }
}

  /**
   * Get all authentication logs (admin only)
   */
  async getAllLogs(limit = 100, offset = 0) {
    try {
      const { data, error, count } = await supabaseService
        .from('auth_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { logs: data, total: count };
    } catch (error) {
      console.error('Error fetching auth logs:', error);
      throw error;
    }
  }

  /**
   * Get logs filtered by action type
   */
  async getLogsByAction(action, limit = 100) {
    try {
      const { data, error } = await supabaseService
        .from('auth_logs')
        .select('*')
        .eq('action', action)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching logs by action:', error);
      throw error;
    }
  }

  /**
   * Get logs for a specific user
   */
  async getLogsByUser(userId, limit = 50) {
    try {
      const { data, error } = await supabaseService
        .from('auth_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching logs by user:', error);
      throw error;
    }
  }

  /**
   * Get logs within a date range
   */
  async getLogsByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabaseService
        .from('auth_logs')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching logs by date range:', error);
      throw error;
    }
  }

  /**
   * Get statistics about authentication logs
   */
  async getLogStatistics() {
    try {
      const { count: totalLogs } = await supabaseService
        .from('auth_logs')
        .select('*', { count: 'exact', head: true });

      const { data: actionCounts } = await supabaseService
        .from('auth_logs')
        .select('action')
        .order('action');

      const actionStats = actionCounts?.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {});

      const { data: uniqueUsers } = await supabaseService
        .from('auth_logs')
        .select('user_id')
        .order('user_id');

      const uniqueUserCount = new Set(uniqueUsers?.map(log => log.user_id)).size;

      return {
        totalLogs,
        actionStats,
        uniqueUsers: uniqueUserCount
      };
    } catch (error) {
      console.error('Error fetching log statistics:', error);
      throw error;
    }
  }
}

module.exports = new AuthLogsService();


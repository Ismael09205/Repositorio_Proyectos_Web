const { supabaseService } = require('../config/supabase');

/**
 * Service for managing authentication logs
 */
class AuthLogsService {
  /**
   * Create a log entry for user authentication events
   */
  async createLog(userId, action, email, ipAddress = null, userAgent = null) {
    try {
      const { data, error } = await supabaseService
        .from('auth_logs')
        .insert([
          {
            user_id: userId,
            action,
            email,
            ip_address: ipAddress,
            user_agent: userAgent,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating auth log:', error);
      throw error;
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



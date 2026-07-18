const authLogsService = require('../services/authLogs.service');

/**
 * Controller for authentication logs
 */
class AuthLogsController {
  /**
   * Get all authentication logs (admin only)
   */
  async getAllLogs(req, res) {
    try {
      const { limit = 100, offset = 0 } = req.query;
      const result = await authLogsService.getAllLogs(
        parseInt(limit),
        parseInt(offset)
      );

      res.status(200).json({
        success: true,
        data: result.logs,
        total: result.total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('Error in getAllLogs:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los logs de autenticación',
        error: error.message
      });
    }
  }

  /**
   * Get logs filtered by action type
   */
  async getLogsByAction(req, res) {
    try {
      const { action } = req.params;
      const { limit = 100 } = req.query;
      
      const logs = await authLogsService.getLogsByAction(action, parseInt(limit));

      res.status(200).json({
        success: true,
        data: logs,
        action
      });
    } catch (error) {
      console.error('Error in getLogsByAction:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los logs por acción',
        error: error.message
      });
    }
  }

  /**
   * Get logs for a specific user
   */
  async getLogsByUser(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;
      
      const logs = await authLogsService.getLogsByUser(userId, parseInt(limit));

      res.status(200).json({
        success: true,
        data: logs,
        userId
      });
    } catch (error) {
      console.error('Error in getLogsByUser:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los logs del usuario',
        error: error.message
      });
    }
  }

  /**
   * Get logs within a date range
   */
  async getLogsByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren startDate y endDate'
        });
      }

      const logs = await authLogsService.getLogsByDateRange(startDate, endDate);

      res.status(200).json({
        success: true,
        data: logs,
        dateRange: { startDate, endDate }
      });
    } catch (error) {
      console.error('Error in getLogsByDateRange:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los logs por rango de fechas',
        error: error.message
      });
    }
  }

  /**
   * Get log statistics
   */
  async getLogStatistics(req, res) {
    try {
      const stats = await authLogsService.getLogStatistics();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getLogStatistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las estadísticas de logs',
        error: error.message
      });
    }
  }
}

module.exports = new AuthLogsController();

// Made with Bob
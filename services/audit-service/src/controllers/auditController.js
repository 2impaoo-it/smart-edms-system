const AuditLog = require('../models/AuditLog');

const createLog = async (req, res) => {
  try {
    const { actorId, actorName, action, entityType, entityId, details } = req.body;
    
    const newLog = new AuditLog({
      actorId,
      actorName,
      action,
      entityType,
      entityId,
      details
    });

    await newLog.save();

    // Emit socket event for realtime dashboard notification
    if (req.io) {
      req.io.emit('new_audit_log', newLog);
    }

    res.status(201).json({ message: 'Log created successfully', log: newLog });
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments();

    res.status(200).json({
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createLog,
  getLogs
};

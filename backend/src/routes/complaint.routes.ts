import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { db } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Complaint Routes - Manage user complaints and grievances
 * 
 * Endpoints:
 * 1. POST /api/v1/complaints - Create new complaint
 * 2. GET /api/v1/complaints - List complaints (filtered by role)
 * 3. GET /api/v1/complaints/:id - Get complaint details
 * 4. PUT /api/v1/complaints/:id/status - Update complaint status (Admin only)
 * 5. POST /api/v1/complaints/:id/response - Add response to complaint
 */

interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: string;
    fullName: string;
  };
}

// Ensure complaints table exists
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      category TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'open',
      assigned_to TEXT,
      response TEXT,
      response_by TEXT,
      response_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
} catch (e) {
  // Table may already exist
}

/**
 * POST /api/v1/complaints
 * Create a new complaint
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { category, subject, title, description, message, priority, audio_duration, voice_duration } = req.body;
    const user = req.user!;

    const complaintSubject = subject || title || category || 'Stakeholder Grievance';
    const complaintDescription = description || message;

    if (!complaintDescription) {
      return res.status(400).json({
        success: false,
        message: 'Complaint message / description is required'
      });
    }

    const complaintId = `CMP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    db.prepare(`
      INSERT INTO complaints (complaint_id, user_id, user_name, user_role, category, subject, description, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      complaintId,
      user.userId || user.username || 'user',
      user.fullName || user.username || 'Stakeholder',
      user.role || 'Stakeholder',
      category || 'General Inquiry',
      complaintSubject,
      complaintDescription,
      priority || 'medium'
    );

    logger.info(`Complaint created: ${complaintId} by ${user.username || user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully to Admin',
      data: {
        complaintId,
        id: complaintId,
        status: 'open',
        category: category || 'General',
        subject: complaintSubject,
        description: complaintDescription,
        user_name: user.fullName || user.username,
        user_role: user.role,
        created_at: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create complaint'
    });
  }
});

/**
 * GET /api/v1/complaints
 * List complaints
 * - Admin sees all complaints
 * - Other users see only their own complaints
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { status, category, priority, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM complaints WHERE 1=1';
    const params: any[] = [];

    // Non-admin users can only see their own complaints
    if (user.role !== 'Admin') {
      query += ' AND user_id = ?';
      params.push(user.userId);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countResult = db.prepare(countQuery).get(...params) as { count: number };

    // Add pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const complaints = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: complaints,
      pagination: {
        total: countResult.count,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error: any) {
    logger.error('List complaints error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list complaints'
    });
  }
});

/**
 * GET /api/v1/complaints/:id
 * Get complaint details
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const complaint = db.prepare('SELECT * FROM complaints WHERE complaint_id = ?').get(id) as any;

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Non-admin users can only view their own complaints
    if (user.role !== 'Admin' && complaint.user_id !== user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: complaint
    });
  } catch (error: any) {
    logger.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get complaint'
    });
  }
});

/**
 * PUT /api/v1/complaints/:id/status
 * Update complaint status (Admin only)
 */
router.put('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, response, reply } = req.body;
    const replyText = response || reply;
    const user = req.user!;

    if (user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can update complaint status'
      });
    }

    const normalizedStatus = String(status || '').toLowerCase();
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed', 'rejected'];
    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    let result;
    if (replyText) {
      result = db.prepare(`
        UPDATE complaints 
        SET status = ?, assigned_to = ?, response = ?, response_by = ?, response_at = datetime('now'), updated_at = datetime('now')
        WHERE complaint_id = ? OR id = ?
      `).run(normalizedStatus, assignedTo || null, replyText, user.fullName || user.username || 'System Administrator', id, id);
    } else {
      result = db.prepare(`
        UPDATE complaints 
        SET status = ?, assigned_to = ?, updated_at = datetime('now')
        WHERE complaint_id = ? OR id = ?
      `).run(normalizedStatus, assignedTo || null, id, id);
    }

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    logger.info(`Complaint ${id} status updated to ${status} by ${user.username}`);

    res.json({
      success: true,
      message: 'Complaint status updated'
    });
  } catch (error: any) {
    logger.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update complaint status'
    });
  }
});

/**
 * POST /api/v1/complaints/:id/response
 * Add response to complaint (Admin only)
 */
router.post('/:id/response', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const user = req.user!;

    if (user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can respond to complaints'
      });
    }

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response is required'
      });
    }

    const result = db.prepare(`
      UPDATE complaints 
      SET response = ?, response_by = ?, response_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE complaint_id = ?
    `).run(response, user.fullName, id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    logger.info(`Response added to complaint ${id} by ${user.username}`);

    res.json({
      success: true,
      message: 'Response added successfully'
    });
  } catch (error: any) {
    logger.error('Add complaint response error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add response'
    });
  }
});

export default router;

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { successResponse } from '../utils/apiResponse.js';
import { store } from '../data/store.js';

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/admin/users
 * Accessible ONLY by: ADMIN (Others get 403 Forbidden)
 */
router.get('/users', authorize('ADMIN'), (req, res) => {
  const safeUsers = store.users.map(u => {
    const copy = { ...u };
    delete copy.password;
    return copy;
  });

  successResponse(res, 200, 'All registered user accounts retrieved', {
    totalUsers: safeUsers.length,
    users: safeUsers
  });
});

/**
 * GET /api/admin/telemetry
 * Accessible ONLY by: ADMIN
 */
router.get('/telemetry', authorize('ADMIN'), (req, res) => {
  successResponse(res, 200, 'Cluster security telemetry data', {
    clusterStatus: 'OPTIMAL',
    encryptionProtocol: 'TLS 1.3 / AES-256 GCM',
    activeSessions: 1420,
    hipaaAuditStatus: 'VERIFIED'
  });
});

export default router;

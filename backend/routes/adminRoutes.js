import express from 'express';
import adminCtrl from '../controllers/adminController.js';

const router = express.Router();

// Middleware to require admin secret
router.use(adminCtrl.requireAdminSecret);

router.post('/add-user', adminCtrl.addUser);
router.post('/edit-user', adminCtrl.editUser);
router.post('/delete-user', adminCtrl.deleteUser);
router.post('/verify-batch', adminCtrl.verifyBatch);
router.get('/generate-report', adminCtrl.generateReport);

export default router;

// routes/DashboardGuruRoutes.js

import express from 'express';
// Impor controller yang baru dibuat
import { getDashboardGuru } from '../controllers/dashboardGuruController.js';

const router = express.Router();

// Rute ini sekarang hanya menunjuk ke fungsi di dalam controller
router.get('/guru/:id', getDashboardGuru);

export default router;
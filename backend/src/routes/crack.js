const { Router } = require('express');
const crackController = require('../controllers/crackController');

const router = Router();

router.get('/wordlists', crackController.listWordlists);
router.post('/jobs', crackController.createJob);
router.get('/jobs', crackController.listJobs);
router.get('/jobs/:id', crackController.getJob);
router.post('/jobs/:id/cancel', crackController.cancelJob);
router.delete('/jobs/:id', crackController.deleteJob);
router.delete('/jobs', crackController.deleteAllJobs);
router.get('/stats', crackController.getStats);

module.exports = router;



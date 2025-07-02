const express = require('express')

const {  
  getAllDoctors,
  getDoctorById,
  changeAvailability,
  createDoctor,
  updateDoctor,
  deleteDoctor} = require('../controllers/doctorController')
const {protect, restrictTo} = require('../middleware/auth')
const upload = require('../middleware/multer')

const router = express.Router()

router.get('/', getAllDoctors)
router.get('/:id', getDoctorById)
router.post('/change-availability', protect, restrictTo('admin'), changeAvailability)
router.post('/', upload.single('image'), protect, restrictTo('admin'), createDoctor)
router.patch('/:id', protect, restrictTo('admin'), updateDoctor)
router.delete('/:id', protect, restrictTo('admin'), deleteDoctor)

module.exports = router

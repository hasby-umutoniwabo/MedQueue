const express = require('express')

const {     
    getAllClinics,
    getClinicById,
    createClinic,
    updateClinic,
    deleteClinic,
    addDoctorToClinic,
    removeDoctorFromClinic} = require('../controllers/clinicController')
const { protect, restrictTo } = require('../middleware/auth')

const router = express.Router()

router.get('/', getAllClinics)
router.get('/:id', getClinicById)
router.post('/', protect, restrictTo('admin'), createClinic)
router.patch('/:id', protect, restrictTo('admin'), updateClinic)
router.delete('/:id', protect, restrictTo('admin'), deleteClinic)
router.post('/:id/doctors', protect, restrictTo('admin'), addDoctorToClinic)
router.delete('/:id/doctors/:doctorId', protect, restrictTo('admin'), removeDoctorFromClinic)

module.exports = router
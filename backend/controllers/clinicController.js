const Clinic = require('../models/Clinic');
const Doctor = require('../models/DoctorModel');
const mongoose = require('mongoose');


const getAllClinics = async (req, res) => {
    try {
        const { province, district, sector } = req.query;
        
        // Build filter object
        const filter = {};
        
        if (province) filter['location.province'] = province;
        if (district) filter['location.district'] = district;
        if (sector) filter['location.sector'] = sector;

        const clinics = await Clinic.find(filter)
            .populate('doctors')
            .select('-__v')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: clinics.length,
            data: clinics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching clinics',
            error: error.message
        });
    }
};


const getClinicById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid clinic ID format'
            });
        }

        const clinic = await Clinic.findById(id)
            .populate('doctors', 'name speciality degree experience available image consultationFee')
            .select('-__v');

        if (!clinic) {
            return res.status(404).json({
                success: false,
                message: 'Clinic not found'
            });
        }

        res.status(200).json({
            success: true,
            data: clinic
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching clinic',
            error: error.message
        });
    }
};

const createClinic = async (req, res) => {
    try {
        const { name, email, phone, location, departments, description } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !location || !departments) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, phone, location, and departments'
            });
        }

        // Validate location object
        if (!location.province || !location.district || !location.sector) {
            return res.status(400).json({
                success: false,
                message: 'Location must include province, district, and sector'
            });
        }

        // Validate departments is an array
        if (!Array.isArray(departments)) {
            return res.status(400).json({
                success: false,
                message: 'Departments must be an array of strings'
            });
        }

        const clinic = new Clinic({
            name,
            email,
            phone,
            location,
            departments,
            description
        });

        const savedClinic = await clinic.save();

        res.status(201).json({
            success: true,
            message: 'Clinic created successfully',
            data: savedClinic
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Clinic with this email already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error creating clinic',
            error: error.message
        });
    }
};


const updateClinic = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid clinic ID format'
            });
        }

        // Validate location if provided
        if (updates.location) {
            if (!updates.location.province || !updates.location.district || !updates.location.sector) {
                return res.status(400).json({
                    success: false,
                    message: 'Location must include province, district, and sector'
                });
            }
        }

        const clinic = await Clinic.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).select('-__v');

        if (!clinic) {
            return res.status(404).json({
                success: false,
                message: 'Clinic not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Clinic updated successfully',
            data: clinic
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating clinic',
            error: error.message
        });
    }
};


const deleteClinic = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid clinic ID format'
            });
        }

        const clinic = await Clinic.findById(id);
        if (!clinic) {
            return res.status(404).json({
                success: false,
                message: 'Clinic not found'
            });
        }

        // Check if clinic has doctors
        if (clinic.doctors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete clinic with assigned doctors'
            });
        }

        await Clinic.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Clinic deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting clinic',
            error: error.message
        });
    }
};


const addDoctorToClinic = async (req, res) => {
    try {
        const { id } = req.params;
        const { doctorId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid clinic or doctor ID format'
            });
        }

        const [clinic, doctor] = await Promise.all([
            Clinic.findById(id),
            Doctor.findById(doctorId)
        ]);

        if (!clinic) {
            return res.status(404).json({
                success: false,
                message: 'Clinic not found'
            });
        }

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Check if doctor is already assigned
        if (clinic.doctors.includes(doctorId)) {
            return res.status(400).json({
                success: false,
                message: 'Doctor already assigned to this clinic'
            });
        }

        clinic.doctors.push(doctorId);
        await clinic.save();

        res.status(200).json({
            success: true,
            message: 'Doctor added to clinic successfully',
            data: clinic
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding doctor to clinic',
            error: error.message
        });
    }
};


const removeDoctorFromClinic = async (req, res) => {
    try {
        const { id, doctorId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid clinic or doctor ID format'
            });
        }

        const clinic = await Clinic.findById(id);
        if (!clinic) {
            return res.status(404).json({
                success: false,
                message: 'Clinic not found'
            });
        }

        // Check if doctor is assigned
        if (!clinic.doctors.includes(doctorId)) {
            return res.status(400).json({
                success: false,
                message: 'Doctor not assigned to this clinic'
            });
        }

        clinic.doctors = clinic.doctors.filter(docId => docId.toString() !== doctorId);
        await clinic.save();

        res.status(200).json({
            success: true,
            message: 'Doctor removed from clinic successfully',
            data: clinic
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing doctor from clinic',
            error: error.message
        });
    }
};

module.exports = {
    getAllClinics,
    getClinicById,
    createClinic,
    updateClinic,
    deleteClinic,
    addDoctorToClinic,
    removeDoctorFromClinic
};
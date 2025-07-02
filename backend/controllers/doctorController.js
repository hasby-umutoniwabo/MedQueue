const Doctor = require('../models/DoctorModel');
const Clinic = require('../models/Clinic');
const mongoose = require('mongoose');
const {v2: cloudinary} = require('cloudinary');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const validator = require('validator')
const fs = require('fs');


const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({})
      .select('-password -__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }

    const doctor = await Doctor.findById(id).select('-password -__v');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor',
      error: error.message
    });
  }
};

const changeAvailability = async (req, res) => {
  try {
    const {docId} = req.body
    const doctorData = await Doctor.findById(docId)
    await Doctor.findByIdAndUpdate(docId, {available: !doctorData.available})
    res.json({success:true, message:"Availability changed successfully"})
  } catch(error){
    console.log(error)
    res.json({success: false, message:error.message})
  }
}

const createDoctor = async (req,res) => {
  try{

    const {name, email, password, clinic, speciality, about, available, address} = req.body
    const imageFile = req.file

    if(!name || !email || !password || !clinic || !speciality || !about || !available || !address || !imageFile){
      return res.json({success: false, message:"Missing Details"})
    }

    if(!validator.isEmail(email)){
      return res.json({success: false, message:"Invalid Email"})
    }

    if(!validator.isStrongPassword(password)){
      return res.json({success: false, message:"Weak Password"})
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:"image"})
    const imageUrl = imageUpload.secure_url

    //create doctor
    const doctorData = {
      name,
      email,
      password: hashedPassword,
      clinic,
      about,
      speciality,
      available,
      address,
      image: imageUrl,
      date: Date.now()
    }

    const newDoctor = new Doctor(doctorData)
    await newDoctor.save()

    await Clinic.findByIdAndUpdate(clinic, {
      $push: { doctors: newDoctor._id }
    });

    res.json({success: true, message:"Doctor added successfully"})
    

  } catch(error){
    console.log(error)
    res.json({success: false, message:error.message})
  }
}


const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid doctor ID format',
      });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found',
      });
    }

    // Handle image update (if new image provided)
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updates.image = result.secure_url; // Store only the URL
      fs.unlinkSync(req.file.path); // Delete temp file
    }

    // Prevent updating restricted fields
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.password; // Don't allow direct password updates here

    const updatedDoctor = await Doctor.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select('-password -__v');

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: updatedDoctor,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path); // Clean up temp file on error

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating doctor',
      error: error.message,
    });
  }
};

// Delete a doctor
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid doctor ID format',
      });
    }

    const doctor = await Doctor.findByIdAndDelete(id);

    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting doctor',
      error: error.message,
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  changeAvailability,
  createDoctor,
  updateDoctor,
  deleteDoctor
};
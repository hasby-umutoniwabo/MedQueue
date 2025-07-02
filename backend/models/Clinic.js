const mongoose = require('mongoose')

const Schema =  mongoose.Schema

const clinicSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  location: {
    province: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    sector: {
      type: String,
      required: true
    }
  },
  departments: {
    type: [String],
    required: true
  },
  doctors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    }
  ],
  description: {
    type: String
  },
  
}, {timestamps: true})

module.exports = mongoose.model('Clinic', clinicSchema)


const mongoose = require('mongoose');
const clinicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
    location: {
        type: String,
        required: true,
    },
     phone: {
        type: String,
        required: true,
     },
     email: {
        type: String,
        required: true,
        unique: true,
     },
      isActive:{
        type: Boolean,
        default: true,
      },
       currentQueueNumber: {
         type: Number,
         default: 0,
       },
       servingNumber:{
            type: Number,
            default: 0,
       },
       departments: [{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Department',
       }], 
    timestamps: true,
       });

module.exports = mongoose.model('Clinic', clinicSchema);
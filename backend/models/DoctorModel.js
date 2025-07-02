const mongoose = require('mongoose')

const Schema = mongoose.Schema

const doctorSchema = new Schema({
   name: {
    type:String,
    required:true
   },
   email: {
    type:String,
    required:true,
    unique:true
   },
   clinic: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic'
   }],
   password: {
    type:String,
    required:true
   },
   image: {
    type:String,
    required:true
   },
   speciality: {
    type:String,
    required:true
   },
   about: {
    type:String,
    required:true
   },
   available: {
    type:Boolean,
    default:true
   },
   address: {
    type:Object,
    required:true
   }
}, {timestamps:true})

const doctorModel = mongoose.model('Doctor', doctorSchema)

module.exports = doctorModel
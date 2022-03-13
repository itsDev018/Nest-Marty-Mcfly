import { Schema } from 'mongoose';

export const UserSchema = new Schema({
  username: {required: true, type:String,
             trim: true, index: { unique: true }},
  password: {type: String, required: true},
  online: {type: Boolean, default: false}
});

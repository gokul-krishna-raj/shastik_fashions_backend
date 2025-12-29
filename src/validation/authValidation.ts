import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  role: Joi.string().valid('user', 'admin').default('user'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const profileUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  mobile: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
  address: Joi.string().min(5).max(250).required(),
  city: Joi.string().min(2).max(100).required(),
  state: Joi.string().min(2).max(100).required(),
  pincode: Joi.string().pattern(/^[0-9]{5,6}$/).required(),
});
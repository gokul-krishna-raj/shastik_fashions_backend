import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // password is optional because it won't be returned in queries
  mobile: string;
  role: 'user' | 'admin';
  refreshToken?: string;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  generateAuthToken: () => string;
  generateRefreshToken: () => string;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Don't return password in queries
    },
    mobile: {
      type: String,
      required: [true, 'Please add a mobile number'],
      unique: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password as string);
};

UserSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRE as any,
  });
};

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE as any,
  });
};


const User = mongoose.model<IUser>('User', UserSchema);

export default User;


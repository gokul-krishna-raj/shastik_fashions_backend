
import { Request, Response } from 'express';
import Address, { IAddress } from '../models/Address';
import apiResponse from '../utils/apiResponse';

interface CustomRequest extends Request {
  user?: {
    id: string;
  };
}

export const addAddress = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return apiResponse(res, { success: false, message: 'Not authorized', statusCode: 401 });
    }

    const { fullName, phone, email, addressLine1, addressLine2, city, state, pincode, country, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    const address = await Address.create({
      user: userId,
      fullName,
      phone,
      email,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      isDefault,
    });

    apiResponse(res, { success: true, message: 'Address added successfully', data: address, statusCode: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    apiResponse(res, { success: false, message: errorMessage, statusCode: 500 });
  }
};

export const getAddresses = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return apiResponse(res, { success: false, message: 'Not authorized', statusCode: 401 });
    }

    const addresses = await Address.find({ user: userId }).sort({ isDefault: -1 });

    apiResponse(res, { success: true, message: 'Addresses fetched successfully', data: addresses, statusCode: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    apiResponse(res, { success: false, message: errorMessage, statusCode: 500 });
  }
};

export const updateAddress = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return apiResponse(res, { success: false, message: 'Not authorized', statusCode: 401 });
    }

    const address = await Address.findOne({ _id: req.params.id, user: userId });
    if (!address) {
      return apiResponse(res, { success: false, message: 'Address not found or not owned by user', statusCode: 404 });
    }

    const { fullName, phone, email, addressLine1, addressLine2, city, state, pincode, country, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.id,
      { fullName, phone, email, addressLine1, addressLine2, city, state, pincode, country, isDefault },
      { new: true, runValidators: true }
    );

    apiResponse(res, { success: true, message: 'Address updated successfully', data: updatedAddress, statusCode: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    apiResponse(res, { success: false, message: errorMessage, statusCode: 500 });
  }
};

export const deleteAddress = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return apiResponse(res, { success: false, message: 'Not authorized', statusCode: 401 });
    }

    const address = await Address.findOne({ _id: req.params.id, user: userId });
    if (!address) {
      return apiResponse(res, { success: false, message: 'Address not found or not owned by user', statusCode: 404 });
    }

    await Address.findByIdAndDelete(req.params.id);

    apiResponse(res, { success: true, message: 'Address deleted successfully', statusCode: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    apiResponse(res, { success: false, message: errorMessage, statusCode: 500 });
  }
};

export const setDefaultAddress = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return apiResponse(res, { success: false, message: 'Not authorized', statusCode: 401 });
    }

    const address = await Address.findOne({ _id: req.params.id, user: userId });
    if (!address) {
      return apiResponse(res, { success: false, message: 'Address not found or not owned by user', statusCode: 404 });
    }

    await Address.updateMany({ user: userId }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    apiResponse(res, { success: true, message: 'Default address set successfully', data: address, statusCode: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    apiResponse(res, { success: false, message: errorMessage, statusCode: 500 });
  }
};

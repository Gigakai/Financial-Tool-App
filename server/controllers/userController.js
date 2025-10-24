import User from "../models/userModel.js";
import validator from "validator";
import {successResponse, errorResponse} from "../utils/response.js";

// Register a new user
export const registerUser = async (req, res) => {
    try {
        const {username, email, password, firstName, lastName} = req.body;
        const errors = {};

        // Check if user already exists
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return errorResponse(res, "User already exists with this email", 400);
        }

        // Validate email
        if (!validator.isEmail(email)) {
            errors.email = "Invalid email format";
        }

        // Validate password length
        if (!validator.isStrongPassword(password, {minLength: 6})) {
            errors.password = "Password must be at least 6 characters long and contain a mix of letters, numbers, and symbols";
        }

        // Validate username
        if (validator.isEmpty(username || "")) {
            errors.username = "Username is required";
        }

        // Check username uniqueness
        const existingUsername = await User.findOne({username});
        if (existingUsername) {
            errors.username = "Username is already taken";
        }

        // Validate first name
        if (firstName && validator.isEmpty(firstName)) {
            errors.firstName = "First name cannot be empty";
        }

        // Validate last name
        if (lastName && validator.isEmpty(lastName)) {
            errors.lastName = "Last name cannot be empty";
        }

        // If there are validation errors, return them
        if (Object.keys(errors).length > 0) {
            return errorResponse(res, "Validation errors", 400, errors);
        }


        // Create new user
        const newUser = new User({username, email, password});
        await newUser.save();

        const userInstance = {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            username: newUser.username
        }

        return successResponse(res, userInstance, "User registered successfully", 201);
    } catch (error) {
        return errorResponse(res, "Server error", 500, error);
    }
};

// Login user
export const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        const errors = {};
        // Find user by email
        const user = await User.findOne({email});
        if (!user) {
            errors.email = "User not found with this email";
            return errorResponse(res, "Invalid credentials", 400, errors);
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            errors.password = "Incorrect password";
            return errorResponse(res, "Invalid credentials", 400, errors);
        }

        const userInstance = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username
        }

        return successResponse(res, userInstance, "User logged in successfully", 200);
    } catch (error) {
        return errorResponse(res, "Server error", 500, error);
    }
};
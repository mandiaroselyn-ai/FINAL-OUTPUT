import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { name, department, position, email, password } = req.body;
    console.log(`📝 Registration attempt for email: ${email}`);
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`❌ Email already exists: ${email}`);
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Force role to 'employee' for security - only admins can assign roles
    const user = new User({ name, department, position, email, password, role: 'employee' });
    await user.save();
    
    console.log(`✅ User registered successfully: ${email}`);
    console.log(`🔐 Password hashed and saved`);
    console.log(`👤 User role set to 'employee' (admins can change roles in dashboard)`);
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ message: 'User registered successfully', user: userObj, token });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔍 Login attempt`);
    console.log(`📧 Email from request: ${email}`);
    console.log(`🔑 Password from request: ${password ? '***' : 'UNDEFINED'}`);
    console.log(`📦 Full body: ${JSON.stringify(req.body)}`);
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    console.log(`✅ User found: ${user.email}`);
    console.log(`🔐 Comparing passwords...`);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`🔐 Password match result: ${isMatch}`);
    
    if (!isMatch) {
      console.log(`❌ Password mismatch for user: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    console.log(`✅ Password correct! Generating token...`);
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ message: 'Login successful', user: userObj, token });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 Update user request for ID: ${id}`);
    console.log(`📦 Request body:`, req.body);
    
    // Get old user to check if role changed
    const oldUser = await User.findById(id);
    if (!oldUser) {
      console.log(`❌ User not found with ID: ${id}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { password, ...updateData } = req.body;
    console.log(`📋 Update data (without password):`, updateData);
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
      console.log(`🔐 Password will be updated and hashed`);
    }
    
    const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    console.log(`✅ User updated:`, updated);
    
    const responseObj = updated.toObject ? updated.toObject() : updated;
    
    // Check if role changed - if so, generate new JWT token
    let newToken = null;
    if (oldUser.role !== updated.role) {
      console.log(`👤 Role changed from ${oldUser.role} to ${updated.role} - generating new token`);
      newToken = jwt.sign(
        { userId: updated._id, role: updated.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      console.log(`🔐 New JWT token generated for updated role`);
    }
    
    const response = { message: 'User updated', user: responseObj };
    if (newToken) {
      response.token = newToken;
    }
    console.log(`📤 Sending response:`, response);
    res.json(response);
  } catch (err) {
    console.error(`❌ Update error:`, err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
};

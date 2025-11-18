const hashingService = require('../services/hashingService');
const userModel = require('../database/userModel');

const register = async (req, res, next) => {
  try {
    const { username, email, password, algorithm, params = {} } = req.body;

    if (!username || !email || !password || !algorithm) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await userModel.findUserByUsername(username);
    if (existing) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const { hash, salt, params: normalizedParams } =
      await hashingService.generateHash({
        algorithm,
        password,
        params,
      });

    const user = await userModel.createUser({
      username,
      email,
      hash,
      algorithm,
      salt,
      params: normalizedParams,
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      algorithm: user.algorithm,
      createdAt: user.created_at,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing credentials' });
    }

    const user = await userModel.findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = await hashingService.verifyPassword({
      algorithm: user.algorithm,
      password,
      hash: user.hash,
      salt: user.salt,
      params: user.params,
    });

    res.json({
      username: user.username,
      algorithm: user.algorithm,
      success: Boolean(isValid),
    });
  } catch (error) {
    next(error);
  }
};

const listUsers = async (_req, res, next) => {
  try {
    const users = await userModel.listUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await userModel.findUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await userModel.deleteUser(id);
    res.json({ message: 'User deleted successfully', id: parseInt(id) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  listUsers,
  deleteUser,
};



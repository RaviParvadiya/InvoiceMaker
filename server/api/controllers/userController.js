const UserAccountModel = require("../models/userModel");

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await UserAccountModel.find();
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  },

  createUser: async (req, res) => {
    const { accountno, name, mobileno } = req.body;

    try {
      const newUser = new UserAccountModel({ accountno, name, mobileno });
      await newUser.save();

      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  },

  updateUserById: async (req, res) => {
    const userId = req.params.id;
    const { accountno, name, mobileno } = req.body;

    try {
      const user = await UserAccountModel.findByIdAndUpdate(
        userId,
        { accountno, name, mobileno, updatedAt: new Date().toISOString() },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  },

  deleteUserById: async (req, res) => {
    const userId = req.params.id;

    try {
      const user = await UserAccountModel.findByIdAndDelete(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  },
};

module.exports = userController;

const userController = require("../controllers/userController");
const express = require("express");

const userRouter = express.Router();

userRouter.get("/getallusers", userController.getAllUsers);
userRouter.post("/createuser", userController.createUser);
// userRouter.post("/createuser", (req, res) => {
//     // Log information to the console
//     console.log('Received a request to create a new user:', req.body);

//     // Call the createUser function from the controller
//     userController.createUser(req, res);
//   });
userRouter.put("/updateuserbyid/:id", userController.updateUserById);
userRouter.delete("/deleteuserbyid/:id", userController.deleteUserById);

module.exports = userRouter;

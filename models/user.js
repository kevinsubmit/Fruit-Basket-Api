import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "guest",
    required: true,
  },
});
// distribute two roles

userSchema.methods.isCustomer = function () {
  return this.role === "customer";
};

userSchema.methods.isGuest = function () {
  return this.role === "admin";
};

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

const User = mongoose.model("User", userSchema);
export default User;

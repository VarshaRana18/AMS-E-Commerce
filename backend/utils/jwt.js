import jwt from "jsonwebtoken";

export const signToken = (id, role) => {
  const secret = process.env.JWT_SECRET || "fallback_ams_jwt_dev_secret_key_2026";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ id, role }, secret, { expiresIn });
};

export const sendTokenResponse = (user, statusCode, res, message = "Success") => {
  const token = signToken(user._id, user.role);

  // Strip password and internal fields
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    image: user.image,
    totalCartItems: user.totalCartItems || 0,
  };

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userResponse,
  });
};

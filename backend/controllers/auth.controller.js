import crypto from "crypto";
import User from "../models/user.model.js";
import { sendTokenResponse } from "../utils/jwt.js";
import { sendVerificationEmail } from "../utils/email.js";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Create user document (password will be hashed via pre-save hook)
    const user = new User({
      name,
      email: email.toLowerCase().trim(),
      password,
      mobile,
      role: "customer",
      isVerified: false,
    });

    // Generate cryptographically secure verification token (SHA-256 hashed in DB)
    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    // Trigger transactional verification email (fail-safe dispatch)
    try {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        token: verificationToken,
        req,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError.message);
    }

    return sendTokenResponse(
      user,
      201,
      res,
      "User registered successfully! A verification email has been dispatched to your inbox."
    );
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register user",
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Explicitly query for the password field which is set to select: false
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password using instance method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return sendTokenResponse(user, 200, res, "Login successful");
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

/**
 * @desc    Admin login (supports both DB admin users and initial .env credentials)
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
export const adminLogin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const identifier = (email || username || "").toLowerCase().trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide admin credentials and password",
      });
    }

    const envAdminUser = (process.env.ADMIN_USERNAME || "").toLowerCase().trim();
    const envAdminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    const envAdminPass = process.env.ADMIN_PASSWORD;

    // Check if matching .env admin configuration
    const isEnvAdminMatch =
      (identifier === envAdminUser || identifier === envAdminEmail) &&
      password === envAdminPass;

    if (isEnvAdminMatch) {
      // Find or upsert the admin user document in MongoDB
      const adminEmailToUse = envAdminEmail || (identifier.includes("@") ? identifier : `${identifier}@ams.local`);
      let admin = await User.findOne({ email: adminEmailToUse });
      if (!admin) {
        admin = await User.create({
          name: "System Administrator",
          email: adminEmailToUse,
          password: envAdminPass,
          role: "admin",
          isVerified: true,
        });
      } else if (admin.role !== "admin") {
        admin.role = "admin";
        await admin.save();
      }

      return sendTokenResponse(admin, 200, res, "Admin login successful");
    }

    // Otherwise check existing admin user in DB
    const adminUser = await User.findOne({
      $or: [{ email: identifier }, { name: identifier }],
      role: "admin",
    }).select("+password");

    if (!adminUser || !(await adminUser.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid admin credentials",
      });
    }

    return sendTokenResponse(adminUser, 200, res, "Admin login successful");
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during admin login",
    });
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/profile
 * @access  Private (Requires JWT)
 */
export const getProfile = async (req, res) => {
  try {
    // req.user was populated by protect middleware
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GetProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};

// Alias for backwards compatibility if needed
export const getMe = getProfile;

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private (Requires JWT)
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (mobile) updates.mobile = mobile;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

/**
 * @desc    Validate verification token and activate account
 * @route   GET /api/auth/verify-email
 * @route   GET /api/auth/verify-email/:token
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
export const verifyEmail = async (req, res) => {
  try {
    const token =
      req.params.token || req.query.token || (req.body && req.body.token);

    const isBrowserHtml =
      req.method === "GET" &&
      req.accepts("html") &&
      !req.xhr &&
      (!req.headers["accept"] || !req.headers["accept"].includes("application/json"));

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    if (!token) {
      if (isBrowserHtml) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Verification Error - AMS E-Commerce</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
              .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 40px; max-width: 480px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
              .icon { font-size: 48px; color: #ef4444; margin-bottom: 16px; }
              h1 { font-size: 22px; margin: 0 0 12px; }
              p { color: #94a3b8; font-size: 15px; line-height: 1.5; margin: 0 0 24px; }
              a.btn { display: inline-block; background: #6366f1; color: #fff; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon">&#9888;</div>
              <h1>Missing Verification Token</h1>
              <p>No verification token was provided in the request URL. Please check the link from your email.</p>
              <a href="${clientUrl}" class="btn">Return to AMS Store</a>
            </div>
          </body>
          </html>
        `);
      }
      return res.status(400).json({
        success: false,
        status: "fail",
        message: "Verification token is required.",
      });
    }

    // 1. Hash incoming token using SHA-256 to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Locate user with valid matching unexpired token
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    }).select("+verificationToken +verificationTokenExpires");

    if (!user) {
      if (isBrowserHtml) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Verification Failed - AMS E-Commerce</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
              .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 40px; max-width: 480px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
              .icon { font-size: 48px; color: #f59e0b; margin-bottom: 16px; }
              h1 { font-size: 22px; margin: 0 0 12px; }
              p { color: #94a3b8; font-size: 15px; line-height: 1.5; margin: 0 0 24px; }
              a.btn { display: inline-block; background: #6366f1; color: #fff; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon">&#9888;</div>
              <h1>Invalid or Expired Token</h1>
              <p>The verification link has expired or has already been used. Please log in or request a new verification email.</p>
              <a href="${clientUrl}" class="btn">Go to Login</a>
            </div>
          </body>
          </html>
        `);
      }
      return res.status(400).json({
        success: false,
        status: "fail",
        message: "Verification token is invalid or has expired. Please request a new verification email.",
      });
    }

    // 3. Mark user verified and clear token credentials
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    if (isBrowserHtml) {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Email Verified - AMS E-Commerce</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 40px; max-width: 480px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
            .icon { font-size: 52px; color: #10b981; margin-bottom: 16px; }
            h1 { font-size: 24px; margin: 0 0 12px; color: #f8fafc; }
            p { color: #94a3b8; font-size: 15px; line-height: 1.5; margin: 0 0 28px; }
            a.btn { display: inline-block; background: #10b981; color: #fff; text-decoration: none; font-weight: 600; padding: 14px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4); }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">&#10004;</div>
            <h1>Email Verified Successfully!</h1>
            <p>Your AMS E-Commerce account is now verified. You have full access to all features, custom PC orders, and checkout.</p>
            <a href="${clientUrl}" class="btn">Continue to AMS Store</a>
          </div>
        </body>
        </html>
      `);
    }

    return res.status(200).json({
      success: true,
      status: "success",
      message: "Email verified successfully! You now have full access to your account.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Server error during email verification.",
    });
  }
};

/**
 * @desc    Resend verification email to user
 * @route   POST /api/auth/resend-verification
 * @access  Public (Rate-limited)
 */
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        status: "fail",
        message: "Email address is required.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Anti-enumeration: Return generic success even if account does not exist
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists and is unverified, a verification link has been sent.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        status: "fail",
        message: "This email address is already verified.",
      });
    }

    // Generate fresh cryptographic token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send transactional verification email
    try {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        token: verificationToken,
        req,
      });
    } catch (emailError) {
      console.error("Resend verification email error:", emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "A fresh verification email has been dispatched to your inbox.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Failed to resend verification email.",
    });
  }
};

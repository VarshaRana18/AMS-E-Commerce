import express from "express";
import User from "../models/user.model.js";
import { getComponentModel } from "../models/components.model.js";
import OwnCustomPC from '../models/ownCustomPC.model.js';
import Order from "../models/orders.js";
import Request from "../models/Request.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { Resend } from 'resend';
import {
  register,
  login,
  adminLogin,
  getMe,
  googleAuth,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

// Function to generate a random 12-character ID
const generateOrderId = async () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let orderId;
  let isUnique = false;

  while (!isUnique) {
    orderId = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) isUnique = true; // If no existing order, ID is unique
  }

  return orderId;
};



//To create a new user
router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

// Legacy register endpoint
router.post("/register-legacy", async (req, res) => {
  const { name, email, mobile } = req.body;

  const newUser = new User({
    name,
    email,
    mobile,
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//To update the user verified status
router.put("/verify/:email", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { isVerified: true },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//To fetch data of the user
router.get("/user/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    const orderCount = await Order.countDocuments({ user_id: user._id });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//To fetch the addresses of the user
router.get('/addresses/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// To fetch data of the user along with the order count
router.get("/user-with-stats/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    const orderCount = await Order.countDocuments({ user_id: user._id });
    
    res.json({
      userData: user,
      orderCount: orderCount
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//To update user's name
router.put("/user/name/:email", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { name: req.body.name },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// To add a new address for a user
router.post("/user/address/:email", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { $push: { addresses: req.body } },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// To update a new address for a user
router.put("/user/address/edit/:email/:addressId", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        email: req.params.email,
        "addresses._id": req.params.addressId,
      },
      {
        $set: {
          "addresses.$": {
            _id: req.params.addressId,
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            pincode: req.body.pincode,
            flat: req.body.flat,
            area: req.body.area,
            landmark: req.body.landmark,
            city: req.body.city,
            state: req.body.state,
          },
        },
      },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// To delete an address for a user
router.delete("/user/address/delete/:email/:addressId", async (req, res) => {
  try {
    const { email, addressId } = req.params;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses = user.addresses.filter(
      (address) => address._id.toString() !== addressId
    );
    await user.save();

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting address", error: error.message });
  }
});

// To edit the phone number
router.put("/user/phone/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { mobile } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { mobile },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//To upload the image in cloudinary
router.post("/user/upload-image/:email", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Get current user data
    const currentUser = await User.findOne({ email: req.params.email });

    // Delete old image from Cloudinary if it's not the default
    if (
      currentUser.image &&
      currentUser.image !==
        "https://www.svgrepo.com/show/452030/avatar-default.svg"
    ) {
      const publicId = currentUser.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }
    const uploadResponse = await cloudinary.uploader.upload(
      req.files.file.tempFilePath
    );
    const imageUrl = uploadResponse.secure_url;

    const updatedUser = await User.findOneAndUpdate(
      { email: req.params.email },
      { image: imageUrl },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    console.log("Error details:", error);
    res.status(500).json({ error: error.message });
  }
});

// To check if a user exists
router.get("/check-user/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Create a new user with Google Login
router.post("/google", googleAuth);
router.post("/google-legacy", async (req, res) => {
  try {
    const { name, email, image } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        mobile: "",
        image:
          image || "https://www.svgrepo.com/show/452030/avatar-default.svg",
        isVerified: true,
      });

      await user.save();
      return res
        .status(201)
        .json({ message: "User registered successfully", user });
    }

    console.log("User already exists:", user);
    res.status(200).json({ message: "User already exists", user });
  } catch (error) {
    console.error("Google login error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});


//To fetch the wishlist
router.get("/wishlist/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Find the user and populate the wishlist
    const user = await User.findOne({ email }).populate("wishlist");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.wishlist || []);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//To add a item to wishlist
router.post("/wishlist/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { _id, type } = req.body;
    
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the item already exists in the wishlist
    const alreadyInWishlist = user.wishlist.some(
      (item) => item._id === _id && item.type === type
    );

    if (alreadyInWishlist) {
      return res.status(400).json({ message: "Item already in wishlist" });
    }

    // Add the item to the wishlist
    user.wishlist.push({ _id: _id, type });
    
    // Save the updated user
    await user.save();

    res.status(200).json({ message: "Added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//To remove a item from wishlist
router.delete("/wishlist/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { _id, type } = req.body;
    
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the item exists in the wishlist
    const itemIndex = user.wishlist.findIndex(
      (item) => item._id === _id && item.type === type
    );

    if (itemIndex === -1) {
      return res.status(400).json({ message: "Item not found in wishlist" });
    }

    // Remove the item from the wishlist
    user.wishlist.splice(itemIndex, 1);
    
    // Save the updated user
    await user.save();

    res.status(200).json({ message: "Removed from wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


//To fetch the wishlist items
router.get("/wishlistItems/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Find the user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch wishlist items dynamically from respective collections
    const wishlistDetails = await Promise.all(
      user.wishlist.map(async (item) => {
        const ComponentModel = getComponentModel(item.type); // Get the model for the specific component type
        const component = await ComponentModel.findById(item._id); // Fetch the document
        return component; // Return the fetched component
      })
    );

    res.json(wishlistDetails.filter(Boolean)); // Filter out any null results
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add an item to the cart (or update quantity if it already exists)
router.post("/cart/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { _id, type, quantity } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the item is already in the cart
    const existingCartItem = user.cart.find(
      (item) => item._id === _id && item.type === type
    );

    if (existingCartItem) {
      // Update quantity if item exists
      existingCartItem.quantity += quantity;
    } else {
      // Add the item to the cart
      user.cart.push({ _id, type, quantity });
    }

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "Added to cart", cart: user.cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Remove an item from the cart
router.delete("/cart/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { _id, type, clearAll } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (clearAll) {
      // Clear the entire cart
      user.cart = [];
    } else {
      // Find the item index
      const itemIndex = user.cart.findIndex(
        (item) => item._id === _id && item.type === type
      );

      if (itemIndex === -1) {
        return res.status(400).json({ message: "Item not found in cart" });
      }

      // Remove the item from the cart
      user.cart.splice(itemIndex, 1);
    }

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: clearAll ? "Cart cleared successfully" : "Removed from cart", cart: user.cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



// Fetch cart items with details
router.get("/cartItems/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Find the user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch cart items dynamically from respective collections
    const cartDetails = await Promise.all(
      user.cart.map(async (item) => {
        const ComponentModel = getComponentModel(item.type); // Get the model for the specific component type
        const component = await ComponentModel.findById(item._id); // Fetch the document
        return component ? { ...component.toObject(), quantity: item.quantity } : null; // Include quantity
      })
    );

    res.json(cartDetails.filter(Boolean)); // Filter out any null results
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Update quantity of an item in the cart
router.put("/cart/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { _id, quantity } = req.body;

    if (!email || !_id || quantity < 1) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update cart item quantity
    const cartItem = user.cart.find((item) => item._id.toString() === _id);
    if (!cartItem) return res.status(404).json({ error: "Item not found in cart" });

    cartItem.quantity = quantity;

    // Save updated cart
    await user.save();

    res.status(200).json({ message: "Quantity updated successfully", cart: user.cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Add item to the orders table
router.post("/checkout/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { components, total_price, address } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Ensure components array is valid
    if (!Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ message: "Invalid components data" });
    }

    const orderId = await generateOrderId();

    // Create new order
    const newOrder = new Order({
      _id: orderId,
      user_id: user._id,
      components,
      status: "Pending", // Default status
      total_price,
      address
    });

    await newOrder.save();

    // Clear the user's cart after successful order creation
    await User.updateOne(
      { email },
      { $set: { cart: [] } }
    );
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//To fetch the orders of the user
router.get("/orders/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Find the user by email to get their _id
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Fetch orders from the 'orders' table using the user's _id
    const userOrders = await Order.find({ user_id: user._id.toString() });

    res.status(200).json({ orders: userOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//To fetch the order details
router.get("/ordersFetch/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the order directly from the 'orders' table
    const order = await Order.findById(id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    let addressDetails = null;
    if (order.address) {
      const user = await User.findOne(
        { "addresses._id": order.address },
        { "addresses.$": 1 } // Projection to only return the matching address
      );
      
      addressDetails = user?.addresses?.[0] || null;
    }
    

    // Fetch details of each component
    const componentDetails = await Promise.all(
      order.components.map(async (component) => {
        if (component.component_type === "owncustompcs") {
          // Fetch from OwnCustomPC model
          const customPC = await OwnCustomPC.findById(component.component_id);
          
          return customPC ? customPC.toObject() : null;
        } else {
          // Fetch from other component models
          const ComponentModel = getComponentModel(component.component_type);
          const componentData = await ComponentModel.findById(component.component_id);
          return componentData ? componentData.toObject() : null;
        }
      })
    );

    // Add component details as a separate field in the response
    const response = {
      ...order.toObject(),
      component_details: componentDetails.filter(Boolean), // Remove null values
    };

    // Add address details if found
    if (addressDetails) {
      response.address_details = addressDetails;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//To cancel the order
router.patch("/cancelOrder/:orderId", async (req, res) => {
  try {
    
    const { orderId } = req.params;

    // Find the order and update its status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: "Cancelled" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order cancelled successfully", order: updatedOrder });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//Contact us form
router.post('/contact', async (req, res) => {
  try {
    const { name, subject, message, email } = req.body;

    // Validate required fields
    if (!name || !subject || !message || !email) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>', // Replace with your domain
      to: ['shaikhsamiul2005@gmail.com'], // Admin email
      reply_to: email, // User's emailS
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>Contact Form Request</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>This message was sent via your website contact form.</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send email'
      });
    }

    return res.json({
      success: true,
      message: 'Your message has been sent successfully!'
    });

  } catch (error) {
    console.error('Contact route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/requests/:email', async (req, res) => {
  try {
    
    const userEmail = req.params.email;
    
    if (!userEmail) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Find the user in database to get their ID
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Find all repair requests for this user
    const requests = await Request.find({ user_id: user._id })
      .sort({ request_date: -1 }); // Sort by newest first

    // Format the response data
    const formattedRequests = requests.map(request => ({
      _id: request._id,
      component_name: request.component_name,
      description: request.description,
      status: request.status,
      request_date: request.request_date.toISOString(),
      totalCharge: request.totalCharge
    }));

    res.status(200).json(formattedRequests);
  } catch (error) {
    console.error('Error fetching repair requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

//To submit a request for repair
router.post('/repairs/:email', async (req, res) => {
  try {
    const { component_name, repair_description } = req.body;
    const userEmail = req.params.email;

    // Validate required fields
    if (!repair_description) {
      return res.status(400).json({
        success: false,
        message: 'Repair description is required'
      });
    }

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Find the user to get their ID
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate unique request ID
    const generateRequestId = async () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let requestId;
      let isUnique = false;

      while (!isUnique) {
        requestId = Array.from({ length: 12 }, () => 
          chars[Math.floor(Math.random() * chars.length)]
        ).join("");
        const existingRequest = await Request.findById(requestId);
        if (!existingRequest) isUnique = true;
      }

      return requestId;
    };

    const requestId = await generateRequestId();

    // Create new repair request
    const newRequest = new Request({
      _id: requestId,
      user_id: user._id,
      component_name: component_name || 'Not specified',
      description: repair_description,
      status: 'Pending',
      request_date: new Date(),
      totalCharge: '0' // Default to 0, can be updated later
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Repair request submitted successfully',
      request: newRequest
    });

  } catch (error) {
    console.error('Error submitting repair request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;

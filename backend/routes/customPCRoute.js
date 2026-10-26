import express from 'express';
import OwnCustomPC from '../models/ownCustomPC.model.js';
import User from "../models/user.model.js";
import mongoose from 'mongoose';


const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { email, components, price } = req.body;

        if (!email || !components.length || !price) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure components match the schema: { _id: "component_id", type: "component_type" }
        const formattedComponents = components.map(comp => ({
            _id: comp.component_id,  // Change component_id to _id
            type: comp.component_type, // Change component_type to type
            price: comp.price,
        }));

        // Generate new order ID
        const orderId = new mongoose.Types.ObjectId();

        const newOrder = new OwnCustomPC({
            _id: orderId,
            user_id: user._id, // Use the fetched user ID
            components: formattedComponents,
            
            price,
        });

        await newOrder.save();

        // Update user's cart
        const existingCartItem = user.cart.find(item => 
            item._id.toString() === orderId.toString() && item.type === "custompcs"
        );

        if (existingCartItem) {
            // Update quantity if item exists
            existingCartItem.quantity += 1;
        } else {
            // Add the item to the cart
            user.cart.push({ _id: orderId, type: "owncustompcs", quantity: 1 });
        }

        // Save the updated user
        await user.save();

        res.status(201).json({ message: "Order placed successfully", order: newOrder });

    } catch (error) {
        console.error("Order placement error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// DELETE route to remove a custom PC by ID
router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
        
      // Find and delete the custom PC
      const deletedPC = await OwnCustomPC.findByIdAndDelete(id);
  
      if (!deletedPC) {
        return res.status(404).json({ message: "Custom PC not found" });
      }
  
      res.status(200).json({ message: "Custom PC deleted successfully" });
    } catch (error) {
      console.error("Error deleting custom PC:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


export default router;

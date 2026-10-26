import mongoose, { Schema } from "mongoose";


const ownCustomPCSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: { 
        type: String, 
        default: "Custom PC", 
        immutable: true // Prevents modification after creation
      },
    type: { 
        type: String, 
        default: "owncustompcs", 
        immutable: true // Prevents modification after creation
      },
      coverImage: {
        type: String,
        default: "https://www.svgrepo.com/show/521931/wrench.svg",
        required: true,
      },
    
    components: [
        {
            _id: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            }
        },
    ],
    // order_date: {
    //     type: Date,
    //     required: true,
    //     default: Date.now,
    // },
    // status: {
    //     type: String,
    //     required: true,
    //     // enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    // },
        price: {
        type: Number,
        required: true,
    },
});

const OwnCustomPC = mongoose.model("OwnCustomPCs", ownCustomPCSchema);
export default OwnCustomPC;

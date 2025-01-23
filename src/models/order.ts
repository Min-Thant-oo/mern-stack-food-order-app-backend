import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    // linking the order to the restaurant and user using their IDs and ref
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deliveryDetails: {
        email: { type: String, required: true },
        name: { type: String, required: true },
        addressLine1: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
    },
    cartItems: [
        {
            menuItemId: { type: String, required: true },
            quantity: { type: Number, required: true },
            name: { type: String, required: true },
        },
    ],
    subTotal: Number,   // Total cost of items
    deliveryPrice: Number,  // Delivery cost
    totalAmount: Number,    // Total cost of items + delivery
    discountPercentage: { type: Number, default: 0 },  // Discount percentage (e.g., 10 for 10%)
    discountedAmount: { type: Number, default: 0 },     // The amount after discount
    status: {
        type: String,
        enum: ["placed", "paid", "inProgress", "outForDelivery", "delivered", "cancelled"],
    },
    createdAt: { type: Date, default: Date.now },
}, { strict: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
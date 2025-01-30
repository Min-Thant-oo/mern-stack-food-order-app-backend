import Stripe from "stripe";
import Order from "../models/order";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);

export const processRefund = async (order: any, reason: string) => {
  try {
    if (!order.paymentIntentId) {
      throw new Error("No payment intent ID found for this order");
    }

    // Calculate refund amount based on order status and timing
    const refundAmount = calculateRefundAmount(order);

    // Create refund in Stripe
    const refund = await STRIPE.refunds.create({
      payment_intent: order.paymentIntentId,
      amount: refundAmount, // Amount in cents
      reason: 'requested_by_customer',
    });

    // Update order with refund information
    order.refundStatus = 'completed';
    order.refundAmount = refundAmount;
    order.refundReason = reason;
    await order.save();

    return refund;
  } catch (error) {
    console.error("Refund processing error:", error);
    order.refundStatus = 'failed';
    await order.save();
    throw error;
  }
};

const calculateRefundAmount = (order: any) => {
  // full refund if cancelled within 5 minutes
  const orderTime = new Date(order.createdAt).getTime();
  const currentTime = new Date().getTime();
  const timeDifference = currentTime - orderTime;
  const fiveMinutesInMs = 5 * 60 * 1000;

  if (timeDifference <= fiveMinutesInMs) {
    // Full refund including delivery fee
    return order.totalAmount;
  } else {
    // Partial refund excluding delivery fee
    return order.subTotal;
  }
};
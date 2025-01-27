import Stripe from "stripe";
import { Request, Response } from "express";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/order";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

type CheckoutSessionRequest = {
    cartItems: {
      menuItemId: string;
      name: string;
      quantity: string;
      price: number;
    }[];
    deliveryDetails: {
      email: string;
      name: string;
      addressLine1: string;
      city: string;
      country: string;
    };
    restaurantId: string;
  };

const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        const checkoutSessionRequest: CheckoutSessionRequest = req.body;
  
        const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId);
  
        if (!restaurant) {
            throw new Error("Restaurant not found");
        }

        const newOrder = new Order({
            restaurant: restaurant,
            user: req.userId,
            status: "unpaid",
            deliveryDetails: checkoutSessionRequest.deliveryDetails,
            cartItems: checkoutSessionRequest.cartItems,
            createdAt: new Date(),
        });
  
        const lineItems = createLineItems(checkoutSessionRequest, restaurant.menuItems);
  
        const session = await createSession(
            lineItems,
            newOrder._id.toString(),
            restaurant.deliveryPrice,
            restaurant._id.toString(),
            checkoutSessionRequest.deliveryDetails
        );
  
        if (!session.url) {
            res.status(500).json({ message: "Error creating stripe session" });
            return;
        }

        await newOrder.save();
  
        res.json({ url: session.url });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.raw.message });
    }
};


const createLineItems = (
    checkoutSessionRequest: CheckoutSessionRequest,
    menuItems: MenuItemType[]
) => {
    // 1. for each cartItem, get the menuItem object from the restaurant to get the price
    const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
        const menuItem = menuItems.find((item) => item._id.toString() === cartItem.menuItemId.toString());
  
        if(!menuItem) {
            throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
        }
        // 2. create a line item object for each cart item
        const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
            price_data: {
                currency: "usd",
                unit_amount: menuItem.price,
                product_data: {
                    name: menuItem.name,
                },
            },
            quantity: parseInt(cartItem.quantity),
        };
  
        return line_item;
    });
  
    return lineItems;
};


const createSession = async (
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    orderId: string,
    deliveryPrice: number,
    restaurantId: string,
    deliveryDetails: CheckoutSessionRequest['deliveryDetails']
) => {
    const sessionData = await STRIPE.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        shipping_options: [
            {
                shipping_rate_data: {
                    display_name: "Delivery",
                    type: "fixed_amount",
                    fixed_amount: {
                        amount: deliveryPrice,
                        currency: "usd",
                    },
                },
            },
        ],
        mode: "payment",
        metadata: {
            orderId,
            restaurantId,
        },

        customer_email: deliveryDetails.email,
        success_url: `${FRONTEND_URL}/order-status?success=true`,
        cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
    });
  
    return sessionData;
};


const stripeWebhookHandler = async (req: Request, res: Response) => {
    let event;
  
    try {
        const sig = req.headers["stripe-signature"];
        event = STRIPE.webhooks.constructEvent(
            req.body,
            sig as string,
            STRIPE_ENDPOINT_SECRET
        );
    } catch (error: any) {
        console.log(error);
        return res.status(400).send(`Webhook error: ${error.message}`);
    }
  
    if(event.type === "checkout.session.completed") {
        const order = await Order.findById(event.data.object.metadata?.orderId);
  
        if(!order) {
            return res.status(404).json({ message: "Order not found" });
        }
  
        order.subTotal = event.data.object.amount_subtotal;
        order.deliveryPrice = event.data.object.shipping_cost?.amount_subtotal;
        order.totalAmount = event.data.object.amount_total;
        order.status = "paid";
    
        await order.save();
    };

    res.status(200).send();
};

const getMyOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({ user: req.userId })
            .sort({ updatedAt: -1, createdAt: -1 })  // Sort by most recently updated first, then by creation date
            .populate("restaurant")
            .populate("user");
  
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
};

const cancelMyOrder = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if(!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const ownThisOrder = order.user?._id.toString() === req.userId;
        if(!ownThisOrder) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        order.cancelledBy = 'customer';
        order.status = 'cancelled';
        order.updatedAt = new Date();
        await order.save();
    
        res.status(200).json(order);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
}
  

export default {
    createCheckoutSession,
    stripeWebhookHandler,
    getMyOrders,
    cancelMyOrder,
}
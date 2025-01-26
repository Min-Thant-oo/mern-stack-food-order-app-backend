import express from 'express';
import { jwtCheck, jwtParse } from '../middleware/auth';
import OrderController from '../controllers/OrderController';

const router = express.Router();

router.post(
    "/checkout/create-checkout-session", 
    jwtCheck, 
    jwtParse, 
    OrderController.createCheckoutSession
);

router.post("/checkout/webhook", OrderController.stripeWebhookHandler as express.RequestHandler);
router.get("/", jwtCheck, jwtParse, OrderController.getMyOrders);
router.patch('/:orderId/cancel', jwtCheck, jwtParse, OrderController.cancelMyOrder  as express.RequestHandler);
export default router;
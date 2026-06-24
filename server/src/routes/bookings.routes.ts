import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createBookingSchema } from "../schemas/booking.schema";

const router = Router();

router.use(authenticate);

router.get("/my-bookings", bookingController.myBookings);
router.get("/:id", bookingController.getBookingByIdHandler);
router.post("/", validate(createBookingSchema), bookingController.createBookingHandler);
router.delete("/:id", bookingController.cancelBookingHandler);

export default router;

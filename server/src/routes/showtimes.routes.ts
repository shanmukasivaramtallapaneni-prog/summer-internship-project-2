import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.get("/", bookingController.listShowtimes);

router.get(
  "/:id/seats",
  authenticate,
  bookingController.showtimeSeats
);

export default router;

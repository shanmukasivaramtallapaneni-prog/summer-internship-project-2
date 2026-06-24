import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { authenticate, requireAdmin } from "../middlewares/auth";

const router = Router();

router.use(authenticate, requireAdmin);

router.post("/movies", adminController.createMovieHandler);
router.put("/movies/:id", adminController.updateMovieHandler);
router.delete("/movies/:id", adminController.deleteMovieHandler);

router.post("/showtimes", adminController.createShowtimeHandler);

router.get("/bookings", adminController.listBookingsHandler);
router.get("/analytics", adminController.getAnalytics);

router.get("/theaters", adminController.listTheatersHandler);
router.post("/theaters", adminController.createTheaterHandler);

export default router;

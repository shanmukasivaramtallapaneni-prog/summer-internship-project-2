import { Router } from "express";
import { prisma } from "../utils/prisma";
import { serializeMovie, serializeShowtime } from "../utils/serialize";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: { releaseDate: "desc" },
    });
    res.json({ movies: movies.map(serializeMovie) });
  } catch (error) {
    console.error("GET /api/movies error:", error);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: req.params.id },
      include: {
        showtimes: {
          where: { startTime: { gt: new Date() } },
          include: { theater: true },
          orderBy: { startTime: "asc" },
        },
      },
    });

    if (!movie) {
      res.status(404).json({ error: "Movie not found" });
      return;
    }

    res.json({
      movie: {
        ...serializeMovie(movie),
        showtimes: movie.showtimes.map(serializeShowtime),
      },
    });
  } catch (error) {
    console.error("GET /api/movies/:id error:", error);
    res.status(500).json({ error: "Failed to fetch movie" });
  }
});

export default router;

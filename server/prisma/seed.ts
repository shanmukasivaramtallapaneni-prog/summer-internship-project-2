import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@moviebooking.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@moviebooking.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@moviebooking.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@moviebooking.com",
      passwordHash,
      role: "USER",
    },
  });

  const theater = await prisma.theater.upsert({
    where: { id: "seed-theater-1" },
    update: {},
    create: {
      id: "seed-theater-1",
      name: "Grand Cinema",
      location: "Downtown",
      totalSeats: 50,
    },
  });

  const rows = ["A", "B", "C", "D", "E"];
  const seatsPerRow = 10;

  for (const row of rows) {
    for (let seatNumber = 1; seatNumber <= seatsPerRow; seatNumber++) {
      await prisma.seat.upsert({
        where: {
          theaterId_row_seatNumber: {
            theaterId: theater.id,
            row,
            seatNumber,
          },
        },
        update: {},
        create: {
          theaterId: theater.id,
          row,
          seatNumber,
        },
      });
    }
  }

  // Movie 1
  const movie1 = await prisma.movie.upsert({
    where: { id: "seed-movie-1" },
    update: { posterUrl: "/posters/last_horizon.png" },
    create: {
      id: "seed-movie-1",
      title: "The Last Horizon",
      description: "An epic sci-fi adventure following a crew searching for a new home among the stars.",
      durationMinutes: 142,
      genre: "Sci-Fi",
      posterUrl: "/posters/last_horizon.png",
      releaseDate: new Date("2025-12-01"),
    },
  });

  // Movie 2
  const movie2 = await prisma.movie.upsert({
    where: { id: "seed-movie-2" },
    update: { posterUrl: "/posters/neon_echoes.png" },
    create: {
      id: "seed-movie-2",
      title: "Neon Echoes",
      description: "A cyberpunk thriller exploring the bounds of human consciousness in a digital age.",
      durationMinutes: 115,
      genre: "Action/Sci-Fi",
      posterUrl: "/posters/neon_echoes.png",
      releaseDate: new Date("2026-03-15"),
    },
  });

  // Movie 3
  const movie3 = await prisma.movie.upsert({
    where: { id: "seed-movie-3" },
    update: { posterUrl: "/posters/whispering_pines.png" },
    create: {
      id: "seed-movie-3",
      title: "Whispering Pines",
      description: "A psychological horror set in a secluded mountain town where nothing is as it seems.",
      durationMinutes: 105,
      genre: "Horror",
      posterUrl: "/posters/whispering_pines.png",
      releaseDate: new Date("2026-10-31"),
    },
  });

  // Movie 4
  const movie4 = await prisma.movie.upsert({
    where: { id: "seed-movie-4" },
    update: { posterUrl: "/posters/laugh_riot.png" },
    create: {
      id: "seed-movie-4",
      title: "Laugh Riot",
      description: "A heartwarming comedy about a mismatched group of friends on a cross-country road trip.",
      durationMinutes: 95,
      genre: "Comedy",
      posterUrl: "/posters/laugh_riot.png",
      releaseDate: new Date("2026-06-20"),
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0);

  const movies = [movie1, movie2, movie3, movie4];
  
  for (let i = 0; i < movies.length; i++) {
    const m = movies[i];
    const startTime = new Date(tomorrow);
    startTime.setHours(18 + i, 0, 0, 0); // Stagger showtimes
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + m.durationMinutes);

    await prisma.showtime.upsert({
      where: { id: `seed-showtime-${i+1}` },
      update: {},
      create: {
        id: `seed-showtime-${i+1}`,
        movieId: m.id,
        theaterId: theater.id,
        startTime,
        endTime,
        price: 12.99 + i, // Vary pricing slightly
      },
    });
  }

  console.log("Seed completed:");
  console.log(`  Admin: ${admin.email} / password123`);
  console.log(`  User:  ${user.email} / password123`);
  console.log(`  Movies Seeded: 4`);
  console.log(`  Theater: ${theater.name} (${theater.totalSeats} seats)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const pptxgen = require("pptxgenjs");
const path = require("path");

const pptx = new pptxgen();

// Layout and formatting
pptx.layout = "LAYOUT_16x9";
const primaryColor = "e94560";
const bgDark = "1a1a2e";
const textLight = "ffffff";

// Artifacts directory where screenshots are saved
const IMG_DIR = "C:\\Users\\shanm\\.gemini\\antigravity\\brain\\5dda270f-e488-4f35-aa09-b90c14bf4ed9";

// Slide 1: Title
const slide1 = pptx.addSlide();
slide1.background = { color: bgDark };
slide1.addText("CineBook", {
    x: 1, y: 2, w: 8, h: 1,
    fontSize: 54, bold: true, color: primaryColor, align: "center"
});
slide1.addText("A Modern Movie Ticket Booking System\nStep-by-Step Project Walkthrough", {
    x: 1, y: 3.5, w: 8, h: 1.5,
    fontSize: 24, color: textLight, align: "center"
});

// Slide 2: Project Overview
const slide2 = pptx.addSlide();
slide2.background = { color: bgDark };
slide2.addText("Project Overview", { x: 0.5, y: 0.5, fontSize: 36, color: primaryColor, bold: true });
slide2.addText("Objective: To build a seamless, enterprise-grade movie booking experience.", { x: 0.5, y: 1.5, fontSize: 20, color: textLight });
slide2.addText([
    { text: "• React 18, TypeScript, Tailwind CSS, Vite" },
    { text: "• Node.js, Express, Prisma ORM, SQLite" },
    { text: "• JWT Authentication & Role-Based Access" }
], { x: 0.8, y: 2.2, w: 8, fontSize: 18, color: textLight, bullet: true, lineSpacing: 35 });

// Slide 3: Home Page (Image)
const slide3 = pptx.addSlide();
slide3.background = { color: bgDark };
slide3.addText("1. Home Page & Movie Browsing", { x: 0.5, y: 0.5, fontSize: 30, color: primaryColor, bold: true });
try {
    slide3.addImage({ path: path.join(IMG_DIR, "home_page.png"), x: 0.5, y: 1.2, w: 9, h: 4.2 });
} catch(e) { console.log("Missing image home_page"); }
slide3.addText("Features cinematic hero carousel, modern hover animations, and skeleton loaders.", { x: 0.5, y: 5.5, fontSize: 16, color: textLight });

// Slide 4: Authentication (Image)
const slide4 = pptx.addSlide();
slide4.background = { color: bgDark };
slide4.addText("2. Secure Authentication", { x: 0.5, y: 0.5, fontSize: 30, color: primaryColor, bold: true });
try {
    slide4.addImage({ path: path.join(IMG_DIR, "login_page.png"), x: 1, y: 1.2, w: 8, h: 4.2 });
} catch(e) {}
slide4.addText("Role-Based Access Control (RBAC). Admin and Customers get different views.", { x: 0.5, y: 5.5, fontSize: 16, color: textLight });

// Slide 5: Profile & Booking History (Image)
const slide5 = pptx.addSlide();
slide5.background = { color: bgDark };
slide5.addText("3. User Profile & PDF Tickets", { x: 0.5, y: 0.5, fontSize: 30, color: primaryColor, bold: true });
try {
    slide5.addImage({ path: path.join(IMG_DIR, "profile_page.png"), x: 1, y: 1.2, w: 8, h: 4.2 });
} catch(e) {}
slide5.addText("Users can track their bookings and instantly download PDF copies of their tickets.", { x: 0.5, y: 5.5, fontSize: 16, color: textLight });

// Slide 6: Admin Dashboard (Image)
const slide6 = pptx.addSlide();
slide6.background = { color: bgDark };
slide6.addText("4. Admin Analytics Dashboard", { x: 0.5, y: 0.5, fontSize: 30, color: primaryColor, bold: true });
try {
    slide6.addImage({ path: path.join(IMG_DIR, "admin_dashboard.png"), x: 0.5, y: 1.2, w: 9, h: 4.2 });
} catch(e) {}
slide6.addText("Real-time revenue calculation, total tickets sold, and complete system visibility.", { x: 0.5, y: 5.5, fontSize: 16, color: textLight });

// Slide 7: Conclusion
const slide7 = pptx.addSlide();
slide7.background = { color: bgDark };
slide7.addText("Conclusion", { x: 0.5, y: 0.5, fontSize: 36, color: primaryColor, bold: true });
slide7.addText("By combining a strong relational database architecture with an enterprise-ready UI, this application meets all requirements of a professional-grade booking system.", { x: 0.5, y: 2.0, w: 9, fontSize: 24, color: textLight, lineSpacing: 40 });
slide7.addText("Thank You!", { x: 1, y: 4.5, w: 8, h: 1, fontSize: 40, bold: true, color: primaryColor, align: "center" });

// Save the file
const outPath = path.join(__dirname, "..", "CineBook_Visual_Presentation.pptx");
pptx.writeFile({ fileName: outPath })
    .then(fileName => {
        console.log(`Successfully created presentation at: ${fileName}`);
    })
    .catch(err => {
        console.error("Error creating PPTX:", err);
    });

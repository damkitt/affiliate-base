# AffiliateBase 🚀

A modern, premium affiliate programs directory with powerful admin moderation panel. Built with Next.js 16, Prisma, and Tailwind CSS.

![AffiliateBase](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)

## ✨ Features

### Public Directory
- **Verified Programs**: Curated list of affiliate programs with commission rates
- **Advanced Filtering**: Category-based filtering and real-time search
- **Program Details**: Comprehensive program pages with metrics and contact info
- **Premium Design**: Framer/Raycast-inspired aesthetic with smooth animations
- **Dark Mode**: Full dark mode support with theme persistence

### Admin Panel (`/admin`)
- **Moderation System**: Approve/decline programs with one click
- **Full Editing**: Edit all program fields (name, logo, contacts, metrics)
- **Real-time Search**: Filter programs instantly
- **Live Updates**: Programs refresh every 3 seconds
- **Status Management**: Track pending, approved programs

### Technical Highlights
- 🎨 **Premium UI**: HSL-based gradients for smooth color transitions
- 🔄 **Real-time**: SWR for automatic data revalidation
- 📱 **Responsive**: Mobile-first design
- 🎯 **Type-safe**: Full TypeScript coverage
- ⚡ **Fast**: Turbopack for instant dev server
- 🗄️ **Database**: SQLite with Prisma ORM

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd affiliatebase

# Install dependencies
npm install

# Set up the database
npx prisma migrate deploy
npx prisma generate

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

## 📁 Project Structure

```
affiliatebase/
├── app/
│   ├── admin/              # Admin panel
│   ├── api/                # API routes
│   │   ├── admin/          # Admin-only endpoints
│   │   └── programs/       # Public program endpoints
│   ├── programs/[id]/      # Program detail pages
│   └── page.tsx            # Home page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── AddProgramModal.tsx # Program submission form
│   ├── Leaderboard.tsx     # Programs list
│   └── ...
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── types/
│   └── index.ts            # TypeScript types
└── lib/
    └── prisma.ts           # Prisma client
```

## 🗄️ Database Schema

```prisma
model Program {
  id                Int      @id @default(autoincrement())
  name              String
  tagline           String
  description       String
  category          String
  websiteUrl        String
  affiliateUrl      String
  commissionRate    String
  status            String   @default("approved")
  logoBase64        String?
  country           String?
  xHandle           String?
  email             String?
  affiliatesCount   String?
  payoutsTotal      String?
  // ... more fields
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

## 🎨 Design System

### Colors
- Light mode: Clean whites and subtle grays
- Dark mode: Deep blacks with accent highlights
- HSL-based gradients for smooth transitions

### Typography
- Font: Inter with optimized font features
- Tracking: Tight for modern look
- Antialiasing: Enabled for crisp text

### Animations
- Fade-in-up: 800ms cubic-bezier(0.16, 1, 0.3, 1)
- Shimmer effect on CTA buttons
- Smooth hover transitions

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: SQLite + Prisma
- **Data Fetching**: SWR
- **Icons**: Heroicons v2
- **Theme**: next-themes

## 📝 Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"
```

## 🚢 Deployment

### Vercel (Recommended)
```bash
npx vercel
```

### Other Platforms
1. Build the project: `npm run build`
2. Start production server: `npm start`
3. Ensure PostgreSQL/MySQL for production (update DATABASE_URL)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your own affiliate directory!

## 🙏 Acknowledgments

- Inspired by Framer, Raycast, and Resend designs
- Built with shadcn/ui components
- Icons by Heroicons

---

Made with ❤️ for the affiliate marketing community

# Site Planner

A professional web-based spatial layout tool designed for planning outdoor venues, lots, rodeos, and parks. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Canvas-Based Layout Editor**: Interactive 2D canvas for spatial planning
- **Equipment Library**: Pre-built library of common equipment and structures
- **Measurement System**: Precise pixel-to-feet conversion and real-time measurements
- **Project Management**: Create, save, and load spatial planning projects
- **Background Images**: Support for satellite imagery and custom uploads
- **Export Capabilities**: Professional PDF generation with title blocks and legends
- **User Authentication**: Secure email-based authentication
- **Responsive Design**: Cross-device compatibility

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Canvas**: Konva.js (to be added)
- **Backend**: Supabase (to be integrated)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # React components (to be created)
│   ├── canvas/        # Canvas-related components
│   ├── ui/            # UI components
│   └── shared/        # Shared components
└── lib/               # Utilities and configurations (to be created)
    ├── canvas/        # Canvas utilities
    ├── db/            # Database queries
    └── utils/         # General utilities
```

## Architecture

The application follows a modern JAMstack architecture:

- **Frontend**: Next.js 14 with App Router for server-side rendering and client-side interactivity
- **Canvas Engine**: Konva.js for high-performance 2D spatial rendering
- **State Management**: Zustand for client-side state, React Query for server state
- **Database**: Supabase with PostgreSQL and PostGIS for spatial operations
- **Authentication**: Supabase Auth with magic link email authentication
- **Deployment**: Vercel Edge Network for global distribution

## Development Roadmap

This project is managed using Task Master. Key development phases:

1. **Foundation**: Project setup and basic architecture ✅
2. **Canvas Engine**: Interactive 2D canvas with Konva.js
3. **Authentication**: User management and secure access
4. **Equipment Library**: Pre-built components and drag-and-drop
5. **Measurements**: Precision tools and annotations
6. **Export System**: Professional PDF generation
7. **Performance**: Optimization and scaling

## Contributing

This project follows the Task Master workflow. See the `.taskmaster/` directory for detailed task management and development planning.

## License

Private project - All rights reserved.

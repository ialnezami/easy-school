# Easy School

A comprehensive school management platform connecting teachers, students, and parents.

## Features

- **User Management**: Role-based access for Teachers, Students, and Parents
- **Class Management**: Create and manage classes with student assignments
- **Resource Sharing**: Upload and share educational resources
- **Schedule Management**: Create and manage class timetables
- **Messaging System**: Secure communication between teachers, students, and parents
- **Parent Account Switching**: Parents can view their child's account

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (MongoDB Atlas)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MongoDB Atlas account (or local MongoDB instance)
- Vercel account (for deployment)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd easy-school
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

Required environment variables:

- `MONGODB_URI`: Your MongoDB connection string
- `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET`: A random secret key (generate with: `openssl rand -base64 32`)

### 4. Set up MongoDB

1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Add it to `.env.local` as `MONGODB_URI`

### 5. Generate NextAuth secret

```bash
openssl rand -base64 32
```

Add the output to `.env.local` as `NEXTAUTH_SECRET`.

### 6. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
easy-school/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   ├── mongodb.ts        # MongoDB connection
│   └── utils.ts          # Helper functions
├── prd.md                # Product Requirements Document
├── tasks.md              # Implementation tasks
└── package.json          # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

The project will automatically deploy on every push to the main branch.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (for file storage) | No |
| `NODE_ENV` | Environment (development/production) | Yes |

## Development Guidelines

- Follow TypeScript strict mode
- Use ESLint and Prettier for code quality
- Write self-documenting code
- Follow the project structure conventions
- Write tests for critical functionality

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and formatting
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.


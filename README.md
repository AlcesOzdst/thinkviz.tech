# ThinkViz

ThinkViz is an interactive web platform built to help students visualize and understand Artificial Intelligence algorithms in real-time. Instead of looking at static pseudocode, you can draw custom environments and watch the algorithms navigate them step-by-step.

This project was built for our TY Semester 5 Artificial Intelligence coursework.

## Features

- **Interactive Sandboxes**: Draw custom grid mazes (walls, start, target) and save them to the database.
- **Algorithm Visualization**: Watch the exact search paths of algorithms as they explore.
- **Supported Algorithms**: 
  - Uninformed Search (BFS, DFS)
  - Informed Search (A* Search)
  - Local Search (Hill Climbing, Genetic Algorithms)
- **Progress Tracking**: The system tracks which algorithms you have fully watched and awards completion badges on your dashboard.

## Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: Prisma v7
- **Deployment**: Vercel

## Running Locally

To run this project on your local machine:

1. **Clone the repository**
   ```bash
   git clone https://github.com/AlcesOzdst/thinkviz.tech.git
   cd thinkviz.tech
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   Create a `.env` file in the root directory and add your Postgres connection string:
   ```env
   DATABASE_URL="postgres://your_user:your_password@localhost:5432/thinkviz"
   ```

4. **Sync the database schema**
   ```bash
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## Created By

- **Parth Doshi**
- **Arya Inamdar**
- **Param Gadiya**

*MIT World Peace University*

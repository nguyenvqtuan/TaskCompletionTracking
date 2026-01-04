# Task Tracker

A modern task completion tracking application built with React, TypeScript, and Vite. This application helps users manage tasks and sprints with a drag-and-drop interface and visual progress tracking.

## Features

- **Task Management**: Create, update, and track tasks.
- **Sprint Planning**: Organize tasks into sprints (`src/features/sprints`).
- **Drag & Drop Interface**: Intuitive task organization using `@dnd-kit`.
- **Data Visualization**: Visualize progress with charts using `recharts`.
- **Modern UI**: Clean and responsive design built with Tailwind CSS and Radix UI.

## Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management & Utilities**: `axios`, `clsx`, `tailwind-merge`

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd task-tracker
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Build

To build the project for production:

```bash
npm run build
```

### Linting

To run the linter:

```bash
npm run lint
```

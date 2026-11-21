# Everleaf

**A little growth with every page.**

Everleaf is a personal reading management and tracking application built to help readers organize their book libraries, record reading activity, monitor progress, set reading goals, and understand their reading habits.

Its central purpose is **personal reading management and tracking**. It offers familiar library and reading-list capabilities, but it is not intended to clone Goodreads or recreate its social community. Book discovery supports the experience; the reader's own reading life remains at the heart of the product.

## Product Direction

Everleaf follows a **Modern Literary** aesthetic: contemporary, polished, welcoming, and bookish, inspired by warm wood, leather-bound books, and beautiful paper.

The interface aims to feel premium without looking antique, overly rustic, or like a generic corporate dashboard.

### Brand Identity

- **Product name:** Everleaf
- **Tagline:** A little growth with every page.
- **Aesthetic:** Modern Literary
- **Wordmark direction:** Lowercase `everleaf` in elegant serif typography.

### Approved Color Palette

| Color | Hex | Intended Role |
|---|---|---|
| Espresso | `#493126` | Sidebar, headings, and strong text |
| Walnut | `#76513B` | Primary buttons and key actions |
| Cognac | `#A77B59` | Accent details |
| Caramel | `#C49A72` | Progress indicators and highlights |
| Sand | `#E6D4BC` | Secondary surfaces and subtle panels |
| Parchment | `#F5EEE3` | Main application background |
| Ivory | `#FFF9F0` | Cards, modals, and elevated surfaces |

The visual system uses predominantly light parchment and ivory surfaces, strong espresso typography, walnut primary actions, and restrained cognac/caramel accents. Book covers provide additional color and visual interest.

## Features and Application Sections

### 1. Dashboard

- Reading overview and key metrics.
- Currently reading books.
- Recently added and recently completed books.
- Weekly reading activity.
- Reading-goal progress.
- Quick actions to add a book or log a reading session.
- Metrics derived from the same application data used throughout the app.

### 2. My Library

- Add, edit, and delete books.
- Search by title or author.
- Filter by reading status and genre.
- Sort by title, author, date added, rating, or progress.
- Switch between grid and list views.
- Track four statuses: **Want to Read**, **Reading**, **Completed**, and **Paused**.

### 3. Explore Books

- Search a public book catalogue by title, author, or ISBN.
- Browse basic genres and categories.
- View available covers and book metadata.
- Add a discovered book to the Wishlist or My Library.
- Keep manual book entry available when catalogue information is missing.

### 4. Book Details

- View a book's title, author, genre, description, and cover.
- Track total pages, current page, and reading progress.
- Change reading status.
- Add a personal rating, review, notes, and memorable quotes.
- Review reading-session history.
- Use one reusable dynamic details view for all books.

### 5. Reading Tracker

- Record a reading session with its book, date, pages read, and duration.
- Add an optional note.
- Review, edit, or delete reading sessions.
- View daily activity and simple streak information.
- Keep book progress and derived statistics consistent with session records.

### 6. Reading Goals

- Set annual books-completed targets.
- Set monthly reading targets.
- Track progress and remaining amounts.
- Derive goal progress from reading records.

### 7. Statistics & Insights

- Books completed.
- Pages read.
- Reading time.
- Monthly reading activity.
- Genre distribution.
- Simple reading trends and average pace.
- Charts based on application data, with useful empty states.

### 8. Wishlist

- Save books to read later.
- Remove wishlist items.
- Add an optional priority or note.
- Search and sort saved books.
- Move a wishlist item into My Library.

### 9. Settings

- Choose a light or dark theme.
- Manage reading preferences and default goals.
- Manage local data, including export/import where available.
- Reset local data with confirmation.
- View application information.

## Technology Stack

| Technology | Responsibility |
|---|---|
| React + Vite | User interface and development/build tooling |
| JavaScript | Application logic |
| React Router | Page navigation and dynamic book routes |
| Redux Toolkit | Centralized application state |
| RTK Query | Query, mutation, and caching patterns |
| Tailwind CSS | Styling and responsive layouts |
| Recharts | Reading statistics and data visualizations |
| React Hook Form | Form state and handling |
| Zod | Form schema validation |
| Lucide React | Interface icons |
| localStorage | Persistence of personal application data |
| ESLint | Code-quality and lint checks |
| Prettier | Consistent code formatting |

RTK Query is used for learning and managing asynchronous data patterns; it does not imply that Everleaf has a backend. The application is designed to remain frontend-only.

## Book Catalogue Integration

The approved specification prefers **Google Books API** as the single public catalogue integration.

It supports searches by title, author, or ISBN and can provide available metadata such as:

- Authors
- Descriptions
- Publication information
- Page counts
- Categories
- ISBN identifiers
- Cover images

Not every catalogue record contains every field or a cover image.

Catalogue data is used to help prefill the local Add Book form; the user confirms before the book is saved to their own library. Manual book entry remains available.

The catalogue API is not a backend or database. Personal reading status, progress, sessions, goals, notes, wishlist items, and preferences remain in local application state and browser storage.

## Architecture Overview

Everleaf is organized around a shared application shell and a centralized source of truth.

- **Presentation:** Feature pages, shared layout, reusable components, forms, and charts.
- **Application logic:** Redux Toolkit state, hooks, services, and utility functions.
- **Personal data:** Browser `localStorage`.
- **External catalogue metadata:** The selected public book catalogue API.

The application uses a shared layout with sidebar, top bar, and main content area. Book Details is opened contextually and uses a dynamic route rather than separate pages for individual books.

### Main Routes

| Section | Route |
|---|---|
| Dashboard | `/` |
| My Library | `/library` |
| Explore Books | `/explore` |
| Book Details | `/books/:bookId` |
| Reading Tracker | `/tracker` |
| Reading Goals | `/goals` |
| Statistics & Insights | `/statistics` |
| Wishlist | `/wishlist` |
| Settings | `/settings` |

### State Management

Redux Toolkit is the central source of truth for the application's main data domains:

- Books
- Reading sessions
- Reading goals
- Wishlist
- Preferences

Dashboard metrics, goals, and statistics should be derived from the shared application records rather than maintained as conflicting copies.

Reading-session records are the source of truth for recorded reading activity and analytics. Persisted data should be validated and loaded safely.

### Responsive Experience

- **Desktop:** Persistent sidebar and spacious content area.
- **Tablet:** Compact or collapsible sidebar.
- **Mobile:** Compact navigation or drawer, with responsive cards, forms, and charts.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (a version compatible with the installed Vite release).
- npm.

### Installation

**1. Clone the repository**

```bash
git clone YOUR_REPOSITORY_URL
```

**2. Navigate to the project directory**

```bash
cd everleaf
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open the local URL**

Open the URL printed in your terminal to access Everleaf.

> Replace `YOUR_REPOSITORY_URL` with the actual Git repository URL after the repository has been published.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format supported project files with Prettier |
| `npm run format:check` | Check formatting without changing files |

## Quality Checks

Before deployment, run:

```bash
npm run format:check
npm run lint
npm run build
```

Then preview the production build:

```bash
npm run preview
```

Check the application on desktop, tablet, and mobile sizes, and verify the main reading flows and data persistence.

## Deployment

Everleaf is intended to be deployed as a Vite frontend application on [Vercel](https://vercel.com/).

Typical Vercel build settings:

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Install command:** `npm install`

Connect the Git repository to Vercel and deploy after the production build and local preview have been checked.

Add environment variables only if the implemented catalogue integration actually requires them. Never commit API secrets or private environment files.

## Project Scope and Non-Goals

Everleaf is a controlled-scope frontend learning and portfolio project.

The following are intentionally outside the approved scope:

- Backend, server, or application database.
- Authentication, user accounts, or profiles.
- Cloud synchronization or multi-device accounts.
- Social feeds, followers, messaging, community, or public reviews.
- Online purchasing, payments, or subscriptions.
- AI recommendations.
- Multiple external catalogue API integrations.
- Complex recommendation engines, advanced analytics, or unnecessary animations.
- Reproducing all Goodreads functionality.

The guiding rule is to simplify complicated features and prioritize a complete, polished frontend over expanding the product unnecessarily.

## Project Status

This README documents the approved product direction and intended application architecture. Features and deployment status should be described as complete only after they have been integrated and verified in the local project.

## License

No open-source license has been specified for this project yet.

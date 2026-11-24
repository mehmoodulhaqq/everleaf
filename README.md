# Everleaf

**A little growth with every page.**

Everleaf is a personal reading management and tracking application designed to help readers organize their book libraries, record reading activity, monitor progress, set reading goals, discover books, and understand their reading habits.

Its central purpose is **personal reading management and tracking**. It offers familiar library and reading-list capabilities, but it is not intended to clone Goodreads or recreate its social community. Book discovery supports the experience; the reader's own reading life remains at the heart of the product.

Everleaf supports both guest users and authenticated users. Guests can use the main application with browser-based data persistence, while authenticated users can save their personal reading data to Firebase Cloud Firestore and access it across devices.

---

## Product Direction

Everleaf follows a **Modern Literary** aesthetic: contemporary, polished, welcoming, and bookish, inspired by warm wood, leather-bound books, and beautiful paper.

The interface aims to feel premium without looking antique, overly rustic, or like a generic corporate dashboard.

### Brand Identity

- **Product name:** Everleaf
- **Tagline:** A little growth with every page.
- **Aesthetic:** Modern Literary
- **Wordmark direction:** Lowercase `everleaf` in elegant serif typography.

### Approved Color Palette

| Color     | Hex       | Intended Role                        |
| --------- | --------- | ------------------------------------ |
| Espresso  | `#493126` | Sidebar, headings, and strong text   |
| Walnut    | `#76513B` | Primary buttons and key actions      |
| Cognac    | `#A77B59` | Accent details                       |
| Caramel   | `#C49A72` | Progress indicators and highlights   |
| Sand      | `#E6D4BC` | Secondary surfaces and subtle panels |
| Parchment | `#F5EEE3` | Main application background          |
| Ivory     | `#FFF9F0` | Cards, modals, and elevated surfaces |

The visual system uses predominantly light parchment and ivory surfaces, strong espresso typography, walnut primary actions, and restrained cognac/caramel accents. Book covers provide additional color and visual interest.

---

## Features and Application Sections

### 1. Landing Page

- Introduces Everleaf and its purpose.
- Presents the application's main features.
- Provides navigation into the application.
- Includes calls to action for account creation and accessing the application.
- Uses a responsive layout consistent with the Modern Literary design direction.

### 2. Dashboard

- Reading overview and key metrics.
- Currently reading books.
- Recently added and recently completed books.
- Weekly reading activity.
- Reading-goal progress.
- Quick actions to add a book or log a reading session.
- Metrics derived from shared application data.

### 3. My Library

- Add, edit, and delete books.
- Search by title or author.
- Filter and sort books.
- Switch between grid and list views.
- Organize books into Currently Reading and Completed sections.
- Track reading status and progress.

The application also supports book statuses such as Want to Read, Reading, Completed, and Paused. Want to Read books can be managed through the Wishlist.

### 4. Explore Books

- Search public book catalogues by title, author, or ISBN.
- Discover books using available genres and categories.
- View available covers and book metadata.
- Open a book details popup.
- Add discovered books to My Library or Wishlist.
- Keep manual book entry available when catalogue information is missing.

### 5. Book Details

- View a book's title, author, genre, description, and cover.
- Review available publication information, page count, language, and ISBN.
- Track reading progress.
- Change reading status.
- Access available catalogue links and additional book information.
- Add discovered books to the personal library.

### 6. Reading Tracker

- Record reading sessions with a book, date, pages read, and duration.
- Add optional session notes.
- Review, edit, and delete reading sessions.
- View daily activity and reading streak information.
- Keep book progress and derived statistics consistent with reading records.

### 7. Reading Goals

- Set annual books-completed targets.
- Set monthly reading targets.
- Track progress and remaining amounts.
- View goal progress using application reading records.

### 8. Statistics & Insights

- Books completed.
- Pages read.
- Reading time.
- Monthly reading activity.
- Genre distribution.
- Reading trends and average pace.
- Charts based on application data, with useful empty states.

### 9. Wishlist

- Save books to read later.
- Remove wishlist items.
- Add optional priorities or notes.
- Search and sort saved books.
- Move a wishlist item into My Library.

### 10. Settings

- Choose a light or dark theme.
- Manage reading preferences and default goals.
- Manage available local data options.
- Export or import data where supported.
- Reset local data with confirmation.
- View application information.

### 11. Profile and Authentication

- Create an account and sign in.
- Support available authentication providers, including email/password and Google sign-in.
- Access the authenticated user's Profile.
- Sign out securely.
- Support password reset.
- Restrict Profile access to authenticated users.

The main application remains accessible to guests without requiring an account.

---

## Technology Stack

| Technology              | Responsibility                                  |
| ----------------------- | ----------------------------------------------- |
| React                   | Component-based user interface                  |
| Vite                    | Development server and production build tooling |
| JavaScript              | Application logic                               |
| React Router            | Page navigation and routing                     |
| Redux Toolkit           | Centralized application state                   |
| RTK Query               | API queries, mutations, and caching             |
| Tailwind CSS            | Styling and responsive layouts                  |
| Recharts                | Reading statistics and data visualizations      |
| React Hook Form         | Form state and handling                         |
| Zod                     | Form schema validation                          |
| Lucide React            | Interface icons                                 |
| Firebase Authentication | User registration and authentication            |
| Cloud Firestore         | Cloud database for authenticated users          |
| Firebase Security Rules | Access control and data protection              |
| localStorage            | Guest data persistence and local preferences    |
| Google Books API        | Public book catalogue                           |
| Open Library API        | Additional public book catalogue data           |
| ESLint                  | Code-quality and lint checks                    |
| Prettier                | Consistent code formatting                      |
| Vercel                  | Application hosting and deployment              |

---

## Book Catalogue Integration

Everleaf integrates public book catalogues to support book discovery and metadata retrieval.

The application uses:

- **Google Books API**
- **Open Library API**

Catalogue searches support title, author, and ISBN queries.

Available catalogue information may include:

- Authors
- Descriptions
- Publication information
- Page counts
- Categories
- ISBN identifiers
- Cover images

Not every catalogue record contains every field or a cover image.

Catalogue information is used to help populate book details. Users can review discovered books and add them to their own library or wishlist.

Manual book entry remains available when catalogue information is missing.

Public catalogue APIs provide external book information; they are not Everleaf's personal reading database.

---

## Architecture Overview

Everleaf uses a frontend application connected to Firebase as its managed backend.

The architecture is organized into the following layers:

- **Presentation:** Feature pages, shared layouts, reusable components, forms, and charts.
- **Application logic:** Redux Toolkit state, React hooks, services, and utility functions.
- **API integration:** RTK Query and public book catalogue APIs.
- **Authentication:** Firebase Authentication.
- **Cloud data:** Firebase Cloud Firestore.
- **Guest data:** Browser localStorage.
- **Hosting:** Vercel.

### Data Persistence

Everleaf supports two user experiences.

#### Guest Users

Guests can access the main application without creating an account.

- Personal books and reading records are stored in browser localStorage.
- Reading sessions, goals, and wishlist data persist in the same browser.
- Data remains available after refreshing or reopening the browser.
- Guest data is browser-specific and is not automatically synchronized across devices.
- Profile access requires authentication.

#### Authenticated Users

Authenticated users save their personal application data to Firebase Cloud Firestore.

- Data is associated with the authenticated user.
- Books and reading records are stored in the cloud.
- Data can be accessed across devices after signing in with the same account.
- Data persists independently of the browser's localStorage.
- Firebase Security Rules protect user-specific data.

The application uses Firebase Authentication to identify users and Firestore to persist their personal reading information.

### State Management

Redux Toolkit is the central application state-management solution.

The main data domains include:

- Books
- Reading sessions
- Reading goals
- Wishlist
- Preferences

Dashboard metrics, goals, and statistics should be derived from shared application records rather than maintained as conflicting copies.

Reading-session records support reading activity and analytics.

### Responsive Experience

- **Desktop:** Persistent sidebar and spacious content area.
- **Tablet:** Compact or collapsible sidebar.
- **Mobile:** Compact navigation or drawer, with responsive cards, forms, and charts.

---

## Main Application Routes

| Section               | Route         |
| --------------------- | ------------- |
| Landing Page          | `/`           |
| Dashboard             | `/dashboard`  |
| My Library            | `/library`    |
| Explore Books         | `/explore`    |
| Reading Tracker       | `/tracker`    |
| Reading Goals         | `/goals`      |
| Statistics & Insights | `/statistics` |
| Wishlist              | `/wishlist`   |
| Settings              | `/settings`   |
| Profile               | `/profile`    |

Authentication-related routes are handled separately by the application's routing configuration.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) compatible with the installed Vite version.
- npm.
- A Firebase project.
- A registered Firebase Web App.

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Navigate to the Project Directory

```bash
cd everleaf
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root.

Add the following Firebase configuration variables:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=your_recaptcha_enterprise_site_key
```

Replace the placeholder values with the configuration from your own Firebase project and reCAPTCHA Enterprise setup.

**Important:**

- Never commit your `.env` file or other private environment files to Git.
- Keep the `.env` file in `.gitignore`.
- Vite variables prefixed with `VITE_` are included in the client-side application bundle. They are not private secrets.
- Firebase Security Rules must enforce data access permissions independently of frontend code.

### 5. Start the Development Server

```bash
npm run dev
```

### 6. Open Everleaf Locally

Open the local URL printed in your terminal to access the application.

---

## Available Scripts

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Start the Vite development server            |
| `npm run build`        | Create the production build in `dist/`       |
| `npm run preview`      | Preview the production build locally         |
| `npm run lint`         | Run ESLint                                   |
| `npm run format`       | Format supported project files with Prettier |
| `npm run format:check` | Check formatting without changing files      |

---

## Firebase Configuration

Everleaf uses Firebase as its managed backend.

### Firebase Authentication

Firebase Authentication manages user identity and account access.

The application supports its configured authentication providers, including:

- Email and password authentication.
- Google sign-in.
- Password reset.
- Sign-out.

The main application is publicly accessible, while Profile requires authentication.

### Cloud Firestore

Cloud Firestore stores personal reading data for authenticated users.

The application uses Firestore to persist user-specific application records, including supported books, reading sessions, goals, wishlist items, and preferences.

### Firebase Security Rules

Firestore Security Rules are responsible for protecting personal user data.

Rules should ensure that authenticated users can only read and modify their own records.

Guest data is handled locally through browser storage rather than being shared through an authenticated user's Firestore records.

### Firebase App Check

Everleaf uses its configured reCAPTCHA Enterprise integration for application protection.

The required site key must be configured correctly for the domains where the application is deployed.

---

## Deployment

Everleaf is deployed as a Vite application using [Vercel](https://vercel.com/).

### Vercel Build Configuration

| Setting           | Value           |
| ----------------- | --------------- |
| Framework Preset  | Vite            |
| Build Command     | `npm run build` |
| Output Directory  | `dist`          |
| Install Command   | `npm install`   |
| Production Branch | `main`          |

### Deployment Process

1. Push the latest application changes to GitHub.
2. Connect the GitHub repository to the Vercel project.
3. Configure the required Firebase environment variables in Vercel.
4. Assign the variables to the appropriate deployment environments.
5. Deploy the application.
6. Verify the production deployment and Firebase functionality.

The production website is hosted at:

**[https://everleafreads.vercel.app](https://everleafreads.vercel.app/)**

Vercel automatically creates deployments when changes are pushed to the configured Git branches.

---

## Quality Checks

Before making significant changes or deploying updates, run:

```bash
npm run format:check
npm run lint
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Verify the following:

- Main application navigation.
- Authentication and sign-out.
- Guest access and local data persistence.
- Authenticated user data persistence.
- Book creation, editing, and deletion.
- Book catalogue search.
- Reading sessions and progress.
- Reading goals and statistics.
- Wishlist functionality.
- Responsive layouts.
- Browser console errors.

---

## Project Scope and Non-Goals

Everleaf is a personal reading management application and a web development portfolio project.

The following are outside its intended scope:

- Social feeds, followers, messaging, and community features.
- Public social reviews and discussion systems.
- Online purchasing and payment processing.
- Subscription-based functionality.
- AI recommendation engines.
- Complex recommendation systems.
- Unnecessary animations or excessive interface complexity.
- Reproducing all Goodreads functionality.

The guiding principle is to prioritize a complete, polished, reliable reading-management experience rather than expanding the product unnecessarily.

---

## Project Status

**Status: Completed and Deployed**

Everleaf has completed its frontend development, Firebase integration, authentication setup, cloud data persistence, and Vercel deployment.

The application is publicly accessible and supports both guest users and authenticated users.

The production application is available at:

**[Everleaf — A little growth with every page.](https://everleafreads.vercel.app/)**

---

## License

No open-source license has been specified for this project yet.

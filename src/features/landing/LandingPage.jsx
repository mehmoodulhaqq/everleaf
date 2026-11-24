
import { Link, Navigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  ChartNoAxesCombined,
  Check,
  Compass,
  Heart,
  Leaf,
  LibraryBig,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../routes/routeConfig'

const features = [
  {
    icon: LibraryBig,
    title: 'Personal Library',
    description:
      'Bring your collection together. Organize your books and keep track of what you own, what you have finished, and what is next.',
    number: '01',
  },
  {
    icon: Compass,
    title: 'Discover Books',
    description:
      'Explore books, discover new authors, and find your next addition to your personal collection.',
    number: '02',
  },
  {
    icon: BookOpen,
    title: 'Reading Tracker',
    description:
      'Record your reading sessions, update your page progress, and keep a history of your reading activity.',
    number: '03',
  },
  {
    icon: Target,
    title: 'Reading Goals',
    description:
      'Set daily, monthly, and annual reading targets. Follow your progress and celebrate your milestones.',
    number: '04',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Statistics & Insights',
    description:
      'Understand your reading habits through statistics, activity summaries, and progress insights.',
    number: '05',
  },
  {
    icon: Heart,
    title: 'Wishlist',
    description:
      'Save books you want to explore or add to your collection. Keep all your future book interests in one place.',
    number: '06',
  },
]

const steps = [
  {
    number: '01',
    title: 'Build your library',
    description:
      'Add books to your personal collection and organize them in one place.',
  },
  {
    number: '02',
    title: 'Track your progress',
    description:
      'Update pages, record reading sessions, and keep your activity organized.',
  },
  {
    number: '03',
    title: 'See your growth',
    description:
      'Set meaningful goals and understand your reading journey through insights.',
  },
]

function Brand({ light = false }) {
  return (
    <Link
      to={ROUTES.EXPLORE}
      className={`inline-flex items-center gap-2.5 ${
        light ? 'text-white' : 'text-text-primary'
      }`}
      aria-label="Everleaf home"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
        <Leaf size={22} strokeWidth={1.8} />
      </span>

      <span className="font-display text-2xl font-semibold tracking-tight">
        everleaf
      </span>
    </Link>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-walnut">
      <span className="h-px w-6 bg-caramel" />
      {children}
    </div>
  )
}

function LandingPage() {
  const { user, loading } = useAuth()

  // Wait until Firebase determines the authentication state.
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Leaf className="mx-auto h-10 w-10 animate-pulse text-caramel" />
          <p className="mt-4 text-sm text-text-secondary">
            Loading Everleaf...
          </p>
        </div>
      </main>
    )
  }

  // Signed-in users should go directly to the Dashboard.
  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      {/* Navigation */}
      <header className="relative z-10 border-b border-border/70 bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Brand />

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
            >
              Features
            </a>
            <Link
              to={ROUTES.EXPLORE}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
            >
              Explore
            </Link>
            <a
              href="#about"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
            >
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.LOGIN}
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:text-primary sm:inline-flex"
            >
              Sign In
            </Link>

            <Link
              to={ROUTES.SIGN_UP}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
            >
              Create Account
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sand/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-32 h-80 w-80 rounded-full bg-caramel/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-28">
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-text-secondary shadow-sm">
              <Sparkles size={14} className="text-caramel" />
              A little growth with every page.
            </div>

            <h1 className="max-w-xl font-display text-5xl font-semibold leading-[1.12] tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
              Your books.
              <span className="block text-walnut">Your progress.</span>
              <span className="block italic text-caramel">
                Your collection.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-text-secondary sm:text-lg">
              A thoughtful space to organize your personal library, track your
              reading activity, set goals, and discover books worth adding to
              your collection.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to={ROUTES.EXPLORE}
                className="inline-flex items-center gap-3 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg"
              >
                Explore Everleaf
                <ArrowRight size={17} />
              </Link>

              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-surface px-6 py-3.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-text-muted">
              <span className="inline-flex items-center gap-2">
                <Check size={15} className="text-success" />
                Personal book collection
              </span>
              <span className="inline-flex items-center gap-2">
                <Check size={15} className="text-success" />
                Track your own progress
              </span>
            </div>
          </div>

          {/* Decorative library preview */}
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute -right-5 -top-5 h-full w-full rounded-[2rem] border border-caramel/20" />

            {/* Main preview card */}
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface p-5 shadow-xl sm:p-8">
              <div className="flex items-center justify-between border-b border-border pb-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
                    Your personal space
                  </p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-text-primary">
                    My Library
                  </h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary text-walnut">
                  <BookOpen size={19} />
                </div>
              </div>

              {/* Statistics */}
              <div className="mt-7 grid grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-xl bg-surface-secondary p-3 sm:p-4">
                  <LibraryBig size={18} className="text-walnut" />
                  <p className="mt-4 font-display text-2xl font-semibold text-text-primary">
                    24
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Books collected
                  </p>
                </div>

                <div className="rounded-xl bg-surface-secondary p-3 sm:p-4">
                  <Target size={18} className="text-walnut" />
                  <p className="mt-4 font-display text-2xl font-semibold text-text-primary">
                    08
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Goals tracked
                  </p>
                </div>

                <div className="rounded-xl bg-surface-secondary p-3 sm:p-4">
                  <TrendingUp size={18} className="text-walnut" />
                  <p className="mt-4 font-display text-2xl font-semibold text-text-primary">
                    76%
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Goal progress
                  </p>
                </div>
              </div>

              {/* Your collection */}
              <div className="mt-7">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-text-primary">
                    Your collection
                  </h3>
                  <span className="text-xs text-text-muted">
                    A little preview
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-5">
                  {/* Of Mice and Men */}
                  <div>
                    <img
                      src="https://d9z6htgewkjtb.cloudfront.net/9789696401414.webp"
                      alt="Of Mice and Men book cover"
                      className="aspect-[3/4] w-full rounded-lg object-cover shadow-md"
                    />
                    <p className="mt-2 truncate text-xs font-semibold text-text-primary">
                      Of Mice and Men
                    </p>
                    <p className="text-xs text-text-muted">
                      John Steinbeck
                    </p>
                  </div>

                  {/* The Stranger */}
                  <div>
                    <img
                      src="https://media.bookcorner.shop/uploads/original/5f6b41bb513421600864699.jpg"
                      alt="The Stranger book cover"
                      className="aspect-[3/4] w-full rounded-lg object-cover shadow-md"
                    />
                    <p className="mt-2 truncate text-xs font-semibold text-text-primary">
                      The Stranger
                    </p>
                    <p className="text-xs text-text-muted">
                      Albert Camus
                    </p>
                  </div>

                  {/* Pride and Prejudice */}
                  <div>
                    <img
                      src="https://cdn.penguin.co.uk/dam-assets/books/9780141439518/9780141439518-jacket-large.jpg"
                      alt="Pride and Prejudice book cover"
                      className="aspect-[3/4] w-full rounded-lg object-cover shadow-md"
                    />
                    <p className="mt-2 truncate text-xs font-semibold text-text-primary">
                      Pride and Prejudice
                    </p>
                    <p className="text-xs text-text-muted">
                      Jane Austen
                    </p>
                  </div>
                </div>
              </div>

              {/* Reading goal */}
              <div className="mt-7 rounded-xl border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-muted">Reading goal</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">
                      Annual collection goal
                    </p>
                  </div>
                  <span className="font-display text-xl font-semibold text-walnut">
                    76%
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-secondary">
                  <div className="h-full w-[76%] rounded-full bg-primary" />
                </div>

                <p className="mt-2 text-xs text-text-muted">
                  A visual example of your progress tracking
                </p>
              </div>
            </div>

            {/* Floating bookmark card */}
            <div className="absolute -bottom-6 -left-5 hidden items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-secondary text-walnut">
                <Bookmark size={17} />
              </div>
              <div>
                <p className="text-xs font-semibold text-text-primary">
                  Your books, organized
                </p>
                <p className="text-xs text-text-muted">
                  All in one place
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-10 bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Everything in its place</SectionLabel>
            <h2 className="font-display text-3xl font-semibold leading-tight text-text-primary sm:text-4xl lg:text-5xl">
              Your reading life,{' '}
              <span className="italic text-walnut">organized.</span>
            </h2>
            <p className="mt-5 text-sm leading-7 text-text-secondary sm:text-base">
              From the books you own to the goals you set, Everleaf brings the
              important parts of your reading journey together.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <article
                  key={feature.number}
                  className="group rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-lg sm:p-7"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-secondary text-walnut transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon size={22} strokeWidth={1.7} />
                    </div>
                    <span className="font-display text-sm text-text-muted">
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-xl font-semibold text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">
                    {feature.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-10 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-12">
          <div>
            <SectionLabel>A simpler way to stay organized</SectionLabel>
            <h2 className="max-w-lg font-display text-3xl font-semibold leading-tight text-text-primary sm:text-4xl lg:text-5xl">
              A home for every part of your reading journey.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-text-secondary sm:text-base">
              Everleaf gives you a clear place to manage your collection and
              follow your reading activity, without making things complicated.
            </p>

            <Link
              to={ROUTES.EXPLORE}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-walnut transition-colors hover:text-primary"
            >
              Explore the platform
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="space-y-7">
            {steps.map((step, index) => (
              <div key={step.number} className="flex gap-5">
                <div className="flex shrink-0 flex-col items-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border-strong bg-surface font-display text-sm font-semibold text-walnut">
                    {step.number}
                  </span>
                  {index !== steps.length - 1 && (
                    <span className="mt-2 h-full min-h-10 w-px bg-border-strong" />
                  )}
                </div>

                <div className="pb-5">
                  <h3 className="font-display text-xl font-semibold text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-7 text-text-secondary">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Everleaf */}
      <section
        id="about"
        className="scroll-mt-10 bg-[#594536] py-20 text-white sm:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-12">
          <div>
            <SectionLabel>Why Everleaf</SectionLabel>
            <h2 className="max-w-xl font-display text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              More than a book list. A record of your reading journey.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-8 text-white/75 sm:text-base">
              Your collection tells a story of its own. Everleaf helps you
              organize the books you care about, remember your progress, keep
              track of your goals, and see how your reading habits grow over
              time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex min-h-[170px] flex-col rounded-2xl border border-white/15 bg-white/10 p-5">
              <LibraryBig size={23} className="text-[#e5c29f]" />
              <h3 className="mt-4 font-display text-lg font-semibold text-white">
                Your collection
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Keep your personal books organized in one place.
              </p>
            </div>

            <div className="flex min-h-[170px] flex-col rounded-2xl border border-white/15 bg-white/10 p-5">
              <TrendingUp size={23} className="text-[#e5c29f]" />
              <h3 className="mt-4 font-display text-lg font-semibold text-white">
                Your progress
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Follow your activity and see your progress develop.
              </p>
            </div>

            <div className="flex min-h-[170px] flex-col rounded-2xl border border-white/15 bg-white/10 p-5">
              <Target size={23} className="text-[#e5c29f]" />
              <h3 className="mt-4 font-display text-lg font-semibold text-white">
                Your goals
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Create targets that give your reading direction.
              </p>
            </div>

            <div className="flex min-h-[170px] flex-col rounded-2xl border border-white/15 bg-white/10 p-5">
              <Heart size={23} className="text-[#e5c29f]" />
              <h3 className="mt-4 font-display text-lg font-semibold text-white">
                Your wishlist
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Remember the books you want to add next.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-border bg-surface px-6 py-14 text-center shadow-sm sm:px-12 sm:py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-secondary text-walnut">
            <Leaf size={27} />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-walnut">
            Begin your Everleaf journey
          </p>

          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold leading-tight text-text-primary sm:text-4xl lg:text-5xl">
            Give your reading life a place to grow.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-text-secondary sm:text-base">
            Organize your collection, keep track of your progress, and make
            every part of your reading journey count.
          </p>

          <Link
            to={ROUTES.EXPLORE}
            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg"
          >
            Explore Everleaf
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-9 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div>
            <Brand />
            <p className="mt-3 text-xs text-text-muted">
              A little growth with every page.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-text-secondary">
            <a
              href="#features"
              className="transition-colors hover:text-primary"
            >
              Features
            </a>
            <Link
              to={ROUTES.EXPLORE}
              className="transition-colors hover:text-primary"
            >
              Explore
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="transition-colors hover:text-primary"
            >
              Sign In
            </Link>
            <Link
              to={ROUTES.SIGN_UP}
              className="transition-colors hover:text-primary"
            >
              Create Account
            </Link>
          </nav>

          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Everleaf. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}

export default LandingPage

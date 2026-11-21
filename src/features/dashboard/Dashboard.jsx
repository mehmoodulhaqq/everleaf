import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookCheck,
  BookOpen,
  BookPlus,
  BookMarked,
  Flame,
  Target,
} from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import EmptyState from '../../components/common/EmptyState'
import BookCard from '../../components/books/BookCard'

import ReadingActivityChart from '../../components/charts/ReadingActivityChart'
import GenreDistributionChart from '../../components/charts/GenreDistributionChart'
import MonthlyProgressChart from '../../components/charts/MonthlyProgressChart'

import useAppSelector from '../../hooks/useAppSelector'
import useReadingStats from '../../hooks/useReadingStats'

import { BOOK_STATUS, GOAL_PERIODS, GOAL_TYPES } from '../../utils/constants'

import { formatDate, parseDate, toISODate } from '../../utils/dateUtils'
import { getSessionPagesRead } from '../../utils/readingUtils'

/* ---------------------------------------------------------
   HELPERS
   --------------------------------------------------------- */

const formatNumber = (value) => {
  return new Intl.NumberFormat('en').format(Number(value) || 0)
}

const formatReadingTime = (minutes) => {
  const totalMinutes = Math.max(0, Number(minutes) || 0)

  if (totalMinutes < 60) {
    return `${totalMinutes} min`
  }

  const hours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

const isDateInGoalPeriod = (value, goal) => {
  const date = parseDate(value)

  if (!date || !goal) return false

  if (date.getFullYear() !== Number(goal.year)) {
    return false
  }

  if (
    goal.period === GOAL_PERIODS.MONTHLY &&
    date.getMonth() + 1 !== Number(goal.month)
  ) {
    return false
  }

  return true
}

const getGoalProgress = (goal, books, sessions) => {
  if (!goal) return null

  let current = 0

  if (goal.type === GOAL_TYPES.BOOKS_COMPLETED) {
    current = books.filter((book) => {
      return (
        book.status === BOOK_STATUS.COMPLETED &&
        isDateInGoalPeriod(book.dateCompleted, goal)
      )
    }).length
  }

  if (goal.type === GOAL_TYPES.PAGES_READ) {
    current = sessions.reduce((total, session) => {
      if (!isDateInGoalPeriod(session.date, goal)) {
        return total
      }

      return total + getSessionPagesRead(session)
    }, 0)
  }

  if (goal.type === GOAL_TYPES.READING_DAYS) {
    const readingDates = new Set(
      sessions
        .filter((session) => isDateInGoalPeriod(session.date, goal))
        .map((session) => toISODate(session.date))
        .filter(Boolean),
    )

    current = readingDates.size
  }

  const target = Math.max(1, Number(goal.target) || 1)

  return {
    current,
    target,
    remaining: Math.max(0, target - current),
    percentage: Math.min(100, Math.round((current / target) * 100)),
  }
}

const getGoalTitle = (type) => {
  const titles = {
    [GOAL_TYPES.BOOKS_COMPLETED]: 'Books completed',
    [GOAL_TYPES.PAGES_READ]: 'Pages read',
    [GOAL_TYPES.READING_DAYS]: 'Reading days',
  }

  return titles[type] || 'Reading goal'
}

const getGoalPeriodLabel = (goal) => {
  if (goal.period === GOAL_PERIODS.MONTHLY) {
    const date = new Date(Number(goal.year), Number(goal.month) - 1, 1)

    return new Intl.DateTimeFormat('en', {
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  return `${goal.year} annual goal`
}

/* ---------------------------------------------------------
   REUSABLE DASHBOARD COMPONENTS
   --------------------------------------------------------- */

function MetricCard({ icon: Icon, label, value, description }) {
  return (
    <article className="min-w-0 rounded-xl border border-border bg-surface p-3 shadow-sm sm:rounded-2xl sm:p-5">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-secondary sm:text-sm">
            {label}
          </p>

          <p className="mt-1.5 break-words font-display text-xl font-semibold leading-tight text-text-primary sm:mt-2 sm:text-2xl">
            {value}
          </p>

          {description ? (
            <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-text-muted sm:text-xs">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-secondary text-walnut sm:h-11 sm:w-11 sm:rounded-xl">
          <Icon aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
    </article>
  )
}

function SectionHeading({ title, link, linkLabel = 'View all' }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4 sm:gap-3">
      <h2 className="font-display text-base font-semibold text-text-primary sm:text-lg">
        {title}
      </h2>

      {link ? (
        <Link
          to={link}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-walnut transition-colors hover:text-cognac sm:text-sm"
        >
          {linkLabel}
          <ArrowRight
            aria-hidden="true"
            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
          />
        </Link>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------
   DASHBOARD BUTTON STYLES
   --------------------------------------------------------- */

const DASHBOARD_BUTTON_BASE = [
  'inline-flex min-h-10 items-center justify-center gap-2',
  'rounded-xl px-4 py-2 text-sm font-semibold',
  'transition-all duration-200 ease-out',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
  'active:scale-[0.98]',
  'sm:min-h-11 sm:px-5',
].join(' ')

const DASHBOARD_BUTTON_PRIMARY = [
  'border border-transparent bg-primary text-text-inverse shadow-sm',
  'hover:bg-primary-hover hover:shadow-md',
].join(' ')

const DASHBOARD_BUTTON_OUTLINE = [
  'border border-border-strong bg-surface text-text-primary',
  'hover:border-caramel hover:bg-surface-secondary',
].join(' ')

/* ---------------------------------------------------------
   DASHBOARD
   --------------------------------------------------------- */

function Dashboard() {
  // Read the existing Redux state.
  const books = useAppSelector((state) => state.books?.items ?? [])
  const sessions = useAppSelector((state) => state.sessions?.items ?? [])
  const goals = useAppSelector((state) => state.goals?.items ?? [])

  // Use shared statistics.
  const statistics = useReadingStats()

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Currently reading books.
  const currentlyReading = books
    .filter((book) => book.status === BOOK_STATUS.READING)
    .sort((a, b) => {
      return String(b.dateStarted || '').localeCompare(
        String(a.dateStarted || ''),
      )
    })

  // Most recently added books.
  const recentlyAdded = [...books]
    .sort((a, b) => {
      return String(b.dateAdded || '').localeCompare(String(a.dateAdded || ''))
    })
    .slice(0, 3)

  // Most recently completed books.
  const recentlyCompleted = books
    .filter((book) => book.status === BOOK_STATUS.COMPLETED)
    .sort((a, b) => {
      return String(b.dateCompleted || '').localeCompare(
        String(a.dateCompleted || ''),
      )
    })
    .slice(0, 4)

  // Find a goal belonging to the current month or year.
  const activeGoal =
    goals
      .filter((goal) => {
        if (Number(goal.year) !== currentYear) return false

        if (goal.period === GOAL_PERIODS.MONTHLY) {
          return Number(goal.month) === currentMonth
        }

        return goal.period === GOAL_PERIODS.ANNUAL
      })
      .sort((a, b) => {
        return String(b.createdAt || '').localeCompare(
          String(a.createdAt || ''),
        )
      })[0] || null

  const goalProgress = activeGoal
    ? getGoalProgress(activeGoal, books, sessions)
    : null

  return (
    <div className="w-full">
      {/* PAGE HEADER */}
      <PageHeader
        eyebrow="Your reading space"
        title="Welcome back"
        description="A little progress, one page at a time. Here's your reading overview."
        className="mb-5 gap-3 sm:mb-8 sm:gap-4"
        titleClassName="text-2xl sm:text-3xl"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/library"
              className={`${DASHBOARD_BUTTON_BASE} ${DASHBOARD_BUTTON_OUTLINE}`}
            >
              <BookPlus aria-hidden="true" className="h-4 w-4 shrink-0" />
              Add a book
            </Link>

            <Link
              to="/tracker"
              className={`${DASHBOARD_BUTTON_BASE} ${DASHBOARD_BUTTON_PRIMARY}`}
            >
              <BookMarked aria-hidden="true" className="h-4 w-4 shrink-0" />
              Log reading
            </Link>
          </div>
        }
      />

      {/* OVERVIEW STATISTICS */}
      <section className="mb-6 sm:mb-8">
        <div className="mb-3 sm:mb-4">
          <h2 className="font-display text-base font-semibold text-text-primary sm:text-lg">
            Your reading overview
          </h2>

          <p className="mt-1 text-xs text-text-secondary sm:text-sm">
            A snapshot of your reading journey.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
          <MetricCard
            icon={BookOpen}
            label="Total books"
            value={formatNumber(statistics.totalBooks)}
            description="Books in your library"
          />

          <MetricCard
            icon={BookCheck}
            label="Books completed"
            value={formatNumber(statistics.completedBooks)}
            description="Finished reading"
          />

          <MetricCard
            icon={BookMarked}
            label="Pages read"
            value={formatNumber(statistics.pagesRead)}
            description={`${formatReadingTime(statistics.readingMinutes)} spent reading`}
          />

          <MetricCard
            icon={Flame}
            label="Reading streak"
            value={`${statistics.readingStreak} ${statistics.readingStreak === 1 ? 'day' : 'days'}`}
            description="Consecutive reading days"
          />
        </div>
      </section>

      {/* CURRENTLY READING */}
      <section className="mb-6 sm:mb-8">
        <SectionHeading
          title="Currently reading"
          link="/library"
          linkLabel="My library"
        />

        {currentlyReading.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nothing on your reading list right now"
            description="Choose a book from your library and start your next reading journey."
            action={
              <Link
                to="/library"
                className={`${DASHBOARD_BUTTON_BASE} ${DASHBOARD_BUTTON_PRIMARY} mt-4 sm:mt-5`}
              >
                Explore my library
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-3">
            {currentlyReading.slice(0, 3).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* READING GOAL */}
      <section className="mb-6 sm:mb-8">
        <SectionHeading
          title="Your reading goal"
          link="/goals"
          linkLabel="Manage goals"
        />

        {!activeGoal || !goalProgress ? (
          <EmptyState
            icon={Target}
            title="Set your next reading goal"
            description="Choose a monthly or annual target and keep track of your progress."
            action={
              <Link
                to="/goals"
                className={`${DASHBOARD_BUTTON_BASE} ${DASHBOARD_BUTTON_PRIMARY} mt-4 sm:mt-5`}
              >
                Create a goal
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            }
          />
        ) : (
          <article className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:rounded-2xl sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Target
                    aria-hidden="true"
                    className="h-4 w-4 text-cognac sm:h-5 sm:w-5"
                  />

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted sm:text-xs">
                    {getGoalPeriodLabel(activeGoal)}
                  </span>
                </div>

                <h3 className="font-display text-lg font-semibold text-text-primary sm:text-xl">
                  {getGoalTitle(activeGoal.type)}
                </h3>

                <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                  {formatNumber(goalProgress.current)} of{' '}
                  {formatNumber(goalProgress.target)} achieved
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="font-display text-2xl font-semibold text-walnut sm:text-3xl">
                  {goalProgress.percentage}%
                </p>

                <p className="mt-1 text-[10px] text-text-muted sm:text-xs">
                  {goalProgress.remaining === 0
                    ? 'Goal achieved!'
                    : `${formatNumber(goalProgress.remaining)} remaining`}
                </p>
              </div>
            </div>

            <div
              className="mt-4 h-2.5 overflow-hidden rounded-full bg-surface-secondary sm:mt-5 sm:h-3"
              role="progressbar"
              aria-label="Reading goal progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={goalProgress.percentage}
            >
              <div
                className="h-full rounded-full bg-caramel transition-all duration-500"
                style={{ width: `${goalProgress.percentage}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] text-text-muted sm:mt-3 sm:text-xs">
              <span>Keep going</span>
              <Link
                to="/goals"
                className="font-medium text-walnut hover:text-cognac"
              >
                View goal details
              </Link>
            </div>
          </article>
        )}
      </section>

      {/* CHARTS */}
      <section className="mb-6 sm:mb-8">
        <div className="mb-3 sm:mb-4">
          <h2 className="font-display text-base font-semibold text-text-primary sm:text-lg">
            Your reading activity
          </h2>

          <p className="mt-1 text-xs text-text-secondary sm:text-sm">
            Understand your habits and see how your reading develops.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-5 xl:grid-cols-2">
          <ReadingActivityChart data={statistics.weeklyActivity} />

          <GenreDistributionChart data={statistics.genreDistribution} />
        </div>

        <div className="mt-3 sm:mt-5">
          <MonthlyProgressChart data={statistics.monthlyProgress} />
        </div>
      </section>

      {/* RECENTLY ADDED */}
      <section className="mb-6 sm:mb-8">
        <SectionHeading
          title="Recently added"
          link="/library"
          linkLabel="View library"
        />

        {recentlyAdded.length === 0 ? (
          <EmptyState
            icon={BookPlus}
            title="Your library is waiting"
            description="Add your first book to start building your personal collection."
            action={
              <Link
                to="/library"
                className={`${DASHBOARD_BUTTON_BASE} ${DASHBOARD_BUTTON_PRIMARY} mt-4 sm:mt-5`}
              >
                Add your first book
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-3">
            {recentlyAdded.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* RECENTLY COMPLETED */}
      <section className="mb-5 sm:mb-6">
        <SectionHeading
          title="Recently completed"
          link="/library"
          linkLabel="View library"
        />

        {recentlyCompleted.length === 0 ? (
          <EmptyState
            icon={BookCheck}
            title="Your finished books will appear here"
            description="Once you complete a book, you'll find it in this section."
            className="py-6 sm:py-8"
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm sm:rounded-2xl">
            {recentlyCompleted.map((book, index) => (
              <Link
                key={book.id}
                to={`/books/${encodeURIComponent(book.id)}`}
                className={[
                  'flex items-center justify-between gap-2 p-3 transition-colors hover:bg-surface-secondary/50 sm:gap-4 sm:p-4',
                  index > 0 ? 'border-t border-border' : '',
                ].join(' ')}
              >
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-secondary text-walnut sm:h-10 sm:w-10 sm:rounded-xl">
                    <BookCheck
                      aria-hidden="true"
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-xs font-semibold text-text-primary sm:text-sm">
                      {book.title}
                    </h3>

                    <p className="mt-0.5 truncate text-[10px] text-text-secondary sm:text-xs">
                      {book.author || 'Unknown author'}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <span className="hidden text-xs text-text-muted sm:inline">
                    {formatDate(book.dateCompleted) || 'Completed'}
                  </span>

                  <ArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-text-muted sm:h-4 sm:w-4"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Dashboard

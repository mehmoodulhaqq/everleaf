import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import EmptyState from '../common/EmptyState'

const CHART_COLORS = [
  '#76513B',
  '#A77B59',
  '#C49A72',
  '#D8B997',
  '#493126',
  '#B58B70',
  '#E6D4BC',
]

const formatNumber = (value) => Number(value || 0).toLocaleString()

const formatDay = (value) => {
  if (!value) return ''

  const date = new Date(`${value}T12:00:00`)

  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
  }).format(date)
}

const formatMonth = (value) => {
  if (!value) return ''

  const date = new Date(`${value}-01T12:00:00`)

  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
  }).format(date)
}

const ChartCard = ({ title, description, children }) => (
  <section className="min-w-0 rounded-xl border border-border bg-surface p-3 shadow-sm sm:rounded-2xl sm:p-5">
    <div className="mb-3 sm:mb-5">
      <h3 className="font-display text-base font-semibold text-text-primary sm:text-lg">
        {title}
      </h3>

      {description ? (
        <p className="mt-1 text-xs text-text-secondary sm:text-sm">
          {description}
        </p>
      ) : null}
    </div>

    {children}
  </section>
)

function StatisticsBreakdown({ statistics = {} }) {
  const weeklyActivity = Array.isArray(statistics.weeklyActivity)
    ? statistics.weeklyActivity
    : []

  const monthlyProgress = Array.isArray(statistics.monthlyProgress)
    ? statistics.monthlyProgress
    : []

  const genreDistribution = Array.isArray(statistics.genreDistribution)
    ? statistics.genreDistribution
    : []

  const hasWeeklyActivity = weeklyActivity.some(
    (item) => Number(item.pagesRead) > 0 || Number(item.durationMinutes) > 0,
  )

  const hasMonthlyActivity = monthlyProgress.some(
    (item) => Number(item.pagesRead) > 0,
  )

  return (
    <section className="space-y-4 sm:space-y-5">
      <div>
        <h2 className="font-display text-lg font-semibold text-text-primary sm:text-xl">
          Reading insights
        </h2>

        <p className="mt-1 text-xs text-text-secondary sm:text-sm">
          Explore how your reading activity changes over time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-5 xl:grid-cols-2">
        <ChartCard
          title="Weekly reading activity"
          description="Pages read each day during the last seven days."
        >
          {hasWeeklyActivity ? (
            <div className="h-56 w-full sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyActivity}
                  margin={{ top: 8, right: 4, left: -22, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="#E6D4BC"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDay}
                    tick={{ fill: '#76513B', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#76513B', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${formatNumber(value)} pages`,
                      'Pages read',
                    ]}
                    labelFormatter={(label) => formatDay(label)}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #E6D4BC',
                    }}
                  />

                  <Bar
                    dataKey="pagesRead"
                    name="Pages read"
                    fill="#A77B59"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={42}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No weekly activity yet"
              description="Record a reading session to see your daily activity here."
              className="border-0 bg-transparent py-6 sm:py-8"
            />
          )}
        </ChartCard>

        <ChartCard
          title="Monthly reading progress"
          description="Pages recorded across the last six months."
        >
          {hasMonthlyActivity ? (
            <div className="h-56 w-full sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyProgress}
                  margin={{ top: 8, right: 4, left: -22, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="#E6D4BC"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tickFormatter={formatMonth}
                    tick={{ fill: '#76513B', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#76513B', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${formatNumber(value)} pages`,
                      'Pages read',
                    ]}
                    labelFormatter={(label) => formatMonth(label)}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #E6D4BC',
                    }}
                  />

                  <Bar
                    dataKey="pagesRead"
                    name="Pages read"
                    fill="#76513B"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={42}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No monthly progress yet"
              description="Your monthly chart will appear after you record reading sessions."
              className="border-0 bg-transparent py-6 sm:py-8"
            />
          )}
        </ChartCard>

        <ChartCard
          title="Your genre distribution"
          description="Books in your library grouped by genre."
        >
          {genreDistribution.length > 0 ? (
            <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-2 sm:gap-3">
              <div className="h-56 min-w-0 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genreDistribution}
                      dataKey="count"
                      nameKey="genre"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {genreDistribution.map((item, index) => (
                        <Cell
                          key={item.genre}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => [
                        `${formatNumber(value)} books`,
                        'Books',
                      ]}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E6D4BC',
                      }}
                    />

                    <Legend
                      verticalAlign="bottom"
                      height={26}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {genreDistribution.map((item, index) => (
                  <div
                    key={item.genre}
                    className="flex items-center justify-between gap-3 text-xs sm:text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />

                      <span className="truncate text-text-secondary">
                        {item.genre}
                      </span>
                    </div>

                    <span className="font-semibold tabular-nums text-text-primary">
                      {formatNumber(item.count)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No genres to display"
              description="Add books to your library to discover your reading preferences."
              className="border-0 bg-transparent py-6 sm:py-8"
            />
          )}
        </ChartCard>

        <ChartCard
          title="Reading session summary"
          description="A few useful numbers from your recorded sessions."
        >
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="rounded-lg bg-surface-secondary p-3 sm:rounded-xl sm:p-4">
              <p className="text-[11px] text-text-secondary sm:text-sm">
                Total sessions
              </p>

              <p className="mt-1.5 font-display text-xl font-semibold text-text-primary sm:mt-2 sm:text-2xl">
                {formatNumber(statistics.sessionCount)}
              </p>
            </div>

            <div className="rounded-lg bg-surface-secondary p-3 sm:rounded-xl sm:p-4">
              <p className="text-[11px] leading-snug text-text-secondary sm:text-sm">
                Average pages per session
              </p>

              <p className="mt-1.5 font-display text-xl font-semibold text-text-primary sm:mt-2 sm:text-2xl">
                {formatNumber(statistics.averagePagesPerSession)}
              </p>
            </div>

            <div className="rounded-lg bg-surface-secondary p-3 sm:rounded-xl sm:p-4">
              <p className="text-[11px] text-text-secondary sm:text-sm">
                Total reading time
              </p>

              <p className="mt-1.5 font-display text-xl font-semibold text-text-primary sm:mt-2 sm:text-2xl">
                {formatNumber(statistics.readingHours)} hrs
              </p>
            </div>

            <div className="rounded-lg bg-surface-secondary p-3 sm:rounded-xl sm:p-4">
              <p className="text-[11px] leading-snug text-text-secondary sm:text-sm">
                Books currently reading
              </p>

              <p className="mt-1.5 font-display text-xl font-semibold text-text-primary sm:mt-2 sm:text-2xl">
                {formatNumber(statistics.currentlyReading)}
              </p>
            </div>
          </div>
        </ChartCard>
      </div>
    </section>
  )
}

export default StatisticsBreakdown

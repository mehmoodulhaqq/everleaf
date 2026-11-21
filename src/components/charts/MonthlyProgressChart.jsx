import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import EmptyState from '../common/EmptyState'

const formatMonth = (value) => {
  if (!value) return ''

  const date = new Date(`${value}-01T00:00:00`)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en', {
    month: 'short',
  }).format(date)
}

const formatTooltipMonth = (value) => {
  if (!value) return ''

  const date = new Date(`${value}-01T00:00:00`)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function MonthlyProgressChart({
  data = [],
  title = 'Monthly reading progress',
  description = 'Pages read during the last six months.',
}) {
  const hasActivity = data.some(
    (item) => Number(item.pagesRead) > 0 || Number(item.sessionsCount) > 0,
  )

  return (
    <section className="min-w-0 rounded-xl border border-border bg-surface p-3 shadow-sm sm:rounded-2xl sm:p-5 lg:p-6">
      {/* CHART HEADER */}
      <div className="mb-3 sm:mb-5">
        <h2 className="font-display text-base font-semibold text-text-primary sm:text-lg">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-relaxed text-text-secondary sm:text-sm">
          {description}
        </p>
      </div>

      {/* CHART CONTENT */}
      {!hasActivity ? (
        <EmptyState
          title="No monthly progress yet"
          description="Your monthly reading progress will appear here after you record reading sessions."
          className="min-h-48 border-0 bg-surface-secondary/40 py-6 sm:min-h-56 sm:py-8"
        />
      ) : (
        <div
          className="h-56 w-full min-w-0 sm:h-64"
          role="img"
          aria-label="Bar chart showing pages read each month"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 4, left: -22, bottom: 0 }}
              barSize={28}
            >
              <CartesianGrid
                stroke="var(--color-border)"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: 'var(--color-text-muted)',
                  fontSize: 10,
                }}
                dy={8}
                interval="preserveStartEnd"
              />

              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: 'var(--color-text-muted)',
                  fontSize: 10,
                }}
                width={32}
              />

              <Tooltip
                cursor={{
                  fill: 'var(--color-surface-secondary)',
                  opacity: 0.45,
                }}
                contentStyle={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  color: 'var(--color-text-primary)',
                  boxShadow: 'var(--shadow-md)',
                  fontSize: '12px',
                }}
                labelStyle={{
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                }}
                labelFormatter={formatTooltipMonth}
                formatter={(value) => [`${value} pages`, 'Pages read']}
              />

              <Bar
                dataKey="pagesRead"
                name="Pages read"
                fill="var(--everleaf-walnut)"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

export default MonthlyProgressChart

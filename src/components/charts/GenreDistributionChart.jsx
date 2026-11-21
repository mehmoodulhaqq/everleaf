import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import EmptyState from '../common/EmptyState'

const CHART_COLORS = [
  'var(--everleaf-walnut)',
  'var(--everleaf-cognac)',
  'var(--everleaf-caramel)',
  '#927E6D',
  '#B99B7B',
  '#D6BFA4',
  '#6E5546',
  '#C6A98B',
]

function GenreDistributionChart({
  data = [],
  title = 'Your reading genres',
  description = 'A breakdown of the books in your library.',
}) {
  const hasData = data.some((item) => Number(item.count) > 0)

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
      {!hasData ? (
        <EmptyState
          title="No genres to display"
          description="Add books to your library to see your genre distribution."
          className="min-h-48 border-0 bg-surface-secondary/40 py-6 sm:min-h-56 sm:py-8"
        />
      ) : (
        <div
          className="h-56 w-full min-w-0 sm:h-64"
          role="img"
          aria-label="Pie chart showing the number of books in each genre"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="genre"
                cx="50%"
                cy="43%"
                innerRadius="27%"
                outerRadius="43%"
                paddingAngle={3}
                stroke="var(--color-surface)"
                strokeWidth={3}
              >
                {data.map((item, index) => (
                  <Cell
                    key={item.genre}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  color: 'var(--color-text-primary)',
                  boxShadow: 'var(--shadow-md)',
                  fontSize: '12px',
                }}
                formatter={(value) => [
                  `${value} ${Number(value) === 1 ? 'book' : 'books'}`,
                  'Books',
                ]}
              />

              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={7}
                wrapperStyle={{
                  fontSize: '11px',
                  lineHeight: '20px',
                  color: 'var(--color-text-secondary)',
                  paddingTop: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

export default GenreDistributionChart

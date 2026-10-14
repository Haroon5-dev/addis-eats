"use client";

import { formatCurrency } from "../../utils/formatCurrency.js";

const CHART = { width: 720, height: 270, left: 94, right: 14, top: 18, bottom: 42 };

function currencyTick(value) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function BarChart({ areas }) {
  const { width, height, left, right, top, bottom } = CHART;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const maximum = Math.max(...areas.map((area) => area.value), 0);
  const tickMaximum = maximum > 0 ? maximum : 1;
  const ticks = Array.from({ length: 5 }, (_, index) => tickMaximum * (4 - index) / 4);
  const slotWidth = areas.length ? chartWidth / areas.length : chartWidth;
  const barWidth = Math.min(48, slotWidth * 0.56);

  return (
    <div className="admin-chart-plot" role="img" aria-label="Bar chart of non-cancelled order value by delivery area">
      <svg aria-hidden="true" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {ticks.map((tick, index) => {
          const y = top + (chartHeight * index / 4);
          return (
            <g key={index}>
              <line className="admin-chart-gridline" x1={left} x2={width - right} y1={y} y2={y} />
              <text className="admin-chart-tick" textAnchor="end" x={left - 8} y={y + 4}>{currencyTick(tick)}</text>
            </g>
          );
        })}
        {areas.map((area, index) => {
          const barHeight = maximum ? (area.value / maximum) * chartHeight : 0;
          const x = left + slotWidth * index + (slotWidth - barWidth) / 2;
          const y = top + chartHeight - barHeight;
          const label = area.name.length > 11 ? `${area.name.slice(0, 10)}…` : area.name;
          return (
            <g key={area.name}>
              <rect className="admin-chart-bar" x={x} y={y} width={barWidth} height={barHeight} rx="5" />
              <text className="admin-chart-x-label" textAnchor="middle" x={x + barWidth / 2} y={height - 13}>{label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function OrdersLineChart({ days }) {
  const { width, height, left, right, top, bottom } = CHART;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const maximum = Math.max(...days.map((day) => day.count), 0);
  const tickMaximum = maximum > 0 ? maximum : 1;
  const ticks = Array.from({ length: 5 }, (_, index) => tickMaximum * (4 - index) / 4);
  const points = days.map((day, index) => ({
    x: left + chartWidth * index / Math.max(days.length - 1, 1),
    y: top + chartHeight - (day.count / tickMaximum) * chartHeight,
    day,
  }));
  const path = points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");

  return (
    <div className="admin-chart-plot" role="img" aria-label="Line chart of orders placed per day over the last seven days">
      <svg aria-hidden="true" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {ticks.map((tick, index) => {
          const y = top + (chartHeight * index / 4);
          return (
            <g key={index}>
              <line className="admin-chart-gridline" x1={left} x2={width - right} y1={y} y2={y} />
              <text className="admin-chart-tick" textAnchor="end" x={left - 8} y={y + 4}>{Math.round(tick)}</text>
            </g>
          );
        })}
        <path className="admin-chart-line" d={path} />
        {points.map(({ x, y, day }) => (
          <g key={day.date}>
            <circle className="admin-chart-point" cx={x} cy={y} r="4.5" />
            <text className="admin-chart-x-label" textAnchor="middle" x={x} y={height - 13}>{day.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function AccessibleDataTable({ caption, headings, rows, emptyMessage }) {
  return (
    <div className="admin-chart-data-wrap">
      <table className="admin-chart-data">
        <caption>{caption}</caption>
        <thead><tr>{headings.map((heading) => <th scope="col" key={heading}>{heading}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((row) => (
            <tr key={row.key}>
              {row.cells.map((cell, index) => index === 0
                ? <th scope="row" key={index}>{cell}</th>
                : <td key={index}>{cell}</td>)}
            </tr>
          )) : <tr><td colSpan={headings.length}>{emptyMessage}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default function RevenueChart({ analytics }) {
  const revenueRows = analytics.orderValueByNeighborhood.map((area) => ({
    key: area.name,
    cells: [area.name, formatCurrency(area.value)],
  }));
  const orderRows = analytics.ordersByDay.map((day) => ({
    key: day.date,
    cells: [day.fullLabel, String(day.count)],
  }));

  return (
    <section className="admin-charts" aria-label="Order analytics">
      <article className="admin-panel admin-chart-card">
        <header className="admin-chart-heading">
          <div>
            <p className="admin-eyebrow">BY DELIVERY AREA</p>
            <h2>Revenue by neighborhood</h2>
            <p>ETB order value · non-cancelled; payments not verified</p>
          </div>
          <span className="admin-chart-mark" aria-hidden="true">ETB</span>
        </header>
        {analytics.orderValueByNeighborhood.length ? (
          <BarChart areas={analytics.orderValueByNeighborhood} />
        ) : (
          <p className="admin-chart-empty" role="status">No order values to chart yet.</p>
        )}
        <AccessibleDataTable
          caption="Non-cancelled order value by neighborhood in Ethiopian Birr; payment is not verified, so this is not confirmed revenue."
          headings={["Neighborhood", "Order value (ETB)"]}
          rows={revenueRows}
          emptyMessage="No neighborhood order values available."
        />
      </article>

      <article className="admin-panel admin-chart-card">
        <header className="admin-chart-heading">
          <div>
            <p className="admin-eyebrow">ORDER VOLUME</p>
            <h2>Orders per day · last 7 days</h2>
            <p>Orders placed · count per day · {analytics.periodLabel} (Addis Ababa)</p>
          </div>
          <span className="admin-chart-mark" aria-hidden="true">7D</span>
        </header>
        {analytics.totalOrdersInPeriod ? (
          <OrdersLineChart days={analytics.ordersByDay} />
        ) : (
          <p className="admin-chart-empty" role="status">No orders were placed in the last 7 days.</p>
        )}
        <AccessibleDataTable
          caption={`Orders placed per day, count, for ${analytics.periodLabel} in the Africa/Addis_Ababa timezone.`}
          headings={["Day", "Orders placed"]}
          rows={orderRows}
          emptyMessage="No order data available."
        />
      </article>
    </section>
  );
}

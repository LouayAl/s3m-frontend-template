// frontend/frontend-template/vite/src/views/dashboard/Default/chart-data/total-growth-bar-chart.jsx
// ==============================|| DASHBOARD - TOTAL GROWTH BAR CHART ||============================== //
const chartOptions = {
  chart: {
    type: 'bar',
    height: 480,
    stacked: true,
    toolbar: { show: true },
    zoom: { enabled: true }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '50%',
      borderRadius: 4
    }
  },
  dataLabels: { enabled: false },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: (val, opts) => {
        const month = opts.w.globals.labels[opts.dataPointIndex];
        if (opts.seriesIndex === 0) { // Top Formation series
          return `${topFormationsByMonth[month]}: ${val} h`;
        } else {
          return `Autres: ${val} h`;
        }
      }
    }
  },
  xaxis: {
    type: 'category',
    categories: [  
      "Jan 2025",
      "Feb 2025",
      "Mar 2025",
      "Apr 2025",
      "May 2025",
      "Jul 2025",
      "Aug 2025",
      "Sep 2025",
      "Oct 2025",
      "Nov 2025",
      "Dec 2025"
    ]
  },
  fill: { type: 'solid' },
  legend: {
    show: true,
    position: 'bottom',
    offsetX: 20,
    labels: { useSeriesColors: false },
    markers: { size: 8, shape: 'square', strokeWidth: 0 },
    itemMargin: { horizontal: 15, vertical: 8 }
  }
};


export default chartOptions;

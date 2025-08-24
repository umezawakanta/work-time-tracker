// Mock for chart.css file
// This prevents Jest from trying to process CSS files

module.exports = {
  // CSS classes as empty strings or objects
  'tooltip-indicator': '',
  'chart-tooltip': '',
  'chart-container': '',
  'chart-legend': '',
  'chart-axis': '',

  // Default export for CSS modules
  default: {},

  // Any other CSS class access
  toString: () => '',

  // For CSS-in-JS style access
  [Symbol.toPrimitive]: () => '',
};

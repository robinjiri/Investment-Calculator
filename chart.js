///------------2026 Pomerancee. All rights reserved.----------------\\\
///------------https://creativecommons.org/licenses/by-nc-sa/4.0/---\\\
///------------Licensed under CC BY-NC-SA 4.0------------------------\\\











/**
 * Chart Management
 * 
 * Handles the initialization and updating of the Chart.js instance.
 */

window.App = window.App || {};

let chartInstance = null;

function getTickLimit() {
    if (window.innerWidth <= 360) return 4;
    return window.innerWidth < 768 ? 6 : 12;
}

function isCompactMobileChart() {
    return window.innerWidth <= 360;
}

function getChartLayoutPadding() {
    if (isCompactMobileChart()) {
        return {
            left: 4,
            right: 8,
            top: 0,
            bottom: 6
        };
    }

    return {
        left: 10,
        right: 20,
        top: 0,
        bottom: 10
    };
}

function getLegendLabelConfig(theme) {
    const compact = isCompactMobileChart();

    return {
        usePointStyle: true,
        boxWidth: compact ? 8 : 10,
        boxHeight: compact ? 8 : 10,
        padding: compact ? 8 : 12,
        color: theme.textColor,
        font: {
            family: "'Inter', sans-serif",
            size: compact ? 10 : 12,
            weight: 500
        }
    };
}

function applyResponsiveChartOptions() {
    if (!chartInstance) return;

    const theme = document.body.classList.contains('light-mode') ? CHART_THEME.light : CHART_THEME.dark;

    chartInstance.options.layout.padding = getChartLayoutPadding();
    chartInstance.options.plugins.legend.labels = getLegendLabelConfig(theme);
    chartInstance.options.scales.x.ticks.maxTicksLimit = getTickLimit();
    chartInstance.options.scales.x.ticks.font = {
        family: "'Inter', sans-serif",
        size: isCompactMobileChart() ? 10 : 12
    };
    chartInstance.options.scales.y.ticks.font = {
        family: "'Inter', sans-serif",
        size: isCompactMobileChart() ? 10 : 12
    };
}

function clearChartInteraction() {
    if (!chartInstance) return;

    chartInstance.setActiveElements([]);
    if (chartInstance.tooltip) {
        chartInstance.tooltip.setActiveElements([], { x: 0, y: 0 });
    }
    chartInstance.update('none');
}

// Theme configuration for the chart
const CHART_THEME = {
    dark: {
        gridColor: '#374151',
        textColor: '#ffffff', // White as requested
        tooltipBg: 'rgba(31, 41, 55, 0.95)',
        tooltipText: '#f9fafb',
        tooltipBorder: '#4b5563',
        investedLineColor: '#ffffff' // White in dark mode
    },
    light: {
        gridColor: '#9ca3af', // Darker gray for better visibility
        textColor: '#000000', // Black as requested
        tooltipBg: 'rgba(255, 255, 255, 0.95)',
        tooltipText: '#111827',
        tooltipBorder: '#e5e7eb',
        investedLineColor: '#1f2937' // Lighter black/dark gray in light mode
    }
};

/**
 * Initializes the chart with empty data.
 * @param {HTMLCanvasElement} canvasContext - The context of the canvas element.
 * @param {boolean} isDarkMode - Initial theme state.
 * @param {string} currency - Initial currency code.
 */
window.App.initChart = function (canvasContext, isDarkMode = true, currency = 'USD') {
    const theme = isDarkMode ? CHART_THEME.dark : CHART_THEME.light;

    chartInstance = new Chart(canvasContext, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Total Invested',
                    data: [],
                    borderColor: theme.investedLineColor, // Theme-aware color
                    backgroundColor: 'rgba(156, 163, 175, 0.2)', // Gray fill
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    fill: false, // Initial state
                    tension: 0.4,

                },
                {
                    label: 'Compound Interest',
                    data: [],
                    borderColor: '#6735c5ff', // Blue
                    backgroundColor: 'rgba(65, 48, 163, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    fill: false, // Initial state
                    tension: 0.4,
                    hidden: true
                },
                {
                    label: 'Potential Portfolio Value',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Benchmark Scenario',
                    data: [],
                    borderColor: '#fbbf24', // Amber 400
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [2, 2],
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    fill: false,
                    tension: 0.4,
                    hidden: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: getChartLayoutPadding()
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                tooltip: {
                    backgroundColor: theme.tooltipBg,
                    titleColor: theme.tooltipText,
                    bodyColor: theme.tooltipText,
                    borderColor: theme.tooltipBorder,
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                },
                legend: {
                    position: 'top',
                    align: 'center',
                    labels: getLegendLabelConfig(theme)
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: getTickLimit(),
                        color: theme.textColor,
                        font: {
                            family: "'Inter', sans-serif",
                            size: isCompactMobileChart() ? 10 : 12
                        },
                        callback: function (value, index, ticks) {
                            const t = window.App.currentTranslation || (window.App.translations && window.App.translations['en']) || { year: 'Year' };
                            const label = this.getLabelForValue(value);
                            return isCompactMobileChart() ? label : t.year + ' ' + label;
                        }
                    },
                },
                y: {
                    grid: {
                        color: theme.gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: theme.textColor,
                        callback: function (value) {
                            return new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: currency,
                                currencyDisplay: 'narrowSymbol',
                                notation: "compact",
                                compactDisplay: "short",
                                maximumFractionDigits: 2
                            }).format(value);
                        },
                        font: {
                            family: "'Inter', sans-serif",
                            size: isCompactMobileChart() ? 10 : 12
                        }
                    },
                    stacked: false,
                    beginAtZero: true
                }
            },
            animation: {
                duration: 750,
                easing: 'easeOutQuart'
            }
        },
        plugins: [{
            id: 'legendMargin',
            beforeInit(chart) {
                const originalFit = chart.legend.fit;
                chart.legend.fit = function fit() {
                    originalFit.bind(chart.legend)();
                    this.height += isCompactMobileChart() ? 18 : 30;
                };
            }
        }]
    });

    const chartCanvas = canvasContext.canvas;
    chartCanvas.addEventListener('touchend', () => {
        requestAnimationFrame(clearChartInteraction);
    }, { passive: true });
    chartCanvas.addEventListener('touchcancel', clearChartInteraction, { passive: true });
    chartCanvas.addEventListener('mouseleave', clearChartInteraction);
    chartCanvas.addEventListener('pointerleave', clearChartInteraction);
    window.addEventListener('scroll', clearChartInteraction, { passive: true });
};

/**
 * Updates the chart with new calculation data.
 * @param {Array<number>} labels - Array of years.
 * @param {Array<number>} totalInvested - Array of total invested amounts.
 * @param {Array<number>} portfolioValue - Array of portfolio values.
 * @param {Array<number>} benchmarkValue - Array of benchmark portfolio values (optional).
 */
window.App.updateChart = function (labels, totalInvested, portfolioValue, benchmarkValue = null) {
    if (!chartInstance) return;

    const t = window.App.currentTranslation || (window.App.translations && window.App.translations['en']) || {
        portfolioValue: 'Potential Portfolio Value',
        totalInvested: 'Total Invested',
        benchmarkScenario: 'Benchmark Scenario',
        compoundInterest: 'Compound Interest'
    };

    chartInstance.data.labels = labels;
    const interestData = portfolioValue.map((val, i) => val - totalInvested[i]);
    const isInterestMode = !chartInstance.data.datasets[1].hidden;

    if (isInterestMode) {
        // Area mode (stacked components)
        chartInstance.data.datasets[0].data = totalInvested;
        chartInstance.data.datasets[0].label = t.totalInvested;
        chartInstance.data.datasets[1].data = interestData;
        chartInstance.data.datasets[1].label = t.compoundInterest || 'Compound Interest';
        chartInstance.data.datasets[2].data = portfolioValue;
        chartInstance.data.datasets[2].label = t.portfolioValue;
    } else {
        // Portfolio mode (standard area)
        chartInstance.data.datasets[0].data = totalInvested;
        chartInstance.data.datasets[0].label = t.totalInvested;
        chartInstance.data.datasets[1].data = []; // Keep empty to skip in tooltip index mode
        chartInstance.data.datasets[1].label = t.compoundInterest || 'Compound Interest';
        chartInstance.data.datasets[2].data = portfolioValue;
        chartInstance.data.datasets[2].label = t.portfolioValue;
    }

    if (benchmarkValue) {
        chartInstance.data.datasets[3].data = benchmarkValue;
        chartInstance.data.datasets[3].hidden = false;
        chartInstance.data.datasets[3].label = t.benchmarkScenario;
    } else {
        chartInstance.data.datasets[3].data = [];
        chartInstance.data.datasets[3].hidden = true;
    }

    chartInstance.update();
};

/**
 * Toggles the chart type between Line and Area (Stacked).
 * @param {string} type - 'line' or 'area'
 */
window.App.toggleChartType = function (type) {
    if (!chartInstance) return;

    if (type === 'area') {
        // Compound Interest Mode: Total Invested (Line) + Compound Interest (Area) + Portfolio (Thick Line)
        chartInstance.data.datasets[0].fill = false; // White dashed line
        chartInstance.data.datasets[0].backgroundColor = 'transparent';
        chartInstance.data.datasets[1].fill = true; // Blue area for interest earned
        chartInstance.data.datasets[1].backgroundColor = 'rgba(59, 130, 246, 0.1)';
        chartInstance.data.datasets[1].hidden = false;
        chartInstance.data.datasets[2].fill = false; // Thick blue line at top
    } else {
        // Portfolio Value Mode: Total Invested (Line) + Portfolio (Area)
        chartInstance.data.datasets[0].fill = false; // White dashed line
        chartInstance.data.datasets[0].backgroundColor = 'transparent';
        chartInstance.data.datasets[1].fill = false;
        chartInstance.data.datasets[1].hidden = true; // Hide interest components
        chartInstance.data.datasets[2].fill = true; // Blue area for Portfolio total
        chartInstance.data.datasets[2].backgroundColor = 'rgba(59, 130, 246, 0.1)';
    }

    // Force re-render with new data distribution
    const { labels, lastResult, benchmark } = window.App.state;
    if (lastResult) {
        window.App.updateChart(
            lastResult.labels,
            lastResult.totalInvested,
            lastResult.portfolioValue,
            benchmark ? benchmark.portfolioValue : null
        );
    }
};

/**
 * Updates chart labels with new translations.
 * @param {object} translations - The translation dictionary for the current language.
 */
window.App.updateChartTranslations = function (translations) {
    if (!chartInstance) return;

    // Update dataset labels
    chartInstance.data.datasets[0].label = translations.totalInvested;
    chartInstance.data.datasets[1].label = translations.compoundInterest;
    chartInstance.data.datasets[2].label = translations.portfolioValue;
    chartInstance.data.datasets[3].label = translations.benchmarkScenario;

    chartInstance.update();
};

/**
 * Updates the chart theme.
 * @param {boolean} isDarkMode - Whether dark mode is active.
 */
window.App.updateChartTheme = function (isDarkMode) {
    if (!chartInstance) return;

    const theme = isDarkMode ? CHART_THEME.dark : CHART_THEME.light;

    // Update Tooltip
    chartInstance.options.plugins.tooltip.backgroundColor = theme.tooltipBg;
    chartInstance.options.plugins.tooltip.titleColor = theme.tooltipText;
    chartInstance.options.plugins.tooltip.bodyColor = theme.tooltipText;
    chartInstance.options.plugins.tooltip.borderColor = theme.tooltipBorder;

    // Update Legend
    chartInstance.options.plugins.legend.labels = getLegendLabelConfig(theme);

    // Update Scales
    chartInstance.options.scales.x.ticks.color = theme.textColor;
    chartInstance.options.scales.y.ticks.color = theme.textColor;
    chartInstance.options.scales.y.grid.color = theme.gridColor;
    
    // Update Dataset Colors
    chartInstance.data.datasets[0].borderColor = theme.investedLineColor;

    chartInstance.update();
};

/**
 * Updates the chart currency.
 * @param {string} currency - The currency code (e.g., 'USD', 'EUR').
 */
window.App.updateChartCurrency = function (currency) {
    if (!chartInstance) return;

    // Update Y axis ticks
    chartInstance.options.scales.y.ticks.callback = function (value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            notation: "compact",
            compactDisplay: "short",
            maximumFractionDigits: 2
        }).format(value);
    };

    // Update Tooltip
    chartInstance.options.plugins.tooltip.callbacks.label = function (context) {
        if (context.datasetIndex === 1 && chartInstance.data.datasets[1].data.length === 0) return null; // Skip interest if no data

        let label = context.dataset.label || '';
        if (label) {
            label += ': ';
        }
        if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(context.parsed.y);
        }
        return label;
    };

    chartInstance.update();
};

// Add resize listener to handle responsive ticks
window.addEventListener('resize', () => {
    if (chartInstance) {
        applyResponsiveChartOptions();
        chartInstance.update('none'); // Update without animation for performance
    }
});

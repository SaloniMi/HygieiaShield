/**
 * ESI Severity Levels with color coding
 */
export const ESI_LEVELS = {
    1: { label: 'Level 1', color: '#dc2626', bgColor: '#fee2e2', name: 'Critical' },
    2: { label: 'Level 2', color: '#ea580c', bgColor: '#ffedd5', name: 'High risk' },
    3: { label: 'Level 3', color: '#f59e0b', bgColor: '#fef3c7', name: 'Moderate risk' },
    4: { label: 'Level 4', color: '#10b981', bgColor: '#d1fae5', name: 'Low risk' },
    5: { label: 'Level 5', color: '#059669', bgColor: '#a7f3d0', name: 'Minimal risk' },
};

export const SEVERITY_COLORS = {
    1: '#dc2626', // Red - Critical
    2: '#ea580c', // Orange - High Risk
    3: '#f59e0b', // Amber - Moderate
    4: '#10b981', // Green - Low
    5: '#059669', // Dark Green - Minimal
};

export const SEVERITY_DOT = {
    1: '#dc2626', // Bright red
    2: '#f59e0b', // Amber
    3: '#10b981', // Green
};

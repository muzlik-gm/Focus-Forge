/**
 * Work Health Monitoring System
 * 
 * Based on research about developer work patterns:
 * - Average: 40-44 hours/week (51% of developers)
 * - Healthy coding time: 3-4 hours of deep focus per day
 * - Overwork threshold: 45+ hours/week (38% of developers)
 * - Burnout risk: 50-60+ hours/week
 */

export interface WorkHealthMetrics {
  todayHours: number;
  weekHours: number;
  deepFocusToday: number;
  deepFocusWeek: number;
  status: 'healthy' | 'warning' | 'danger' | 'excellent';
  message: string;
  recommendations: string[];
  color: string;
}

export interface HealthThresholds {
  // Daily thresholds (hours)
  dailyHealthy: number;
  dailyWarning: number;
  dailyDanger: number;
  
  // Weekly thresholds (hours)
  weeklyHealthy: number;
  weeklyWarning: number;
  weeklyDanger: number;
  
  // Deep focus thresholds (hours per day)
  focusOptimal: number;
  focusMinimum: number;
}

const DEFAULT_THRESHOLDS: HealthThresholds = {
  dailyHealthy: 8,
  dailyWarning: 10,
  dailyDanger: 12,
  weeklyHealthy: 44,
  weeklyWarning: 50,
  weeklyDanger: 60,
  focusOptimal: 4,
  focusMinimum: 2,
};

export function calculateWorkHealth(
  todayMinutes: number,
  weekMinutes: number,
  thresholds: HealthThresholds = DEFAULT_THRESHOLDS
): WorkHealthMetrics {
  const todayHours = todayMinutes / 60;
  const weekHours = weekMinutes / 60;
  
  // Estimate deep focus time (assuming 40-50% of work time is deep focus)
  const deepFocusToday = todayHours * 0.45;
  const deepFocusWeek = weekHours * 0.45;
  
  // Determine status based on multiple factors
  let status: WorkHealthMetrics['status'] = 'healthy';
  let message = '';
  const recommendations: string[] = [];
  let color = '#10b981'; // green
  
  // Check for overwork (highest priority)
  if (weekHours >= thresholds.weeklyDanger || todayHours >= thresholds.dailyDanger) {
    status = 'danger';
    color = '#ef4444'; // red
    message = '⚠️ Critical: You\'re working too much!';
    recommendations.push('🛑 Stop working immediately and take a break');
    recommendations.push('😴 Get proper sleep (7-9 hours)');
    recommendations.push('🚶 Take a walk or do light exercise');
    recommendations.push('📅 Review your workload and delegate tasks');
    
    if (weekHours >= 60) {
      recommendations.push('🏥 Consider talking to a manager about burnout risk');
    }
  }
  // Check for warning signs
  else if (weekHours >= thresholds.weeklyWarning || todayHours >= thresholds.dailyWarning) {
    status = 'warning';
    color = '#f59e0b'; // orange
    message = '⚡ Warning: Approaching overwork threshold';
    recommendations.push('⏸️ Take regular breaks (Pomodoro technique)');
    recommendations.push('🌙 Ensure you get 7-8 hours of sleep tonight');
    recommendations.push('💧 Stay hydrated and eat healthy meals');
    recommendations.push('📊 Track your hours to avoid burnout');
  }
  // Check for excellent performance
  else if (
    deepFocusToday >= thresholds.focusOptimal - 0.5 &&
    deepFocusToday <= thresholds.focusOptimal + 1 &&
    todayHours <= thresholds.dailyHealthy &&
    weekHours <= thresholds.weeklyHealthy
  ) {
    status = 'excellent';
    color = '#3b82f6'; // blue
    message = '🌟 Excellent! Optimal work-life balance';
    recommendations.push('✨ You\'re in the sweet spot for productivity');
    recommendations.push('🎯 Maintain this pace for sustainable performance');
    recommendations.push('🧘 Keep taking breaks and staying healthy');
  }
  // Healthy range
  else if (todayHours <= thresholds.dailyHealthy && weekHours <= thresholds.weeklyHealthy) {
    status = 'healthy';
    color = '#10b981'; // green
    message = '✅ Healthy work pace';
    
    if (deepFocusToday < thresholds.focusMinimum) {
      recommendations.push('🎯 Try to get 2-4 hours of deep focus work');
      recommendations.push('🔕 Minimize distractions during focus sessions');
    } else {
      recommendations.push('👍 Keep up the good work!');
      recommendations.push('⏰ Remember to take breaks every 90 minutes');
    }
  }
  
  // Add general recommendations based on time of day
  const hour = new Date().getHours();
  if (hour >= 22 || hour <= 5) {
    recommendations.push('🌙 It\'s late! Consider wrapping up for better sleep');
  }
  
  // Add focus-specific recommendations
  if (deepFocusToday < thresholds.focusMinimum && todayHours > 4) {
    recommendations.push('⚠️ Low deep focus ratio - too many meetings/distractions?');
    recommendations.push('📅 Block time for uninterrupted deep work');
  }
  
  return {
    todayHours,
    weekHours,
    deepFocusToday,
    deepFocusWeek,
    status,
    message,
    recommendations,
    color,
  };
}

export function getHealthStatusIcon(status: WorkHealthMetrics['status']): string {
  switch (status) {
    case 'excellent':
      return '🌟';
    case 'healthy':
      return '✅';
    case 'warning':
      return '⚡';
    case 'danger':
      return '⚠️';
  }
}

export function getHealthStatusLabel(status: WorkHealthMetrics['status']): string {
  switch (status) {
    case 'excellent':
      return 'Excellent';
    case 'healthy':
      return 'Healthy';
    case 'warning':
      return 'Warning';
    case 'danger':
      return 'Danger';
  }
}

/**
 * Calculate productivity score based on focus time and work hours
 * Returns a score from 0-100
 */
export function calculateProductivityScore(
  focusMinutes: number,
  totalMinutes: number
): number {
  if (totalMinutes === 0) return 0;
  
  const focusRatio = focusMinutes / totalMinutes;
  const focusHours = focusMinutes / 60;
  
  // Optimal focus is 3-4 hours per day
  let score = 0;
  
  // Base score from focus ratio (0-60 points)
  score += focusRatio * 60;
  
  // Bonus for optimal focus hours (0-40 points)
  if (focusHours >= 3 && focusHours <= 5) {
    score += 40;
  } else if (focusHours >= 2 && focusHours < 3) {
    score += 30;
  } else if (focusHours >= 1 && focusHours < 2) {
    score += 20;
  } else if (focusHours > 5) {
    // Penalty for too much focus (burnout risk)
    score += Math.max(0, 40 - (focusHours - 5) * 5);
  }
  
  return Math.min(100, Math.round(score));
}

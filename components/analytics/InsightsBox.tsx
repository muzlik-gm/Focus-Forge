'use client';

import { useEffect, useState } from 'react';
import { Insight } from '@/lib/insights';

/**
 * InsightsBox Component
 * 
 * Displays AI-generated insights based on productivity patterns.
 * Shows actionable recommendations and observations.
 * 
 * Requirements: 5.5, 28
 */
export function InsightsBox() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/analytics/insights?dateRange=30');
      
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }

      const data = await response.json();
      setInsights(data.insights || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'productivity':
        return '📊';
      case 'distraction':
        return '🎯';
      case 'streak':
        return '🔥';
      case 'time-of-day':
        return '⏰';
      default:
        return '💡';
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-gray-900/50 border border-gray-800 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">💡</span>
          <h2 className="text-xl font-bold text-white">AI Insights</h2>
        </div>
        <div className="text-gray-400">Analyzing your productivity patterns...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-gray-900/50 border border-gray-800 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">💡</span>
          <h2 className="text-xl font-bold text-white">AI Insights</h2>
        </div>
        <div className="text-red-400">Error loading insights: {error}</div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-900/50 border border-gray-800 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">💡</span>
          <h2 className="text-xl font-bold text-white">AI Insights</h2>
        </div>
        <div className="text-gray-400">
          Complete more focus sessions to unlock personalized insights.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gray-900/50 border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-2xl">💡</span>
        <h2 className="text-xl font-bold text-white">AI Insights</h2>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`rounded-xl p-4 border transition-all ${
              insight.actionable
                ? 'bg-blue-900/20 border-blue-800/50 hover:border-blue-700'
                : 'bg-gray-800/30 border-gray-700/50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-xl flex-shrink-0 mt-0.5">
                {getInsightIcon(insight.type)}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white mb-1">
                  {insight.title}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {insight.message}
                </p>
                {insight.actionable && (
                  <div className="mt-2">
                    <span className="inline-flex items-center text-xs font-medium text-blue-400">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                      Actionable
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          Insights are generated based on your last 30 days of focus sessions.
          Keep logging sessions for more accurate recommendations.
        </p>
      </div>
    </div>
  );
}

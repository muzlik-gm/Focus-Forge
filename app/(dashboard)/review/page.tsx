'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Target, Award, Sparkles, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { get, post } from '@/lib/api-client';

interface WeeklyReview {
  weekStart: string;
  totalFocusHours: number;
  tasksCompleted: number;
  streak: number;
  topAchievements: string[];
  missedGoals: string[];
  reflection: string;
  aiSummary?: string;
}

export default function ReviewPage() {
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchWeeklyReview();
  }, []);

  const fetchWeeklyReview = async () => {
    try {
      const weekStart = getWeekStart();
      const res = await get(`/api/reviews/${weekStart}`);
      
      if (res.ok) {
        const data = await res.json();
        setReview(data);
        setReflection(data.reflection || '');
      }
    } catch (error) {
      console.error('Error fetching review:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const saveReflection = async () => {
    try {
      await post('/api/reviews', {
        weekStart: getWeekStart(),
        reflection,
      });
    } catch (error) {
      console.error('Error saving reflection:', error);
    }
  };

  const generateAISummary = async () => {
    setGenerating(true);
    try {
      const res = await post(`/api/reviews/${review?.weekStart}/generate-summary`, {});
      
      if (res.ok) {
        const data = await res.json();
        setReview({ ...review!, aiSummary: data.summary });
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Weekly Review</h1>
        <p className="text-gray-400">Reflect on your progress and plan ahead</p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] border border-white/10 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-400">Total Focus Hours</span>
          </div>
          <p className="text-3xl font-bold">{review?.totalFocusHours.toFixed(1) || '0.0'}h</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.02] border border-white/10 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-400">Tasks Completed</span>
          </div>
          <p className="text-3xl font-bold">{review?.tasksCompleted || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.02] border border-white/10 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-400">Current Streak</span>
          </div>
          <p className="text-3xl font-bold">{review?.streak || 0} days</p>
        </motion.div>
      </div>

      {/* Achievements & Goals */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/[0.02] border border-white/10 rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold">Top Achievements</h2>
          </div>
          <ul className="space-y-2">
            {review?.topAchievements.map((achievement, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                {achievement}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/[0.02] border border-white/10 rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Missed Goals</h2>
          </div>
          <ul className="space-y-2">
            {review?.missedGoals.map((goal, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-orange-500 mt-1">○</span>
                {goal}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Reflection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.02] border border-white/10 rounded-lg p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Your Reflection</h2>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          onBlur={saveReflection}
          placeholder="What went well this week? What could be improved?"
          className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">Auto-saves as you type</p>
      </motion.div>

      {/* AI Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">AI-Generated Summary</h2>
          </div>
          <button
            onClick={generateAISummary}
            disabled={generating}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Summary'}
          </button>
        </div>
        
        {review?.aiSummary ? (
          <p className="text-gray-300 leading-relaxed">{review.aiSummary}</p>
        ) : (
          <p className="text-gray-500 italic">Click &quot;Generate Summary&quot; to get AI-powered insights about your week</p>
        )}
      </motion.div>
    </div>
  );
}

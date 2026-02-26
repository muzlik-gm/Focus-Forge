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
    <div className="max-w-4xl mx-auto space-y-10 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 embossed-text tracking-tight">Weekly Review</h1>
        <p className="text-zinc-300 text-lg">Reflect on your progress and plan ahead</p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="skeuo-panel p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-base font-medium text-zinc-400">Total Focus Hours</span>
          </div>
          <p className="text-4xl font-bold embossed-text text-white mt-4 tracking-tight">{review?.totalFocusHours.toFixed(1) || '0.0'}h</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="skeuo-panel p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-base font-medium text-zinc-400">Tasks Completed</span>
          </div>
          <p className="text-4xl font-bold embossed-text text-white mt-4 tracking-tight">{review?.tasksCompleted || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="skeuo-panel p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-base font-medium text-zinc-400">Current Streak</span>
          </div>
          <p className="text-4xl font-bold embossed-text text-white mt-4 tracking-tight">{review?.streak || 0} days</p>
        </motion.div>
      </div>

      {/* Achievements & Goals */}
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="skeuo-panel p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-xl font-bold embossed-text">Top Achievements</h2>
          </div>
          <ul className="space-y-3">
            {review?.topAchievements.map((achievement, i) => (
              <li key={i} className="flex items-start gap-3 text-base text-zinc-300">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                {achievement}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="skeuo-panel p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold embossed-text">Missed Goals</h2>
          </div>
          <ul className="space-y-3">
            {review?.missedGoals.map((goal, i) => (
              <li key={i} className="flex items-start gap-3 text-base text-zinc-300">
                <span className="text-orange-400 mt-1 font-bold">○</span>
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
        className="skeuo-panel p-8"
      >
        <h2 className="text-xl font-bold mb-6 embossed-text">Your Reflection</h2>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          onBlur={saveReflection}
          placeholder="What went well this week? What could be improved?"
          className="skeuo-input w-full h-32 px-5 py-4 text-white focus:outline-none resize-none"
        />
        <p className="text-sm text-zinc-500 mb-0">Auto-saves as you type</p>
      </motion.div>

      {/* AI Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="skeuo-panel p-8 !border-t-2 !border-t-blue-500"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold embossed-text">AI-Generated Summary</h2>
          </div>
          <button
            onClick={generateAISummary}
            disabled={generating}
            className="skeuo-button px-6 py-3 text-white font-medium shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? 'Generating...' : 'Generate Summary'}
          </button>
        </div>

        {review?.aiSummary ? (
          <p className="text-zinc-300 leading-relaxed text-lg bg-zinc-800/20 p-6 rounded-lg border border-zinc-800/50">{review.aiSummary}</p>
        ) : (
          <p className="text-zinc-500 italic text-lg p-6 flex justify-center border border-dashed border-zinc-700 rounded-lg">Click &quot;Generate Summary&quot; to get AI-powered insights about your week</p>
        )}
      </motion.div>
    </div>
  );
}

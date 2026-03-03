'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor,
  Search,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { tauriApi } from '@/lib/tauri-api';
import type { ApplicationCategory } from '@/types/tauri';

const CATEGORY_COLORS = {
  Productive: 'bg-green-500/20 text-green-400 border-green-500/30',
  Distracting: 'bg-red-500/20 text-red-400 border-red-500/30',
  Neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  Break: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const DEFAULT_CATEGORIES = ['Productive', 'Distracting', 'Neutral', 'Break'];

export default function AppCategoriesPage() {
  const [categories, setCategories] = useState<ApplicationCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ApplicationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingApp, setEditingApp] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    setIsTauri(tauriApi.isTauriEnvironment());
    if (tauriApi.isTauriEnvironment()) {
      loadCategories();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchQuery, filterCategory]);

  const loadCategories = async () => {
    try {
      const allCategories = await tauriApi.categories.listAll();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      showMessage('error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(cat =>
        cat.application.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(cat => cat.category === filterCategory);
    }

    setFilteredCategories(filtered);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleEditStart = (app: string, currentCategory: string) => {
    setEditingApp(app);
    setEditCategory(currentCategory);
  };

  const handleEditSave = async (app: string) => {
    try {
      await tauriApi.categories.setCategory(app, editCategory, !DEFAULT_CATEGORIES.includes(editCategory));
      await loadCategories();
      setEditingApp(null);
      showMessage('success', `Updated ${app} to ${editCategory}`);
    } catch (error) {
      console.error('Error updating category:', error);
      showMessage('error', 'Failed to update category');
    }
  };

  const handleEditCancel = () => {
    setEditingApp(null);
    setEditCategory('');
  };

  const handleDelete = async (app: string) => {
    if (!confirm(`Remove category for ${app}? It will default to Neutral.`)) {
      return;
    }

    try {
      await tauriApi.categories.deleteCategory(app);
      await loadCategories();
      showMessage('success', `Removed category for ${app}`);
    } catch (error) {
      console.error('Error deleting category:', error);
      showMessage('error', 'Failed to delete category');
    }
  };

  const handleAddCustomCategory = async () => {
    if (!customCategory.trim()) {
      showMessage('error', 'Please enter a category name');
      return;
    }

    const appName = prompt('Enter application name:');
    if (!appName) return;

    try {
      await tauriApi.categories.createCustomCategory(appName, customCategory);
      await loadCategories();
      setCustomCategory('');
      setShowAddCustom(false);
      showMessage('success', `Added custom category ${customCategory} for ${appName}`);
    } catch (error) {
      console.error('Error creating custom category:', error);
      showMessage('error', 'Failed to create custom category');
    }
  };

  const handleBulkCategorize = async () => {
    const category = prompt('Enter category to apply (Productive, Distracting, Neutral, Break):');
    if (!category || !DEFAULT_CATEGORIES.includes(category)) {
      showMessage('error', 'Invalid category');
      return;
    }

    const apps = prompt('Enter application names (comma-separated):');
    if (!apps) return;

    const appList = apps.split(',').map(a => a.trim()).filter(a => a);

    try {
      for (const app of appList) {
        await tauriApi.categories.setCategory(app, category, false);
      }
      await loadCategories();
      showMessage('success', `Categorized ${appList.length} applications as ${category}`);
    } catch (error) {
      console.error('Error bulk categorizing:', error);
      showMessage('error', 'Failed to bulk categorize');
    }
  };

  const handleExport = async () => {
    try {
      const data = JSON.stringify(categories, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `app-categories-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showMessage('success', 'Categories exported');
    } catch (error) {
      console.error('Error exporting:', error);
      showMessage('error', 'Failed to export');
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text) as ApplicationCategory[];

        for (const cat of imported) {
          await tauriApi.categories.setCategory(cat.application, cat.category, cat.custom);
        }

        await loadCategories();
        showMessage('success', `Imported ${imported.length} categories`);
      } catch (error) {
        console.error('Error importing:', error);
        showMessage('error', 'Failed to import categories');
      }
    };
    input.click();
  };

  if (!isTauri) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="skeuo-panel p-8">
          <div className="flex items-center gap-4 text-yellow-400">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold embossed-text">Desktop Only Feature</h2>
              <p className="text-zinc-300 mt-2">
                Application categorization is only available in the desktop app.
                Please use the Forgrin desktop application to manage application categories.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold embossed-text mb-2">Application Categories</h1>
        <p className="text-zinc-400">Manage how applications are categorized for focus tracking</p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg ${message.type === 'success'
              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Toolbar */}
      <div className="skeuo-panel p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-zinc-900/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All Categories</option>
              {DEFAULT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowAddCustom(!showAddCustom)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Custom
            </Button>
            <Button
              variant="secondary"
              onClick={handleBulkCategorize}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Bulk
            </Button>
            <Button
              variant="secondary"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              onClick={handleImport}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Add Custom Category Form */}
        {showAddCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-zinc-700"
          >
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Custom category name..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="flex-1 px-4 py-2 bg-zinc-900/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <Button onClick={handleAddCustomCategory}>
                Add
              </Button>
              <Button variant="ghost" onClick={() => setShowAddCustom(false)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Categories List */}
      <div className="skeuo-panel p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <Monitor className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">
              {searchQuery || filterCategory !== 'all'
                ? 'No applications match your filters'
                : 'No applications categorized yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCategories.map((cat) => (
              <motion.div
                key={cat.application}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Monitor className="w-5 h-5 text-zinc-500" />
                  <div className="flex-1">
                    <p className="font-medium">{String(cat.application)}</p>
                    {cat.custom && (
                      <span className="text-xs text-zinc-500">Custom category</span>
                    )}
                  </div>
                </div>

                {editingApp === cat.application ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {DEFAULT_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleEditSave(cat.application)}
                      className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${CATEGORY_COLORS[cat.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.Neutral
                      }`}>
                      {String(cat.category)}
                    </span>
                    <button
                      onClick={() => handleEditStart(cat.application, cat.category)}
                      className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.application)}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {!loading && categories.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {DEFAULT_CATEGORIES.map(cat => {
            const count = categories.filter(c => c.category === cat).length;
            return (
              <div key={cat} className="skeuo-card p-4">
                <p className="text-sm text-zinc-400 mb-1">{cat}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

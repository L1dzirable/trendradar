import { useState, useEffect } from 'react';
import { Bell, Save, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = [
  'AI & Machine Learning',
  'SaaS',
  'Creator Economy',
  'Health & Wellness',
  'Sustainability',
  'FinTech',
  'EdTech',
  'E-commerce',
  'Gaming',
  'Developer Tools'
];

interface AlertPreferences {
  categories: string[];
  min_score: number;
  alert_on_trending: boolean;
  alert_on_emerging: boolean;
}

export function AlertsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState<AlertPreferences>({
    categories: [],
    min_score: 70,
    alert_on_trending: true,
    alert_on_emerging: true
  });

  useEffect(() => {
    loadPreferences();
  }, [user]);

  async function loadPreferences() {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('alert_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          categories: data.categories || [],
          min_score: data.min_score || 70,
          alert_on_trending: data.alert_on_trending ?? true,
          alert_on_emerging: data.alert_on_emerging ?? true
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  }

  async function savePreferences() {
    if (!user) return;

    setSaving(true);
    setSaved(false);

    try {
      const { error } = await supabase
        .from('alert_preferences')
        .upsert({
          user_id: user.id,
          categories: preferences.categories,
          min_score: preferences.min_score,
          alert_on_trending: preferences.alert_on_trending,
          alert_on_emerging: preferences.alert_on_emerging,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  }

  function toggleCategory(category: string) {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to configure your alert preferences.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Alert Preferences
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure when and how you want to be notified about new opportunities
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Categories
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select the categories you're interested in
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    preferences.categories.includes(category)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Minimum Trend Score
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Only alert me about opportunities with a score of {preferences.min_score}+ out of 100
            </p>
            <div className="space-y-2">
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={preferences.min_score}
                onChange={(e) => setPreferences(prev => ({ ...prev, min_score: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>50</span>
                <span>95</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Alert Types
            </h2>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.alert_on_trending}
                  onChange={(e) => setPreferences(prev => ({ ...prev, alert_on_trending: e.target.checked }))}
                  className="mt-1 w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Trending Opportunities
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Notify me when opportunities are gaining momentum
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.alert_on_emerging}
                  onChange={(e) => setPreferences(prev => ({ ...prev, alert_on_emerging: e.target.checked }))}
                  className="mt-1 w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Emerging Opportunities
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Notify me about new opportunities as soon as they're discovered
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={savePreferences}
              disabled={saving || saved}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

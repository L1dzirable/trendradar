import { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, Heart, LogIn, LogOut, User, Crown, Trophy, Bell, Database, Rocket } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { UpgradeModal } from './UpgradeModal';
import { getUserProfile } from '../lib/subscription';
import { UserProfile } from '../types/subscription';

interface HeaderProps {
  currentPage: 'home' | 'favorites' | 'pricing' | 'leaderboard' | 'alerts' | 'database' | 'projects';
  onNavigate: (page: 'home' | 'favorites' | 'pricing' | 'leaderboard' | 'alerts' | 'database' | 'projects') => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  async function loadProfile() {
    const userProfile = await getUserProfile();
    setProfile(userProfile);
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                TrendRadar
              </h1>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('database')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  currentPage === 'database'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Database</span>
              </button>

              <button
                onClick={() => onNavigate('leaderboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  currentPage === 'leaderboard'
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Top</span>
              </button>

              {user && (
                <>
                  <button
                    onClick={() => onNavigate('projects')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                      currentPage === 'projects'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Rocket className="w-4 h-4" />
                    <span className="hidden sm:inline">Projects</span>
                  </button>

                  <button
                    onClick={() => onNavigate('alerts')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                      currentPage === 'alerts'
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    <span className="hidden sm:inline">Alerts</span>
                  </button>
                </>
              )}

              <button
                onClick={() => onNavigate('pricing')}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  currentPage === 'pricing'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Pricing
              </button>

              {user && (
                <button
                  onClick={() => onNavigate('favorites')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'favorites'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${currentPage === 'favorites' ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline font-medium">Favorites</span>
                </button>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-800">
                  {profile?.subscription_status !== 'pro' && (
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
                    >
                      <Crown className="w-4 h-4" />
                      <span className="font-medium">Upgrade to Pro</span>
                    </button>
                  )}
                  {profile?.subscription_status === 'pro' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg">
                      <Crown className="w-4 h-4" />
                      <span className="text-sm font-medium">Pro</span>
                    </div>
                  )}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden sm:inline font-medium">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-2 ml-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="font-medium">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
    </>
  );
}

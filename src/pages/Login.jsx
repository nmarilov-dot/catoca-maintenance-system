import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Lock, User, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Принудительно устанавливаем португальский для страницы входа
    i18n.changeLanguage('pt');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent-yellow/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-dark-surface border border-dark-border rounded-2xl shadow-2xl p-8 relative z-10 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-10">
          <Logo variant="themed" />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-accent-red/10 border border-accent-red/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-accent-red shrink-0 w-5 h-5" />
            <p className="text-accent-red text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm text-text-muted font-medium ml-1">{t('login.login_label')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-text-main placeholder-gray-600"
                placeholder="admin / chefe / dispacho / user"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-text-muted font-medium ml-1">{t('login.password_label')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-text-main placeholder-gray-600"
                placeholder="••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors focus:ring-4 focus:ring-primary/50 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              t('login.submit')
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-dark-border pt-6">
          <p className="text-xs text-text-muted">
            {t('login.footer_text')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

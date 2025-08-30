import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { login } from '@/services/api/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';
import { Eye, EyeOff, Loader2, AlertCircle, Mail, Lock, Shield, CheckCircle } from 'lucide-react';
import { useAnalytics } from '@/lib/analytics';
import { useTranslation } from 'react-i18next';

// (Removed legacy mock globals)

export default function Login() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  // Offline/test modes are not supported to avoid mock-like behavior

  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthenticated, isAuthenticated, refreshAuth, setUser } = useAuth();
  const { user } = useAuth() as any;
  const { identifyUser, trackEvent } = useAnalytics();

  // リダイレクト先を取得（PrivateRouteから渡される）
  const from = location.state?.from?.pathname || '/';
  const message = location.state?.message;
  const sessionExpired = location.state?.sessionExpired;

  // 既にログイン済みの場合はリダイレクト（管理者は /admin 優先）
  useEffect(() => {
    if (!isAuthenticated) return;
    const isAdmin = Boolean((user as any)?.isAdmin) || (user as any)?.role === 'admin';
    const target = isAdmin || from === '/admin' ? '/admin' : from;
    navigate(target, { replace: true });
  }, [isAuthenticated, user, navigate, from]);

  // 登録完了メッセージの表示
  useEffect(() => {
    if (message) {
      toast.success(message);
      if (location.state?.email) {
        setFormData((prev) => ({ ...prev, email: location.state.email }));
      }
    }

    // セッション期限切れメッセージ
    if (sessionExpired) {
      toast.error('セッションが期限切れになりました。再度ログインしてください。', {
        duration: 5000,
      });
    }
  }, [message, sessionExpired, location.state]);

  // Remember Meの状態を復元
  useEffect(() => {
    // Ensure submit button is not stuck disabled on hot-reload
    setIsSubmitting(false);

    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

    if (savedEmail && savedRememberMe) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Relaxed validation for local development to ensure requests are sent
    const isDevHost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isDevHost) {
      if (!formData.email.trim()) newErrors.email = 'メールアドレスを入力してください';
      if (!formData.password || formData.password.length < 1)
        newErrors.password = 'パスワードを入力してください';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '正しいメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    console.log('🔐 Login form submission started');
    console.log('  - Form data:', {
      email: formData.email,
      passwordLength: formData.password.length,
    });
    console.log('  - Remember me:', rememberMe);
    console.log('  - Current URL:', window.location.href);

    if (!validateForm()) {
      console.log('❌ Form validation failed', errors, formData);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      console.log('🚀 Calling login API...');
      const loginResponse = await login(formData.email.trim(), formData.password, rememberMe);

      console.log('✅ Login API call successful');
      console.log('  - Response received:', !!loginResponse);
      console.log('  - User data:', loginResponse.user);

      // Remember Me 機能（Emailの保存のみローカルで実行）
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email.trim());
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      toast.success('ログインに成功しました');

      // Save token locally and reflect immediately for API client
      if ((loginResponse as any)?.token) {
        localStorage.setItem('access_token', (loginResponse as any).token);
        try {
          const { api } = await import('@/services/api/apiConfig');
          (api.defaults.headers as any).common = (api.defaults.headers as any).common || {};
          (api.defaults.headers as any).common.Authorization =
            `Bearer ${(loginResponse as any).token}`;
          const masked = `Bearer ${String((loginResponse as any).token).slice(0, 12)}...`;
          (window as any).__API_AUTH_HEADER__ = masked;
          console.log('🔗 Authorization header set for API client (masked):', masked);
        } catch (e) {
          console.warn('Failed to set API default Authorization header:', e);
        }
      }

      if (loginResponse.user) setUser(loginResponse.user);
      try {
        const uid =
          (loginResponse as any)?.user?.id || (loginResponse as any)?.userId || formData.email;
        identifyUser(uid, { email: formData.email });
        trackEvent('login_success', { method: 'password' });
      } catch {}

      console.log('🔄 Setting authenticated state...');
      setIsAuthenticated(true);

      // refreshAuthは呼ばない（すでにユーザー情報とトークンは設定済み）
      console.log('✅ Login complete - user and tokens set');

      // ログイン成功後の遷移先決定（post_login_redirect を最優先）
      const stored = sessionStorage.getItem('post_login_redirect');
      if (stored) {
        sessionStorage.removeItem('post_login_redirect');
      }
      const isAdmin = (u?: any) => Boolean(u?.isAdmin) || u?.role === 'admin';
      const target = stored || (isAdmin(user as any) || from === '/admin' ? '/admin' : from);
      console.log('🔀 Redirecting to:', target);
      navigate(target, { replace: true });
    } catch (error) {
      console.error('❌ Login submission error:', error);
      if (error instanceof Error) {
        console.error('  - Error details:', {
          name: error.name,
          message: error.message,
        });
      }
      if (error instanceof AxiosError) {
        console.error('  - Axios Error details:', {
          code: error.code,
          status: error.response?.status,
          responseData: error.response?.data,
        });
      }

      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message;
        const statusCode = error.response?.status;

        // ネットワークエラーまたはサーバー接続エラーの場合
        if (!error.response || error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
          setErrors({
            general: 'サーバーに接続できません。ネットワーク接続を確認してください。',
          });
          // Do not enable any offline login
        } else if (statusCode === 401) {
          const hintMessage = error.response?.data?.hint;
          const _availableAccounts = error.response?.data?.availableAccounts;

          if (hintMessage) {
            setErrors({
              general: `${error.response?.data?.message}\n\n${hintMessage}`,
            });
          } else {
            setErrors({ general: 'メールアドレスまたはパスワードが正しくありません' });
          }
        } else if (statusCode === 429) {
          setErrors({
            general: 'ログイン試行回数が上限に達しました。しばらく時間をおいてからお試しください',
          });
        } else if (statusCode === 423) {
          setErrors({
            general: 'アカウントがロックされています。サポートにお問い合わせください',
          });
        } else {
          setErrors({ general: errorMessage || 'ログインに失敗しました' });
        }
      } else {
        setErrors({ general: '不明なエラーが発生しました' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // エラーをクリア
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  return (
    <>
      <style>
        {`
          /* ログイン画面専用のスタイル */
          .login-page * {
            color: #111827;
          }
          
          .login-page .bg-card {
            background-color: white !important;
          }
          
          .login-page [class*="card"] {
            background-color: white !important;
          }
          
          .login-page input {
            color: #111827 !important;
            background-color: white !important;
          }
          
          .login-page input::placeholder {
            color: #9ca3af !important;
          }
          
          .login-page input:-webkit-autofill,
          .login-page input:-webkit-autofill:hover,
          .login-page input:-webkit-autofill:focus {
            -webkit-text-fill-color: #111827 !important;
            -webkit-box-shadow: 0 0 0px 1000px white inset !important;
            background-color: white !important;
          }
          
          .login-page label {
            color: #374151 !important;
          }
          
          .login-page h3 {
            color: #111827 !important;
          }
          
          .login-page p {
            color: #4b5563 !important;
          }
          
          .login-page .text-blue-600 {
            color: #2563eb !important;
          }
          
          .login-page a {
            color: #2563eb !important;
            text-decoration: none;
          }
          
          .login-page a:hover {
            text-decoration: underline;
          }
          
          .login-page .text-gray-500 {
            color: #6b7280 !important;
          }
          
          .login-page .text-gray-600 {
            color: #4b5563 !important;
          }
          
          .login-page .text-gray-700 {
            color: #374151 !important;
          }
          
          .login-page .text-gray-900 {
            color: #111827 !important;
          }
          
          .login-page .text-red-600 {
            color: #dc2626 !important;
          }
          
          .login-page .text-red-700 {
            color: #b91c1c !important;
          }
          
          .login-page .text-blue-700 {
            color: #1d4ed8 !important;
          }
          
          .login-page .text-orange-600 {
            color: #ea580c !important;
          }
          
          .login-page .text-orange-700 {
            color: #c2410c !important;
          }
          
          /* チェックボックスのスタイル */
          .login-page input[type="checkbox"] {
            border: 1px solid #d1d5db !important;
            background-color: white !important;
          }
          
          .login-page input[type="checkbox"]:checked {
            background-color: #3b82f6 !important;
            border-color: #3b82f6 !important;
          }
          
          .login-page [role="checkbox"] {
            border: 1px solid #d1d5db !important;
            background-color: white !important;
          }
          
          .login-page [role="checkbox"][data-state="checked"] {
            background-color: #3b82f6 !important;
            border-color: #3b82f6 !important;
          }
          
          .login-page [role="checkbox"] svg {
            color: white !important;
          }
          
          /* ボタンのスタイル */
          .login-page button:not([class*="outline"]) {
            background-color: #3b82f6 !important;
            color: white !important;
          }
          
          .login-page button:not([class*="outline"]):hover {
            background-color: #2563eb !important;
          }
          
          .login-page button[class*="outline"] {
            background-color: transparent !important;
            color: #2563eb !important;
            border: 1px solid #2563eb !important;
          }
          
          .login-page button[class*="outline"]:hover {
            background-color: #eff6ff !important;
          }
          
          .login-page button:disabled {
            opacity: 0.5 !important;
            cursor: not-allowed !important;
          }
          
          /* SVGアイコンのスタイル */
          .login-page svg {
            color: currentColor;
          }
          
          .login-page .text-blue-600 svg {
            color: #2563eb !important;
          }
          
          .login-page .text-red-600 svg {
            color: #dc2626 !important;
          }
          
          .login-page .text-orange-600 svg {
            color: #ea580c !important;
          }
          
          .login-page button svg {
            color: white !important;
          }
          
          .login-page button[class*="outline"] svg {
            color: #2563eb !important;
          }
          
          /* アラートメッセージのスタイル */
          .login-page .alert {
            background-color: #fef3c7 !important;
            border-color: #fbbf24 !important;
          }
          
          .login-page .alert-description {
            color: #92400e !important;
          }
        `}
      </style>
      <div className="login-page min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              {t('auth.login.title', 'ログイン')}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t('auth.login.subtitle', 'Work Time Trackerにアクセス')}
            </CardDescription>
            {from !== '/' && (
              <Alert className="mt-4 border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  {t('auth.login.requireLogin', 'このページにアクセスするにはログインが必要です')}
                </AlertDescription>
              </Alert>
            )}
            {sessionExpired && (
              <Alert className="mt-4 border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-700">
                  {t('auth.login.sessionExpired', 'セッションが期限切れになりました')}
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errors.general && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* メールアドレスフィールド */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  <Mail className="inline-block w-4 h-4 mr-1" />
                  {t('auth.login.email', 'メールアドレス')}
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-4 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                    placeholder="メールアドレスを入力"
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                  {formData.email && !errors.email && (
                    <div className="absolute right-3 top-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* パスワードフィールド */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  <Lock className="inline-block w-4 h-4 mr-1" />
                  {t('auth.login.password', 'パスワード')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-4 pr-12 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                    placeholder="パスワードを入力"
                    disabled={isSubmitting}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me チェックボックス */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer">
                    {t('auth.login.remember', 'ログイン状態を保持する')}
                  </Label>
                </div>

                {/* パスワードを忘れた場合のリンク */}
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  {t('auth.login.forgot', 'パスワードをお忘れですか？')}
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-testid="login-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('auth.login.loggingIn', 'ログイン中...')}
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    {t('auth.login.submit', 'ログイン')}
                  </>
                )}
              </Button>

              {/* Alternative login UI removed */}

              <div className="text-center text-sm text-gray-600">
                {t('auth.login.noAccount', 'アカウントをお持ちでない方は')}
                <Link to="/register" className="text-blue-600 hover:underline ml-1">
                  {t('auth.login.register', 'こちらから登録')}
                </Link>
              </div>

              {/* セキュリティ情報 */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  {t('auth.login.secureNotice', 'このサイトは SSL暗号化通信により保護されています')}
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}

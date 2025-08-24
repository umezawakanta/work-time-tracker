import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword, verifyResetToken } from '@/services/api/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Shield,
  Key,
  X,
} from 'lucide-react';

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState<ResetPasswordForm>({
    password: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    token?: string;
    general?: string;
  }>({});

  // パスワード強度チェック
  const checkPasswordStrength = (password: string): number => {
    if (password.length === 0) return 0;

    let score = 0;
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (/[a-z]/.test(password)) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

    return Math.min(score, 100);
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 40) return '弱い';
    if (strength < 70) return '普通';
    return '強い';
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 40) return 'text-red-600';
    if (strength < 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  // トークン検証
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setErrors({ token: 'リセットトークンが無効です' });
        setIsVerifyingToken(false);
        return;
      }

      try {
        await verifyResetToken(token);
        setTokenValid(true);
      } catch (error) {
        console.error('Token verification failed:', error);

        if (error instanceof AxiosError) {
          const statusCode = error.response?.status;
          if (statusCode === 400) {
            setErrors({ token: 'リセットトークンが無効または期限切れです' });
          } else if (statusCode === 404) {
            setErrors({ token: 'リセットトークンが見つかりません' });
          } else {
            setErrors({ token: 'トークンの検証に失敗しました' });
          }
        } else {
          setErrors({ token: '不明なエラーが発生しました' });
        }
      } finally {
        setIsVerifyingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  // パスワード強度の更新
  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(formData.password));
  }, [formData.password]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください';
    } else if (passwordStrength < 60) {
      newErrors.password = 'より強力なパスワードを設定してください';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワード確認を入力してください';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await resetPassword(token!, formData.password);
      toast.success('パスワードが正常に変更されました');

      // 成功後ログインページにリダイレクト
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'パスワードが変更されました。新しいパスワードでログインしてください。',
          },
        });
      }, 2000);
    } catch (error) {
      console.error('パスワードリセットエラー:', error);

      if (error instanceof AxiosError) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.message;

        if (statusCode === 400) {
          setErrors({ general: 'リセットトークンが無効または期限切れです' });
        } else if (statusCode === 422) {
          setErrors({ password: 'パスワードが要件を満たしていません' });
        } else {
          setErrors({ general: errorMessage || 'パスワードの変更に失敗しました' });
        }
      } else {
        setErrors({ general: '不明なエラーが発生しました' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ResetPasswordForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // エラーをクリア
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  // トークン検証中
  if (isVerifyingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">リセットトークンを確認しています...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // トークンが無効な場合
  if (!tokenValid || errors.token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              リセットリンクが無効です
            </CardTitle>
            <CardDescription className="text-gray-600">
              パスワードリセットのリンクが無効または期限切れです
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{errors.token}</AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Link to="/forgot-password" className="w-full">
              <Button className="w-full">
                <Key className="h-4 w-4 mr-2" />
                新しいリセットリンクを要求
              </Button>
            </Link>

            <Link to="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ログインページに戻る
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">新しいパスワードを設定</CardTitle>
          <CardDescription className="text-gray-600">
            アカウントの新しいパスワードを入力してください
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errors.general && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{errors.general}</AlertDescription>
              </Alert>
            )}

            {/* 新しいパスワード */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                <Lock className="inline-block w-4 h-4 mr-1" />
                新しいパスワード
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPasswords.password ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-4 pr-12 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="8文字以上の安全なパスワード"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, password: !prev.password }))
                  }
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showPasswords.password ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* パスワード強度インジケーター */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">パスワード強度:</span>
                    <span className={`font-medium ${getPasswordStrengthColor(passwordStrength)}`}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <Progress value={passwordStrength} className="h-2" />
                </div>
              )}

              {errors.password && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* パスワード確認 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                <Lock className="inline-block w-4 h-4 mr-1" />
                パスワード（確認）
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`pl-4 pr-12 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="上記と同じパスワードを入力"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="absolute right-10 top-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* パスワード要件 */}
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">パスワード要件:</p>
              <ul className="space-y-0.5">
                <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                  ✓ 8文字以上
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                  ✓ 大文字を含む
                </li>
                <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                  ✓ 小文字を含む
                </li>
                <li className={/\d/.test(formData.password) ? 'text-green-600' : ''}>
                  ✓ 数字を含む
                </li>
                <li
                  className={
                    /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : ''
                  }
                >
                  ✓ 特殊文字を含む
                </li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || passwordStrength < 60}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  パスワード変更中...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  パスワードを変更
                </>
              )}
            </Button>

            <Link to="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ログインページに戻る
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

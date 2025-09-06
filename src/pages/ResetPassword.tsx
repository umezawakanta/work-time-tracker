import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword, verifyResetToken } from '@/services/api/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import axios from 'axios';
import { Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      validateToken(tokenFromUrl);
    } else {
      setError('無効なリセットリンクです');
      setIsValidatingToken(false);
    }
  }, [searchParams]);

  const validateToken = async (token: string) => {
    try {
      const response = await verifyResetToken(token);
      if (response.valid) {
        setIsTokenValid(true);
      } else {
        setError('無効または期限切れのリセットリンクです');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setError('リセットリンクの検証に失敗しました');
    } finally {
      setIsValidatingToken(false);
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'パスワードは8文字以上である必要があります';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'パスワードは大文字、小文字、数字を含む必要があります';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('パスワードを入力してください');
      return;
    }

    if (!confirmPassword.trim()) {
      setError('パスワード確認を入力してください');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await resetPassword(token, password);
      setIsSuccess(true);
      toast.success('パスワードが正常にリセットされました');
    } catch (error) {
      console.error('Password reset error:', error);

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.message;

        if (statusCode === 400) {
          setError(errorMessage || '無効なリクエストです');
        } else if (statusCode === 404) {
          setError('無効または期限切れのリセットリンクです');
        } else {
          setError(errorMessage || 'パスワードリセットに失敗しました');
        }
      } else {
        setError('不明なエラーが発生しました');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'password') {
      setPassword(value);
    } else if (field === 'confirmPassword') {
      setConfirmPassword(value);
    }
    
    if (error) {
      setError('');
    }
  };

  if (isValidatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">リセットリンクを検証中...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">無効なリンク</CardTitle>
            <CardDescription className="text-gray-600">
              このリセットリンクは無効または期限切れです
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>

            <div className="text-sm text-gray-600">
              <p>新しいリセットリンクが必要な場合は：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>パスワード忘れページから再度リクエストしてください</li>
                <li>リンクの有効期限は24時間です</li>
                <li>既に使用済みのリンクは無効になります</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Link to="/forgot-password" className="w-full">
              <Button className="w-full">
                新しいリセットリンクをリクエスト
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

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">パスワードがリセットされました</CardTitle>
            <CardDescription className="text-gray-600">
              新しいパスワードでログインできます
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                パスワードが正常に変更されました。新しいパスワードでログインしてください。
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Link to="/login" className="w-full">
              <Button className="w-full">
                ログインページに移動
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
          <CardTitle className="text-2xl font-bold text-gray-900">
            新しいパスワードを設定
          </CardTitle>
          <CardDescription className="text-gray-600">
            新しいパスワードを入力してください
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                <Lock className="inline-block w-4 h-4 mr-1" />
                新しいパスワード
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-4 pr-10 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="新しいパスワードを入力"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && !error && validatePassword(password) === '' && (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  パスワードの要件を満たしています
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                <Lock className="inline-block w-4 h-4 mr-1" />
                パスワード確認
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`pl-4 pr-10 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="パスワードを再入力"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password === confirmPassword && (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  パスワードが一致しています
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600">
              <p>パスワードの要件：</p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>8文字以上</li>
                <li>大文字、小文字、数字を含む</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !password.trim() || !confirmPassword.trim() || password !== confirmPassword}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  リセット中...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  パスワードをリセット
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
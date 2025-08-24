import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '@/services/api/authApi';
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
import { AxiosError } from 'axios';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('メールアドレスを入力してください');
      return;
    }

    if (!validateEmail(email)) {
      setError('正しいメールアドレスを入力してください');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await requestPasswordReset(email.trim());
      setIsSuccess(true);
      toast.success('パスワードリセットのメールを送信しました');
    } catch (error) {
      console.error('パスワードリセット要求エラー:', error);

      if (error instanceof AxiosError) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.message;

        if (statusCode === 404) {
          setError('このメールアドレスは登録されていません');
        } else if (statusCode === 429) {
          setError('パスワードリセットの要求が多すぎます。しばらく時間をおいてからお試しください');
        } else {
          setError(errorMessage || 'パスワードリセットのメール送信に失敗しました');
        }
      } else {
        setError('不明なエラーが発生しました');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">メールを送信しました</CardTitle>
            <CardDescription className="text-gray-600">
              パスワードリセットの手順をお送りしました
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <Mail className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <strong>{email}</strong> にパスワードリセットのリンクを送信しました。
                メールを確認して、リンクをクリックしてパスワードを変更してください。
              </AlertDescription>
            </Alert>

            <div className="text-sm text-gray-600 space-y-2">
              <p>メールが届かない場合は：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>迷惑メールフォルダを確認してください</li>
                <li>メールアドレスが正しいか確認してください</li>
                <li>数分お待ちいただいてから再度お試しください</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button
              onClick={() => {
                setIsSuccess(false);
                setEmail('');
              }}
              variant="outline"
              className="w-full"
            >
              別のメールアドレスで試す
            </Button>

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
          <CardTitle className="text-2xl font-bold text-gray-900">
            パスワードをお忘れですか？
          </CardTitle>
          <CardDescription className="text-gray-600">
            登録されたメールアドレスにパスワードリセットのリンクをお送りします
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
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                <Mail className="inline-block w-4 h-4 mr-1" />
                メールアドレス
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className={`pl-4 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="登録されたメールアドレスを入力"
                  disabled={isSubmitting}
                  autoComplete="email"
                  autoFocus
                />
                {email && !error && validateEmail(email) && (
                  <div className="absolute right-3 top-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                メールアドレスを入力すると、パスワードリセット用のリンクが送信されます。
                そのリンクからパスワードを変更できます。
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !email.trim() || !validateEmail(email)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  送信中...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  リセットメールを送信
                </>
              )}
            </Button>

            <Link to="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ログインページに戻る
              </Button>
            </Link>

            <div className="text-center text-sm text-gray-600">
              アカウントをお持ちでない方は
              <Link to="/register" className="text-blue-600 hover:underline ml-1">
                こちらから登録
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

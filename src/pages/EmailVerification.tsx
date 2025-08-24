import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { verifyEmail, resendVerificationEmail } from '@/services/api/authApi';
import { Button } from '@/components/ui/button';
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
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(!!token);
  const [verificationStatus, setVerificationStatus] = useState<
    'pending' | 'success' | 'error' | 'expired'
  >('pending');
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [error, setError] = useState('');

  const verifyEmailToken = useCallback(
    async (verificationToken: string) => {
      try {
        setIsVerifying(true);
        await verifyEmail(verificationToken);
        setVerificationStatus('success');
        toast.success('メールアドレスが確認されました');

        // 3秒後にログインページにリダイレクト
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'メール確認が完了しました。ログインしてください。',
            },
          });
        }, 3000);
      } catch (error) {
        console.error('Email verification failed:', error);

        if (error instanceof AxiosError) {
          const statusCode = error.response?.status;
          if (statusCode === 400) {
            setVerificationStatus('expired');
            setError('確認リンクが期限切れまたは無効です');
          } else if (statusCode === 404) {
            setVerificationStatus('error');
            setError('確認トークンが見つかりません');
          } else {
            setVerificationStatus('error');
            setError('メール確認に失敗しました');
          }
        } else {
          setVerificationStatus('error');
          setError('不明なエラーが発生しました');
        }
      } finally {
        setIsVerifying(false);
      }
    },
    [navigate]
  );

  // トークンがある場合は自動で確認処理を実行
  useEffect(() => {
    if (token) {
      verifyEmailToken(token);
    }
  }, [token, verifyEmailToken]);

  // 再送信のクールダウンタイマー
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      setError('');
      await resendVerificationEmail();
      toast.success('確認メールを再送信しました');
      setCanResend(false);
      setResendCountdown(60); // 60秒のクールダウン
    } catch (error) {
      console.error('Resend verification failed:', error);

      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message;
        setError(errorMessage || '確認メールの再送信に失敗しました');
      } else {
        setError('不明なエラーが発生しました');
      }
    } finally {
      setIsResending(false);
    }
  };

  // 確認中の表示
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">メール確認中</CardTitle>
            <CardDescription className="text-gray-600">
              メールアドレスを確認しています...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // 確認成功の表示
  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">確認完了</CardTitle>
            <CardDescription className="text-gray-600">
              メールアドレスが正常に確認されました
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                アカウントが有効化されました。ログインしてサービスをご利用ください。
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter>
            <Button onClick={() => navigate('/login')} className="w-full">
              ログインページへ
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 確認失敗の表示
  if (verificationStatus === 'error' || verificationStatus === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {verificationStatus === 'expired' ? '確認リンクが期限切れです' : '確認に失敗しました'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              メールアドレスの確認ができませんでした
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>

            {error && (
              <div className="text-sm text-gray-600">
                <p>可能な解決方法：</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>確認メールを再送信する</li>
                  <li>正しいリンクをクリックしているか確認する</li>
                  <li>メールが迷惑メールフォルダに入っていないか確認する</li>
                </ul>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button
              onClick={handleResendVerification}
              disabled={isResending || !canResend}
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  送信中...
                </>
              ) : !canResend ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  再送信まで {resendCountdown}秒
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  確認メールを再送信
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
        </Card>
      </div>
    );
  }

  // メール確認待ちの表示（トークンがない場合）
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">メール確認</CardTitle>
          <CardDescription className="text-gray-600">
            メールアドレスの確認が必要です
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              登録したメールアドレスに確認リンクを送信しました。
              メール内のリンクをクリックしてアカウントを有効化してください。
            </AlertDescription>
          </Alert>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-600 space-y-2">
            <p>メールが届かない場合は：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>迷惑メールフォルダを確認してください</li>
              <li>数分お待ちいただいてから再度確認してください</li>
              <li>下のボタンから確認メールを再送信できます</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button
            onClick={handleResendVerification}
            disabled={isResending || !canResend}
            className="w-full"
          >
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                送信中...
              </>
            ) : !canResend ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                再送信まで {resendCountdown}秒
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                確認メールを再送信
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
      </Card>
    </div>
  );
}

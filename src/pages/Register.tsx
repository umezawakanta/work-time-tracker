import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { toast } from 'react-hot-toast';
import { api } from '@/services/api/apiConfig';
import { AxiosError } from 'axios';
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle, User, Mail, Lock } from 'lucide-react';

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

interface PasswordStrength {
  score: number;
  message: string;
  color: string;
}

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();

  // パスワード強度チェック
  const checkPasswordStrength = (password: string): PasswordStrength => {
    if (password.length === 0) {
      return { score: 0, message: '', color: 'bg-gray-200' };
    }

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score <= 2) {
      return { score: score * 20, message: '弱い', color: 'bg-red-500' };
    } else if (score <= 3) {
      return { score: score * 20, message: '普通', color: 'bg-yellow-500' };
    } else if (score <= 4) {
      return { score: score * 20, message: '強い', color: 'bg-blue-500' };
    } else {
      return { score: 100, message: '非常に強い', color: 'bg-green-500' };
    }
  };

  // バリデーション関数
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name': {
        if (!value.trim()) return '名前を入力してください';
        if (value.trim().length < 2) return '名前は2文字以上で入力してください';
        if (value.trim().length > 50) return '名前は50文字以内で入力してください';
        break;
      }

      case 'email': {
        if (!value.trim()) return 'メールアドレスを入力してください';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return '正しいメールアドレスを入力してください';
        break;
      }

      case 'password': {
        if (!value) return 'パスワードを入力してください';
        if (value.length < 8) return 'パスワードは8文字以上で入力してください';
        if (value.length > 128) return 'パスワードは128文字以内で入力してください';
        if (!/(?=.*[a-z])/.test(value)) return '小文字を含める必要があります';
        if (!/(?=.*[A-Z])/.test(value)) return '大文字を含める必要があります';
        if (!/(?=.*\d)/.test(value)) return '数字を含める必要があります';
        break;
      }

      case 'confirmPassword': {
        if (!value) return 'パスワード（確認）を入力してください';
        if (value !== formData.password) return 'パスワードが一致しません';
        break;
      }

      default:
        break;
    }
    return undefined;
  };

  // フィールド値更新
  const updateField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // リアルタイムバリデーション（フィールドがタッチされている場合のみ）
    if (touchedFields[name]) {
      const error = validateField(name, value);
      setValidationErrors((prev) => ({ ...prev, [name]: error }));

      // confirmPasswordの場合、passwordが変更されたらconfirmPasswordも再検証
      if (name === 'password' && touchedFields.confirmPassword) {
        const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
        setValidationErrors((prev) => ({ ...prev, confirmPassword: confirmPasswordError }));
      }
    }
  };

  // フィールドのブラー処理
  const handleFieldBlur = (name: string) => {
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof typeof formData]);
    setValidationErrors((prev) => ({ ...prev, [name]: error }));
  };

  // フォーム送信前の全体バリデーション
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // 各フィールドのバリデーション
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) errors[key as keyof ValidationErrors] = error;
    });

    // 利用規約の確認
    if (!acceptTerms) {
      errors.terms = '利用規約に同意してください';
    }

    setValidationErrors(errors);
    setTouchedFields({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    return Object.keys(errors).length === 0;
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('入力内容に誤りがあります');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      toast.success('アカウントが正常に作成されました');

      // 登録成功後の処理
      if (response.data.token) {
        // 自動ログインする場合
        localStorage.setItem('token', response.data.token);
        navigate('/');
      } else {
        // ログインページに遷移する場合
        navigate('/login', {
          state: {
            message: '登録が完了しました。ログインしてください。',
            email: formData.email,
          },
        });
      }
    } catch (error) {
      console.error('登録エラー:', error);

      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message;
        const errorField = error.response?.data?.field;

        console.log('エラーレスポンス:', {
          status: error.response?.status,
          data: error.response?.data,
          message: errorMessage,
          field: errorField,
        });

        if (errorField && errorMessage) {
          // 特定のフィールドエラーの場合
          if (errorField === 'email') {
            setValidationErrors((prev) => ({ ...prev, email: errorMessage }));
            setTouchedFields((prev) => ({ ...prev, email: true }));
          } else if (errorField === 'general') {
            // 一般的なエラーはtoastで表示
            toast.error(errorMessage);
          } else {
            // その他のフィールドエラー
            setValidationErrors((prev) => ({ ...prev, [errorField]: errorMessage }));
            setTouchedFields((prev) => ({ ...prev, [errorField]: true }));
          }
        } else if (errorMessage) {
          // メッセージのみの場合はtoastで表示
          toast.error(errorMessage);
        } else {
          // デフォルトのエラーメッセージ
          toast.error('アカウントの作成に失敗しました。もう一度お試しください。');
        }
      } else {
        console.error('予期しないエラー:', error);
        toast.error('予期しないエラーが発生しました。しばらく時間をおいてから再度お試しください。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = checkPasswordStrength(formData.password);
  const hasErrors = Object.keys(validationErrors).some(
    (key) => validationErrors[key as keyof ValidationErrors]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">アカウント登録</CardTitle>
          <CardDescription className="text-gray-600">Work Time Trackerへようこそ</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* 一般的なエラーメッセージ表示エリアを追加 */}
            {validationErrors.general && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {validationErrors.general}
                </AlertDescription>
              </Alert>
            )}

            {/* 名前フィールド */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                <User className="inline-block w-4 h-4 mr-1" />
                名前
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  onBlur={() => handleFieldBlur('name')}
                  className={`pl-4 ${validationErrors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="田中 太郎"
                  disabled={isSubmitting}
                />
                {touchedFields.name && (
                  <div className="absolute right-3 top-3">
                    {validationErrors.name ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                )}
              </div>
              {validationErrors.name && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* メールアドレスフィールド */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                <Mail className="inline-block w-4 h-4 mr-1" />
                メールアドレス
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  onBlur={() => handleFieldBlur('email')}
                  className={`pl-4 ${validationErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="example@email.com"
                  disabled={isSubmitting}
                />
                {touchedFields.email && (
                  <div className="absolute right-3 top-3">
                    {validationErrors.email ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                )}
              </div>
              {validationErrors.email && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* パスワードフィールド */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                <Lock className="inline-block w-4 h-4 mr-1" />
                パスワード
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  onBlur={() => handleFieldBlur('password')}
                  className={`pl-4 pr-12 ${validationErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="8文字以上の安全なパスワード"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* パスワード強度インジケーター */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">パスワード強度:</span>
                    <span
                      className={`font-medium ${passwordStrength.score >= 80 ? 'text-green-600' : passwordStrength.score >= 60 ? 'text-blue-600' : passwordStrength.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}
                    >
                      {passwordStrength.message}
                    </span>
                  </div>
                  <Progress value={passwordStrength.score} className="h-2" />
                </div>
              )}

              {validationErrors.password && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* パスワード確認フィールド */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                <Lock className="inline-block w-4 h-4 mr-1" />
                パスワード（確認）
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  onBlur={() => handleFieldBlur('confirmPassword')}
                  className={`pl-4 pr-12 ${validationErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="上記と同じパスワードを入力"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                {touchedFields.confirmPassword && (
                  <div className="absolute right-10 top-3">
                    {validationErrors.confirmPassword ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : formData.confirmPassword &&
                      formData.password === formData.confirmPassword ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* 利用規約同意チェックボックス */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  disabled={isSubmitting}
                />
                <div className="text-sm">
                  <Label htmlFor="terms" className="text-gray-700 cursor-pointer">
                    <Link to="/terms" className="text-blue-600 hover:underline">
                      利用規約
                    </Link>
                    および
                    <Link to="/privacy" className="text-blue-600 hover:underline">
                      プライバシーポリシー
                    </Link>
                    に同意します
                  </Label>
                </div>
              </div>
              {validationErrors.terms && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.terms}
                </p>
              )}
            </div>

            {/* エラー表示 */}
            {hasErrors && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  入力内容を確認してください
                </AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || hasErrors || !acceptTerms}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  登録中...
                </>
              ) : (
                'アカウントを作成'
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              すでにアカウントをお持ちの方は
              <Link to="/login" className="text-blue-600 hover:underline ml-1">
                こちらからログイン
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

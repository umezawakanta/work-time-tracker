import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  useInternationalization,
  SupportedLocale,
  SUPPORTED_LOCALES,
} from '@/hooks/useInternationalization';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'button' | 'compact' | 'inline';
  showFlag?: boolean;
  showNativeName?: boolean;
  className?: string;
}

/**
 * 🌍 国際化マスター: 言語切り替えコンポーネント
 * ユーザーがアプリケーションの表示言語を簡単に変更できる
 */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'button',
  showFlag = true,
  showNativeName = true,
  className,
}) => {
  const { locale, setLocale, t } = useInternationalization();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = SUPPORTED_LOCALES[locale];

  const handleLocaleChange = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
    setIsOpen(false);

    // アナウンス
    const localeName = SUPPORTED_LOCALES[newLocale].nativeName;
    const announcement = `言語を${localeName}に変更しました`;

    // ARIA live regionに通知
    const liveRegion = document.getElementById('language-announcements');
    if (liveRegion) {
      liveRegion.textContent = announcement;
    }

    // 強制的に再レンダリング（念のため）
    setTimeout(() => {
      window.dispatchEvent(new Event('localeChanged'));
    }, 50);
  };

  // コンパクト表示
  if (variant === 'compact') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('gap-1 px-2', className)}
            aria-label={`${t('settings.language')}: ${currentLocale.nativeName}`}
          >
            {showFlag && <span className="text-base">{currentLocale.flag}</span>}
            <span className="text-sm font-medium">{locale.toUpperCase()}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[200px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg backdrop-blur-none"
        >
          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-gray-50 dark:bg-slate-700">
            {t('settings.language')}
          </div>
          <DropdownMenuSeparator />
          {Object.values(SUPPORTED_LOCALES).map((localeConfig) => (
            <DropdownMenuItem
              key={localeConfig.code}
              onClick={() => handleLocaleChange(localeConfig.code)}
              className="flex items-center justify-between gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{localeConfig.flag}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {localeConfig.nativeName}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({localeConfig.name})
                </span>
              </div>
              {locale === localeConfig.code && <Check className="h-4 w-4 text-green-600" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // インライン表示
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="text-sm text-muted-foreground">{t('settings.language')}:</span>
        <div className="flex gap-1">
          {Object.values(SUPPORTED_LOCALES).map((localeConfig) => (
            <Button
              key={localeConfig.code}
              variant={locale === localeConfig.code ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleLocaleChange(localeConfig.code)}
              className="gap-1 px-2"
              aria-label={`${localeConfig.nativeName}に変更`}
            >
              {showFlag && <span className="text-sm">{localeConfig.flag}</span>}
              <span className="text-xs font-medium">{localeConfig.code.toUpperCase()}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // 標準ボタン表示
  return (
    <div className={cn('relative', className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 justify-between min-w-[160px]"
            aria-label={`${t('settings.language')}: ${currentLocale.nativeName}`}
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="font-medium">
                {showFlag && `${currentLocale.flag} `}
                {showNativeName ? currentLocale.nativeName : locale.toUpperCase()}
              </span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="min-w-[250px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl backdrop-blur-none"
          align="start"
        >
          <div className="px-3 py-2 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              {t('settings.language')}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t('settings.language')}を選択してください
            </p>
          </div>

          {Object.values(SUPPORTED_LOCALES).map((localeConfig) => (
            <DropdownMenuItem
              key={localeConfig.code}
              onClick={() => handleLocaleChange(localeConfig.code)}
              className="flex items-center justify-between gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{localeConfig.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {localeConfig.nativeName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {localeConfig.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {locale === localeConfig.code && (
                  <>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      {t('common.current')}
                    </Badge>
                    <Check className="h-4 w-4 text-green-600" />
                  </>
                )}
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <div className="px-3 py-2 text-xs bg-gray-50 dark:bg-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">対応言語数</span>
              <Badge
                variant="outline"
                className="text-xs border-gray-300 text-gray-700 dark:border-slate-600 dark:text-gray-300"
              >
                {Object.keys(SUPPORTED_LOCALES).length}言語
              </Badge>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ARIA Live Region */}
      <div id="language-announcements" aria-live="polite" aria-atomic="true" className="sr-only" />
    </div>
  );
};

export default LanguageSwitcher;

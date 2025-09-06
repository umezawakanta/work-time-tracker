import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                ホームに戻る
              </Link>
            </Button>
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              利用規約
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">利用規約</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Work Time Tracker サービスの利用規約です
          </p>
        </div>

        {/* Terms Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              サービス利用規約
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                最終更新: 2025年9月7日
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Work Time Tracker
              </div>
            </div>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-0">
                <strong>重要:</strong> 本利用規約は、Work Time
                Trackerサービス（以下「本サービス」）の利用条件を定めるものです。
              </p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              第1条（適用）
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              本規約は、ユーザーとWork Time
              Tracker（以下「当社」）との間の本サービスの利用に関わる一切の関係に適用されるものとします。
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              第2条（利用登録）
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              本サービスにおいては、登録希望者が本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li className="text-gray-700 dark:text-gray-300">
                利用登録の申請に際して虚偽の事項を届け出た場合
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                本規約に違反したことがある者からの申請である場合
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                その他、当社が利用登録を相当でないと判断した場合
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              第3条（ユーザーIDおよびパスワードの管理）
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。当社は、ユーザーIDとパスワードの組み合わせが登録情報と一致してログインされた場合には、そのユーザーIDを登録しているユーザー自身による利用とみなします。
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              第4条（禁止事項）
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li className="text-gray-700 dark:text-gray-300">法令または公序良俗に違反する行為</li>
              <li className="text-gray-700 dark:text-gray-300">犯罪行為に関連する行為</li>
              <li className="text-gray-700 dark:text-gray-300">
                本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                当社、ほかのユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                本サービスによって得られた情報を商業的に利用する行為
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                当社のサービスの運営を妨害するおそれのある行為
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                不正アクセスをし、またはこれを試みる行為
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                その他、当社が不適切と判断する行為
              </li>
            </ol>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              第5条（本サービスの提供の停止等）
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-gray-700 dark:text-gray-300">
                本サービスにかかるコンピュータシステムの保守点検または更新を行う場合
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                コンピュータまたは通信回線等が事故により停止した場合
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                その他、当社が本サービスの提供が困難と判断した場合
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              第6条（利用制限および登録抹消）
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              当社は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-gray-700 dark:text-gray-300">
                本規約のいずれかの条項に違反した場合
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                登録事項に虚偽の事実があることが判明した場合
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                料金等の支払債務の不履行があった場合
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                当社からの連絡に対し、一定期間返答がない場合
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                本サービスについて、最終の利用から一定期間利用がない場合
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                その他、当社が本サービスの利用を適当でないと判断した場合
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              第7条（退会）
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              ユーザーは、当社の定める退会手続により、本サービスから退会できるものとします。
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              第8条（保証の否認および免責事項）
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              当社は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              当社は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。ただし、本サービスに関する当社とユーザーとの間の契約（本規約を含みます。）が消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              第9条（サービス内容の変更等）
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              第10条（利用規約の変更）
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              当社は以下の場合には、ユーザーの個別の同意を要せず、本規約を変更することができるものとします。
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li className="text-gray-700 dark:text-gray-300">
                本規約の変更がユーザーの一般の利益に適合するとき。
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                本規約の変更が本サービス利用契約の目的に反せず、かつ、変更の必要性、変更後の内容の相当性その他の変更に係る事情に照らして合理的なものであるとき。
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              第11条（個人情報の取扱い）
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              当社は、本サービスの利用によって取得する個人情報については、当社「プライバシーポリシー」に従い適切に取り扱うものとします。
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              第12条（通知または連絡）
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              ユーザーと当社との間の通知または連絡は、当社の定める方法によって行うものとします。当社は、ユーザーから、当社が別途定める方式に従った変更届け出がない限り、現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、これらは、発信時にユーザーへ到達したものとみなします。
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              第13条（権利義務の譲渡の禁止）
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              ユーザーは、当社の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              第14条（準拠法・裁判管轄）
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              本規約の解釈にあたっては、日本法を準拠法とします。
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
            </p>

            <Separator className="my-8" />

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                お問い合わせ
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                本利用規約に関するお問い合わせは、以下の方法でお願いいたします。
              </p>
              <ul className="text-blue-800 dark:text-blue-200 text-sm mt-2 space-y-1">
                <li>• サービス内のお問い合わせフォーム</li>
                <li>• メール: support@work-time-tracker.com</li>
              </ul>
            </div>

            <div className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">以上</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">2025年9月7日 制定</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/register">アカウント作成</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/privacy">プライバシーポリシー</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

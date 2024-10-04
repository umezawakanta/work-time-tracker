import React, { useState } from "react";

interface Candidate {
  name: string;
  party: string;
  prefecture: string;
  district: number;
}

const parties = [
  "自民党",
  "立憲民主党",
  "日本維新の会",
  "公明党",
  "共産党",
  "国民民主党",
  "社民党",
  "無所属",
];
const prefectures = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

export default function ElectionCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newCandidate, setNewCandidate] = useState<Candidate>({
    name: "",
    party: "",
    prefecture: "",
    district: 1,
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setNewCandidate((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setCandidates((prev) => [...prev, newCandidate]);
    setNewCandidate({ name: "", party: "", prefecture: "", district: 1 });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">衆議院選挙 候補者擁立状況</h1>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">新規候補者登録</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              候補者名
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newCandidate.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label
              htmlFor="party"
              className="block text-sm font-medium text-gray-700"
            >
              政党
            </label>
            <select
              id="party"
              name="party"
              value={newCandidate.party}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">選択してください</option>
              {parties.map((party) => (
                <option key={party} value={party}>
                  {party}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="prefecture"
              className="block text-sm font-medium text-gray-700"
            >
              都道府県
            </label>
            <select
              id="prefecture"
              name="prefecture"
              value={newCandidate.prefecture}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">選択してください</option>
              {prefectures.map((prefecture) => (
                <option key={prefecture} value={prefecture}>
                  {prefecture}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="district"
              className="block text-sm font-medium text-gray-700"
            >
              選挙区
            </label>
            <input
              type="number"
              id="district"
              name="district"
              value={newCandidate.district}
              onChange={handleInputChange}
              min="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            候補者を登録
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h2 className="text-xl font-semibold mb-4">登録済み候補者一覧</h2>
        {candidates.length === 0 ? (
          <p>まだ候補者が登録されていません。</p>
        ) : (
          <ul className="space-y-2">
            {candidates.map((candidate, index) => (
              <li key={index} className="border-b pb-2">
                {candidate.name} ({candidate.party}) - {candidate.prefecture} 第
                {candidate.district}区
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

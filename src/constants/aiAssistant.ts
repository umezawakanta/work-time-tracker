export interface AssistantTemplate {
  id: string;
  label: string;
  text: string;
}

export const ASSISTANT_TEMPLATES: AssistantTemplate[] = [
  { id: 'day-plan', label: '一日の計画', text: '今日の最適な計画を30分単位で提案してください。' },
  { id: 'habit', label: '習慣化', text: '毎日続けられる3つの小さな習慣を提案してください。' },
  {
    id: 'urgent-important',
    label: '緊急⇔重要',
    text: 'タスクを緊急度×重要度で分類し、順序を提案してください。',
  },
];

# Analytics Event Naming (success/CTA/flow)

- funnel_visit: { step }
- funnel_action: { step }
- funnel_success: { step }

- page_view: { page, title }
- not_found: { path, referrer }

- ai_assistant_reply: { ok, latencyMs? }

- assessment_saved: { type, score?, scaled?, percentile?, mbti? }
- assessment_save_failed: { type }

- learning_progress_saved: { courseId, progress, delta? }

Notes:

- UTM parameters persisted once in localStorage under `utm:first_visit`.
- Development only: success rates are logged per category (AI/Assess/Learning).

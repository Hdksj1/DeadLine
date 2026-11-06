export type Fact = {
  value: string | null; evidence: string[];
  status: 'extracted' | 'needs_confirmation' | 'not_stated';
};
export type ParsedNotice = {
  title: Fact; eligibility: Fact[]; deadlines: Fact[]; materials: Fact[];
  submission_methods: Fact[]; issues: { question: string; evidence: string[] }[];
};
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const nonempty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const quotes = (v: unknown, source: string): v is string[] => Array.isArray(v) && v.every(q => nonempty(q) && source.includes(q));
function fact(v: unknown, source: string): v is Fact {
  if (!record(v) || !quotes(v.evidence, source)) return false;
  if (v.status === 'not_stated') return v.value === null && v.evidence.length === 0;
  return (v.status === 'extracted' || v.status === 'needs_confirmation') && nonempty(v.value) && v.evidence.length > 0;
}
export function isParsedNotice(v: unknown, source: string): v is ParsedNotice {
  if (!record(v) || !fact(v.title, source)) return false;
  const groups = ['eligibility', 'deadlines', 'materials', 'submission_methods'] as const;
  for (const key of groups) if (!Array.isArray(v[key]) || !(v[key] as unknown[]).every(f => fact(f, source))) return false;
  if (!Array.isArray(v.issues) || !v.issues.every(i => record(i) && nonempty(i.question) && quotes(i.evidence, source))) return false;
  const facts = [v.title, ...groups.flatMap(k => v[k] as Fact[])];
  return !facts.some(f => f.status === 'needs_confirmation') || v.issues.length > 0;
}
export const PARSE_TIMEOUT_MS = 60_000;
export async function requestParse(text: string, signal: AbortSignal): Promise<ParsedNotice> {
  let response: Response;
  try {
    response = await fetch('/api/notices/parse', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }), signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error('无法连接解析服务，请检查网络及本机 8000 端口的后端服务。');
  }
  let data: unknown;
  try { data = await response.json(); }
  catch (error) {
    if (signal.aborted) throw error;
    throw new Error(response.ok ? '解析结果无效：服务未返回有效 JSON，请重试。' : `服务返回非 JSON 错误（HTTP ${response.status}），请检查后端与代理。`);
  }
  if (!response.ok) {
    const status = record(data) ? data.status : undefined;
    const messages: Record<string, string> = {
      not_configured: '后端尚未配置模型密钥。请在项目根目录 .env 配置后重启后端，勿将密钥填入前端。',
      model_unavailable: 'DeepSeek 调用失败，请检查后端模型配置、网络或额度后重试。',
      invalid_model_output: '模型结果格式或原文引用校验失败，请重试并核对通知内容。',
    };
    throw new Error(typeof status === 'string' && messages[status] ? messages[status] : response.status === 422 ? '输入未通过后端校验，请提交 1—20,000 字符的通知正文。' : `解析服务暂不可用（HTTP ${response.status}），请稍后重试。`);
  }
  if (!isParsedNotice(data, text)) throw new Error('解析结果无效：字段结构、状态或原文引用不符合约定。请重试或检查后端版本。');
  return data;
}
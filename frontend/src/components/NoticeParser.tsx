import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, CircleHelp, FileSearch, FileText, Link2, LoaderCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { PARSE_TIMEOUT_MS, requestParse, type Fact, type ParsedNotice } from '../api/notices';
import { sampleText } from '../data/demo';

export function NoticeParser() {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [result, setResult] = useState<ParsedNotice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState('');
  const [quoteSelection, setQuoteSelection] = useState(0);
  const markRef = useRef<HTMLElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => {
    if (!quote) return;
    const mark = markRef.current;
    mark?.focus({ preventScroll: true });
    mark?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
  }, [quote, quoteSelection]);
  function edit(value: string) {
    setText(value); setSource(''); setResult(null); setQuote(''); setError('');
  }
  async function parse() {
    if (!text.trim() || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true); setError(''); setResult(null); setQuote('');
    const submitted = text;
    let timedOut = false;
    const timer = window.setTimeout(() => { timedOut = true; controller.abort(); }, PARSE_TIMEOUT_MS);
    try {
      const parsed = await requestParse(submitted, controller.signal);
      if (!controller.signal.aborted) { setSource(submitted); setResult(parsed); }
    } catch (e) {
      if (!controller.signal.aborted || timedOut) setError(timedOut ? '解析超过 60 秒，已停止等待。请稍后重试；停止等待不保证模型服务尚未计费。' : e instanceof Error ? e.message : '解析失败，请重试。');
    } finally {
      clearTimeout(timer);
      if (requestRef.current === controller) {
        requestRef.current = null;
        if (!controller.signal.aborted || timedOut) setLoading(false);
      }
    }
  }
  function locate(q: string) { setQuote(q); setQuoteSelection(n => n + 1); }
  function renderFact(f: Fact, i: number) {
    return <div className="fact-card" key={i}><div><strong>{f.value ?? '未说明'}</strong><span className={`pill ${f.status === 'needs_confirmation' ? 'orange' : f.status === 'not_stated' ? 'neutral' : 'blue'}`}>{f.status === 'needs_confirmation' ? '待确认' : f.status === 'not_stated' ? '未说明' : '已提取、待核对'}</span></div>{f.evidence.map((q, j) => <button type="button" className="quote-button" key={j} onClick={() => locate(q)} aria-label={`定位原文：${q}`}><Link2 size={15} />{q}</button>)}</div>;
  }
  const start = quote ? source.indexOf(quote) : -1;
  const groups: [string, Fact[]][] = result ? [['事项名称', [result.title]], ['报名资格', result.eligibility], ['关键时间', result.deadlines], ['提交材料', result.materials], ['提交方式', result.submission_methods]] : [];
  return <>
    <div className="page-heading"><div><div className="eyebrow">FROM INFORMATION TO ACTION</div><h1 tabIndex={-1}>把通知，变成清晰的下一步<span className="heading-dot">.</span></h1><p>每个结论保留依据，每个疑点留给你确认。</p></div><span className="pill blue">实时解析 · 不保存</span></div>
    <div className="parse-grid">
      <section className="panel source-panel" aria-labelledby="source-title"><div className="section-heading"><h2 id="source-title"><FileText size={20} />原始通知</h2><button className="text-button" disabled={loading} onClick={() => edit(sampleText)}>填入演示通知</button></div>
        <label className="sr-only" htmlFor="notice-text">通知全文</label><textarea id="notice-text" placeholder={'在这里粘贴通知全文…\n\n竞赛报名、奖学金申请、考试安排，都可以从这里开始。'} maxLength={20000} disabled={loading} value={text} onChange={e => edit(e.target.value)} aria-describedby="input-meta privacy-note" />
        <div className="input-meta" id="input-meta"><span>仅支持文本 · PDF 导入未实现</span><span>{text.length.toLocaleString()} / 20,000</span></div>
        <div className="privacy-note" id="privacy-note"><ShieldCheck size={18} /><span>正文会发送给 DeepSeek，可能产生费用，请勿输入敏感资料。密钥仅由后端读取。</span></div>
        <button className="primary parse-submit" disabled={!text.trim() || loading} onClick={parse}>{loading ? <LoaderCircle className="spin" size={19} /> : <Sparkles size={19} />}{loading ? '正在梳理要求…' : '开始解析通知'}</button>
        <p className="muted">解析期间暂停编辑；离开本页会取消等待，不会保存解析结果。</p>
        {error && <div className="error-box" role="alert"><AlertCircle size={19} /><span>{error}</span></div>}
        {result && <section className="source-preview" aria-labelledby="evidence-title"><h3 id="evidence-title">原文溯源</h3><p className="muted">点击右侧引用可定位原文；重复片段定位到第一次出现的位置。</p><div className="source-text" tabIndex={0} aria-label="解析时提交的原文">{start >= 0 ? <>{source.slice(0, start)}<mark ref={markRef} tabIndex={-1} aria-label={`已定位原文：${quote}`}>{quote}</mark>{source.slice(start + quote.length)}</> : source}</div></section>}
      </section>
      <section className="panel result-panel" aria-labelledby="result-title" aria-busy={loading}><div className="section-heading"><h2 id="result-title"><Sparkles size={20} />解析结果</h2><span className="pill blue">AI 辅助</span></div>
        <div role="status" className="sr-only">{loading ? '正在阅读通知，请等待，最长等待 60 秒。' : result ? '解析完成，请核对各项结果与原文。' : '尚无解析结果。'}</div>
        {!result ? <div className="parse-empty">{loading ? <LoaderCircle className="spin" size={36} /> : <span className="empty-icon"><FileSearch size={34} /></span>}<h3>{loading ? '正在阅读你的通知' : '复杂的通知，简单地理清'}</h3><p>{loading ? '提取关键要求并校验原文引用，最长等待 60 秒。' : '粘贴通知并开始解析，在这里查看要求、依据和待确认问题。'}</p><div className="empty-steps">{['关键要求', '原文依据', '疑点提示'].map(s => <span key={s}><Check size={15} />{s}</span>)}</div></div> : <div className="result-content"><div className="result-note">提取不等于用户确认。引用存在也不代表结论一定准确，请对照原文核查。</div>{groups.map(([label, facts]) => <section className="fact-group" key={label}><h3>{label}</h3>{facts.length ? facts.map(renderFact) : <p className="muted">未说明或未提取到相关信息，请核对原文。</p>}</section>)}<section className="issues"><h3><CircleHelp size={18} />待确认问题</h3>{result.issues.length ? result.issues.map((issue, i) => <div key={i}><p>{i + 1}. {issue.question}</p>{issue.evidence.map((q, j) => <button className="quote-button" key={j} onClick={() => locate(q)} aria-label={`定位原文：${q}`}><Link2 size={15} />{q}</button>)}</div>) : <p>模型未提出疑点，不代表信息完整或已经确认。</p>}</section><div className="inline-message">当前仅解析。人工确认保存、真实任务生成和数据库保存尚未实现。</div></div>}
      </section>
    </div>
  </>;
}
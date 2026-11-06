import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Radar, LayoutDashboard, FileSearch, Bell, ArrowUpRight, ArrowRight, Plus, Search, ChevronRight, Clock3, Check, CheckCheck, CircleHelp, LogOut, CalendarDays, FileText, ShieldCheck, Sparkles, Eye, EyeOff, Menu, X, AlertCircle, LoaderCircle, Link2 } from 'lucide-react';
import './styles.css';

type Fact = { value: string | null; evidence: string[]; status: 'extracted' | 'needs_confirmation' | 'not_stated' };
type Parsed = { title: Fact; eligibility: Fact[]; deadlines: Fact[]; materials: Fact[]; submission_methods: Fact[]; issues: { question: string; evidence: string[] }[] };
type Page = 'login' | 'overview' | 'parse' | 'detail';
const sampleText = '全国高校 Vibe Coding 开发挑战赛\n参赛对象：具有正式全日制学籍的研究生、本科及高职高专学生。\n作品提交截止时间：2026年11月18日。\n提交材料：代码仓库、至少3个核心功能的完整Prompt迭代链、README复现指南。\n演示视频为5—8分钟，其中至少2分钟展示AI协同过程。技术文档为PDF格式，不超过30页。\n通过大赛官网个人中心提交作品。';
const matters = [
  { title: '全国高校 Vibe Coding 开发挑战赛', type: '学科竞赛', color: 'blue', date: '11 月 18 日', done: 2, total: 5, icon: '✦', next: '录制 5–8 分钟演示视频', label: '准备中' },
  { title: '2026 秋季学期奖学金申请', type: '奖助申请', color: 'orange', date: '11 月 09 日', done: 1, total: 4, icon: '◇', next: '核对成绩单与申请资格', label: '即将截止' },
  { title: '大学英语六级考试报名', type: '考试报名', color: 'purple', date: '11 月 12 日', done: 2, total: 3, icon: 'Aa', next: '确认报名信息并缴费', label: '待确认' },
];

function App() {
  const readPage = (): Page => ['login', 'overview', 'parse', 'detail'].includes(location.hash.slice(1)) ? location.hash.slice(1) as Page : 'login';
  const [page, setPage] = useState<Page>(readPage);
  const [mobile, setMobile] = useState(false);
  const [toast, setToast] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('全部事项');
  const [selected, setSelected] = useState(0);
  const [tasks, setTasks] = useState<Record<number, boolean[]>>({ 0: [true, true, false, false, false], 1: [true, false, false, false], 2: [true, true, false] });
  useEffect(() => { const handler = () => { setPage(readPage()); setMobile(false); }; window.addEventListener('hashchange', handler); return () => window.removeEventListener('hashchange', handler); }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 4000); return () => clearTimeout(timer); }, [toast]);
  function go(p: Page) { location.hash = p; setPage(p); setMobile(false); window.scrollTo(0, 0); }
  function detail(i: number) { setSelected(i); go('detail'); }
  const current = matters[selected];
  const allDone = Object.values(tasks).flat().filter(Boolean).length;

  if (page === 'login') return <><Login enter={() => go('overview')} />{toast && <div role="status" className="toast">{toast}</div>}</>;

  return <div className="app">
    {mobile && <button className="scrim" aria-label="关闭导航" onClick={() => setMobile(false)} />}
    <aside className={`sidebar ${mobile ? 'open' : ''}`}>
      <a className="brand" href="#overview"><span className="brand-icon"><Radar size={25} /></span><span>DDL 雷达<small>YOUR NEXT MOVE</small></span></a>
      <div className="workspace"><span className="avatar small">D</span><span>我的个人空间<small>个人工作台</small></span><span className="demo-tag">演示</span></div>
      <div className="nav-caption">工作空间</div>
      <nav><button className={page === 'overview' ? 'active' : ''} onClick={() => go('overview')}><LayoutDashboard size={19} />事项总览</button><button className={page === 'parse' ? 'active' : ''} onClick={() => go('parse')}><FileSearch size={19} />通知解析<span className="nav-new">AI</span></button><button onClick={() => { go('overview'); setTimeout(() => document.getElementById('reminders')?.scrollIntoView({ behavior: 'smooth' }), 50); }}><Bell size={19} />提醒中心<span className="count">3</span></button></nav>
      <div className="sidebar-tip"><span className="tip-icon"><Sparkles size={20} /></span><strong>少一点遗漏，多一点从容。</strong><p>把复杂通知交给雷达，<br />把时间留给重要的事。</p><button onClick={() => go('parse')}>解析一份新通知 <ArrowUpRight size={16} /></button></div>
      <div className="sidebar-bottom"><span className="avatar">D</span><span>演示体验者<small>数据仅在当前页面体验</small></span><button title="返回登录页" aria-label="返回登录页" onClick={() => go('login')}><LogOut size={18} /></button></div>
    </aside>
    <main>
      <header className="topbar"><div className="breadcrumbs"><button className="mobile-menu" aria-label="打开导航" onClick={() => setMobile(true)}><Menu size={22} /></button>个人空间 <ChevronRight size={14} /><span>{page === 'overview' ? '事项总览' : page === 'parse' ? '通知解析' : '事项详情'}</span></div><div className="top-actions"><span className="demo-label"><i />演示工作空间</span><button aria-label="查看提醒" onClick={() => { go('overview'); setTimeout(() => document.getElementById('reminders')?.scrollIntoView({ behavior: 'smooth' }), 50); }} className="bell-button"><Bell size={19} /><i /></button><span className="avatar small">D</span></div></header>
      <div className="content">
        {page === 'overview' && <>
          <div className="page-heading"><div><div className="eyebrow">MAKE ROOM FOR WHAT MATTERS</div><h1>每一个截止，都心中有数<span className="heading-dot">.</span></h1><p>把通知变成行动，让准备更有条理。</p></div><button className="primary" onClick={() => go('parse')}><Plus size={18} />导入新通知</button></div>
          <div className="demo-note"><CircleHelp size={16} />以下为固定演示数据，日期与进度不代表你的真实事项；操作仅在当前页面会话中生效。</div>
          <section className="stats"><button className="stat" onClick={() => setFilter('全部事项')}><span className="stat-icon blue"><LayoutDashboard size={20} /></span><span>进行中的事项<strong>03<small>项</small></strong></span><span className="stat-footer">每一步准备，都算数 <ArrowUpRight size={15} /></span></button><button className="stat" onClick={() => setFilter('即将截止')}><span className="stat-icon orange"><Clock3 size={20} /></span><span>即将截止<strong>01<small>项</small></strong></span><span className="stat-footer orange-text">需要优先关注 <ArrowUpRight size={15} /></span></button><button className="stat" onClick={() => setFilter('待确认')}><span className="stat-icon purple"><CircleHelp size={20} /></span><span>待确认事项<strong>01<small>项</small></strong></span><span className="stat-footer">核对后，行动更放心 <ArrowUpRight size={15} /></span></button><div className="stat"><span className="stat-icon green"><CheckCheck size={20} /></span><span>已完成任务<strong>{String(allDone).padStart(2, '0')}<small>项</small></strong></span><span className="stat-footer">继续保持你的节奏 <span className="mini-bars">▂ ▄ ▃ ▆ ▅ █</span></span></div></section>
          <div className="dashboard-grid"><section className="matters"><div className="section-heading"><h2>我的事项 <span>03</span></h2><label className="search"><Search size={16} /><input aria-label="搜索事项" placeholder="搜索事项…" value={query} onChange={e => setQuery(e.target.value)} /></label></div><div className="tabs">{['全部事项', '准备中', '即将截止', '待确认'].map(t => <button key={t} className={filter === t ? 'selected' : ''} onClick={() => setFilter(t)}>{t}</button>)}</div>
            <div className="matter-list">{matters.map((m, i) => ({ m, i })).filter(({ m }) => m.title.includes(query) && (filter === '全部事项' || m.label === filter)).map(({ m, i }) => <button key={m.title} className="matter-card" onClick={() => detail(i)}><div className="matter-top"><span className={`matter-symbol ${m.color}`}>{m.icon}</span><span className={`pill ${m.color}`}>{m.label}</span></div><h3>{m.title}</h3><div className="matter-meta"><span>{m.type}</span><span><CalendarDays size={14} />{m.date}截止 · 示例</span></div><div className="progress-caption"><span>准备进度</span><strong>{tasks[i].filter(Boolean).length} / {m.total}</strong></div><div className="progress"><span style={{ width: `${tasks[i].filter(Boolean).length / m.total * 100}%` }} /></div><div className="next-task"><span><span className="tiny-circle" />{m.next}</span><ChevronRight size={16} /></div></button>)}{!matters.some(m => m.title.includes(query) && (filter === '全部事项' || m.label === filter)) && <div className="empty">没有符合条件的事项。<button className="text-button" onClick={() => { setQuery(''); setFilter('全部事项'); }}>重置筛选</button></div>}</div>
            <button className="add-card" onClick={() => go('parse')}><span><Plus size={20} /></span><strong>下一件重要的事，从这里开始</strong><small>粘贴一份通知，让 AI 帮你梳理要求</small></button>
          </section><aside className="right-column"><section className="reminder-panel" id="reminders"><div className="section-heading"><h2>最近提醒</h2><Bell size={17} /></div><span className="sample-caption">提醒样例 · 未实际发送</span><div className="reminder urgent"><span className="timeline-dot" /><small>截止前 3 天</small><h4>奖学金申请，别忘了补齐材料</h4><p>还有 3 项准备任务未完成，建议优先核对成绩单。</p><button onClick={() => detail(1)}>查看事项 <ArrowRight size={14} /></button></div><div className="reminder"><span className="timeline-dot" /><small>截止前 5 天</small><h4>英语六级报名需要你确认</h4><p>核对个人信息，完成最后一步报名准备。</p><button onClick={() => detail(2)}>去确认 <ArrowRight size={14} /></button></div><div className="reminder last"><span className="timeline-dot" /><small>截止前 24 小时</small><h4>最后一次提醒，会替你记着</h4><p>站内与邮件双渠道提醒，功能待接入。</p></div></section><section className="quiet-card"><ShieldCheck size={25} /><h3>每一项要求，都有据可查</h3><p>AI 提取关键内容，你保留最终判断。点击解析结果，随时回到原文。</p><button className="text-button" onClick={() => go('parse')}>体验原文溯源 <ArrowUpRight size={15} /></button></section></aside></div>
        </>}
        {page === 'parse' && <Parser />}
        {page === 'detail' && <><button className="back text-button" onClick={() => go('overview')}>← 返回事项总览</button><div className="page-heading"><div><div className="eyebrow">YOUR ACTION PLAN</div><h1>{current.title}</h1><p>将每一项要求，变成清晰的下一步。</p></div><span className={`pill ${current.color}`}>{current.label}</span></div><div className="demo-note"><CircleHelp size={16} />演示事项 · 勾选仅修改当前页面状态，不保存到数据库。</div><div className="detail-grid"><section className="panel"><div className="section-heading"><h2>行动清单</h2><span>{tasks[selected].filter(Boolean).length} / {current.total} 已完成</span></div>{(selected === 0 ? ['阅读赛事要求，确认参赛组别', '整理项目方案与 README', '整理代码仓库与 Prompt 迭代记录', '录制 5–8 分钟演示视频', '整理技术文档并核对提交材料'] : selected === 1 ? ['阅读奖学金申请通知', '核对成绩单与申请资格', '填写申请表并准备证明材料', '确认提交方式与具体截止时刻'] : ['阅读报名通知', '核对报名条件', '确认报名信息并缴费']).map((task, i) => <label className={`task-row ${tasks[selected][i] ? 'done' : ''}`} key={task}><input type="checkbox" checked={tasks[selected][i]} onChange={() => setTasks(old => ({ ...old, [selected]: old[selected].map((v, j) => j === i ? !v : v) }))} /><span>{task}<small>{i === 0 ? '用户计划 · 示例' : '准备建议 · 示例，尚未关联原文'}</small></span></label>)}<p className="muted">真实通知的原文证据可在“通知解析”页面查看。</p></section><section className="panel"><h2>截止与提醒</h2><div className="deadline-box"><CalendarDays size={22} /><div><small>演示截止日期</small><strong>{current.date}</strong><span>具体时刻待确认</span></div></div><h4>计划提醒节点</h4>{['截止前 5 天', '截止前 3 天', '截止前 24 小时'].map(t => <div className="reminder-node" key={t}><Bell size={16} />{t}<span>未接入</span></div>)}<p className="muted">站内消息与邮件发送尚未实现。确认截止时间后才能安排真实提醒。</p></section></div></>}
        <footer>DDL 雷达 <span>让每一份通知，都有下一步。</span><span className="footer-right">Built with intention.</span></footer>
      </div>
    </main>{toast && <div role="status" className="toast">{toast}</div>}
  </div>;
}

function Login({ enter }: { enter: () => void }) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  return <div className="login-page"><section className="login-story"><a className="brand" href="#login"><span className="brand-icon"><Radar size={27} /></span><span>DDL 雷达<small>YOUR NEXT MOVE</small></span></a><div className="login-copy"><div className="eyebrow">LESS OVERWHELM. MORE ACTION.</div><h1>重要的事，<br />不必靠记性。</h1><p>从一份复杂的通知，到清晰的行动清单。<br />让每一个截止，都心中有数。</p><div className="orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-center"><Radar size={44} /></div><div className="floating float-one"><span className="stat-icon blue"><FileSearch size={20} /></span><div><strong>通知里的要求，清清楚楚</strong><small>每个结论，都能回到原文</small></div><Check size={17} /></div><div className="floating float-two"><span className="stat-icon orange"><Bell size={20} /></span><div><strong>距离截止还有 3 天</strong><small>提醒样例 · 从容准备下一步</small></div></div></div></div><div className="login-story-footer"><ShieldCheck size={16} />AI 帮你梳理，你做最终决定。</div></section><section className="login-form-section"><div className="login-top"><span>你的个人行动空间</span><span className="demo-label">界面预览</span></div><div className="login-form"><div className="login-welcome"><span className="welcome-icon"><Radar size={26} /></span><h2>欢迎来到 DDL 雷达</h2><p>少一点手忙脚乱，多一点有条不紊。</p></div><form onSubmit={e => { e.preventDefault(); setMessage('真实登录尚未开放。请使用下方演示入口，不会保存你的密码。'); }}><label className="form-label">邮箱地址<input type="email" autoComplete="email" placeholder="you@example.com" required /></label><label className="form-label">密码<div className="password-input"><input type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="请输入密码" required /><button type="button" aria-label={show ? '隐藏密码' : '显示密码'} onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label><p className="login-disclosure">当前为界面预览，真实登录与注册尚未开放。</p><button className="primary login-submit" type="submit">登录 <ArrowRight size={17} /></button>{message && <div role="status" className="inline-message">{message}</div>}</form><div className="divider"><span>先看看它能做什么</span></div><button className="secondary demo-enter" onClick={enter}>进入演示工作空间 <ArrowUpRight size={17} /></button><p className="privacy"><ShieldCheck size={14} />演示无需账号，不保存登录表单内容。</p></div><div className="login-bottom">通知看得懂，事情不漏办。</div></section></div>;
}

function Parser() {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [result, setResult] = useState<Parsed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quote, setQuote] = useState('');
  const markRef = useRef<HTMLElement | null>(null);
  useEffect(() => { markRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [quote]);
  async function parse() {
    if (!text.trim() || loading) return;
    setLoading(true); setError(''); setResult(null); setQuote('');
    const submitted = text;
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch('/api/notices/parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: submitted }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : '请求未成功，请检查输入长度或稍后重试。');
      if (!data.title || !Array.isArray(data.issues) || !['eligibility', 'deadlines', 'materials', 'submission_methods'].every(k => Array.isArray(data[k]))) throw new Error('接口返回格式异常，请检查后端版本。');
      setSource(submitted); setResult(data);
    } catch (e) { setError(e instanceof Error && e.name === 'AbortError' ? '请求超时，请稍后重试。' : e instanceof TypeError ? '无法连接解析服务，请确认后端已在 8000 端口启动。' : e instanceof Error ? e.message : '解析失败，请重试。'); }
    finally { clearTimeout(timer); setLoading(false); }
  }
  const start = quote ? source.indexOf(quote) : -1;
  function factCard(f: Fact, i: number) { return <div className="fact-card" key={i}><div><strong>{f.value ?? '未说明'}</strong><span className={`pill ${f.status === 'needs_confirmation' ? 'orange' : 'blue'}`}>{f.status === 'needs_confirmation' ? '待确认' : f.status === 'not_stated' ? '未说明' : '已提取 · 待核对'}</span></div>{f.evidence.map((q, j) => <button className="quote-button" key={j} onClick={() => setQuote(q)}><Link2 size={13} />{q}</button>)}</div>; }
  return <><div className="page-heading"><div><div className="eyebrow">FROM INFORMATION TO ACTION</div><h1>把一份通知，变成清晰的下一步<span className="heading-dot">.</span></h1><p>提取重要要求，保留原文依据。最后的判断，交给你。</p></div></div><div className="parse-grid"><section className="panel source-panel"><div className="section-heading"><h2><FileText size={19} />原始通知</h2><button className="text-button" disabled={loading} onClick={() => { setText(sampleText); setResult(null); setQuote(''); }}>填入示例</button></div><label className="sr-only" htmlFor="notice-text">通知正文</label><textarea id="notice-text" placeholder="在这里粘贴通知全文…\n\n竞赛报名、奖学金申请、考试安排，都可以从这里开始。" maxLength={20000} disabled={loading} value={text} onChange={e => { setText(e.target.value); setResult(null); setQuote(''); setError(''); }} /><div className="input-meta"><span>支持粘贴文本 · PDF 导入待开放</span><span>{text.length} / 20,000</span></div><div className="privacy-note"><ShieldCheck size={16} /><span>点击解析后，正文将发送给 DeepSeek，可能产生 API 费用。请勿输入敏感资料。</span></div><button className="primary parse-submit" disabled={!text.trim() || loading} onClick={parse}>{loading ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}{loading ? '正在梳理要求…' : '开始智能解析'}</button>{error && <div className="error-box" role="alert"><AlertCircle size={18} />{error}</div>}{result && <div className="source-preview"><h4>原文溯源</h4><p>{start >= 0 ? <>{source.slice(0, start)}<mark ref={markRef}>{quote}</mark>{source.slice(start + quote.length)}</> : source}</p></div>}</section><section className="panel result-panel"><div className="section-heading"><h2><Sparkles size={19} />解析结果</h2><span className="pill blue">AI 辅助</span></div>{!result ? <div className="parse-empty">{loading ? <LoaderCircle className="spin" size={37} /> : <span className="empty-icon"><FileSearch size={34} /></span>}<h3>{loading ? '正在阅读你的通知' : '复杂的通知，简单地理清'}</h3><p>{loading ? '提取关键要求并校验原文引用，请稍候。' : '粘贴通知并开始解析后，\n在这里查看要求、证据和待确认内容。'}</p><div className="empty-steps"><span><Check size={14} />关键要求</span><span><Check size={14} />原文依据</span><span><Check size={14} />疑点提示</span></div></div> : <div className="result-content"><div className="result-note">提取不等于确认。点击引用可在左侧原文中定位；引用匹配不能保证结论准确，请人工核对。</div>{[['事项名称', [result.title]], ['报名资格', result.eligibility], ['关键时间', result.deadlines], ['提交材料', result.materials], ['提交方式', result.submission_methods]].map(([label, facts]) => <section className="fact-group" key={label as string}><h4>{label as string}</h4>{(facts as Fact[]).length ? (facts as Fact[]).map(factCard) : <p className="muted">未提取到相关信息，请核对原文。</p>}</section>)}<section className="issues"><h4><CircleHelp size={17} />待确认问题</h4>{result.issues.length ? result.issues.map((issue, i) => <div key={i}><p>{i + 1}. {issue.question}</p>{issue.evidence.map((q, j) => <button className="quote-button" key={j} onClick={() => setQuote(q)}>{q}</button>)}</div>) : <p>模型未提出疑点，请自行检查是否有遗漏。</p>}</section><div className="inline-message">当前仅解析，不保存到数据库。任务生成与人工确认保存将在后续接入。</div></div>}</section></div></>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);

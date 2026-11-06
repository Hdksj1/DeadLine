import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Radar, LayoutDashboard, FileSearch, Bell, ArrowUpRight, ArrowRight, Plus, Search, ChevronRight, Clock3, Check, CheckCheck, CircleHelp, LogOut, CalendarDays, FileText, ShieldCheck, Eye, EyeOff, Menu, X, ListChecks, ArrowLeft } from 'lucide-react';
import { demoMatters, initialTasks, matterStatus } from './data/demo';
import { NoticeParser } from './components/NoticeParser';
import './styles.css';

type Page = 'login' | 'overview' | 'parse' | 'detail';
const filters = ['全部事项', '进行中', '临期', '待确认', '已完成'] as const;
type Filter = typeof filters[number];
function route() {
  const [page, id] = location.hash.slice(1).split('/');
  if (page === 'detail' && demoMatters.some(m => m.id === id)) return { page: 'detail' as Page, id: id! };
  return { page: (page === 'parse' || page === 'overview' || page === 'reminders' ? page === 'reminders' ? 'overview' : page : 'login') as Page, id: demoMatters[0].id };
}
function Brand() { return <><span className="brand-icon"><Radar size={25} /></span><span>DDL 雷达<small>YOUR NEXT MOVE</small></span></>; }
function DemoNote({ children }: { children?: React.ReactNode }) { return <div className="demo-note"><CircleHelp size={18} /><span>{children ?? '固定演示数据 · 日期不代表真实倒计时；操作仅在本次页面会话生效，刷新后重置。'}</span></div>; }
function Progress({ done, total }: { done: number; total: number }) { return <><div className="progress-caption"><span>准备进度</span><strong>{done} / {total} 已完成</strong></div><div className="progress" role="progressbar" aria-label="任务完成进度" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}><span style={{ width: `${done / total * 100}%` }} /></div></>; }
function App() {
  const [currentRoute, setRoute] = useState(route);
  const [mobile, setMobile] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('全部事项');
  const [tasks, setTasks] = useState(initialTasks);
  const sidebarRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const { page, id } = currentRoute;
  useEffect(() => {
    const handler = () => { setRoute(route()); setMobile(false); };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  useEffect(() => {
    if (page === 'login') return;
    const frame = requestAnimationFrame(() => {
      const target = location.hash === '#reminders' ? document.getElementById('reminders') : mainRef.current?.querySelector<HTMLElement>('h1');
      target?.focus({ preventScroll: true });
      if (location.hash === '#reminders') target?.scrollIntoView({ block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [currentRoute, page]);
  useEffect(() => {
    if (!mobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebarRef.current?.querySelector<HTMLButtonElement>('.drawer-close')?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); setMobile(false); }
      if (e.key !== 'Tab') return;
      const nodes = sidebarRef.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)');
      if (!nodes?.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    const media = matchMedia('(max-width: 720px)');
    const resize = () => { if (!media.matches) setMobile(false); };
    window.addEventListener('keydown', handleKey); media.addEventListener('change', resize);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', handleKey); media.removeEventListener('change', resize); menuRef.current?.focus(); };
  }, [mobile]);
  function go(hash: string) {
    setMobile(false);
    if (location.hash === `#${hash}`) {
      if (hash === 'reminders') { const r = document.getElementById('reminders'); r?.focus(); r?.scrollIntoView({ block: 'start' }); }
      return;
    }
    location.hash = hash;
  }
  function openDetail(matterId: string) { go(`detail/${matterId}`); }
  const matching = demoMatters.filter(m => `${m.title} ${m.category}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const active = matching.filter(m => matterStatus(m, tasks[m.id]) !== '已完成');
  const due = active.filter(m => matterStatus(m, tasks[m.id]) === '临期');
  const uncertain = active.filter(m => matterStatus(m, tasks[m.id]) === '待确认');
  const completedTasks = matching.reduce((sum, m) => sum + tasks[m.id].filter(Boolean).length, 0);
  const visible = matching.filter(m => filter === '全部事项' || (filter === '进行中' ? matterStatus(m, tasks[m.id]) !== '已完成' : matterStatus(m, tasks[m.id]) === filter));
  const current = demoMatters.find(m => m.id === id)!;
  const currentChecked = tasks[current.id];
  const statusClass = (status: string) => status === '临期' || status === '待确认' ? 'orange' : status === '已完成' ? 'neutral' : 'blue';
  if (page === 'login') return <Login enter={() => go('overview')} />;
  return <div className="app">
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); mainRef.current?.focus(); }}>跳到主要内容</a>
    {mobile && <button tabIndex={-1} className="scrim" aria-label="关闭导航" onClick={() => setMobile(false)} />}
    <aside ref={sidebarRef} id="workspace-nav" className={`sidebar ${mobile ? 'open' : ''}`} role={mobile ? 'dialog' : undefined} aria-modal={mobile || undefined} aria-label="工作空间导航">
      <button className="drawer-close icon-button" aria-label="关闭导航" onClick={() => setMobile(false)}><X size={22} /></button>
      <a className="brand" href="#overview" onClick={() => setMobile(false)}><Brand /></a>
      <div className="workspace"><span className="avatar small">D</span><span>个人演示空间<small>本地原型体验</small></span><span className="demo-tag">演示</span></div>
      <div className="nav-caption">工作空间</div>
      <nav aria-label="主导航"><button className={page === 'overview' ? 'active' : ''} aria-current={page === 'overview' ? 'page' : undefined} onClick={() => go('overview')}><LayoutDashboard size={20} />事项总览</button><button className={page === 'parse' ? 'active' : ''} aria-current={page === 'parse' ? 'page' : undefined} onClick={() => go('parse')}><FileSearch size={20} />通知解析<span className="nav-new">AI</span></button><button onClick={() => go('reminders')}><Bell size={20} />提醒中心<span className="count">样例</span></button></nav>
      <div className="sidebar-tip"><ShieldCheck size={23} /><strong>有依据，才更安心。</strong><p>AI 帮你梳理要求，<br />你保留最终判断。</p><button className="text-button" onClick={() => go('parse')}>解析一份通知 <ArrowUpRight size={16} /></button></div>
      <div className="sidebar-bottom"><span className="avatar">D</span><span>演示体验者<small>未登录 · 不保存数据</small></span><button className="icon-button" aria-label="返回登录页" onClick={() => go('login')}><LogOut size={19} /></button></div>
    </aside>
    <main ref={mainRef} id="main-content" tabIndex={-1} inert={mobile}>
      <header className="topbar"><div className="breadcrumbs"><button ref={menuRef} className="mobile-menu icon-button" aria-label="打开导航" aria-expanded={mobile} aria-controls="workspace-nav" onClick={() => setMobile(true)}><Menu size={23} /></button><span>个人空间</span><ChevronRight size={15} /><strong>{page === 'overview' ? '事项总览' : page === 'parse' ? '通知解析' : '事项详情'}</strong></div><div className="top-actions"><span className="demo-label">演示工作空间</span><button className="icon-button" aria-label="查看提醒样例" onClick={() => go('reminders')}><Bell size={20} /></button><span className="avatar small" aria-hidden="true">D</span></div></header>
      <div className="content">
        {page === 'overview' && <>
          <div className="page-heading"><div><div className="eyebrow">MAKE ROOM FOR WHAT MATTERS</div><h1 tabIndex={-1}>每一个截止，都心中有数<span className="heading-dot">.</span></h1><p>把通知变成行动，让准备更有条理。</p></div><button className="primary" onClick={() => go('parse')}><Plus size={19} />解析新通知</button></div>
          <DemoNote />
          <p className="scope-note">统计范围：{query.trim() ? `搜索“${query.trim()}”匹配的 ${matching.length} 项` : '全部演示事项'}；下方状态筛选不改变统计范围。临期为固定样例标签，不按今天计算。</p>
          <section className="stats" aria-label="当前搜索范围统计">
            {[{ label: '进行中事项', count: active.length, Icon: LayoutDashboard, color: 'blue', caption: '包含临期与待确认', target: '进行中' as Filter }, { label: '临期事项', count: due.length, Icon: Clock3, color: 'orange', caption: '固定状态 · 非真实倒计时', target: '临期' as Filter }, { label: '待确认事项', count: uncertain.length, Icon: CircleHelp, color: 'orange', caption: '核对疑点后再行动', target: '待确认' as Filter }].map(s => <button className="stat" key={s.label} aria-pressed={filter === s.target} onClick={() => setFilter(s.target)}><span className={`stat-icon ${s.color}`}><s.Icon size={21} /></span><span>{s.label}<strong>{s.count}<small>项</small></strong></span><span className="stat-footer">{s.caption}<ArrowUpRight size={15} /></span></button>)}
            <div className="stat"><span className="stat-icon blue"><CheckCheck size={21} /></span><span>已完成任务<strong>{completedTasks}<small>项</small></strong></span><span className="stat-footer">随演示任务勾选同步更新<Check size={15} /></span></div>
          </section>
          <div className="dashboard-grid"><section className="matters" aria-labelledby="matters-title"><div className="section-heading"><h2 id="matters-title">我的事项 <span>{visible.length} 项</span></h2><label className="search"><Search size={17} /><input type="search" aria-label="搜索事项名称或类别" placeholder="搜索事项或类别" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
            <div className="tabs" role="group" aria-label="事项状态筛选">{filters.map(f => <button key={f} className={filter === f ? 'selected' : ''} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>)}</div>
            <p className="result-count" role="status">当前显示 {visible.length} / {matching.length} 项 · {filter}</p>
            <div className="matter-list">{visible.map(m => {
              const checked = tasks[m.id], done = checked.filter(Boolean).length;
              const status = matterStatus(m, checked), next = m.tasks.find((_, i) => !checked[i]);
              return <button className="matter-card" key={m.id} onClick={() => openDetail(m.id)}><div className="matter-top"><span className="matter-symbol blue">{m.category === '学科竞赛' ? <Radar size={22} /> : m.category === '奖助申请' ? <FileText size={22} /> : <CalendarDays size={22} />}</span><span className={`pill ${statusClass(status)}`}>{status === '已完成' ? <Check size={13} /> : status === '待确认' ? <CircleHelp size={13} /> : <Clock3 size={13} />}{status} · 演示</span></div><h3>{m.title}</h3><div className="matter-meta"><span>{m.category}</span><span><CalendarDays size={14} />{m.date} · 示例日期</span></div><Progress done={done} total={m.tasks.length} /><div className="next-task"><span><ListChecks size={16} />{next ? `下一步：${next.text}` : '演示任务已全部完成'}</span><ChevronRight size={17} /></div></button>;
            })}{!visible.length && <div className="empty"><FileSearch size={30} /><h3>没有匹配的事项</h3><p>试试其他关键词，或恢复全部演示事项。</p><button className="secondary" onClick={() => { setQuery(''); setFilter('全部事项'); }}>重置搜索与筛选</button></div>}</div>
            <button className="add-card" onClick={() => go('parse')}><span><Plus size={22} /></span><strong>下一件重要的事，从一份通知开始</strong><small>粘贴文本，梳理要求 <ArrowRight size={15} /></small></button>
          </section><aside className="right-column"><section className="reminder-panel" id="reminders" tabIndex={-1} aria-labelledby="reminders-title"><div className="section-heading"><h2 id="reminders-title">提醒中心</h2><Bell size={20} /></div><p className="sample-caption">固定样例 · 站内与邮件均未接入</p>{['截止前 5 天', '截止前 3 天', '截止前 24 小时'].map((node, i) => <div className={`reminder ${i === 1 ? 'urgent' : ''}`} key={node}><small>{node} · 提醒样例</small><h3>{['先把准备清单理一理', '核对还未完成的材料', '最后检查提交要求'][i]}</h3><p>仅展示计划节点，不代表已安排或发送。</p><span className="pill neutral">未接入</span></div>)}</section><section className="quiet-card"><ShieldCheck size={27} /><h3>每一项要求，都有据可查</h3><p>从原文出发，让结论可核对，让疑点被看见。</p><button className="text-button" onClick={() => go('parse')}>体验原文溯源 <ArrowUpRight size={16} /></button></section></aside></div>
        </>}
        {page === 'parse' && <NoticeParser />}
        {page === 'detail' && <>
          <button className="back text-button" onClick={() => go('overview')}><ArrowLeft size={17} />返回事项总览</button><div className="page-heading"><div><div className="eyebrow">YOUR ACTION PLAN</div><h1 tabIndex={-1}>{current.title}</h1><p>{current.category} · 演示事项</p></div><span className={`pill ${statusClass(matterStatus(current, currentChecked))}`}>{matterStatus(current, currentChecked)}</span></div><DemoNote>演示任务未关联真实原文，均为示例计划或建议；勾选仅在本次页面会话生效，刷新后重置。</DemoNote>
          <div className="detail-grid"><section className="panel"><div className="section-heading"><h2>行动清单</h2><ListChecks size={20} /></div><Progress done={currentChecked.filter(Boolean).length} total={current.tasks.length} /><div className="task-list">{current.tasks.map((task, i) => <label className={`task-row ${currentChecked[i] ? 'done' : ''}`} key={task.text}><input type="checkbox" checked={currentChecked[i]} onChange={() => setTasks(old => ({ ...old, [current.id]: old[current.id].map((v, j) => i === j ? !v : v) }))} /><span><span className="task-title">{task.text}</span><small>{task.source} · 演示，未关联原文</small></span><span className="task-state">{currentChecked[i] ? '已勾选' : '未完成'}</span></label>)}</div><p className="muted">来源可分为原文要求、AI 建议、用户计划；本页没有真实依据，因此不将示例任务标为“原文要求”。</p><p className="sr-only" role="status">已勾选 {currentChecked.filter(Boolean).length} / {current.tasks.length} 项</p></section><section className="panel"><h2>截止与提醒</h2><div className="deadline-box"><CalendarDays size={25} /><div><small>演示截止日期 · 非倒计时</small><strong>{current.date}</strong><span>具体截止时刻待确认</span></div></div><h3>计划提醒节点</h3>{['截止前 5 天', '截止前 3 天', '截止前 24 小时'].map(t => <div className="reminder-node" key={t}><Bell size={17} /><span>{t}</span><span className="pill neutral">未接入</span></div>)}<div className="channels"><span>站内消息：未接入</span><span>邮件发送：未接入</span></div><p className="muted">未创建真实提醒计划，也未发送通知。人工确认保存与数据库任务管理尚未实现。</p></section></div>
        </>}
        <footer><strong>DDL 雷达</strong><span>让每一份通知，都有下一步。</span><span className="footer-right">原型体验 · 数据不持久化</span></footer>
      </div>
    </main>
  </div>;
}
function Login({ enter }: { enter: () => void }) {
  const [show, setShow] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  function enterDemo() { formRef.current?.reset(); setShow(false); enter(); }
  return <div className="login-page"><section className="login-story"><a className="brand" href="#login"><Brand /></a><div className="login-copy"><div className="eyebrow">LESS OVERWHELM. MORE ACTION.</div><h1>通知看得懂，<br />事情不漏办<span className="heading-dot">。</span></h1><p>从一份复杂通知，到有依据的行动清单。<br />把准备理清楚，把判断留给你。</p><div className="story-flow" aria-label="产品计划流程示意"><div><span className="stat-icon blue"><FileText size={23} /></span><strong>一份校园通知</strong><small>竞赛 · 奖学金 · 考试 · 教务</small></div><ArrowRight className="flow-arrow" size={21} /><div><span className="stat-icon blue"><FileSearch size={23} /></span><strong>有依据的要求</strong><small>关联原文，标出疑点</small></div><ArrowRight className="flow-arrow" size={21} /><div><span className="stat-icon orange"><ListChecks size={23} /></span><strong>清晰的下一步</strong><small>计划功能 · 人工确认后行动</small></div></div><div className="story-caption"><ShieldCheck size={18} />AI 帮你梳理，你做最终决定。</div></div><div className="login-story-footer">你的校园通知行动助手</div></section><section className="login-form-section"><div className="login-top"><span>个人行动空间</span><span className="pill neutral">原型预览</span></div><div className="login-form"><div className="login-welcome"><span className="welcome-icon"><Radar size={27} /></span><h2>欢迎来到 DDL 雷达</h2><p>少一点手忙脚乱，多一点有条不紊。</p></div><div className="inline-message" id="login-notice">真实登录尚未开放。无需填写账号，直接进入下方演示空间。</div><form ref={formRef} onSubmit={e => e.preventDefault()} autoComplete="off" aria-describedby="login-notice"><label className="form-label" htmlFor="preview-email">邮箱地址<input id="preview-email" type="email" autoComplete="off" placeholder="you@example.com" /></label><label className="form-label" htmlFor="preview-password">密码</label><div className="password-input"><input id="preview-password" type={show ? 'text' : 'password'} autoComplete="new-password" placeholder="仅作界面预览，请勿输入真实密码" /><button type="button" aria-label={show ? '隐藏密码' : '显示密码'} aria-pressed={show} onClick={() => setShow(v => !v)}>{show ? <EyeOff size={19} /> : <Eye size={19} />}</button></div><button className="primary login-submit" type="button" disabled aria-describedby="login-notice">登录尚未开放 <ArrowRight size={18} /></button></form><div className="divider"><span>先看看它能做什么</span></div><button className="secondary demo-enter" onClick={enterDemo}>进入演示工作空间 <ArrowUpRight size={18} /></button><p className="privacy"><ShieldCheck size={16} />无需账号，不发送或保存登录表单内容。</p><p className="muted">注册、找回密码尚未实现。</p></div><div className="login-bottom">通知看得懂，事情不漏办。</div></section></div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
export type TaskSource = 'AI 建议' | '用户计划';
export type DemoTask = { text: string; source: TaskSource; done: boolean };
export type DemoMatter = {
  id: string; title: string; category: string; date: string;
  initialStatus: '准备中' | '临期' | '待确认'; tasks: DemoTask[];
};
export const demoMatters: DemoMatter[] = [
  { id: 'competition', title: '全国高校 Vibe Coding 开发挑战赛', category: '学科竞赛', date: '2026-11-18', initialStatus: '准备中', tasks: [
    { text: '阅读赛事要求，确认参赛组别', source: '用户计划', done: true },
    { text: '整理项目方案与 README', source: '用户计划', done: true },
    { text: '整理代码仓库与 AI 协同记录', source: 'AI 建议', done: false },
    { text: '准备演示脚本并录制视频', source: 'AI 建议', done: false },
    { text: '核对最终提交材料', source: '用户计划', done: false },
  ] },
  { id: 'scholarship', title: '2026 秋季学期奖学金申请', category: '奖助申请', date: '2026-11-09', initialStatus: '临期', tasks: [
    { text: '阅读奖学金申请通知', source: '用户计划', done: true },
    { text: '核对成绩单与申请资格', source: 'AI 建议', done: false },
    { text: '准备申请表及证明材料', source: 'AI 建议', done: false },
    { text: '确认提交渠道和截止时刻', source: '用户计划', done: false },
  ] },
  { id: 'exam', title: '大学英语六级考试报名', category: '考试报名', date: '2026-11-12', initialStatus: '待确认', tasks: [
    { text: '阅读考试报名通知', source: '用户计划', done: true },
    { text: '核对报名条件', source: '用户计划', done: true },
    { text: '确认报名信息与缴费流程', source: 'AI 建议', done: false },
  ] },
];
export const sampleText = '【教学演示通知，非正式赛事文件】\n校园创意应用挑战赛\n参赛对象：本校全日制在校学生，个人报名。\n作品提交截止日期：2026年11月18日。\n提交材料：项目代码仓库、项目说明文档和演示视频。\n演示视频时长为5—8分钟。\n通过学校竞赛平台提交作品。\n具体截止时刻未说明，请向组织方确认。';
export function initialTasks(): Record<string, boolean[]> {
  return Object.fromEntries(demoMatters.map(m => [m.id, m.tasks.map(t => t.done)]));
}
export function matterStatus(m: DemoMatter, checked: boolean[]) {
  return checked.every(Boolean) ? '已完成' : m.initialStatus;
}
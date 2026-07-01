// 훅 템플릿 — 인기 콘텐츠 리서치(2025-26)에서 추출. 표지 첫 줄은 "교훈"이 아니라 "긴장"을 만든다.
// 규칙: ≤10단어, 1줄. 계정당 3~4개 로테이션. tone 으로 earnest/ironic 필터.
export type HookTone = 'earnest' | 'ironic';

export interface HookTemplate {
  id: string;
  template: string; // {중괄호} = 채울 슬롯
  example: string;
  tone: HookTone;
  fields: string[];
}

export const HOOK_TEMPLATES: HookTemplate[] = [
  { id: 'H1-contrarian', template: '{belief} is actually {opposite}.', example: "Discipline isn't motivation. It's self-respect.", tone: 'earnest', fields: ['belief', 'opposite'] },
  { id: 'H2-withheld', template: 'Nobody tells you that {truth}.', example: 'Nobody tells you that peace is a skill, not a mood.', tone: 'earnest', fields: ['truth'] },
  { id: 'H3-diagnose', template: 'The reason you {pain} is {reframe}.', example: "The reason you're anxious is you rehearse the future.", tone: 'earnest', fields: ['pain', 'reframe'] },
  { id: 'H4-authority', template: '{philosopher} spent his life on one idea: {idea}.', example: 'Marcus Aurelius ruled an empire by one rule: control less.', tone: 'earnest', fields: ['philosopher', 'idea'] },
  { id: 'H5-cost', template: 'What {avoidance} is quietly costing you.', example: 'What needing to be right is quietly costing you.', tone: 'earnest', fields: ['avoidance'] },
  { id: 'H6-paradox', template: 'To {gain}, you have to {give up}.', example: 'To feel in control, stop trying to control.', tone: 'earnest', fields: ['gain', 'giveup'] },
  { id: 'H7-counting', template: '{n} things stoics refuse to {verb}.', example: '7 things stoics refuse to react to.', tone: 'earnest', fields: ['n', 'verb'] },
  { id: 'H8-confession', template: 'I {wrong} for {time}. Here is what changed.', example: 'I chased calm for 10 years. Then I stopped chasing.', tone: 'earnest', fields: ['wrong', 'time'] },
  { id: 'H9-stop', template: 'Stop {behavior}. {reframe}.', example: 'Stop explaining yourself. Silence is an answer.', tone: 'earnest', fields: ['behavior', 'reframe'] },
  { id: 'H10-ifthen', template: 'If you {trait}, read this twice.', example: 'If you overthink everything, read this twice.', tone: 'earnest', fields: ['trait'] },
  { id: 'H11-question', template: 'What if {assumption} was the problem all along?', example: 'What if your standards, not your effort, were the problem?', tone: 'earnest', fields: ['assumption'] },
  { id: 'H12-timemachine', template: '{figure} already solved your {problem}.', example: 'Seneca already solved your phone addiction. 2000 years ago.', tone: 'earnest', fields: ['figure', 'problem'] },
  // 풍자: 같은 형식을 흉내 내되 비튼다(가짜 출처/반전/자조).
  { id: 'S1-misattrib', template: '{mundane truth} — {philosopher}, probably.', example: 'Touch grass. — Marcus Aurelius, probably.', tone: 'ironic', fields: ['mundane', 'philosopher'] },
  { id: 'S2-anticlimax', template: 'A quote that will not {grand promise}.', example: 'A motivational quote that will not fix your life.', tone: 'ironic', fields: ['promise'] },
];

export const hooksByTone = (tone: HookTone) => HOOK_TEMPLATES.filter((h) => h.tone === tone);

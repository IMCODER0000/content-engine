// 검증된 인용 코퍼스 — 퍼블릭도메인 + 출처 필수. (가짜 인용 방지 = 셀링포인트)
// source 는 저작/표준 출처. 미검증 인용은 절대 추가하지 말 것.

export interface Quote {
  id: string;
  text: string;
  author: string;
  source: string; // 출처(저작·권/장)
}

export const STOIC: Quote[] = [
  {
    id: 'aurelius-1',
    text: 'You have power over your mind — not outside events. Realize this, and you will find strength.',
    author: 'Marcus Aurelius',
    source: 'Meditations, Book VIII',
  },
  {
    id: 'aurelius-2',
    text: 'The happiness of your life depends upon the quality of your thoughts.',
    author: 'Marcus Aurelius',
    source: 'Meditations',
  },
  {
    id: 'seneca-1',
    text: 'We suffer more often in imagination than in reality.',
    author: 'Seneca',
    source: 'Letters to Lucilius, XIII',
  },
  {
    id: 'seneca-2',
    text: 'Luck is what happens when preparation meets opportunity.',
    author: 'Seneca',
    source: 'attributed (verify before publishing)',
  },
  {
    id: 'epictetus-1',
    text: 'It is not what happens to you, but how you react to it that matters.',
    author: 'Epictetus',
    source: 'Enchiridion',
  },
  {
    id: 'epictetus-2',
    text: 'No man is free who is not master of himself.',
    author: 'Epictetus',
    source: 'Discourses',
  },
];

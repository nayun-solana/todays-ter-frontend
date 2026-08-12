const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
/** 한 글자당 종성 21개 × 중성 21개. 종성 인덱스 0이 받침 없음. */
const JONGSEONG_COUNT = 28;

/**
 * 마지막 글자에 받침이 있는지.
 * 한글 음절 영역 밖(영문·숫자·기호)이면 판단할 수 없으므로 false로 본다 —
 * 이 파일이 다루는 건 화면 문구의 명사라 한글이 아닌 경우가 사실상 없다.
 */
function hasFinalConsonant(word: string): boolean {
  const lastCharacter = word.trim().at(-1);
  if (!lastCharacter) return false;

  const code = lastCharacter.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return false;

  return (code - HANGUL_START) % JONGSEONG_COUNT !== 0;
}

/**
 * 목적격 조사를 붙인다. "장소" → "장소를", "알림" → "알림을".
 *
 * 문구를 조립할 때 조사를 고정해두면("장소을") 어색해지고, 그렇다고 명사마다 완성된
 * 문장을 따로 적으면 같은 문장이 화면 수만큼 늘어난다.
 */
export function withObjectParticle(noun: string): string {
  return `${noun}${hasFinalConsonant(noun) ? '을' : '를'}`;
}

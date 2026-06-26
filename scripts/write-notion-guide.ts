import { Client } from '@notionhq/client';
import 'dotenv/config';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const parentPageId = process.env.NOTION_PAGE_ID;

if (!parentPageId) {
  throw new Error('NOTION_PAGE_ID is required.');
}

type Block = Parameters<typeof notion.blocks.children.append>[0]['children'][number];

const text = (content: string, annotations?: Record<string, boolean>) => ({
  type: 'text' as const,
  text: { content },
  annotations,
});

const paragraph = (content: string): Block => ({
  object: 'block',
  type: 'paragraph',
  paragraph: { rich_text: content ? [text(content)] : [] },
});

const heading1 = (content: string): Block => ({
  object: 'block',
  type: 'heading_1',
  heading_1: { rich_text: [text(content)] },
});

const heading2 = (content: string): Block => ({
  object: 'block',
  type: 'heading_2',
  heading_2: { rich_text: [text(content)] },
});

const heading3 = (content: string): Block => ({
  object: 'block',
  type: 'heading_3',
  heading_3: { rich_text: [text(content)] },
});

const bullet = (content: string): Block => ({
  object: 'block',
  type: 'bulleted_list_item',
  bulleted_list_item: { rich_text: [text(content)] },
});

const numbered = (content: string): Block => ({
  object: 'block',
  type: 'numbered_list_item',
  numbered_list_item: { rich_text: [text(content)] },
});

const code = (content: string, language = 'plain text'): Block => ({
  object: 'block',
  type: 'code',
  code: {
    rich_text: [text(content)],
    language,
  },
});

const callout = (content: string): Block => ({
  object: 'block',
  type: 'callout',
  callout: {
    rich_text: [text(content)],
    icon: { type: 'emoji', emoji: '💡' },
  },
});

const divider = (): Block => ({
  object: 'block',
  type: 'divider',
  divider: {},
});

const blocks: Block[] = [
  callout(
    '이 문서는 개발을 잘 모르는 팀원도 GitHub 협업 흐름을 따라갈 수 있도록 만든 가이드입니다.',
  ),
  heading1('오늘의 터 Frontend Git 협업 가이드'),
  paragraph(
    '우리 팀은 Issue를 먼저 만들고, Issue 번호로 브랜치를 생성한 뒤, Pull Request로 리뷰받고 dev 브랜치에 합치는 방식으로 작업합니다.',
  ),
  divider(),

  heading2('1. 전체 작업 흐름'),
  numbered('작업할 내용을 GitHub Issue로 생성합니다.'),
  numbered('Issue 번호를 확인합니다. 예: #12'),
  numbered('Issue 번호를 포함한 브랜치를 생성합니다. 예: feature/12-login-page'),
  numbered('내 브랜치에서 작업합니다.'),
  numbered('커밋 메시지에 Issue 번호를 포함합니다. 예: feat: 로그인 페이지 구현 (#12)'),
  numbered('GitHub에 push합니다.'),
  numbered('내 브랜치에서 dev 브랜치로 PR을 생성합니다.'),
  numbered('팀원에게 코드 리뷰를 받습니다.'),
  numbered('리뷰 승인 후 dev에 merge합니다.'),
  numbered('평가 또는 배포 시점에만 dev에서 main으로 merge합니다.'),
  heading3('예시'),
  code(`1. "로그인 페이지 구현" Issue 생성
2. Issue 번호 #12 확인
3. feature/12-login-page 브랜치 생성
4. 로그인 페이지 작업
5. feat: 로그인 페이지 구현 (#12) 커밋
6. GitHub에 push
7. feature/12-login-page → dev 로 PR 생성
8. 팀원 리뷰
9. dev에 merge`),

  heading2('2. 처음 프로젝트 받는 방법'),
  numbered('프로젝트를 저장할 위치로 이동합니다. 예: cd ~/Desktop'),
  numbered('GitHub Repository를 clone합니다.'),
  code('git clone https://github.com/nayun-solana/todays-ter-frontend.git', 'bash'),
  numbered('프로젝트 폴더로 이동합니다.'),
  code('cd todays-ter-frontend', 'bash'),
  numbered('패키지를 설치합니다.'),
  code('pnpm install', 'bash'),
  numbered('개발 서버를 실행합니다.'),
  code('pnpm dev', 'bash'),
  paragraph('터미널에 나온 주소를 브라우저에서 엽니다. 예: http://localhost:5173'),

  heading2('3. 브랜치 역할'),
  heading3('main'),
  paragraph('main은 평가 또는 배포용 브랜치입니다. 평소에는 직접 작업하지 않습니다.'),
  bullet('최종 제출본 또는 안정 버전만 들어갑니다.'),
  bullet('직접 push하지 않습니다.'),
  bullet('평가 또는 배포 시점에만 dev에서 main으로 PR을 생성합니다.'),
  code('main = 최종 제출본 / 안정 버전'),
  heading3('dev'),
  paragraph('dev는 개발 중인 작업을 모으는 통합 브랜치입니다.'),
  bullet('각자 만든 작업 브랜치는 최종적으로 dev에 합쳐집니다.'),
  bullet('dev에 직접 push하지 않습니다.'),
  bullet('PR과 리뷰를 거쳐 merge합니다.'),
  code('dev = 개발 중인 최신 통합본'),
  heading3('feature/*'),
  paragraph('새로운 기능을 개발할 때 사용합니다.'),
  code(`feature/12-login-page
feature/15-common-button
feature/20-main-layout`),
  heading3('fix/*'),
  paragraph('버그를 수정할 때 사용합니다.'),
  code(`fix/23-mobile-layout
fix/31-login-error
fix/40-button-click-bug`),
  heading3('docs/*'),
  paragraph('README, 노션, 문서 수정 시 사용합니다.'),
  code(`docs/18-update-readme
docs/27-git-guide
docs/33-update-notion-rule`),
  heading3('chore/*'),
  paragraph('설정, 패키지 설치, 환경 구성 작업 시 사용합니다.'),
  code(`chore/21-eslint-config
chore/30-branch-protection
chore/35-install-package`),
  heading3('design/*'),
  paragraph('UI 디자인, 레이아웃, 스타일 수정 시 사용합니다.'),
  code(`design/44-home-layout
design/45-button-style`),
  heading3('refactor/*'),
  paragraph('기능 변화 없이 코드 구조를 개선할 때 사용합니다.'),
  code(`refactor/50-component-structure
refactor/51-folder-structure`),

  heading2('4. Issue 생성 방법'),
  numbered('GitHub Repository에서 Issues를 클릭합니다.'),
  numbered('New issue를 클릭합니다.'),
  numbered('작업 종류에 맞는 템플릿을 선택합니다.'),
  numbered('제목과 내용을 작성합니다.'),
  numbered('담당자, 라벨, Project를 지정합니다.'),
  numbered('Submit new issue를 클릭합니다.'),
  heading3('Issue 제목 예시'),
  code(`feat: 로그인 페이지 구현
feat: 공통 Button 컴포넌트 추가
fix: 모바일 헤더 깨짐 수정
docs: README 실행 방법 수정
chore: ESLint 설정 추가
design: 홈 화면 레이아웃 수정`),
  paragraph(
    'Issue가 생성되면 #12 같은 번호가 생깁니다. 이 번호를 브랜치명, 커밋 메시지, PR 본문에 사용합니다.',
  ),

  heading2('5. Issue 템플릿 예시'),
  heading3('기능 개발 Issue'),
  paragraph('사용 예시: 로그인 페이지 구현, 회원가입 페이지 구현, 공통 버튼 컴포넌트 추가'),
  code(`제목: feat: 로그인 페이지 구현

작업 요약:
사용자가 이메일과 비밀번호를 입력해 로그인할 수 있는 페이지를 구현합니다.

작업 항목:
- 이메일 입력창 구현
- 비밀번호 입력창 구현
- 로그인 버튼 구현
- 모바일 화면 확인

참고 자료:
- Figma 로그인 화면
- API 명세서`),
  heading3('버그 수정 Issue'),
  code(`제목: fix: 모바일 화면 버튼 깨짐 수정

문제 상황:
모바일 화면에서 로그인 버튼이 화면 밖으로 벗어납니다.

재현 방법:
1. 모바일 크기로 화면 축소
2. 로그인 페이지 접속
3. 하단 버튼 확인

기대 동작:
버튼이 화면 안에 정상적으로 보여야 합니다.`),
  heading3('작업 관리 Issue'),
  code(`제목: chore: ESLint 설정 추가

작업 유형: chore

작업 요약:
프로젝트 코드 품질 검사를 위해 ESLint 설정을 추가합니다.

작업 항목:
- ESLint 패키지 설치
- ESLint 설정 파일 추가
- lint 명령어 확인`),

  heading2('6. 브랜치 생성 방법'),
  paragraph('작업은 항상 dev에서 시작합니다.'),
  code(
    `git checkout dev
git pull origin dev`,
    'bash',
  ),
  heading3('브랜치 생성 예시'),
  code(
    `git checkout -b feature/12-login-page
git checkout -b fix/23-mobile-layout
git checkout -b docs/30-update-readme
git checkout -b chore/35-eslint-config`,
    'bash',
  ),
  callout(
    '브랜치명에는 # 기호를 넣지 않습니다. 좋은 예: feature/12-login-page / 나쁜 예: feature/#12-login-page',
  ),

  heading2('7. 작업 후 커밋 방법'),
  code(
    `git status
git add .
git commit -m "feat: 로그인 페이지 구현 (#12)"`,
    'bash',
  ),
  paragraph('커밋 메시지 형식은 "종류: 작업 내용 (#이슈번호)"입니다.'),
  heading3('커밋 예시'),
  code(`feat: 로그인 페이지 구현 (#12)
feat: 공통 Button 컴포넌트 추가 (#15)
fix: 모바일 헤더 깨짐 수정 (#20)
docs: README 실행 방법 수정 (#22)
chore: ESLint 설정 추가 (#24)
design: 홈 화면 카드 스타일 수정 (#28)
refactor: 공통 컴포넌트 구조 정리 (#31)`),

  heading2('8. 커밋 종류'),
  bullet('feat: 새로운 기능 추가'),
  bullet('fix: 버그 수정'),
  bullet('docs: 문서 수정'),
  bullet('style: 코드 포맷팅, CSS 등 스타일 변경'),
  bullet('refactor: 기능 변화 없는 코드 개선'),
  bullet('chore: 설정, 패키지, 빌드 등 기타 작업'),
  bullet('design: UI 디자인, 레이아웃 수정'),
  bullet('test: 테스트 코드 추가 또는 수정'),

  heading2('9. GitHub에 push 하는 방법'),
  paragraph('처음 브랜치를 GitHub에 올릴 때는 -u origin 브랜치명을 붙입니다.'),
  code(
    `git push -u origin feature/12-login-page
git push -u origin fix/23-mobile-layout
git push -u origin docs/30-update-readme`,
    'bash',
  ),
  paragraph('이미 한 번 push한 브랜치라면 다음부터는 git push만 실행하면 됩니다.'),
  code('git push', 'bash'),

  heading2('10. PR 생성 방법'),
  numbered('GitHub Repository에서 Pull requests를 클릭합니다.'),
  numbered('New pull request를 클릭합니다.'),
  numbered('base를 dev로 설정합니다.'),
  numbered('compare를 내 작업 브랜치로 설정합니다.'),
  numbered('Create pull request를 클릭합니다.'),
  numbered('PR 제목과 내용을 작성합니다.'),
  numbered('Reviewer, Assignee, Label, Project를 지정합니다.'),
  heading3('PR 방향 예시'),
  code(`feature/12-login-page → dev
fix/23-mobile-layout → dev
docs/30-update-readme → dev
chore/35-eslint-config → dev`),
  callout('평소 작업은 main이 아니라 dev로 PR을 만듭니다.'),

  heading2('11. PR 제목 규칙'),
  paragraph('PR 제목도 커밋 메시지처럼 작성합니다. 형식은 "종류: 작업 내용"입니다.'),
  code(`feat: 로그인 페이지 구현
feat: 공통 Button 컴포넌트 추가
fix: 모바일 헤더 깨짐 수정
docs: README 협업 규칙 추가
chore: ESLint 설정 추가
design: 홈 화면 레이아웃 수정`),
  paragraph('나쁜 예: 로그인 만들었음, 수정함, 작업 완료'),

  heading2('12. PR 템플릿'),
  paragraph('GitHub에서는 PR을 만들 때 자동 작성 양식을 제공할 수 있습니다.'),
  code(`작업 내용:
- 이번 PR에서 작업한 내용을 작성합니다.

관련 이슈:
Refs #이슈번호

확인 사항:
- pnpm lint 실행 여부
- pnpm build 실행 여부

참고 사항:
- 리뷰어가 알아야 할 내용을 작성합니다.`),
  heading3('PR 작성 예시'),
  code(`제목: feat: 로그인 페이지 구현

작업 내용:
- 로그인 페이지 UI 구현
- 이메일 입력창 추가
- 비밀번호 입력창 추가
- 로그인 버튼 스타일 적용

관련 이슈:
Refs #12

확인 사항:
- pnpm lint 완료
- pnpm build 완료

참고 사항:
- 아직 API 연동은 하지 않았습니다.
- 현재는 UI만 구현했습니다.`),

  heading2('13. Issue와 PR 연결 방법'),
  paragraph('PR 본문에 Issue 번호를 적으면 GitHub에서 Issue와 PR이 연결됩니다.'),
  bullet('Refs #12: 이 PR은 #12 이슈와 관련 있음'),
  bullet('Closes #12: 이 PR이 merge되면 #12 이슈를 자동으로 닫음'),
  bullet('Fixes #12, Resolves #12도 자동 종료 키워드로 사용할 수 있음'),
  callout(
    '작업 중이거나 추가 확인이 필요하면 Refs #12를 쓰고, merge와 동시에 Issue를 닫아도 되면 Closes #12를 씁니다.',
  ),

  heading2('14. 커밋과 Issue 연결 방법'),
  paragraph('커밋 메시지에도 Issue 번호를 넣으면 GitHub에서 자동 링크로 표시됩니다.'),
  code(`feat: 로그인 페이지 구현 (#12)
fix: 모바일 버튼 깨짐 수정 (#20)
docs: README 수정 (#22)`),
  paragraph('추천 규칙: 커밋 메시지에는 항상 (#이슈번호)를 포함합니다.'),

  heading2('15. PR 자동 검사'),
  paragraph('PR을 올리면 GitHub Actions로 자동 검사를 실행할 수 있습니다.'),
  bullet('PR 제목 형식 검사'),
  bullet('PR 본문 템플릿 작성 여부 검사'),
  bullet('관련 Issue 연결 여부 검사'),
  bullet('pnpm lint 실행'),
  bullet('pnpm build 실행'),
  heading3('검사 흐름'),
  numbered('PR 생성'),
  numbered('GitHub Actions 자동 실행'),
  numbered('제목, 본문, Issue 연결 확인'),
  numbered('lint 검사'),
  numbered('build 검사'),
  numbered('모든 검사 통과 시 merge 가능'),
  paragraph('자동 검사를 merge 필수 조건으로 만들려면 GitHub Repository 설정 권한이 필요합니다.'),

  heading2('16. 코드 리뷰 방법'),
  paragraph(
    'PR을 올리면 GitHub에서 코드 리뷰를 할 수 있습니다. 리뷰어는 Files changed 탭에서 변경된 코드를 확인합니다.',
  ),
  bullet('Comment: 의견만 남김'),
  bullet('Approve: 승인'),
  bullet('Request changes: 수정 요청'),
  paragraph(
    '우리 팀 규칙: 최소 1명 이상 리뷰 후 merge하고, Request changes가 있으면 수정 후 다시 리뷰를 요청합니다.',
  ),

  heading2('17. 리뷰 반영 방법'),
  paragraph(
    '리뷰어가 수정 요청을 남기면 같은 브랜치에서 수정합니다. PR을 새로 만들 필요 없습니다.',
  ),
  code(
    `git status
git add .
git commit -m "fix: PR 리뷰 반영 (#12)"
git push`,
    'bash',
  ),

  heading2('18. 작업 전 확인 명령'),
  paragraph('PR을 올리기 전 아래 명령을 실행합니다.'),
  code(
    `pnpm lint
pnpm build`,
    'bash',
  ),
  bullet('pnpm lint: 코드 규칙 검사'),
  bullet('pnpm build: 프로젝트가 정상적으로 빌드되는지 확인'),

  heading2('19. Project 보드 사용법'),
  paragraph('Project 보드는 팀 작업 현황판입니다. Issue와 PR이 현재 어떤 상태인지 볼 수 있습니다.'),
  bullet('Todo: 해야 할 작업'),
  bullet('In Progress: 작업 중'),
  bullet('Review: PR 리뷰 중'),
  bullet('Done: 완료'),
  heading3('작업 흐름 예시'),
  code(`#12 로그인 페이지 구현
Todo → In Progress → Review → Done`),
  heading3('Project 보드 예시'),
  code(`Todo:
- 회원가입 페이지 구현
- 공통 Input 컴포넌트 추가

In Progress:
- 로그인 페이지 구현

Review:
- README 협업 규칙 추가

Done:
- ESLint/Prettier 설정
- GitHub 템플릿 추가`),
  paragraph(
    'Project 보드를 쓰면 누가 어떤 작업을 하는지 확인하기 쉽고, 평가 시 협업 관리가 잘 보입니다.',
  ),

  heading2('20. 라벨 사용법'),
  paragraph('라벨은 Issue나 PR의 종류를 표시하는 태그입니다.'),
  bullet('feature: 새로운 기능 개발'),
  bullet('bug: 버그 수정'),
  bullet('docs: 문서 수정'),
  bullet('chore: 설정, 패키지, 환경 작업'),
  bullet('design: UI 디자인, 레이아웃 수정'),
  bullet('refactor: 코드 구조 개선'),
  bullet('test: 테스트 관련 작업'),
  bullet('question: 논의가 필요한 내용'),
  heading3('라벨 사용 예시'),
  code(`로그인 페이지 구현 → feature
모바일 버튼 깨짐 수정 → bug
README 실행 방법 수정 → docs
ESLint 설정 추가 → chore
홈 화면 레이아웃 수정 → design
컴포넌트 구조 정리 → refactor
테스트 코드 추가 → test
기술 스택 논의 → question`),

  heading2('21. 팀원 알림 방법'),
  bullet('Reviewer 지정: PR 오른쪽 Reviewers에서 리뷰어를 지정합니다.'),
  bullet('Assignee 지정: Issue나 PR 담당자를 지정합니다.'),
  bullet('댓글 멘션: @github-id 리뷰 부탁드립니다.'),
  bullet('Label 지정: feature, bug, docs 등 작업 종류를 표시합니다.'),
  bullet('Project 지정: Project 보드에 작업을 등록합니다.'),
  paragraph(
    '팀원이 이메일 알림을 받으려면 GitHub Notification 설정에서 이메일 수신을 켜야 합니다.',
  ),

  heading2('22. main 브랜치 운영 방식'),
  paragraph(
    'main은 평가 또는 배포 시점까지 닫아두는 브랜치입니다. 평소 개발은 dev에서 진행합니다.',
  ),
  code(`일반 작업 흐름:
feature/* → dev
fix/* → dev
docs/* → dev
chore/* → dev
design/* → dev

최종 제출 흐름:
dev → main`),

  heading2('23. 브랜치 보호 설정'),
  paragraph(
    '브랜치 보호 설정은 Repository 관리자 권한이 있어야 가능합니다. 현재 권한이 없으면 설정할 수 없습니다.',
  ),
  heading3('main 보호 규칙'),
  bullet('직접 push 금지'),
  bullet('PR 필수'),
  bullet('리뷰 1명 이상 필수'),
  bullet('status check 통과 필수'),
  bullet('force push 금지'),
  bullet('branch 삭제 금지'),
  heading3('dev 보호 규칙'),
  bullet('직접 push 금지'),
  bullet('PR 필수'),
  bullet('리뷰 1명 이상 필수'),
  bullet('status check 통과 필수'),
  bullet('force push 금지'),
  bullet('branch 삭제 금지'),
  heading3('권한 요청 문구'),
  code(`Repository 설정 권한이 없어 브랜치 보호 설정을 할 수 없습니다.

아래 설정을 적용하거나 제 계정에 Admin 또는 Maintain 권한을 부여해 주세요.

필요 설정:
- main, dev 브랜치 보호
- 직접 push 금지
- PR 필수
- 리뷰 1명 이상 필수
- GitHub Actions status check 필수`),

  heading2('24. 자주 생기는 상황'),
  heading3('내가 어떤 브랜치에 있는지 모르겠을 때'),
  code('git branch', 'bash'),
  heading3('변경된 파일을 확인하고 싶을 때'),
  code('git status', 'bash'),
  heading3('dev 최신 코드를 받아오고 싶을 때'),
  code(
    `git checkout dev
git pull origin dev`,
    'bash',
  ),
  heading3('처음 push하는데 에러가 날 때'),
  code('git push -u origin feature/12-login-page', 'bash'),
  heading3('이미 PR을 올렸는데 수정이 필요할 때'),
  code(
    `git add .
git commit -m "fix: PR 리뷰 반영 (#12)"
git push`,
    'bash',
  ),

  heading2('25. 하면 안 되는 것'),
  bullet('main에 직접 push하지 않기'),
  bullet('dev에 직접 push하지 않기'),
  bullet('Issue 없이 작업 시작하지 않기'),
  bullet('리뷰 없이 merge하지 않기'),
  bullet('이슈 번호 없는 브랜치명 사용하지 않기'),
  bullet('커밋 메시지를 "수정", "작업"처럼 모호하게 작성하지 않기'),
  heading3('나쁜 예시'),
  code(
    `git checkout main
git add .
git commit -m "수정"
git push`,
    'bash',
  ),
  heading3('좋은 예시'),
  code(
    `git checkout dev
git pull origin dev
git checkout -b feature/12-login-page
git add .
git commit -m "feat: 로그인 페이지 구현 (#12)"
git push -u origin feature/12-login-page`,
    'bash',
  ),

  heading2('26. 최종 요약'),
  bullet('처음 프로젝트 받기: git clone → cd → pnpm install → pnpm dev'),
  bullet('작업 시작: Issue 생성 → Issue 번호 확인 → dev 최신 코드 받기 → 브랜치 생성'),
  bullet('작업 저장: git status → git add . → git commit → git push'),
  bullet('PR 생성: 작업 브랜치에서 dev로 PR 생성 → Refs #이슈번호 작성 → 리뷰 후 merge'),
  bullet(
    '최종 원칙: Issue 먼저 생성, Issue 번호로 브랜치 생성, PR은 dev로 생성, main은 평가 또는 배포 시점까지 보호',
  ),

  heading2('27. 한 줄 요약'),
  callout(
    '우리 팀은 Issue로 작업을 만들고, Issue 번호로 브랜치를 만들고, PR로 리뷰받은 뒤 dev에 합치는 방식으로 협업합니다.',
  ),
];

const chunk = <T>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const page = await notion.pages.create({
  parent: { page_id: parentPageId },
  properties: {
    title: {
      title: [text('오늘의 터 Frontend Git 협업 가이드')],
    },
  },
});

for (const group of chunk(blocks, 90)) {
  await notion.blocks.children.append({
    block_id: page.id,
    children: group,
  });
}

console.log(`Notion guide created: ${page.id}`);

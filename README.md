# NOKSU Landing Page

F&B(주류/크래프트 소주) 테마 원페이지 랜딩. 브랜드명은 영문(NOKSU), 본문 콘텐츠는 한글로 작성.

## 레퍼런스 취득 경로

Figma MCP (`get_design_context`, node `33:18111`)로 조회했으나 프레임 전체가 74k+ 토큰(글자 단위
텍스트 노드까지 분해된 응답)이라 단일 호출 한도를 초과했습니다. 대신:

1. `get_design_context`가 반환한 sparse 메타데이터(각 레이어의 실측 `x/y/width/height`)를 파이썬으로
   파싱해 섹션별 정확한 픽셀 비율을 확보했습니다 (히어로 1920×1080, 카드 650px×3, Crave 섹션 컨텐츠
   오프셋 x=260/1400폭, Burn Level 섹션 좌 668px : 우 556px 등).
2. 사용자가 첨부한 스크린샷(3840×11946 원본, 배율 5.97)으로 비주얼 톤·구성 순서를 교차 확인했습니다.

## 그리드 (요청에 따라 가장 신경 쓴 부분)

| 섹션 | 컨테이너 | split |
|---|---|---|
| Hero | full-bleed | 오버레이 콘텐츠 (좌하단 정보 + 우하단 CTA) |
| Find Your Flavor #1 | wide | 4-4-4 |
| Crave the Burn | full-bleed → narrow | 8-4 (좌측 오프셋) |
| Find Your Flavor #2 (blog) | wide | 4-4-4 |
| Burn Level | full-bleed → narrow | 6-6 |
| Marquee | full-bleed | — |
| Footer | wide | 3-9 |

Figma 실측 기준: flavor 카드는 690px 마진 박스 안에 650px 카드 3개(1920 컨테이너 대비 정확히
4-4-4), Burn Level은 668px : 556px(narrow 컨테이너 1400px 기준 약 48:40 → 6-6에 매핑), Crave
섹션은 컨테이너 폭 1400px 중 콘텐츠가 좌측 약 674px(48% ≈ 8컬럼)에서 시작.

## 디자인 토큰 준수

- `css/styles.css`는 원본 디자인 킷 그대로 두고 수정하지 않았습니다.
- `css/site.css`의 모든 색상/spacing/radius/폰트 값은 `var(--...)` 토큰만 사용했습니다.
- 레퍼런스의 노란색 배경(Burn Level 섹션)은 브랜드 컬러가 명시적으로 주어지지 않아 토큰에 없는
  임의 HEX 대신 `--color-primary-900`(다크 인버스)으로 대체했습니다.
- 이미지 영역은 전부 `--color-placeholder` (#d9d9d9)를 사용하는 `.img` 클래스로 처리했습니다.
- 레퍼런스에 있던 카드 캐러셀의 이전/다음 화살표 내비게이션은 치트시트의 하드 룰(캐러셀/화살표 버튼
  금지)에 따라 제외하고 정적 3열 그리드로 구현했습니다.

## 스택

- `index.html` — 시맨틱 마크업, Variant Memo + Layout Declaration 주석 포함
- `css/styles.css` — 공유 디자인 킷 (불변)
- `css/site.css` — NOKSU 브랜드 컴포넌트
- `js/main.js` — 스티키 nav + 스크롤 reveal
- `.github/workflows/deploy.yml` — GitHub Pages 배포 (Actions)

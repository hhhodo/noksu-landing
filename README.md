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
| Burn Level | full-bleed → default | 668:556 flex (실측값 그대로, ≈6-6) |
| Marquee | full-bleed | — |
| Footer | wide | 3-9 |

Figma 실측 기준: flavor 카드는 690px 마진 박스 안에 650px 카드 3개(1920 컨테이너 대비 정확히
4-4-4), Burn Level은 668px : 556px 플렉스 비율 그대로 사용, Crave 섹션은 컨테이너 폭 1400px
(≈ `container` 기본값 1440px에 매핑, 이전 빌드에서 1280px `container--narrow`를 잘못 사용해
"그리드가 좁다"는 피드백을 받고 수정) 중 콘텐츠가 좌측 약 674px(48% ≈ 8컬럼)에서 시작.

## 디자인 토큰 & 색상 준수 (1차 빌드 피드백 반영)

1차 빌드에서 색상을 전부 공유 그레이스케일 토큰(`--color-primary-900` 등)으로만 처리해 "모노톤"이라는
지적을 받았습니다. 재작업 시 `get_design_context`를 섹션별로 다시 호출하고 참조 스크린샷을 픽셀 단위로
샘플링해 실제 색상·폰트를 확인했습니다:

- `css/styles.css`는 원본 디자인 킷 그대로 두고 수정하지 않았습니다.
- 실측한 브랜드 컬러(크림 `#fefff0`, 옐로우 `#fff200`, 레드 `#e30413`, 핑크 `#ff3157`, 잉크
  `#121212`, 히어로 버블 7색)는 `css/site.css`에 `--brand-*` 커스텀 프로퍼티로 선언했습니다 —
  레퍼런스 자체가 제공한 실측값이므로 "임의 HEX 금지" 규칙의 예외로 취급했습니다 (레퍼런스가 없을 때
  임의로 지어내는 것과는 다름).
- Burn Level/마퀴 섹션은 실제로 밝은 옐로우 배경 + 레드 텍스트이며, 1차 빌드처럼 다크 인버스로
  대체하지 않았습니다.
- 폰트 크기는 실측값(40/32/96/18/20/14px)이 기존 타입 스케일 토큰과 거의 정확히 일치해 해당
  토큰 클래스에 매핑했습니다 (뱃지 radius 12px과 버튼 radius 200px(완전 pill)을 실측 후 구분).
- 이미지 영역은 여전히 `--color-placeholder` (#d9d9d9)를 사용하는 `.img` 클래스로 처리했습니다
  (사용자 지시 사항).
- 레퍼런스에 있던 카드 캐러셀의 이전/다음 화살표 내비게이션은 치트시트의 하드 룰(캐러셀/화살표 버튼
  금지)에 따라 제외하고 정적 3열 그리드로 구현했습니다.

## 스택

- `index.html` — 시맨틱 마크업, Variant Memo + Layout Declaration 주석 포함
- `css/styles.css` — 공유 디자인 킷 (불변)
- `css/site.css` — NOKSU 브랜드 컴포넌트
- `js/main.js` — 스티키 nav + 스크롤 reveal
- `.github/workflows/deploy.yml` — GitHub Pages 배포 (Actions)

# Animal Butt 이미지 제작 가이드

## 추천 사이즈

- 기본 캔버스: `2048 x 2048px`
- 최소 캔버스: `1024 x 1024px`
- 파일 형식: `PNG`
- 색공간: `sRGB`
- 이미지 여백: 동물 전체가 캔버스 안에 들어오되 가장자리에서 8-12% 정도 여백

2048px 정사각형을 추천하는 이유는 데스크톱에서 크게 보여도 덜 뭉개지고, 모바일에서는 브라우저가 자연스럽게 축소해서 보여주기 때문입니다.

## 한 동물당 필요한 파일

```txt
assets/animals/{animal-id}/base.png
```

- `base.png`: 사이트에 그대로 보여줄 최종 이미지입니다.
- 배경은 흰색이 가장 좋습니다. 투명 배경도 가능하지만, 현재 사이트 배경은 단색 흰색입니다.
- 이미지 자체의 완성도가 가장 중요합니다. 레이어 분리는 사용하지 않고, PixiJS가 이미지 한 장을 mesh로 왜곡합니다.

## GPT 이미지 생성 프롬프트 예시

```txt
Create one cute [ANIMAL] seen naturally from behind.
The animal should look like a believable living animal, not a plush toy,
figurine, mascot, costume, or collectible render.
Use a natural cute back-view pose that fits this animal's real behavior.
The rear/back silhouette should be visible because of the natural pose,
not because the anatomy is exaggerated.
Plain pure white studio background, isolated subject, no props, no scenery.
Square image, centered subject, full body visible with comfortable white margin.
Soft bright studio lighting, detailed natural fur/feathers/skin texture.
Wholesome, cute, absurd, and playful.
No text, no watermark, no logo.
Avoid creepy realism, forced butt pose, exaggerated butt, sexual tone,
front view, side view, clothing, accessories, cropped body.
```

동물별 포즈는 억지로 통일하지 않는 편이 좋습니다.

```txt
Panda: sitting naturally from behind.
Capybara: standing naturally from behind.
Corgi/cat: standing from behind with a natural tail position.
Rabbit/hamster/guinea pig: sitting naturally from behind.
Duck/penguin: standing naturally from behind.
```

## 앱에 이미지 추가하기

현재 앱에는 11종의 이미지 에셋이 들어가 있습니다.

1. `assets/animals/새-id/` 폴더를 만듭니다.
2. `base.png`를 넣습니다.
3. `site/app.js`의 `animals` 배열에 항목을 추가합니다.

```js
{
  id: "cat-001",
  image: "/assets/animals/cat-001/base.png",
  alt: "Cat from behind",
}
```

## 더 사실적으로 보이게 만드는 팁

- 사진 한 장 안에서 조명, 그림자, 털 질감이 이미 완성되어 있어야 합니다.
- 엉덩이를 억지로 강조하기보다 동물의 자연스러운 뒤태 실루엣이 웃기게 보여야 합니다.
- 다리와 귀 같은 식별 요소가 살짝 남아 있어야 더 좋습니다.
- 배경은 흰색이나 거의 흰색으로 유지하는 편이 가장 미니멀합니다.
- 텍스트나 효과음은 넣지 않는 편이 글로벌 바이럴 톤에 더 잘 맞습니다.

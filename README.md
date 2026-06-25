# 동물 엉덩이

아무 의미 없이 동물 뒷모습을 보여주는 미니멀 B급 웹사이트입니다. PixiJS mesh warp로 클릭한 지점 주변만 미묘하게 눌렸다 복원됩니다. 한 동물을 20번 만지면 다음 동물로 넘어갑니다.

## 실행

아래 명령으로 실행하면 브라우저가 자동으로 열립니다.

```bash
npm run dev
```

기본 주소는 `http://127.0.0.1:5173`입니다. 다른 포트를 쓰고 싶으면 이렇게 실행하세요.

```bash
PORT=3000 npm run dev
```

## 구조

```txt
index.html
site/
  app.js
  dev-server.js
  styles.css
assets/
  animals/
    capybara-real/
      base.png
    cat/
      base.png
    corgi/
      base.png
    duck/
      base.png
    guinea-pig/
      base.png
    hamster/
      base.png
    lamb/
      base.png
    panda/
      base.png
    penguin/
      base.png
    rabbit/
      base.png
    shiba-inu/
      base.png
IMAGE_GUIDE.md
```

## 이미지 교체

실제 이미지는 `IMAGE_GUIDE.md` 기준으로 만들면 됩니다.

권장 방식은 한 동물마다 정사각형 PNG 한 장입니다.

```txt
base.png
```

파일을 넣은 뒤 `site/app.js`의 `animals` 배열에 추가하면 랜덤 후보에 들어갑니다.

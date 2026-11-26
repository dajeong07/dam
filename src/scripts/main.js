
// 시간 기준: 한국(서울) 시간
const TIME_ZONE = 'Asia/Seoul';

const CHECK_INTERVAL_MS = 1000;

const LAST_MINUTE = 59;            
const PHOTO_FADE_START_SECOND = 55; 
const SHAKE_START_SECOND = 58;      

const getPhotoPath = (name) => `src/assets/dam-${name}.png`;

// 발자국 기준 색
const PAW_COLOR_STOPS = [
  { hour: 0, token: '--paw-night' },
  { hour: 6, token: '--paw-dawn' },
  { hour: 12, token: '--paw-day' },
  { hour: 18, token: '--paw-sunset' },
  { hour: 23, token: '--paw-night' },
];



const SCHEDULE = [

  { emoji: '💨💨', text: '우다다 time', photo: 'excited' },
  { emoji: '💨💨💨', text: '레전드 우다다 time', photo: 'excited' },
  { emoji: '😢', text: '아무도 내 질주를 봐주지 않네', photo: 'bored' },
  { emoji: '😠', text: '괘씸하니까 자는 사람 배 밟고 지나가자', photo: 'angry' },
  { emoji: '😪', text: '점점 체력이 빠진다', photo: 'tired' },
  { emoji: '😴', text: '해 뜨기 전에 잠자기', photo: 'sleeping' },

  { emoji: '😴', text: '드르렁...', photo: 'sleeping' },
  { emoji: '🫨', text: '인간들 일어나는 시간에 화들짝...', photo: 'surprised' },
  { emoji: '🥱', text: '다들 준비중. 난 졸린데 왜 이렇게 시끄럽냐', photo: 'tired' },
  { emoji: '😑', text: '엄마의 청소 시간. 너무 시끄러워', photo: 'angry' },
  { emoji: '😐', text: '다 나가서 조용하다...', photo: 'bored' },
  { emoji: '😄', text: '와 집에 나밖에 없다 ^_^', photo: 'excited' },

  { emoji: '😆', text: '자유시간을 즐기는 중', photo: 'excited' },
  { emoji: '😪', text: '너무 신나게 놀아서 피곤하다', photo: 'tired' },
  { emoji: '😴', text: '햇빛 드는 자리 찾아서 식빵 구움', photo: 'sleeping' },
  { emoji: '😴', text: '쿨...', photo: 'sleeping' },
  { emoji: '😴', text: '쿨.. 쿨...', photo: 'sleeping' },
  { emoji: '🤤', text: '드르렁...', photo: 'sleeping' },

  { emoji: '😵‍💫', text: '문 열리는 소리! 가족들이 줄줄이 귀가한다', photo: 'surprised' },
  { emoji: '😵', text: '형이랑 아빠가 날 괴롭힌다...', photo: 'angry' },
  { emoji: '😮‍💨', text: '겨우 도망쳐 드디어 혼자만의 시간', photo: 'bored' },

  // 🌃 밤 – 다시 내 차례
  { emoji: '🫩', text: '다들 나랑 안 놀아주고 자다니 언짢다', photo: 'angry' },
  { emoji: '😒', text: '집이 조용해지니 슬슬 심심하다', photo: 'bored' },
  { emoji: '😏', text: '뒷다리가 근질근질...', photo: 'excited' },
];


// =========================================================
// 화면 요소
// =========================================================
const bubble = document.querySelector('.bubble');
const bubbleFront = document.querySelector('.bubble-front');
const bubbleBack = document.querySelector('.bubble-back');
const pawList = document.querySelector('.paw-list');
const photoFrame = document.querySelector('.photo-frame');
const photos = document.querySelectorAll('.dam-photo'); 


// =========================================================
// 기능
// =========================================================

// --- 시간 ---

function getKoreaTime() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const read = (type) => Number(parts.find((part) => part.type === type).value);
  return { hour: read('hour'), minute: read('minute'), second: read('second') };
}

// --- 말풍선 ---

function showHour(hour) {
  const plan = SCHEDULE[hour];
  bubble.classList.add('no-flip-motion');
  bubble.classList.remove('flipped');
  void bubble.offsetWidth; 
  bubble.classList.remove('no-flip-motion');
  bubble.classList.remove('shake-out'); 
  bubbleFront.textContent = plan.emoji;
  bubbleBack.textContent = plan.text;
}

bubble.addEventListener('click', () => {
  bubble.classList.toggle('flipped');
});

// --- 발자국 바 ---

function hexToRgb(hex) {
  const value = hex.trim().replace('#', '');
  return [0, 2, 4].map((start) => parseInt(value.slice(start, start + 2), 16));
}

function getPawColor(hour) {
  const tokens = getComputedStyle(document.documentElement);
  for (let i = 0; i < PAW_COLOR_STOPS.length - 1; i++) {
    const from = PAW_COLOR_STOPS[i];
    const to = PAW_COLOR_STOPS[i + 1];
    if (hour >= from.hour && hour <= to.hour) {
      const ratio = (hour - from.hour) / (to.hour - from.hour); 
      const fromRgb = hexToRgb(tokens.getPropertyValue(from.token));
      const toRgb = hexToRgb(tokens.getPropertyValue(to.token));
      const mixed = fromRgb.map((c, j) => Math.round(c + (toRgb[j] - c) * ratio));
      return `rgb(${mixed.join(', ')})`;
    }
  }
}


function buildPawBar() {
  SCHEDULE.forEach((_, hour) => {
    const item = document.createElement('li');
    const paw = document.createElement('button');
    paw.type = 'button';
    paw.className = 'paw';
    paw.setAttribute('aria-label', `${hour}시`);
    paw.innerHTML = '<span class="paw-shape"></span>';
    paw.style.setProperty('--paw-color', getPawColor(hour));
    paw.addEventListener('click', () => {
      selectHour(hour);
      replayAnimation(bubble, 'bounce-in');
    });
    paw.addEventListener('animationend', (event) => {
      if (event.animationName === 'pop') paw.classList.remove('pop');
    });
    item.append(paw);
    pawList.append(item);
  });
}

// --- 사진 ---

let visiblePhotoIndex = 0;
function showPhoto(name, speedToken) {
  const current = photos[visiblePhotoIndex];
  const src = getPhotoPath(name);
  if (current.getAttribute('src') === src) return; 

  const next = photos[1 - visiblePhotoIndex];
  photoFrame.style.setProperty('--photo-duration', `var(${speedToken})`);
  next.src = src;
  next.alt = '담이';
  current.alt = '';
  current.classList.remove('is-visible');
  next.classList.add('is-visible');
  visiblePhotoIndex = 1 - visiblePhotoIndex;
}

function preloadPhotos() {
  new Set(SCHEDULE.map((plan) => plan.photo)).forEach((name) => {
    new Image().src = getPhotoPath(name);
  });
}

// --- 시간대 선택 ---

function selectHour(hour) {
  showHour(hour);
  showPhoto(SCHEDULE[hour].photo, '--duration-fast');
  pawList.querySelectorAll('.paw').forEach((paw, i) => {
    paw.classList.toggle('selected', i === hour);
  });
}

function markNowPaw(hour) {
  pawList.querySelectorAll('.paw').forEach((paw, i) => {
    paw.classList.toggle('now', i === hour);
  });
}

function replayAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

// --- 드래그 ---

function getPawHourAt(x, y) {
  const paw = document.elementFromPoint(x, y)?.closest('.paw');
  if (!paw) return null;
  return [...pawList.querySelectorAll('.paw')].indexOf(paw);
}

let isDragging = false;      
let draggedAcross = false;   
let lastDraggedHour = null;  

pawList.addEventListener('pointerdown', (event) => {
  isDragging = true;
  draggedAcross = false;
  lastDraggedHour = getPawHourAt(event.clientX, event.clientY);
});

window.addEventListener('pointermove', (event) => {
  if (!isDragging) return;
  const hour = getPawHourAt(event.clientX, event.clientY);
  if (hour === null || hour === lastDraggedHour) return;

  const paws = pawList.querySelectorAll('.paw');
  const start = lastDraggedHour ?? hour;
  const step = hour > start ? 1 : -1;
  for (let h = start + step; h !== hour + step; h += step) {
    replayAnimation(paws[h], 'pop');
  }

  lastDraggedHour = hour;
  draggedAcross = true;
  selectHour(hour);
});

function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  if (draggedAcross) replayAnimation(bubble, 'bounce-in');
}
window.addEventListener('pointerup', endDrag);
window.addEventListener('pointercancel', endDrag);

bubble.addEventListener('animationend', (event) => {
  if (event.animationName === 'bounce-in') bubble.classList.remove('bounce-in');
});

let currentHour = getKoreaTime().hour;
let shakenBeforeHour = null; 
let fadedBeforeHour = null; 
buildPawBar();
preloadPhotos();
showHour(currentHour);
showPhoto(SCHEDULE[currentHour].photo, '--duration-fast');
markNowPaw(currentHour);
replayAnimation(bubble, 'bounce-in');

setInterval(() => {
  const now = getKoreaTime();

  const isPhotoFadeTime = now.minute === LAST_MINUTE && now.second >= PHOTO_FADE_START_SECOND;
  if (isPhotoFadeTime && fadedBeforeHour !== currentHour) {
    fadedBeforeHour = currentHour;
    const nextHour = (currentHour + 1) % SCHEDULE.length;
    showPhoto(SCHEDULE[nextHour].photo, '--duration-fade');
  }

  const isShakeTime = now.minute === LAST_MINUTE && now.second >= SHAKE_START_SECOND;
  if (isShakeTime && shakenBeforeHour !== currentHour) {
    shakenBeforeHour = currentHour;
    bubble.classList.remove('bounce-in');
    bubble.classList.add('shake-out');
  }

  if (now.hour !== currentHour) {
    currentHour = now.hour;
    showHour(currentHour);
    showPhoto(SCHEDULE[currentHour].photo, '--duration-fade');
    markNowPaw(currentHour);
    pawList.querySelectorAll('.paw').forEach((paw) => paw.classList.remove('selected'));
    replayAnimation(bubble, 'bounce-in');
  }
}, CHECK_INTERVAL_MS);

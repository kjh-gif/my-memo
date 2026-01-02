// ============================================
// 앱 초기화
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('My memo 앱이 시작되었습니다.');

  // 초기 메모 로드
  loadMemos();

  // 이벤트 리스너 등록
  initEventListeners();
});

// ============================================
// 이벤트 리스너 초기화
// ============================================
function initEventListeners() {
  // 새 메모 버튼
  const newMemoBtn = document.getElementById('new-memo-btn');
  if (newMemoBtn) {
    newMemoBtn.addEventListener('click', createNewMemo);
  }

  // 검색 기능
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', searchMemos);
  }
}

// ============================================
// 메모 목록 로드
// ============================================
function loadMemos() {
  const memoList = document.getElementById('memo-list');
  if (!memoList) return;

  // LocalStorage에서 메모 가져오기
  const memos = getMemos();

  // 메모가 없으면 안내 메시지 표시
  if (memos.length === 0) {
    memoList.innerHTML = '<p style="text-align: center; color: var(--text-placeholder); padding: 2rem;">아직 메모가 없습니다.<br>+ New memo 버튼을 눌러 시작하세요!</p>';
    return;
  }

  // 메모 목록 렌더링
  renderMemos(memos);
}

// ============================================
// 메모 렌더링
// ============================================
function renderMemos(memos) {
  const memoList = document.getElementById('memo-list');
  if (!memoList) return;

  memoList.innerHTML = '';

  memos.forEach(memo => {
    const memoItem = createMemoElement(memo);
    memoList.appendChild(memoItem);
  });
}

// ============================================
// 메모 요소 생성
// ============================================
function createMemoElement(memo) {
  const div = document.createElement('div');
  div.className = 'memo-item';
  div.dataset.id = memo.id;

  div.innerHTML = `
    <h3>📁 ${memo.title || '제목 없음'}</h3>
    <p>${memo.content || ''}</p>
    <div class="memo-date">${formatDate(memo.date)}</div>
  `;

  // 클릭 이벤트 - 메모 상세보기/수정
  div.addEventListener('click', () => editMemo(memo.id));

  return div;
}

// ============================================
// LocalStorage에서 메모 가져오기
// ============================================
function getMemos() {
  const memosJson = localStorage.getItem('memos');
  return memosJson ? JSON.parse(memosJson) : [];
}

// ============================================
// LocalStorage에 메모 저장하기
// ============================================
function saveMemos(memos) {
  localStorage.setItem('memos', JSON.stringify(memos));
}

// ============================================
// 새 메모 생성
// ============================================
function createNewMemo() {
  const title = prompt('메모 제목을 입력하세요:');
  if (!title) return;

  const content = prompt('메모 내용을 입력하세요:');
  if (content === null) return;

  const memos = getMemos();
  const newMemo = {
    id: Date.now(),
    title: title,
    content: content,
    date: new Date().toISOString()
  };

  memos.unshift(newMemo); // 맨 앞에 추가
  saveMemos(memos);
  loadMemos();

  alert('메모가 저장되었습니다!');
}

// ============================================
// 메모 수정
// ============================================
function editMemo(id) {
  const memos = getMemos();
  const memo = memos.find(m => m.id === id);

  if (!memo) return;

  const title = prompt('메모 제목:', memo.title);
  if (title === null) return;

  const content = prompt('메모 내용:', memo.content);
  if (content === null) return;

  memo.title = title;
  memo.content = content;
  memo.date = new Date().toISOString();

  saveMemos(memos);
  loadMemos();

  alert('메모가 수정되었습니다!');
}

// ============================================
// 메모 검색
// ============================================
function searchMemos() {
  const searchInput = document.getElementById('search-input');
  const query = searchInput.value.toLowerCase();

  const allMemos = getMemos();
  const filteredMemos = allMemos.filter(memo =>
    memo.title.toLowerCase().includes(query) ||
    memo.content.toLowerCase().includes(query)
  );

  renderMemos(filteredMemos);
}

// ============================================
// 날짜 포맷 함수
// ============================================
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

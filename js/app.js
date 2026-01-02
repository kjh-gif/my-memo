// ============================================
// 전역 변수
// ============================================
let currentFilter = 'all'; // 'all' 또는 'important'
let currentEditingId = null; // 현재 편집 중인 메모 ID

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
    newMemoBtn.addEventListener('click', openNewMemoEditor);
  }

  // 검색 기능
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', searchMemos);
  }

  // 필터 버튼
  const filterAllBtn = document.getElementById('filter-all');
  const filterImportantBtn = document.getElementById('filter-important');

  if (filterAllBtn) {
    filterAllBtn.addEventListener('click', () => setFilter('all'));
  }

  if (filterImportantBtn) {
    filterImportantBtn.addEventListener('click', () => setFilter('important'));
  }

  // 에디터 버튼들
  const backBtn = document.getElementById('back-btn');
  const saveBtn = document.getElementById('save-btn');
  const editorDeleteBtn = document.getElementById('editor-delete-btn');

  if (backBtn) {
    backBtn.addEventListener('click', showMainView);
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', saveMemo);
  }

  if (editorDeleteBtn) {
    editorDeleteBtn.addEventListener('click', deleteCurrentMemo);
  }
}

// ============================================
// 화면 전환
// ============================================
function showMainView() {
  document.getElementById('main-view').style.display = 'block';
  document.getElementById('editor-view').style.display = 'none';
  currentEditingId = null;
  loadMemos();
}

function showEditorView() {
  document.getElementById('main-view').style.display = 'none';
  document.getElementById('editor-view').style.display = 'flex';
}

// ============================================
// 새 메모 작성 화면 열기
// ============================================
function openNewMemoEditor() {
  currentEditingId = null;
  document.getElementById('memo-title').value = '';
  document.getElementById('memo-content').value = '';
  document.getElementById('editor-delete-btn').style.display = 'none';
  showEditorView();
}

// ============================================
// 메모 수정 화면 열기
// ============================================
function openEditMemoEditor(id) {
  const memos = getMemos();
  const memo = memos.find(m => m.id === id);

  if (!memo) return;

  currentEditingId = id;
  document.getElementById('memo-title').value = memo.title;
  document.getElementById('memo-content').value = memo.content;
  document.getElementById('editor-delete-btn').style.display = 'block';
  showEditorView();
}

// ============================================
// 메모 저장
// ============================================
function saveMemo() {
  const title = document.getElementById('memo-title').value.trim();
  const content = document.getElementById('memo-content').value.trim();

  if (!title && !content) {
    alert('제목 또는 내용을 입력해주세요.');
    return;
  }

  const memos = getMemos();

  if (currentEditingId) {
    // 수정 모드
    const memo = memos.find(m => m.id === currentEditingId);
    if (memo) {
      memo.title = title || '제목 없음';
      memo.content = content;
      memo.date = new Date().toISOString();
    }
  } else {
    // 새 메모 추가
    const newMemo = {
      id: Date.now(),
      title: title || '제목 없음',
      content: content,
      date: new Date().toISOString(),
      isImportant: false
    };
    memos.unshift(newMemo);
  }

  saveMemos(memos);
  showMainView();
}

// ============================================
// 에디터에서 메모 삭제
// ============================================
function deleteCurrentMemo() {
  if (!currentEditingId) return;

  const confirmed = confirm('정말로 이 메모를 삭제하시겠습니까?');
  if (!confirmed) return;

  const memos = getMemos();
  const filteredMemos = memos.filter(m => m.id !== currentEditingId);

  saveMemos(filteredMemos);
  showMainView();
}

// ============================================
// 필터 설정
// ============================================
function setFilter(filter) {
  currentFilter = filter;

  // 버튼 활성화 상태 변경
  const filterAllBtn = document.getElementById('filter-all');
  const filterImportantBtn = document.getElementById('filter-important');

  if (filter === 'all') {
    filterAllBtn.classList.add('active');
    filterImportantBtn.classList.remove('active');
  } else {
    filterAllBtn.classList.remove('active');
    filterImportantBtn.classList.add('active');
  }

  // 메모 다시 로드
  loadMemos();
}

// ============================================
// 메모 목록 로드
// ============================================
function loadMemos() {
  const memoList = document.getElementById('memo-list');
  if (!memoList) return;

  // LocalStorage에서 메모 가져오기
  let memos = getMemos();

  // 필터 적용
  if (currentFilter === 'important') {
    memos = memos.filter(memo => memo.isImportant);
  }

  // 메모가 없으면 안내 메시지 표시
  if (memos.length === 0) {
    const message = currentFilter === 'important'
      ? '중요 메모가 없습니다.<br>별표를 눌러 중요 메모로 지정하세요!'
      : '아직 메모가 없습니다.<br>+ New memo 버튼을 눌러 시작하세요!';
    memoList.innerHTML = `<p style="text-align: center; color: var(--text-placeholder); padding: 2rem;">${message}</p>`;
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

  const starIcon = memo.isImportant ? '⭐' : '☆';

  div.innerHTML = `
    <div class="memo-item-header">
      <h3>📁 ${memo.title || '제목 없음'}</h3>
      <button class="star-btn ${memo.isImportant ? 'active' : ''}" data-id="${memo.id}">
        ${starIcon}
      </button>
    </div>
    <div class="memo-item-content">
      <p>${memo.content || ''}</p>
      <div class="memo-date">${formatDate(memo.date)}</div>
    </div>
    <div class="memo-item-footer">
      <button class="delete-btn" data-id="${memo.id}">🗑️ 삭제</button>
    </div>
  `;

  // 별 버튼 클릭 이벤트
  const starBtn = div.querySelector('.star-btn');
  starBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleImportant(memo.id);
  });

  // 삭제 버튼 클릭 이벤트
  const deleteBtn = div.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteMemo(memo.id);
  });

  // 메모 내용 클릭 이벤트 - 수정 화면으로 이동
  const memoContent = div.querySelector('.memo-item-content');
  const memoTitle = div.querySelector('h3');

  memoContent.addEventListener('click', () => openEditMemoEditor(memo.id));
  memoTitle.addEventListener('click', () => openEditMemoEditor(memo.id));

  return div;
}

// ============================================
// 중요 메모 토글
// ============================================
function toggleImportant(id) {
  const memos = getMemos();
  const memo = memos.find(m => m.id === id);

  if (!memo) return;

  memo.isImportant = !memo.isImportant;
  saveMemos(memos);
  loadMemos();
}

// ============================================
// 메모 삭제 (목록에서)
// ============================================
function deleteMemo(id) {
  const confirmed = confirm('정말로 이 메모를 삭제하시겠습니까?');
  if (!confirmed) return;

  const memos = getMemos();
  const filteredMemos = memos.filter(m => m.id !== id);

  saveMemos(filteredMemos);
  loadMemos();
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
// 메모 검색
// ============================================
function searchMemos() {
  const searchInput = document.getElementById('search-input');
  const query = searchInput.value.toLowerCase();

  let allMemos = getMemos();

  // 필터 적용
  if (currentFilter === 'important') {
    allMemos = allMemos.filter(memo => memo.isImportant);
  }

  // 검색어 적용
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

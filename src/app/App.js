import { h, useEffect, useMemo, useState } from '../core/runtime.js';

const STORAGE_KEY = 'week5-react-like-todos';

/**
 * localStorage에서 Todo 배열을 읽는다.
 * 저장값이 이상하면 빈 배열을 반환한다.
 */
function loadTodosFromStorage() {
  try {
    const savedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!savedValue) {
      return [];
    }

    const parsedValue = JSON.parse(savedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
}

/**
 * Todo 배열을 localStorage에 저장한다.
 */
function saveTodosToStorage(todos) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    // 저장 실패는 조용히 무시한다.
  }
}

/**
 * 테스트에서 storage key를 확인할 수 있게 노출한다.
 */
export function getStorageKey() {
  return STORAGE_KEY;
}

/**
 * Todo 객체를 만드는 함수다.
 * id를 안정적으로 부여해 key 비교가 가능하도록 한다.
 */
export function createTodo(text) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    text,
    completed: false,
    createdAt: Date.now(),
  };
}

/**
 * 입력 문자열을 정리한다.
 * 앞뒤 공백만 제거하고 내부 공백은 유지해 사용자의 의도를 보존한다.
 */
export function normalizeTodoText(text) {
  return text.trim();
}

/**
 * 필터링과 정렬을 적용한 Todo 목록을 계산한다.
 * 이 값은 원본 state가 아니라 파생값이므로 useMemo와 잘 맞는다.
 */
export function getVisibleTodos(todos, filter, sort) {
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') {
      return !todo.completed;
    }

    if (filter === 'completed') {
      return todo.completed;
    }

    return true;
  });

  const sortedTodos = [...filteredTodos];

  if (sort === 'created-asc') {
    sortedTodos.sort((left, right) => left.createdAt - right.createdAt);
    return sortedTodos;
  }

  if (sort === 'text-asc') {
    sortedTodos.sort((left, right) => left.text.localeCompare(right.text, 'ko'));
    return sortedTodos;
  }

  sortedTodos.sort((left, right) => right.createdAt - left.createdAt);
  return sortedTodos;
}

/**
 * 아래부터는 모두 stateless child component다.
 * state는 없고, props만 받아 화면을 그린다.
 */
function AppHeader({ totalCount, remainingCount }) {
  return h(
    'header',
    { className: 'hero-card' },
    h('p', { className: 'eyebrow' }, 'Week 5 Custom React Clone'),
    h('h1', { className: 'hero-title' }, 'Todo / Task Manager'),
    h(
      'p',
      { className: 'hero-description' },
      '루트 컴포넌트 한 곳에서만 상태를 관리하고, 자식은 props만 받는 순수 함수로 구성한 학습용 앱입니다.',
    ),
    h(
      'div',
      { className: 'hero-badges' },
      h('span', { className: 'badge' }, `전체 ${totalCount}개`),
      h('span', { className: 'badge badge-accent' }, `남은 일 ${remainingCount}개`),
    ),
  );
}

function TodoComposer({ draftText, onDraftChange, onSubmit }) {
  return h(
    'section',
    { className: 'panel' },
    h('h2', { className: 'panel-title' }, '새 작업 추가'),
    h(
      'div',
      { className: 'composer-row' },
      h('input', {
        className: 'todo-input',
        type: 'text',
        value: draftText,
        placeholder: '예: 발표 자료 README 정리하기',
        'aria-label': '할 일 입력',
        onInput: onDraftChange,
        onKeydown: (event) => {
          if (event.key === 'Enter') {
            onSubmit();
          }
        },
      }),
      h(
        'button',
        {
          className: 'primary-button',
          type: 'button',
          onClick: onSubmit,
        },
        '추가',
      ),
    ),
    h(
      'p',
      { className: 'panel-hint' },
      '빈 문자열은 추가되지 않으며, 중복 텍스트는 허용해 리스트와 key 동작을 확인할 수 있습니다.',
    ),
  );
}

function ControlPanel({ currentFilter, currentSort, onFilterChange, onSortChange }) {
  const filters = [
    { value: 'all', label: '전체' },
    { value: 'active', label: '진행중' },
    { value: 'completed', label: '완료' },
  ];

  const sorts = [
    { value: 'created-desc', label: '최신순' },
    { value: 'created-asc', label: '오래된순' },
    { value: 'text-asc', label: '이름순' },
  ];

  return h(
    'section',
    { className: 'panel' },
    h('h2', { className: 'panel-title' }, '필터'),
    h(
      'div',
      { className: 'chip-row' },
      filters.map((filter) =>
        h(
          'button',
          {
            key: filter.value,
            type: 'button',
            className: currentFilter === filter.value ? 'chip chip-active' : 'chip',
            'aria-pressed': currentFilter === filter.value,
            onClick: () => onFilterChange(filter.value),
          },
          filter.label,
        ),
      ),
    ),
    h('h2', { className: 'panel-title panel-title-with-gap' }, '정렬'),
    h(
      'div',
      { className: 'chip-row' },
      sorts.map((sort) =>
        h(
          'button',
          {
            key: sort.value,
            type: 'button',
            className: currentSort === sort.value ? 'chip chip-active' : 'chip',
            'aria-pressed': currentSort === sort.value,
            onClick: () => onSortChange(sort.value),
          },
          sort.label,
        ),
      ),
    ),
  );
}

function StatsPanel({ totalCount, remainingCount, completedCount }) {
  return h(
    'section',
    { className: 'stats-grid' },
    h('article', { className: 'stat-card' }, h('span', { className: 'stat-label' }, '전체 작업'), h('strong', { className: 'stat-value' }, String(totalCount))),
    h('article', { className: 'stat-card' }, h('span', { className: 'stat-label' }, '진행중'), h('strong', { className: 'stat-value' }, String(remainingCount))),
    h('article', { className: 'stat-card' }, h('span', { className: 'stat-label' }, '완료'), h('strong', { className: 'stat-value' }, String(completedCount))),
  );
}

function EmptyState({ currentFilter }) {
  const messageByFilter = {
    all: '아직 등록된 작업이 없습니다. 첫 작업을 추가해 보세요.',
    active: '진행중인 작업이 없습니다.',
    completed: '완료된 작업이 없습니다.',
  };

  return h(
    'div',
    { className: 'empty-state', 'data-testid': 'empty-state' },
    h('strong', null, '표시할 작업이 없습니다.'),
    h('p', null, messageByFilter[currentFilter]),
  );
}

function TodoItem({ todo, onToggle, onDelete }) {
  return h(
    'li',
    {
      className: todo.completed ? 'todo-item todo-item-completed' : 'todo-item',
      'data-testid': `todo-item-${todo.id}`,
    },
    h(
      'label',
      { className: 'todo-main' },
      h('input', {
        type: 'checkbox',
        checked: todo.completed,
        'aria-label': `${todo.text} 완료 토글`,
        onChange: () => onToggle(todo.id),
      }),
      h('span', { className: 'todo-text' }, todo.text),
    ),
    h(
      'div',
      { className: 'todo-actions' },
      h('span', { className: 'todo-meta' }, todo.completed ? '완료됨' : '진행중'),
      h(
        'button',
        {
          className: 'danger-button',
          type: 'button',
          'aria-label': `${todo.text} 삭제`,
          onClick: () => onDelete(todo.id),
        },
        '삭제',
      ),
    ),
  );
}

function TodoList({ todos, currentFilter, onToggle, onDelete }) {
  return h(
    'section',
    { className: 'panel' },
    h('h2', { className: 'panel-title' }, '작업 목록'),
    todos.length === 0
      ? h(EmptyState, { currentFilter })
      : h(
          'ul',
          { className: 'todo-list', 'data-testid': 'todo-list' },
          todos.map((todo) =>
            h(TodoItem, {
              key: todo.id,
              todo,
              onToggle,
              onDelete,
            }),
          ),
        ),
  );
}

function LearningNotes() {
  return h(
    'footer',
    { className: 'panel' },
    h('h2', { className: 'panel-title' }, '이 데모에서 볼 수 있는 개념'),
    h(
      'ul',
      { className: 'notes-list' },
      h('li', null, '루트 컴포넌트만 useState / useEffect / useMemo를 사용합니다.'),
      h('li', null, '자식 컴포넌트는 모두 stateless pure function입니다.'),
      h('li', null, '상태가 바뀌면 새 Virtual DOM을 만들고 diff 후 patch 합니다.'),
      h('li', null, '파생값은 state가 아니라 useMemo 계산값으로 유지합니다.'),
    ),
  );
}

/**
 * 루트 컴포넌트다.
 * 이 프로젝트에서 state와 Hook은 오직 이 함수에서만 사용한다.
 */
export function App() {
  const [todos, setTodos] = useState(() => loadTodosFromStorage());
  const [draftText, setDraftText] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('created-desc');

  const statistics = useMemo(() => {
    const totalCount = todos.length;
    const completedCount = todos.filter((todo) => todo.completed).length;
    const remainingCount = totalCount - completedCount;

    return {
      totalCount,
      completedCount,
      remainingCount,
    };
  }, [todos]);

  const visibleTodos = useMemo(() => getVisibleTodos(todos, filter, sort), [todos, filter, sort]);

  useEffect(() => {
    saveTodosToStorage(todos);
  }, [todos]);

  useEffect(() => {
    document.title = `남은 작업 ${statistics.remainingCount}개 | React-like Todo`;

    return () => {
      document.title = 'React-like Todo Manager';
    };
  }, [statistics.remainingCount]);

  function handleDraftChange(event) {
    setDraftText(event.target.value);
  }

  function handleSubmit() {
    const nextText = normalizeTodoText(draftText);

    if (!nextText) {
      return;
    }

    setTodos((currentTodos) => [createTodo(nextText), ...currentTodos]);
    setDraftText('');
  }

  function handleToggle(todoId) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  function handleDelete(todoId) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId));
  }

  return h(
    'main',
    { className: 'page-shell' },
    h(
      'div',
      { className: 'app-layout' },
      h(AppHeader, {
        totalCount: statistics.totalCount,
        remainingCount: statistics.remainingCount,
      }),
      h(
        'section',
        { className: 'workspace-grid' },
        h(
          'div',
          { className: 'left-column' },
          h(TodoComposer, {
            draftText,
            onDraftChange: handleDraftChange,
            onSubmit: handleSubmit,
          }),
          h(ControlPanel, {
            currentFilter: filter,
            currentSort: sort,
            onFilterChange: setFilter,
            onSortChange: setSort,
          }),
          h(StatsPanel, statistics),
        ),
        h(
          'div',
          { className: 'right-column' },
          h(TodoList, {
            todos: visibleTodos,
            currentFilter: filter,
            onToggle: handleToggle,
            onDelete: handleDelete,
          }),
          h(LearningNotes),
        ),
      ),
    ),
  );
}

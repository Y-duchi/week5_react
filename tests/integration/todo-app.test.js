import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App, getStorageKey } from '../../src/app/App.js';
import { mountRoot, fireChange, fireClick, fireInput, fireKeydown } from '../helpers/testUtils.js';

describe('Todo App integration', () => {
  beforeEach(() => {
    document.title = 'React-like Todo Manager';
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('Todo를 추가한다', () => {
    const { container } = mountRoot(App);
    const input = container.querySelector('input[aria-label="할 일 입력"]');
    const addButton = container.querySelector('.primary-button');

    fireInput(input, '첫 번째 할 일');
    fireClick(addButton);

    const items = container.querySelectorAll('.todo-item');
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain('첫 번째 할 일');
    expect(input.value).toBe('');
  });

  it('빈 문자열 입력은 추가되지 않는다', () => {
    const { container } = mountRoot(App);
    const input = container.querySelector('input[aria-label="할 일 입력"]');

    fireInput(input, '   ');
    fireKeydown(input, 'Enter');

    expect(container.querySelectorAll('.todo-item')).toHaveLength(0);
    expect(container.querySelector('[data-testid="empty-state"]')).not.toBeNull();
  });

  it('Todo 완료 토글이 동작한다', () => {
    const { container } = mountRoot(App);
    const input = container.querySelector('input[aria-label="할 일 입력"]');
    fireInput(input, '체크 테스트');
    fireClick(container.querySelector('.primary-button'));

    const checkbox = container.querySelector('input[type="checkbox"]');
    checkbox.checked = true;
    fireChange(checkbox);

    expect(container.querySelector('.todo-item')?.className).toContain('todo-item-completed');
    const statValues = Array.from(container.querySelectorAll('.stat-value')).map((node) =>
      node.textContent.trim(),
    );
    expect(statValues).toEqual(['1', '0', '1']);
  });

  it('Todo를 삭제한다', () => {
    const { container } = mountRoot(App);
    const input = container.querySelector('input[aria-label="할 일 입력"]');
    fireInput(input, '삭제할 일');
    fireClick(container.querySelector('.primary-button'));

    fireClick(container.querySelector('.danger-button'));

    expect(container.querySelectorAll('.todo-item')).toHaveLength(0);
    expect(container.querySelector('[data-testid="empty-state"]')).not.toBeNull();
  });

  it('전체 / 진행중 / 완료 필터가 동작한다', () => {
    const { container } = mountRoot(App);
    const input = container.querySelector('input[aria-label="할 일 입력"]');

    fireInput(input, '미완료');
    fireClick(container.querySelector('.primary-button'));
    fireInput(input, '완료');
    fireClick(container.querySelector('.primary-button'));

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes[0].checked = true;
    fireChange(checkboxes[0]);

    const filterButtons = Array.from(container.querySelectorAll('.chip')).filter((button) =>
      ['전체', '진행중', '완료'].includes(button.textContent),
    );

    fireClick(filterButtons.find((button) => button.textContent === '완료'));
    expect(container.querySelectorAll('.todo-item')).toHaveLength(1);
    expect(container.textContent).toContain('완료');

    fireClick(filterButtons.find((button) => button.textContent === '진행중'));
    expect(container.querySelectorAll('.todo-item')).toHaveLength(1);
    expect(container.textContent).toContain('미완료');
  });

  it('정렬 변경이 동작한다', () => {
    const { container } = mountRoot(App);
    const input = container.querySelector('input[aria-label="할 일 입력"]');

    fireInput(input, 'gamma');
    fireClick(container.querySelector('.primary-button'));
    fireInput(input, 'alpha');
    fireClick(container.querySelector('.primary-button'));

    const sortButton = Array.from(container.querySelectorAll('.chip')).find(
      (button) => button.textContent === '이름순',
    );
    fireClick(sortButton);

    const itemTexts = Array.from(container.querySelectorAll('.todo-text')).map((node) =>
      node.textContent.trim(),
    );
    expect(itemTexts).toEqual(['alpha', 'gamma']);
  });

  it('남은 개수와 완료 개수가 반영된다', () => {
    const { container } = mountRoot(App);
    const input = container.querySelector('input[aria-label="할 일 입력"]');

    fireInput(input, '하나');
    fireClick(container.querySelector('.primary-button'));
    fireInput(input, '둘');
    fireClick(container.querySelector('.primary-button'));

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes[0].checked = true;
    fireChange(checkboxes[0]);

    const statValues = Array.from(container.querySelectorAll('.stat-value')).map((node) =>
      node.textContent.trim(),
    );
    expect(statValues).toEqual(['2', '1', '1']);
  });

  it('localStorage와 document.title이 동기화된다', () => {
    const { container } = mountRoot(App);
    const input = container.querySelector('input[aria-label="할 일 입력"]');

    fireInput(input, '저장 테스트');
    fireClick(container.querySelector('.primary-button'));

    const savedValue = JSON.parse(window.localStorage.getItem(getStorageKey()));
    expect(savedValue).toHaveLength(1);
    expect(document.title).toBe('남은 작업 1개 | React-like Todo');
  });

  it('빠른 연속 입력과 클릭에도 앱이 깨지지 않는다', () => {
    const { container } = mountRoot(App);
    const input = container.querySelector('input[aria-label="할 일 입력"]');
    const button = container.querySelector('.primary-button');

    fireInput(input, '하나');
    fireClick(button);
    fireInput(input, '둘');
    fireClick(button);
    fireInput(input, '셋');
    fireClick(button);

    const firstCheckbox = container.querySelectorAll('input[type="checkbox"]')[0];
    firstCheckbox.checked = true;
    fireChange(firstCheckbox);
    fireClick(container.querySelectorAll('.danger-button')[1]);

    expect(container.querySelectorAll('.todo-item')).toHaveLength(2);
    expect(container.querySelector('.todo-list')).not.toBeNull();
  });

  it('중복 텍스트와 긴 문자열도 허용한다', () => {
    const { container } = mountRoot(App);
    const input = container.querySelector('input[aria-label="할 일 입력"]');
    const longText = '아주 긴 문자열 '.repeat(20);

    fireInput(input, '중복');
    fireClick(container.querySelector('.primary-button'));
    fireInput(input, '중복');
    fireClick(container.querySelector('.primary-button'));
    fireInput(input, longText);
    fireClick(container.querySelector('.primary-button'));

    const itemTexts = Array.from(container.querySelectorAll('.todo-text')).map((node) =>
      node.textContent,
    );
    expect(itemTexts.filter((text) => text === '중복')).toHaveLength(2);
    expect(itemTexts.some((text) => text.includes('아주 긴 문자열'))).toBe(true);
  });

  it('완료된 항목 필터 전환이 안정적으로 동작한다', () => {
    const { container } = mountRoot(App);
    const input = container.querySelector('input[aria-label="할 일 입력"]');

    fireInput(input, '완료 예정');
    fireClick(container.querySelector('.primary-button'));

    const checkbox = container.querySelector('input[type="checkbox"]');
    checkbox.checked = true;
    fireChange(checkbox);

    const completedFilterButton = Array.from(container.querySelectorAll('.chip')).find(
      (button) => button.textContent === '완료',
    );
    const activeFilterButton = Array.from(container.querySelectorAll('.chip')).find(
      (button) => button.textContent === '진행중',
    );

    fireClick(completedFilterButton);
    expect(container.querySelectorAll('.todo-item')).toHaveLength(1);

    fireClick(activeFilterButton);
    expect(container.querySelectorAll('.todo-item')).toHaveLength(0);
    expect(container.querySelector('[data-testid="empty-state"]')).not.toBeNull();
  });
});

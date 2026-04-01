import { FunctionComponent } from '../../src/core/runtime.js';

/**
 * 테스트마다 깨끗한 DOM 컨테이너를 만든다.
 */
export function createContainer() {
  const container = document.createElement('div');
  document.body.innerHTML = '';
  document.body.appendChild(container);
  return container;
}

/**
 * 루트 컴포넌트를 mount한 뒤 인스턴스와 컨테이너를 함께 돌려준다.
 */
export function mountRoot(renderFunction, props = {}) {
  const container = createContainer();
  const instance = new FunctionComponent(renderFunction, props);
  instance.mount(container);
  return { container, instance };
}

/**
 * input 이벤트를 실제 브라우저처럼 흉내 낸다.
 */
export function fireInput(element, value) {
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * change 이벤트를 발생시킨다.
 */
export function fireChange(element, value = element.value) {
  element.value = value;
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * keyboard 이벤트를 발생시킨다.
 */
export function fireKeydown(element, key) {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

/**
 * click 이벤트를 발생시킨다.
 */
export function fireClick(element) {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

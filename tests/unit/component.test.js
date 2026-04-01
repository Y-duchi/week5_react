import { describe, expect, it } from 'vitest';
import { FunctionComponent, h, useState } from '../../src/core/runtime.js';
import { createContainer, fireClick } from '../helpers/testUtils.js';

describe('FunctionComponent', () => {
  it('mount가 최초 렌더링 결과를 DOM에 붙인다', () => {
    function Greeting() {
      return h('h1', null, '안녕하세요');
    }

    const container = createContainer();
    const component = new FunctionComponent(Greeting);
    component.mount(container);

    expect(container.querySelector('h1')?.textContent).toBe('안녕하세요');
    expect(component.renderCount).toBe(1);
  });

  it('update가 새 화면으로 갱신된다', () => {
    function Counter() {
      const [count, setCount] = useState(0);

      return h(
        'button',
        {
          type: 'button',
          onClick: () => setCount((current) => current + 1),
        },
        `count:${count}`,
      );
    }

    const container = createContainer();
    const component = new FunctionComponent(Counter);
    component.mount(container);

    fireClick(container.querySelector('button'));

    expect(container.querySelector('button')?.textContent).toBe('count:1');
    expect(component.renderCount).toBe(2);
  });

  it('렌더마다 hookIndex가 0부터 다시 시작한다', () => {
    const snapshots = [];

    function HookIndexViewer() {
      const [left, setLeft] = useState('L');
      const [right] = useState('R');

      snapshots.push([left, right]);

      return h(
        'button',
        {
          type: 'button',
          onClick: () => setLeft('NEXT'),
        },
        `${left}-${right}`,
      );
    }

    const container = createContainer();
    const component = new FunctionComponent(HookIndexViewer);
    component.mount(container);
    fireClick(container.querySelector('button'));

    expect(snapshots).toEqual([
      ['L', 'R'],
      ['NEXT', 'R'],
    ]);
    expect(component.hookIndex).toBe(2);
  });

  it('자식 함수 컴포넌트에서는 Hook을 사용할 수 없다', () => {
    function Child() {
      useState(0);
      return h('div', null, 'child');
    }

    function Parent() {
      return h(Child);
    }

    const container = createContainer();
    const component = new FunctionComponent(Parent);

    expect(() => component.mount(container)).toThrow(
      'useState는 루트 FunctionComponent 내부에서만 사용할 수 있습니다.',
    );
  });
});

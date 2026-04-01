import { describe, expect, it, vi } from 'vitest';
import { FunctionComponent, h, useEffect, useMemo, useState } from '../../src/core/runtime.js';
import { createContainer, fireClick } from '../helpers/testUtils.js';

describe('hooks', () => {
  it('useState가 상태를 유지하고 rerender를 트리거한다', () => {
    function Counter() {
      const [count, setCount] = useState(1);

      return h(
        'button',
        {
          type: 'button',
          onClick: () => setCount((current) => current + 1),
        },
        String(count),
      );
    }

    const container = createContainer();
    const component = new FunctionComponent(Counter);
    component.mount(container);

    fireClick(container.querySelector('button'));
    fireClick(container.querySelector('button'));

    expect(container.querySelector('button')?.textContent).toBe('3');
    expect(component.renderCount).toBe(3);
  });

  it('같은 이벤트 흐름에서 여러 번 setState를 호출해도 안정적으로 반영된다', () => {
    function MultiUpdate() {
      const [count, setCount] = useState(0);

      return h(
        'button',
        {
          type: 'button',
          onClick: () => {
            setCount((current) => current + 1);
            setCount((current) => current + 1);
            setCount((current) => current + 1);
          },
        },
        String(count),
      );
    }

    const container = createContainer();
    const component = new FunctionComponent(MultiUpdate);
    component.mount(container);
    fireClick(container.querySelector('button'));

    expect(container.querySelector('button')?.textContent).toBe('3');
    expect(component.renderCount).toBe(4);
  });

  it('같은 상태를 다시 set하면 rerender하지 않는다', () => {
    function SameValue() {
      const [count, setCount] = useState(10);

      return h(
        'button',
        {
          type: 'button',
          onClick: () => setCount(10),
        },
        String(count),
      );
    }

    const container = createContainer();
    const component = new FunctionComponent(SameValue);
    component.mount(container);
    fireClick(container.querySelector('button'));

    expect(component.renderCount).toBe(1);
  });

  it('useEffect는 dependency가 바뀔 때만 실행된다', () => {
    const effectSpy = vi.fn();

    function EffectViewer() {
      const [count, setCount] = useState(0);

      useEffect(() => {
        effectSpy(count);
      }, [count]);

      return h(
        'div',
        null,
        h(
          'button',
          {
            type: 'button',
            onClick: () => setCount(count),
          },
          'same',
        ),
        h(
          'button',
          {
            type: 'button',
            onClick: () => setCount((current) => current + 1),
          },
          'plus',
        ),
      );
    }

    const container = createContainer();
    const component = new FunctionComponent(EffectViewer);
    component.mount(container);

    fireClick(container.querySelectorAll('button')[0]);
    fireClick(container.querySelectorAll('button')[1]);

    expect(effectSpy.mock.calls).toEqual([[0], [1]]);
    expect(component.renderCount).toBe(2);
  });

  it('useEffect cleanup이 이전 effect를 정리한 뒤 다시 실행된다', () => {
    const events = [];

    function CleanupViewer() {
      const [step, setStep] = useState(1);

      useEffect(() => {
        events.push(`effect:${step}`);
        return () => {
          events.push(`cleanup:${step}`);
        };
      }, [step]);

      return h(
        'button',
        {
          type: 'button',
          onClick: () => setStep(2),
        },
        String(step),
      );
    }

    const container = createContainer();
    const component = new FunctionComponent(CleanupViewer);
    component.mount(container);
    fireClick(container.querySelector('button'));

    expect(events).toEqual(['effect:1', 'cleanup:1', 'effect:2']);
  });

  it('dependency가 없으면 effect가 매 렌더마다 실행되고, 빈 배열이면 한 번만 실행된다', () => {
    const noDepsSpy = vi.fn();
    const emptyDepsSpy = vi.fn();

    function EffectKinds() {
      const [count, setCount] = useState(0);

      useEffect(() => {
        noDepsSpy(count);
      });

      useEffect(() => {
        emptyDepsSpy(count);
      }, []);

      return h(
        'button',
        {
          type: 'button',
          onClick: () => setCount((current) => current + 1),
        },
        String(count),
      );
    }

    const container = createContainer();
    const component = new FunctionComponent(EffectKinds);
    component.mount(container);
    fireClick(container.querySelector('button'));
    fireClick(container.querySelector('button'));

    expect(noDepsSpy.mock.calls).toEqual([[0], [1], [2]]);
    expect(emptyDepsSpy.mock.calls).toEqual([[0]]);
    expect(component.renderCount).toBe(3);
  });

  it('useMemo는 dependency가 같으면 이전 값을 재사용한다', () => {
    const factorySpy = vi.fn((count) => ({ doubled: count * 2 }));
    const seenReferences = [];

    function MemoViewer() {
      const [count, setCount] = useState(1);
      const [text, setText] = useState('a');

      const memoValue = useMemo(() => factorySpy(count), [count]);
      seenReferences.push(memoValue);

      return h(
        'div',
        null,
        h(
          'button',
          {
            type: 'button',
            onClick: () => setText(text === 'a' ? 'b' : 'a'),
          },
          'text',
        ),
        h(
          'button',
          {
            type: 'button',
            onClick: () => setCount((current) => current + 1),
          },
          'count',
        ),
      );
    }

    const container = createContainer();
    const component = new FunctionComponent(MemoViewer);
    component.mount(container);
    fireClick(container.querySelectorAll('button')[0]);
    fireClick(container.querySelectorAll('button')[1]);

    expect(factorySpy).toHaveBeenCalledTimes(2);
    expect(seenReferences[0]).toBe(seenReferences[1]);
    expect(seenReferences[1]).not.toBe(seenReferences[2]);
    expect(component.renderCount).toBe(3);
  });

  it('memo dependency는 같은 참조면 재사용하고 새 참조면 다시 계산한다', () => {
    const computeSpy = vi.fn((items) => items.length);

    function ReferenceMemo() {
      const [items, setItems] = useState(() => ['a']);

      const memoValue = useMemo(() => computeSpy(items), [items]);

      return h(
        'div',
        null,
        h('span', { 'data-testid': 'memo' }, String(memoValue)),
        h(
          'button',
          {
            type: 'button',
            onClick: () => setItems(items),
          },
          'same-ref',
        ),
        h(
          'button',
          {
            type: 'button',
            onClick: () => setItems([...items]),
          },
          'new-ref',
        ),
      );
    }

    const container = createContainer();
    const component = new FunctionComponent(ReferenceMemo);
    component.mount(container);
    fireClick(container.querySelectorAll('button')[0]);
    fireClick(container.querySelectorAll('button')[1]);

    expect(computeSpy).toHaveBeenCalledTimes(2);
    expect(component.renderCount).toBe(2);
  });
});

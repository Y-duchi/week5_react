import { describe, expect, it } from 'vitest';
import { TEXT_ELEMENT, flattenChildren, h } from '../../src/core/runtime.js';

describe('h / VNode', () => {
  it('문자열 태그와 props를 가진 VNode를 만든다', () => {
    const vnode = h('button', { className: 'primary', type: 'button' }, '추가');

    expect(vnode.type).toBe('button');
    expect(vnode.props).toEqual({
      className: 'primary',
      type: 'button',
    });
    expect(vnode.children).toHaveLength(1);
    expect(vnode.children[0]).toEqual({
      type: TEXT_ELEMENT,
      props: { nodeValue: '추가' },
      children: [],
      key: null,
    });
  });

  it('children을 평탄화하고 null/boolean을 제거한다', () => {
    const flattened = flattenChildren([
      'a',
      ['b', ['c']],
      null,
      false,
      true,
      3,
    ]);

    expect(flattened).toEqual(['a', 'b', 'c', 3]);
  });

  it('중첩 children을 모두 텍스트/노드 형태로 정규화한다', () => {
    const vnode = h('div', null, ['안녕', [h('span', null, '세상')], 7]);

    expect(vnode.children).toHaveLength(3);
    expect(vnode.children[0].type).toBe(TEXT_ELEMENT);
    expect(vnode.children[1].type).toBe('span');
    expect(vnode.children[2].props.nodeValue).toBe('7');
  });
});

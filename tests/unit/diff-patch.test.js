import { describe, expect, it } from 'vitest';
import { createDomNode, diffTrees, h, patchDom } from '../../src/core/runtime.js';
import { createContainer } from '../helpers/testUtils.js';

describe('diff / patch', () => {
  it('diff가 prop과 텍스트 변경 지점을 찾는다', () => {
    const oldTree = h('div', { className: 'before' }, h('span', null, 'old'));
    const newTree = h('div', { className: 'after' }, h('span', null, 'new'));
    const diffResult = diffTrees(oldTree, newTree);

    expect(diffResult.type).toBe('UPDATE');
    expect(diffResult.propChanges).toEqual([
      {
        type: 'SET_PROP',
        key: 'className',
        value: 'after',
      },
    ]);
    expect(diffResult.childDiffs[0].childDiffs[0].type).toBe('TEXT');
  });

  it('patch가 필요한 DOM만 갱신하고 루트 노드는 재사용한다', () => {
    const oldTree = h(
      'section',
      { className: 'wrapper' },
      h('h1', null, '제목'),
      h('p', { 'data-testid': 'message' }, '처음 문장'),
    );
    const newTree = h(
      'section',
      { className: 'wrapper' },
      h('h1', null, '제목'),
      h('p', { 'data-testid': 'message' }, '바뀐 문장'),
    );

    const container = createContainer();
    container.appendChild(createDomNode(oldTree));
    const rootBefore = container.firstChild;
    const headingBefore = container.querySelector('h1');
    const messageBefore = container.querySelector('[data-testid="message"]');

    patchDom(container, diffTrees(oldTree, newTree), rootBefore);

    expect(container.firstChild).toBe(rootBefore);
    expect(container.querySelector('h1')).toBe(headingBefore);
    expect(container.querySelector('[data-testid="message"]')).toBe(messageBefore);
    expect(messageBefore.textContent).toBe('바뀐 문장');
  });

  it('key가 있으면 재정렬 시 기존 DOM 노드를 재사용한다', () => {
    const oldTree = h(
      'ul',
      null,
      h('li', { key: 'a', 'data-key': 'a' }, 'A'),
      h('li', { key: 'b', 'data-key': 'b' }, 'B'),
      h('li', { key: 'c', 'data-key': 'c' }, 'C'),
    );
    const newTree = h(
      'ul',
      null,
      h('li', { key: 'c', 'data-key': 'c' }, 'C'),
      h('li', { key: 'a', 'data-key': 'a' }, 'A'),
      h('li', { key: 'b', 'data-key': 'b' }, 'B'),
    );

    const container = createContainer();
    container.appendChild(createDomNode(oldTree));
    const [aNode, bNode, cNode] = Array.from(container.firstChild.childNodes);

    patchDom(container, diffTrees(oldTree, newTree), container.firstChild);

    const reordered = Array.from(container.firstChild.childNodes);
    expect(reordered[0]).toBe(cNode);
    expect(reordered[1]).toBe(aNode);
    expect(reordered[2]).toBe(bNode);
  });

  it('마지막 항목 삭제를 올바르게 반영한다', () => {
    const oldTree = h('ul', null, h('li', { key: '1' }, '하나'));
    const newTree = h('ul', null);

    const container = createContainer();
    container.appendChild(createDomNode(oldTree));

    patchDom(container, diffTrees(oldTree, newTree), container.firstChild);

    expect(container.querySelectorAll('li')).toHaveLength(0);
  });
});

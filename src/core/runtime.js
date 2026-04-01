export const TEXT_ELEMENT = 'TEXT_ELEMENT';

let currentComponent = null;

/**
 * h 함수의 목적:
 * - 화면을 바로 DOM으로 만들지 않고 Virtual DOM 객체로 표현한다.
 * 입력값:
 * - type: 태그 이름 또는 함수형 컴포넌트
 * - props: 속성 객체
 * - children: 자식 노드들
 * 반환값:
 * - 정규화된 VNode 객체
 * 왜 필요한가:
 * - 이전 화면과 새 화면을 비교하려면 먼저 일관된 자료구조가 필요하다.
 */
export function h(type, props = {}, ...children) {
  const flatChildren = flattenChildren(children).map(normalizeChild);
  const { key = null, ...safeProps } = props ?? {};

  return {
    type,
    props: safeProps,
    children: flatChildren,
    key,
  };
}

/**
 * 중첩된 children 배열을 한 줄로 평탄화한다.
 */
export function flattenChildren(children) {
  const result = [];

  children.forEach((child) => {
    if (Array.isArray(child)) {
      result.push(...flattenChildren(child));
      return;
    }

    if (child === null || child === undefined || child === false || child === true) {
      return;
    }

    result.push(child);
  });

  return result;
}

/**
 * 문자열/숫자를 텍스트 VNode로 바꾼다.
 */
export function normalizeChild(child) {
  if (typeof child === 'string' || typeof child === 'number') {
    return createTextVNode(String(child));
  }

  return child;
}

/**
 * 텍스트도 일반 노드처럼 diff하기 위해 별도 VNode로 감싼다.
 */
export function createTextVNode(text) {
  return {
    type: TEXT_ELEMENT,
    props: { nodeValue: text },
    children: [],
    key: null,
  };
}

/**
 * dependency 배열이 바뀌었는지 비교한다.
 */
export function didDependenciesChange(previousDeps, nextDeps) {
  if (previousDeps === undefined || nextDeps === undefined) {
    return true;
  }

  if (previousDeps.length !== nextDeps.length) {
    return true;
  }

  for (let index = 0; index < previousDeps.length; index += 1) {
    if (!Object.is(previousDeps[index], nextDeps[index])) {
      return true;
    }
  }

  return false;
}

function getCurrentComponentOrThrow(hookName) {
  if (!currentComponent) {
    throw new Error(`${hookName}는 루트 FunctionComponent 내부에서만 사용할 수 있습니다.`);
  }

  return currentComponent;
}

/**
 * useState의 목적:
 * - 루트 상태를 hooks 배열에 저장하고 setter로 갱신한다.
 * 입력값:
 * - initialValue: 초기값 또는 초기값 함수
 * 반환값:
 * - [현재값, setter]
 * 왜 필요한가:
 * - 사용자 입력에 따라 화면이 바뀌려면 기억되는 값이 필요하다.
 */
export function useState(initialValue) {
  const component = getCurrentComponentOrThrow('useState');
  const hookIndex = component.hookIndex;
  let hook = component.hooks[hookIndex];

  if (!hook) {
    hook = {
      kind: 'state',
      value: typeof initialValue === 'function' ? initialValue() : initialValue,
      setValue(nextValue) {
        const resolvedValue =
          typeof nextValue === 'function' ? nextValue(hook.value) : nextValue;

        if (Object.is(hook.value, resolvedValue)) {
          return hook.value;
        }

        hook.value = resolvedValue;
        component.update();
        return hook.value;
      },
    };

    component.hooks[hookIndex] = hook;
  }

  component.hookIndex += 1;
  return [hook.value, hook.setValue];
}

/**
 * useEffect의 목적:
 * - 렌더 뒤 실행할 부수효과를 예약한다.
 * 입력값:
 * - effect: 실행 함수
 * - dependencies: 재실행 조건 배열
 * 반환값:
 * - 없음
 * 왜 필요한가:
 * - localStorage 저장이나 document.title 변경은 렌더와 분리해야 한다.
 */
export function useEffect(effect, dependencies) {
  const component = getCurrentComponentOrThrow('useEffect');
  const hookIndex = component.hookIndex;
  let hook = component.hooks[hookIndex];

  if (!hook) {
    hook = {
      kind: 'effect',
      deps: undefined,
      cleanup: null,
      pendingEffect: null,
      nextDeps: undefined,
    };
    component.hooks[hookIndex] = hook;
  }

  if (didDependenciesChange(hook.deps, dependencies)) {
    hook.pendingEffect = effect;
    hook.nextDeps = dependencies;
    component.pendingEffects.push(hookIndex);
  }

  component.hookIndex += 1;
}

/**
 * useMemo의 목적:
 * - 비용이 있는 파생 계산 결과를 dependency가 같을 때 재사용한다.
 * 입력값:
 * - factory: 계산 함수
 * - dependencies: 재계산 조건 배열
 * 반환값:
 * - 캐싱된 계산 결과
 * 왜 필요한가:
 * - 파생값을 state로 저장하지 않으면서 불필요한 계산을 줄일 수 있다.
 */
export function useMemo(factory, dependencies) {
  const component = getCurrentComponentOrThrow('useMemo');
  const hookIndex = component.hookIndex;
  let hook = component.hooks[hookIndex];

  if (!hook) {
    hook = {
      kind: 'memo',
      initialized: false,
      deps: undefined,
      value: undefined,
    };
    component.hooks[hookIndex] = hook;
  }

  if (!hook.initialized || didDependenciesChange(hook.deps, dependencies)) {
    hook.value = factory();
    hook.deps = dependencies;
    hook.initialized = true;
  }

  component.hookIndex += 1;
  return hook.value;
}

/**
 * 함수형 자식 컴포넌트를 실제 비교 가능한 VNode까지 펼친다.
 */
export function resolveVNode(vnode) {
  if (vnode === null || vnode === undefined) {
    return null;
  }

  if (typeof vnode.type === 'function') {
    const savedComponent = currentComponent;
    currentComponent = null;

    try {
      const childVNode = vnode.type({
        ...vnode.props,
        children: vnode.children,
      });

      return resolveVNode(childVNode);
    } finally {
      currentComponent = savedComponent;
    }
  }

  return {
    ...vnode,
    children: (vnode.children || []).map(resolveVNode).filter(Boolean),
  };
}

/**
 * Virtual DOM 노드로부터 실제 DOM 노드를 만든다.
 */
export function createDomNode(vnode) {
  if (vnode.type === TEXT_ELEMENT) {
    return document.createTextNode(vnode.props.nodeValue);
  }

  const domNode = document.createElement(vnode.type);
  updateDomProps(domNode, {}, vnode.props);

  vnode.children.forEach((child) => {
    domNode.appendChild(createDomNode(child));
  });

  return domNode;
}

/**
 * DOM 속성을 이전/이후 props 기준으로 동기화한다.
 */
export function updateDomProps(domNode, previousProps = {}, nextProps = {}) {
  Object.keys(previousProps).forEach((key) => {
    if (key === 'children') {
      return;
    }

    if (!(key in nextProps)) {
      removeDomProp(domNode, key, previousProps[key]);
    }
  });

  Object.keys(nextProps).forEach((key) => {
    if (key === 'children') {
      return;
    }

    if (!Object.is(previousProps[key], nextProps[key])) {
      setDomProp(domNode, key, nextProps[key], previousProps[key]);
    }
  });
}

function setDomProp(domNode, key, nextValue, previousValue) {
  if (key.startsWith('on') && typeof nextValue === 'function') {
    const eventName = key.slice(2).toLowerCase();

    if (previousValue) {
      domNode.removeEventListener(eventName, previousValue);
    }

    domNode.addEventListener(eventName, nextValue);
    return;
  }

  if (key === 'className') {
    domNode.setAttribute('class', nextValue);
    return;
  }

  if (key === 'value' || key === 'checked') {
    domNode[key] = nextValue;
    return;
  }

  if (nextValue === false || nextValue === null || nextValue === undefined) {
    domNode.removeAttribute(key);
    return;
  }

  if (nextValue === true) {
    domNode.setAttribute(key, '');
    return;
  }

  domNode.setAttribute(key, nextValue);
}

function removeDomProp(domNode, key, previousValue) {
  if (key.startsWith('on') && typeof previousValue === 'function') {
    const eventName = key.slice(2).toLowerCase();
    domNode.removeEventListener(eventName, previousValue);
    return;
  }

  if (key === 'className') {
    domNode.removeAttribute('class');
    return;
  }

  if (key === 'value') {
    domNode.value = '';
    return;
  }

  if (key === 'checked') {
    domNode.checked = false;
    return;
  }

  domNode.removeAttribute(key);
}

/**
 * 두 VNode가 같은 DOM 자리로 재사용 가능한지 판단한다.
 */
export function isSameVNodeType(oldVNode, newVNode) {
  if (!oldVNode || !newVNode) {
    return false;
  }

  return oldVNode.type === newVNode.type && oldVNode.key === newVNode.key;
}

/**
 * prop 차이 목록을 구한다.
 */
export function diffProps(previousProps = {}, nextProps = {}) {
  const changes = [];
  const keys = new Set([...Object.keys(previousProps), ...Object.keys(nextProps)]);

  keys.forEach((key) => {
    if (key === 'children') {
      return;
    }

    if (!(key in nextProps)) {
      changes.push({ type: 'REMOVE_PROP', key });
      return;
    }

    if (!(key in previousProps) || !Object.is(previousProps[key], nextProps[key])) {
      changes.push({ type: 'SET_PROP', key, value: nextProps[key] });
    }
  });

  return changes;
}

function hasKeys(children = []) {
  return children.some((child) => child && child.key !== null && child.key !== undefined);
}

/**
 * 이전 트리와 새 트리를 비교해 변경 요약을 만든다.
 */
export function diffTrees(oldVNode, newVNode, path = '0') {
  if (!oldVNode && newVNode) {
    return { type: 'CREATE', path, oldVNode, newVNode };
  }

  if (oldVNode && !newVNode) {
    return { type: 'REMOVE', path, oldVNode, newVNode };
  }

  if (!isSameVNodeType(oldVNode, newVNode)) {
    return { type: 'REPLACE', path, oldVNode, newVNode };
  }

  if (newVNode.type === TEXT_ELEMENT) {
    const changed = oldVNode.props.nodeValue !== newVNode.props.nodeValue;

    return {
      type: changed ? 'TEXT' : 'NONE',
      path,
      oldVNode,
      newVNode,
      propChanges: changed ? [{ type: 'SET_TEXT', value: newVNode.props.nodeValue }] : [],
      childDiffs: [],
    };
  }

  const propChanges = diffProps(oldVNode.props, newVNode.props);
  const oldChildren = oldVNode.children || [];
  const newChildren = newVNode.children || [];
  const childDiffs = [];
  const childCount = Math.max(oldChildren.length, newChildren.length);

  for (let index = 0; index < childCount; index += 1) {
    childDiffs.push(diffTrees(oldChildren[index], newChildren[index], `${path}.${index}`));
  }

  return {
    type:
      propChanges.length > 0 ||
      childDiffs.some((child) => child.type !== 'NONE') ||
      hasKeys(oldChildren) ||
      hasKeys(newChildren)
        ? 'UPDATE'
        : 'NONE',
    path,
    oldVNode,
    newVNode,
    propChanges,
    childDiffs,
  };
}

/**
 * diff 결과를 실제 DOM에 반영한다.
 */
export function patchDom(parentDom, diffResult, currentDom = null) {
  const { oldVNode, newVNode } = diffResult;
  const targetDom = currentDom ?? parentDom?.firstChild ?? null;

  if (diffResult.type === 'CREATE') {
    const createdNode = createDomNode(newVNode);
    parentDom.appendChild(createdNode);
    return createdNode;
  }

  if (diffResult.type === 'REMOVE') {
    if (targetDom) {
      parentDom.removeChild(targetDom);
    }
    return null;
  }

  if (diffResult.type === 'REPLACE') {
    const replacedNode = createDomNode(newVNode);

    if (targetDom) {
      parentDom.replaceChild(replacedNode, targetDom);
    } else {
      parentDom.appendChild(replacedNode);
    }

    return replacedNode;
  }

  if (newVNode.type === TEXT_ELEMENT) {
    if (diffResult.type === 'TEXT') {
      targetDom.nodeValue = newVNode.props.nodeValue;
    }

    return targetDom;
  }

  updateDomProps(targetDom, oldVNode.props, newVNode.props);
  patchChildren(targetDom, oldVNode.children || [], newVNode.children || []);
  return targetDom;
}

function patchChildren(parentDom, oldChildren, newChildren) {
  if (!hasKeys(oldChildren) && !hasKeys(newChildren)) {
    const maxLength = Math.max(oldChildren.length, newChildren.length);

    for (let index = 0; index < maxLength; index += 1) {
      patchDom(
        parentDom,
        {
          type: guessPatchType(oldChildren[index], newChildren[index]),
          oldVNode: oldChildren[index],
          newVNode: newChildren[index],
        },
        parentDom.childNodes[index] ?? null,
      );
    }

    return;
  }

  const oldDomNodes = Array.from(parentDom.childNodes);
  const oldEntriesByKey = new Map();
  const oldEntriesWithoutKey = [];
  const nextDomOrder = [];

  oldChildren.forEach((child, index) => {
    const entry = { vnode: child, domNode: oldDomNodes[index] };

    if (child?.key !== null && child?.key !== undefined) {
      oldEntriesByKey.set(child.key, entry);
    } else {
      oldEntriesWithoutKey.push(entry);
    }
  });

  newChildren.forEach((newChild) => {
    let matchedEntry = null;

    if (newChild?.key !== null && newChild?.key !== undefined && oldEntriesByKey.has(newChild.key)) {
      matchedEntry = oldEntriesByKey.get(newChild.key);
      oldEntriesByKey.delete(newChild.key);
    } else if (oldEntriesWithoutKey.length > 0) {
      matchedEntry = oldEntriesWithoutKey.shift();
    }

    const patchedNode = patchDom(
      parentDom,
      {
        type: guessPatchType(matchedEntry?.vnode ?? null, newChild),
        oldVNode: matchedEntry?.vnode ?? null,
        newVNode: newChild,
      },
      matchedEntry?.domNode ?? null,
    );

    if (patchedNode) {
      nextDomOrder.push(patchedNode);
    }
  });

  oldEntriesByKey.forEach((entry) => {
    if (entry.domNode && parentDom.contains(entry.domNode)) {
      parentDom.removeChild(entry.domNode);
    }
  });

  oldEntriesWithoutKey.forEach((entry) => {
    if (entry.domNode && parentDom.contains(entry.domNode)) {
      parentDom.removeChild(entry.domNode);
    }
  });

  nextDomOrder.forEach((domNode, index) => {
    const domAtIndex = parentDom.childNodes[index];

    if (domAtIndex !== domNode) {
      parentDom.insertBefore(domNode, domAtIndex ?? null);
    }
  });
}

function guessPatchType(oldVNode, newVNode) {
  if (!oldVNode && newVNode) {
    return 'CREATE';
  }

  if (oldVNode && !newVNode) {
    return 'REMOVE';
  }

  if (!isSameVNodeType(oldVNode, newVNode)) {
    return 'REPLACE';
  }

  if (newVNode.type === TEXT_ELEMENT && oldVNode.props.nodeValue !== newVNode.props.nodeValue) {
    return 'TEXT';
  }

  return 'UPDATE';
}

/**
 * FunctionComponent 클래스의 목적:
 * - 루트 함수형 컴포넌트를 감싸서 hooks 배열, mount, update를 관리한다.
 * 입력값:
 * - renderFunction: 루트 함수형 컴포넌트
 * - props: 루트 props
 * 반환값:
 * - mount/update 가능한 인스턴스
 * 왜 필요한가:
 * - 함수형 컴포넌트는 상태를 기억할 인스턴스가 없어서 외부 저장소가 필요하다.
 */
export class FunctionComponent {
  constructor(renderFunction, props = {}) {
    this.renderFunction = renderFunction;
    this.props = props;
    this.hooks = [];
    this.hookIndex = 0;
    this.pendingEffects = [];
    this.container = null;
    this.currentTree = null;
    this.renderCount = 0;
    this.lastDiff = null;
  }

  /**
   * 처음 화면을 그린다.
   */
  mount(container) {
    this.container = container;
    this.hookIndex = 0;
    this.pendingEffects = [];
    this.currentTree = this.renderResolvedTree();
    this.container.innerHTML = '';
    this.container.appendChild(createDomNode(this.currentTree));
    this.flushEffects();
    return this.currentTree;
  }

  /**
   * state 변경 후 다시 렌더링한다.
   */
  update() {
    if (!this.container) {
      throw new Error('mount 이후에만 update를 호출할 수 있습니다.');
    }

    this.hookIndex = 0;
    this.pendingEffects = [];

    const previousTree = this.currentTree;
    const nextTree = this.renderResolvedTree();
    const diffResult = diffTrees(previousTree, nextTree);

    this.lastDiff = diffResult;
    patchDom(this.container, diffResult, this.container.firstChild);
    this.currentTree = nextTree;
    this.flushEffects();
    return this.currentTree;
  }

  /**
   * 테스트나 종료 시 effect cleanup을 정리한다.
   */
  destroy() {
    this.hooks.forEach((hook) => {
      if (hook?.kind === 'effect' && typeof hook.cleanup === 'function') {
        hook.cleanup();
      }
    });

    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  renderResolvedTree() {
    currentComponent = this;

    try {
      this.renderCount += 1;
      return resolveVNode(this.renderFunction(this.props));
    } finally {
      currentComponent = null;
    }
  }

  flushEffects() {
    this.pendingEffects.forEach((hookIndex) => {
      const hook = this.hooks[hookIndex];

      if (typeof hook.cleanup === 'function') {
        hook.cleanup();
      }

      const cleanup = hook.pendingEffect();
      hook.cleanup = typeof cleanup === 'function' ? cleanup : null;
      hook.deps = hook.nextDeps;
      hook.pendingEffect = null;
      hook.nextDeps = undefined;
    });
  }
}

// 발표 포인트:
// "초보자 버전에서는 runtime.js 한 파일에 h, hooks, diff, patch를 모아 전체 흐름을 따라가게 했습니다."

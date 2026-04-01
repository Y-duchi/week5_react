import {
  cloneWithVNodeMetadata,
  createIdentityState,
  getVNodeKey,
  reconcileVNodeIdentity,
  seedVNodeIdentity,
} from "./identity.js";

const TEXT_KIND = "TEXT";
const TEXT_PROP = "nodeValue";
const OWN = Object.prototype.hasOwnProperty;
const ENABLE_KEYED_CHILD_DIFF = true;

export function diff(oldVNode, newVNode, options = {}) {
  const skipIdentityPrep = Boolean(options?.skipIdentityPrep);
  let preparedOldVNode = oldVNode;
  let preparedNewVNode = newVNode;

  if (!skipIdentityPrep) {
    const identityState = createIdentityState();
    preparedOldVNode = cloneWithVNodeMetadata(oldVNode);
    preparedNewVNode = cloneWithVNodeMetadata(newVNode);

    seedVNodeIdentity(preparedOldVNode, identityState);
    reconcileVNodeIdentity(preparedOldVNode, preparedNewVNode, identityState);
  }

  const patches = [];
  walk(preparedOldVNode, preparedNewVNode, [], patches);
  return patches;
}

function walk(oldNode, newNode, path, patches) {
  if (oldNode == null && newNode == null) return;
  if (oldNode === newNode) return;

  if (oldNode == null) {
    patches.push({ kind: "CREATE", path: path.slice(0), node: newNode });
    return;
  }

  if (newNode == null) {
    patches.push({ kind: "REMOVE", path: path.slice(0) });
    return;
  }

  if (oldNode.type !== newNode.type) {
    patches.push({ kind: "REPLACE", path: path.slice(0), node: newNode });
    return;
  }

  if (oldNode.type === TEXT_KIND) {
    const oldText = getTextValue(oldNode);
    const newText = getTextValue(newNode);
    if (oldText !== newText) {
      patches.push({ kind: "TEXT", path: path.slice(0), text: newText });
    }
    return;
  }

  if (isSubtreeEqual(oldNode, newNode)) {
    return;
  }

  diffProps(oldNode, newNode, path, patches);
  diffChildren(
    Array.isArray(oldNode.children) ? oldNode.children : [],
    Array.isArray(newNode.children) ? newNode.children : [],
    path,
    patches,
  );
}

function diffChildren(oldChildren, newChildren, path, patches) {
  if (!oldChildren.length && !newChildren.length) return;

  const canUseKeyedDiff =
    ENABLE_KEYED_CHILD_DIFF &&
    isReusableKeyedChildren(oldChildren) &&
    isReusableKeyedChildren(newChildren);

  if (canUseKeyedDiff) {
    diffChildrenByKeys(oldChildren, newChildren, path, patches);
    return;
  }

  const oldLength = oldChildren.length;
  const newLength = newChildren.length;
  const sharedLength = Math.min(oldLength, newLength);

  for (let index = 0; index < sharedLength; index += 1) {
    path.push(index);
    walk(oldChildren[index], newChildren[index], path, patches);
    path.pop();
  }

  if (oldLength > newLength) {
    for (let index = oldLength - 1; index >= newLength; index -= 1) {
      path.push(index);
      walk(oldChildren[index], null, path, patches);
      path.pop();
    }
  }

  if (newLength > oldLength) {
    for (let index = oldLength; index < newLength; index += 1) {
      path.push(index);
      walk(null, newChildren[index], path, patches);
      path.pop();
    }
  }
}

function diffChildrenByKeys(oldChildren, newChildren, path, patches) {
  const oldIndexByKey = new Map();
  for (let index = 0; index < oldChildren.length; index += 1) {
    const key = getVNodeKey(oldChildren[index]);
    if (key != null) {
      oldIndexByKey.set(key, index);
    }
  }

  const newIndexToOldIndex = new Array(newChildren.length);
  const oldIndexesInNewOrder = [];
  const oldKeysInNew = new Set();

  for (let newIndex = 0; newIndex < newChildren.length; newIndex += 1) {
    const key = getVNodeKey(newChildren[newIndex]);
    oldKeysInNew.add(key);

    const oldIndex = oldIndexByKey.has(key) ? oldIndexByKey.get(key) : -1;
    newIndexToOldIndex[newIndex] = oldIndex;
    if (oldIndex >= 0) {
      oldIndexesInNewOrder.push(oldIndex);
    }
  }

  const lisSet = new Set(longestIncreasingSubsequence(oldIndexesInNewOrder));

  for (let oldIndex = oldChildren.length - 1; oldIndex >= 0; oldIndex -= 1) {
    const oldKey = getVNodeKey(oldChildren[oldIndex]);
    if (!oldKeysInNew.has(oldKey) || !lisSet.has(oldIndex)) {
      path.push(oldIndex);
      walk(oldChildren[oldIndex], null, path, patches);
      path.pop();
    }
  }

  for (let newIndex = 0; newIndex < newChildren.length; newIndex += 1) {
    const oldIndex = newIndexToOldIndex[newIndex];
    path.push(newIndex);

    if (oldIndex >= 0 && lisSet.has(oldIndex)) {
      walk(oldChildren[oldIndex], newChildren[newIndex], path, patches);
    } else {
      walk(null, newChildren[newIndex], path, patches);
    }

    path.pop();
  }
}

function diffProps(oldNode, newNode, path, patches) {
  const oldProps = oldNode.props || {};
  const newProps = newNode.props || {};
  const keys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

  for (const key of keys) {
    const hadOld = OWN.call(oldProps, key);
    const hasNew = OWN.call(newProps, key);

    if (!hasNew) {
      patches.push({ kind: "REMOVE_PROP", path: path.slice(0), key });
      continue;
    }

    if (!hadOld || oldProps[key] !== newProps[key]) {
      const value = isEventHandlerProp(key) ? newProps[key] : newProps[key];
      patches.push({ kind: "SET_PROP", path: path.slice(0), key, value });
    }
  }
}

function isEventHandlerProp(key) {
  return typeof key === "string" && key.startsWith("on");
}

function isSubtreeEqual(left, right) {
  if (left === right) return true;
  if ((left.children?.length ?? 0) !== (right.children?.length ?? 0)) return false;
  if ((left.children?.length ?? 0) > 0) return false;

  const leftProps = left.props || {};
  const rightProps = right.props || {};
  let leftCount = 0;

  for (const key in leftProps) {
    if (!OWN.call(leftProps, key)) continue;
    leftCount += 1;
    if (!OWN.call(rightProps, key)) return false;
    if (leftProps[key] !== rightProps[key]) return false;
  }

  for (const key in rightProps) {
    if (!OWN.call(rightProps, key)) continue;
    if (!OWN.call(leftProps, key)) return false;
    leftCount -= 1;
  }

  return leftCount === 0;
}

function getTextValue(vnode) {
  const props = vnode && vnode.props;
  if (props != null && OWN.call(props, TEXT_PROP)) {
    const value = props[TEXT_PROP];
    return value == null ? "" : String(value);
  }

  return "";
}

function isReusableKeyedChildren(children) {
  if (children.length === 0) return true;

  const keys = new Set();
  for (const child of children) {
    const key = getVNodeKey(child);
    if (key == null || keys.has(key)) {
      return false;
    }
    keys.add(key);
  }

  return true;
}

function longestIncreasingSubsequence(values) {
  if (values.length === 0) {
    return [];
  }

  const tails = [];
  const tailsIndex = [];
  const prevIndex = new Array(values.length).fill(-1);

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    let left = 0;
    let right = tails.length;

    while (left < right) {
      const mid = (left + right) >>> 1;
      if (tails[mid] >= value) {
        right = mid;
      } else {
        left = mid + 1;
      }
    }

    if (left === tails.length) {
      tails.push(value);
      tailsIndex.push(index);
    } else {
      tails[left] = value;
      tailsIndex[left] = index;
    }

    if (left > 0) {
      prevIndex[index] = tailsIndex[left - 1];
    }
  }

  const sequence = [];
  let cursor = tailsIndex[tailsIndex.length - 1];
  while (cursor !== -1) {
    sequence.push(values[cursor]);
    cursor = prevIndex[cursor];
  }

  return sequence.reverse();
}

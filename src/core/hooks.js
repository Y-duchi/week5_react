/**
 * 역할:
 * - useState / useEffect / useMemo를 hook index 기반으로 구현합니다.
 * - "함수는 매번 다시 실행되는데 상태는 어떻게 유지되는가?"를 가장 직접적으로 보여주는 파일입니다.
 */

import { assertRootHookUsage } from "./component.js";

export function useState(initialValue) {
  const component = assertRootHookUsage("useState");
  const index = component.hookCursor;
  let hook = component.hooks[index];

  if (!hook) {
    hook = {
      kind: "state",
      value: typeof initialValue === "function" ? initialValue() : initialValue,
      setter: null,
    };
    component.hooks[index] = hook;
  }

  if (hook.kind !== "state") {
    throw new Error("Hook order changed: expected a state hook.");
  }

  if (!hook.setter) {
    hook.setter = (nextValue) => {
      const resolvedValue =
        typeof nextValue === "function" ? nextValue(hook.value) : nextValue;

      if (Object.is(hook.value, resolvedValue)) {
        return hook.value;
      }

      hook.value = resolvedValue;

      if (component.store?.requestUpdate) {
        component.store.requestUpdate();
      } else {
        component.requestUpdate();
      }

      return hook.value;
    };
  }

  component.hookCursor += 1;
  return [hook.value, hook.setter];
}

export function useEffect(effect, deps) {
  const component = assertRootHookUsage("useEffect");
  const index = component.hookCursor;
  let hook = component.hooks[index];

  if (!hook) {
    hook = {
      kind: "effect",
      deps: undefined,
      nextDeps: undefined,
      cleanup: null,
      runCount: 0,
    };
    component.hooks[index] = hook;
  }

  if (hook.kind !== "effect") {
    throw new Error("Hook order changed: expected an effect hook.");
  }

  const nextDeps = Array.isArray(deps) ? [...deps] : undefined;
  const shouldRun = nextDeps === undefined || !areDepsEqual(hook.deps, nextDeps);

  hook.nextDeps = nextDeps;

  if (shouldRun) {
    component.queueEffect({
      index,
      effect,
      deps: nextDeps,
    });
  }

  component.hookCursor += 1;
}

export function useMemo(factory, deps) {
  const component = assertRootHookUsage("useMemo");
  const index = component.hookCursor;
  let hook = component.hooks[index];

  if (!hook) {
    hook = {
      kind: "memo",
      deps: undefined,
      value: undefined,
      recomputeCount: 0,
      cacheHits: 0,
    };
    component.hooks[index] = hook;
  }

  if (hook.kind !== "memo") {
    throw new Error("Hook order changed: expected a memo hook.");
  }

  const nextDeps = Array.isArray(deps) ? [...deps] : undefined;
  const shouldRecompute = nextDeps === undefined || !areDepsEqual(hook.deps, nextDeps);

  if (shouldRecompute) {
    hook.value = factory();
    hook.deps = nextDeps;
    hook.recomputeCount += 1;
  } else {
    hook.cacheHits += 1;
  }

  component.hookCursor += 1;
  return hook.value;
}

export function areDepsEqual(previousDeps, nextDeps) {
  if (!Array.isArray(previousDeps) || !Array.isArray(nextDeps)) {
    return false;
  }

  if (previousDeps.length !== nextDeps.length) {
    return false;
  }

  return previousDeps.every((value, index) => Object.is(value, nextDeps[index]));
}

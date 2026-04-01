let activeComponent = null;
let nestedComponentDepth = 0;

function ensureActiveComponent(hookName) {
  if (!activeComponent) {
    throw new Error(`${hookName} can only be used while a FunctionComponent is rendering.`);
  }

  if (nestedComponentDepth > 0) {
    throw new Error(`${hookName} can only be used in the root component.`);
  }

  return activeComponent;
}

export function runWithHooks(component, render) {
  const previousComponent = activeComponent;
  const previousDepth = nestedComponentDepth;
  activeComponent = component;
  component.hookCursor = 0;
  component.pendingEffects = [];
  nestedComponentDepth = 0;

  try {
    return render();
  } finally {
    activeComponent = previousComponent;
    nestedComponentDepth = previousDepth;
  }
}

export function withNestedComponent(render) {
  nestedComponentDepth += 1;

  try {
    return render();
  } finally {
    nestedComponentDepth -= 1;
  }
}

export function areHookInputsEqual(previousDeps, nextDeps) {
  if (!Array.isArray(previousDeps) || !Array.isArray(nextDeps)) {
    return false;
  }

  if (previousDeps.length !== nextDeps.length) {
    return false;
  }

  return previousDeps.every((value, index) => Object.is(value, nextDeps[index]));
}

export function useState(initialValue) {
  const component = ensureActiveComponent("useState");
  const hookIndex = component.hookCursor++;
  const existingHook = component.hooks[hookIndex];

  if (!existingHook) {
    component.hooks[hookIndex] = {
      type: "state",
      value: typeof initialValue === "function" ? initialValue() : initialValue,
    };
  }

  const hook = component.hooks[hookIndex];

  function setState(nextValue) {
    const resolvedValue =
      typeof nextValue === "function" ? nextValue(hook.value) : nextValue;

    if (Object.is(hook.value, resolvedValue)) {
      return;
    }

    hook.value = resolvedValue;
    component.scheduleUpdate();
  }

  return [hook.value, setState];
}

export function useMemo(factory, deps) {
  const component = ensureActiveComponent("useMemo");
  const hookIndex = component.hookCursor++;
  const existingHook = component.hooks[hookIndex];

  if (!existingHook || !areHookInputsEqual(existingHook.deps, deps)) {
    component.hooks[hookIndex] = {
      type: "memo",
      deps,
      value: factory(),
    };
  }

  return component.hooks[hookIndex].value;
}

export function useEffect(effect, deps) {
  const component = ensureActiveComponent("useEffect");
  const hookIndex = component.hookCursor++;
  const existingHook = component.hooks[hookIndex];
  const didChange = !existingHook || !areHookInputsEqual(existingHook.deps, deps);

  component.hooks[hookIndex] = {
    type: "effect",
    deps,
    cleanup: existingHook?.cleanup ?? null,
  };

  if (didChange) {
    component.pendingEffects.push({
      hookIndex,
      effect,
    });
  }
}

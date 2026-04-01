function normalizeNode(node) {
  if (node == null || node === false) {
    return null;
  }

  if (Array.isArray(node)) {
    return {
      type: "fragment",
      children: normalizeChildren(node),
    };
  }

  if (typeof node === "string" || typeof node === "number") {
    return {
      type: "text",
      value: String(node),
    };
  }

  return node;
}

function normalizeChildren(children) {
  return children.flatMap((child) => {
    if (Array.isArray(child)) {
      return normalizeChildren(child);
    }

    const normalized = normalizeNode(child);
    return normalized ? [normalized] : [];
  });
}

function normalizeProps(props = {}) {
  const attrs = {};

  for (const [name, value] of Object.entries(props)) {
    if (name === "children" || value == null || value === false) {
      continue;
    }

    if (name.startsWith("on")) {
      continue;
    }

    if (name === "className") {
      attrs.class = value;
      continue;
    }

    if (name === "htmlFor") {
      attrs.for = value;
      continue;
    }

    attrs[name] = value;
  }

  return attrs;
}

export function fragment(...children) {
  return {
    type: "fragment",
    children: normalizeChildren(children),
  };
}

export function h(tagNameOrComponent, props = {}, ...children) {
  const normalizedChildren = normalizeChildren(children);

  if (typeof tagNameOrComponent === "function") {
    return normalizeNode(tagNameOrComponent({ ...props, children: normalizedChildren }));
  }

  return {
    type: "element",
    tagName: tagNameOrComponent,
    attrs: normalizeProps(props),
    children: normalizedChildren,
  };
}

# Week 5 Assignment: Custom React-like Runtime

This project implements a tiny React-style runtime from scratch with:

- `FunctionComponent` class
  - `mount()`
  - `update()`
  - hook storage array (`hooks`)
- `useState`, `useEffect`, `useMemo`
- Virtual DOM + Diff + Patch rendering pipeline
- A working demo page with input/click interactions

Important constraints from the assignment are reflected:

- Only root component owns state.
- Child components receive props only and do not use hooks.
- State updates re-render only through diff/patch, not full remount.

## Optimization improvements

- Child removal in diff/patch now uses reverse-order deletion to avoid index-shift bugs on unkeyed list shrink.
- Boolean props like `checked`/`disabled` are treated as properties, not string attributes.
- Update scheduling uses `requestAnimationFrame` when available for frame-level batching.

## How to run

1. Open `index.html` in a browser.
2. Enter a task and click **add**.
3. Use checkbox, delete, and filter buttons to see updates.

## Project files

- Runtime: `src/framework/reactCore.js`
- Virtual DOM core: `src/core/diff.js`, `src/core/patch.js`, `src/core/vNodeToDOM.js`
- Demo app: `src/app.js`
- Unit tests: `tests/unit/*.test.js`

## Test command

```bash
npm test
```

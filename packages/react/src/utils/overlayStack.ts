// Internal shared stack used by overlay components (Modal, Drawer, BottomSheet,
// Popover) to coordinate Escape handling: only the top-most overlay handles
// Escape, so nested overlays close one layer at a time.

type Token = symbol;

const stack: Token[] = [];

export function pushOverlay(): Token {
  const token = Symbol('overlay');
  stack.push(token);
  return token;
}

export function popOverlay(token: Token) {
  const i = stack.lastIndexOf(token);
  if (i >= 0) stack.splice(i, 1);
}

/** Returns true if `token` is currently the top of the stack. */
export function isTop(token: Token): boolean {
  return stack[stack.length - 1] === token;
}

import {
  cloneElement,
  forwardRef,
  isValidElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from './cn';

type SlotChildProps = Record<string, unknown> & {
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLElement>;
};

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children: ReactElement;
  slottedChildren?: ReactNode;
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (!ref) return;
  if (typeof ref === 'function') ref(node);
  else (ref as React.MutableRefObject<T | null>).current = node;
}

export function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    refs.forEach((ref) => assignRef(ref, node));
  };
}

function mergeProps(slotProps: SlotChildProps, childProps: SlotChildProps) {
  const merged: SlotChildProps = { ...slotProps, ...childProps };

  for (const key of Object.keys(slotProps)) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];
    const isHandler = /^on[A-Z]/.test(key);

    if (isHandler && typeof slotValue === 'function' && typeof childValue === 'function') {
      merged[key] = (...args: unknown[]) => {
        childValue(...args);
        slotValue(...args);
      };
    }
  }

  merged.className = cn(slotProps.className, childProps.className);
  merged.style = { ...slotProps.style, ...childProps.style };
  return merged;
}

/**
 * Tiny Radix-style Slot used by primitives that expose `asChild`.
 * It preserves child props while merging Corelith classes, handlers, styles,
 * and refs without adding a runtime dependency.
 */
export const Slot = forwardRef<HTMLElement, SlotProps>(function Slot(
  { children, slottedChildren, ...props },
  ref,
) {
  if (!isValidElement(children)) {
    throw new Error('Slot expects a single valid React element child.');
  }

  const child = children as ReactElement<SlotChildProps>;
  const merged = mergeProps({ ...props, ref }, child.props);
  if (slottedChildren !== undefined) {
    merged.children = slottedChildren;
  }

  return cloneElement(child, {
    ...merged,
    ref: composeRefs(ref, child.props.ref),
  });
});

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type StepperStepState = 'pending' | 'current' | 'done';

export interface StepperStepProps extends HTMLAttributes<HTMLDivElement> {
  state?: StepperStepState;
  /** Optional inline label — switches the row to `.p-stepper--labelled`. */
  label?: ReactNode;
}

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  /** Total number of steps. Ignored if children are provided. */
  total?: number;
  /** 1-based current step index. */
  current?: number;
  /** Switch to labelled layout (taller pills). */
  labelled?: boolean;
  children?: ReactNode;
}

function StepperStep({ state = 'pending', label, className, ...rest }: StepperStepProps) {
  return (
    <div
      role="presentation"
      className={cx('p-step', state, className)}
      aria-current={state === 'current' ? 'step' : undefined}
      {...rest}
    >
      {label}
    </div>
  );
}

const StepperRoot = forwardRef<HTMLDivElement, StepperProps>(function Stepper(
  { total, current = 1, labelled, className, children, ...rest },
  ref,
) {
  let content: ReactNode = children;
  if (!children && total) {
    content = Array.from({ length: total }, (_, i) => {
      const idx = i + 1;
      const state: StepperStepState =
        idx < current ? 'done' : idx === current ? 'current' : 'pending';
      return <StepperStep key={i} state={state} />;
    });
  }
  return (
    <div
      ref={ref}
      role="group"
      aria-label="Progress"
      className={cx('p-stepper', labelled && 'p-stepper--labelled', className)}
      {...rest}
    >
      {content}
    </div>
  );
});

type StepperComponent = typeof StepperRoot & {
  Step: typeof StepperStep;
};

/**
 * Stepper — multi-step progress indicator.
 *
 * @example
 * ```tsx
 * <Stepper />
 * ```
 */
export const Stepper = StepperRoot as StepperComponent;
Stepper.Step = StepperStep;

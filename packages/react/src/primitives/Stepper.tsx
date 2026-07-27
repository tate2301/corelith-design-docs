"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export type StepperVariant = 'numbered' | 'bars';

export interface StepItem {
  /** Stable id — used as the React key. Falls back to the array index. */
  id?: string;
  title: ReactNode;
  description?: ReactNode;
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** 1-BASED current step. @default 1 */
  current?: number;
  /** 0-BASED alternative to `current`, so callers cannot get the off-by-one
   *  wrong. If both are supplied, `current` wins. */
  currentIndex?: number;
  /** Number of steps to synthesise when `steps` is omitted. @default 3 */
  total?: number;
  /** Explicit step list. */
  steps?: StepItem[];
  /** Fires with the 1-based step number when a step is activated. Supplying
   *  this makes each step a real `<button>`. */
  onChange?: (step: number) => void;
  /** `numbered` is the labelled pill track; `bars` is the compact segmented
   *  progress bar. @default 'numbered' */
  variant?: StepperVariant;
  /** Render an "3/5" counter and the current step's label above the track.
   *  @default false */
  showCounter?: boolean;
}

/**
 * Stepper — wizard progress indicator. Maps to the `.p-stepper` / `.p-step`
 * family in components.css (`.p-stepper--labelled` for `variant="numbered"`),
 * with the wrapper and counter chrome in surfaces.css.
 *
 * NOTE — this component previously emitted `.p-stepper-step` with `active` /
 * `done` modifiers while the stylesheet styles `.p-step` with `done` /
 * `current` / `pending`. Both halves disagreed, so every shipped rule was dead
 * and only inline styles applied. The JSX now emits the styled names and keeps
 * the legacy `.p-stepper-step` / `.active` aliases alongside them.
 *
 * @example
 * <Stepper steps={[{ id: 'a', title: 'Type' }, { id: 'b', title: 'Dates' }]} current={2} />
 *
 * @example
 * // 0-based callers, compact bars, with a "2/4" counter.
 * <Stepper variant="bars" showCounter steps={steps} currentIndex={1} />
 *
 * Accessibility:
 *   - The root is `role="navigation"`; pass `aria-label` to rename it.
 *   - A visually-hidden `<ol>` lists every step with its state, so AT gets the
 *     full picture regardless of variant.
 *   - When `onChange` is omitted the steps are inert and the track is hidden
 *     from AT (the `<ol>` covers it). With `onChange` the steps are `<button>`s
 *     and the current one carries `aria-current="step"`.
 */
export const Stepper = forwardRef<HTMLDivElement, StepperProps>(function Stepper(
  {
    current,
    currentIndex,
    total,
    steps,
    onChange,
    variant = 'numbered',
    showCounter = false,
    className,
    ...props
  },
  ref,
) {
  const stepList: StepItem[] = steps
    ? steps
    : Array.from({ length: total ?? 3 }, (_, i) => ({
        title: `Step ${i + 1}`,
      }));

  // `current` is 1-based and wins over the 0-based `currentIndex`.
  const resolvedCurrent = current ?? (currentIndex != null ? currentIndex + 1 : 1);
  const counterValue = Math.min(Math.max(resolvedCurrent, 1), stepList.length || 1);
  const currentStep = stepList[counterValue - 1];
  const interactive = Boolean(onChange);

  return (
    <div
      ref={ref}
      role="navigation"
      aria-label="Progress steps"
      className={cn('p-stepper-root', className)}
      {...props}
    >
      {showCounter ? (
        <div className="p-stepper-counter">
          <span className="p-stepper-counter-label">{currentStep?.title}</span>
          <span className="p-stepper-counter-value">
            {counterValue}/{stepList.length}
          </span>
        </div>
      ) : null}

      <div
        className={cn('p-stepper', variant === 'numbered' && 'p-stepper--labelled')}
        aria-hidden={interactive ? undefined : true}
      >
        {stepList.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === resolvedCurrent;
          const isDone = stepNum < resolvedCurrent;
          const state = isDone ? 'done' : isActive ? 'current' : 'pending';
          // `p-stepper-step` / `active` are the pre-fix names, kept so callers
          // that targeted them keep working.
          const stepClass = cn('p-step', 'p-stepper-step', state, isActive && 'active');
          const key = step.id ?? idx;

          const body =
            variant === 'bars' ? (
              // A 6px bar has no visible label, so an interactive one needs a
              // hidden accessible name.
              interactive ? <span className="sr-only">{step.title}</span> : null
            ) : (
              <>
                <span className="p-step-index t-mono" aria-hidden="true">
                  {isDone ? '✓' : String(stepNum).padStart(2, '0')}
                </span>
                <span className="p-step-text">
                  <span className="p-step-title">{step.title}</span>
                  {step.description != null ? (
                    <span className="p-step-desc">{step.description}</span>
                  ) : null}
                </span>
              </>
            );

          if (interactive) {
            return (
              <button
                key={key}
                type="button"
                className={stepClass}
                aria-current={isActive ? 'step' : undefined}
                onClick={() => onChange?.(stepNum)}
              >
                {body}
              </button>
            );
          }

          return (
            <span key={key} className={stepClass}>
              {body}
            </span>
          );
        })}
      </div>

      <ol className="sr-only">
        {stepList.map((step, idx) => (
          <li key={step.id ?? idx}>
            {step.title}
            {idx + 1 === resolvedCurrent
              ? ' current'
              : idx + 1 < resolvedCurrent
                ? ' complete'
                : ' pending'}
          </li>
        ))}
      </ol>
    </div>
  );
});

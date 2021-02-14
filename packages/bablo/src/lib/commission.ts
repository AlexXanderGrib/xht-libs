import { sum } from '@xxhax/safe-math';

type CommissionConstraintDTO = {
  min: number;
  max: number;
  percent: number;
  fixed: number;
};

type CommissionConstraint =
  | Partial<CommissionConstraintDTO>
  | (() => Partial<CommissionConstraintDTO>);

const useValue = <T>(
  factory: T
): T extends (...args: unknown[]) => unknown ? ReturnType<T> : T =>
  typeof factory === 'function' ? factory() : factory;

const defaults: CommissionConstraintDTO = {
  fixed: 0,
  max: Infinity,
  min: -Infinity,
  percent: 0,
};

export function createCommissionCalculator(
  ...conditions: CommissionConstraint[]
) {
  const resolvedConditions = conditions.map((condition) => ({
    ...defaults,
    ...useValue(condition),
  }));

  return (amount: number) => {
    const combinedCondition = resolvedConditions
      .filter((x) => amount >= x.min && amount <= x.max)
      .reduce((a, b) => ({
        ...defaults,
        fixed: sum(a.fixed ?? 0, b.fixed ?? 0),
        percent: sum(a.percent ?? 0, b.percent ?? 0),
      }));

    const percent = amount * 0.01 * (combinedCondition.percent ?? 0);

    return sum(percent, combinedCondition.fixed ?? 0);
  };
}

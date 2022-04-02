// Validation
export type Validatable = {
  value: string | number;
  required?: boolean; // required: boolean | undefined と同義
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
};

export function validate(validatableInput: Validatable): boolean {
  let isValid = true;

  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    /**
     * if (validatavleInput) としてしまうと、minLength = 0 を設定している場合、
     * falsy 判定になり、条件に反するということになる。
     *
     * そこで、minLength != null とする事で、null と undefined 以外は条件を通る
     * という書き方をするのがベター
     * （ minLength !== undefined とすると、undefined 以外という判定になる
     * 安全性を高めるといった観点では、 minLength != null の方が良い）
     *
     * また、そもそも minLength = 0 は、required のチェックとほぼ同じなので、
     * チェックする必要があるのかという議論の余地がある。。
     */
    validatableInput.minLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }

  return isValid;
}

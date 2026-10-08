import { useLayoutEffect, useRef, useState, type TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string;
  errorMessage?: string;
  submitted?: boolean;
};

export function MethodTextField({ errorMessage, submitted, onBlur, ...props }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [touched, setTouched] = useState(false);
  const invalid = Boolean(props.required && !props.value.trim() && (touched || submitted));
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    function resize() {
      if (!element) return;
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight + 2}px`;
    }
    resize();
    // 只观察宽度变化，避免自身高度更新触发循环。
    let width = element.clientWidth;
    const widthObserver = new ResizeObserver(() => {
      if (element.clientWidth !== width) { width = element.clientWidth; resize(); }
    });
    widthObserver.observe(element);
    return () => widthObserver.disconnect();
  }, [props.value]);

  return <div className="method-text-field" data-invalid={invalid || undefined}>
    <textarea {...props} ref={ref} rows={props.rows ?? 2} aria-invalid={invalid}
      aria-describedby={invalid ? `${props.id}-error` : props['aria-describedby']}
      onBlur={(event) => { setTouched(true); onBlur?.(event); }} />
    {invalid && <p className="field-error" id={`${props.id}-error`} role="alert">{errorMessage || '请填写此项。'}</p>}
  </div>;
}

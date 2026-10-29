"use client";

/** Нативная кнопка «Войти с Яндекс ID»: оранжевый скругленный квадрат + буква Я. */
export function YandexButton({
  disabled, onClick, label = "Войти с Яндекс ID",
}: { disabled?: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="btn w-full border-base-300 bg-base-100 text-base-content hover:bg-base-200 hover:border-base-300 font-medium"
    >
      <YandexLogo />
      <span>{label}</span>
    </button>
  );
}

export function YandexLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <rect width="24" height="24" rx="5.5" fill="#FC3F1D" />
      <path
        d="M13.6 18.6V9.9c0-1.4.1-2.2.1-2.2h-.06c-.6 1.1-1.3 2-2.3 2.9l-1.6 1.3-.8-1 3.5-3h1.8v10.7h-.64Z"
        fill="#fff"
        transform="translate(1.2 0)"
      />
      <path d="M5.6 7.4h3.9V17H11V7.4h3.9V6H5.6v1.4Z" fill="#fff" opacity="0" />
    </svg>
  );
}

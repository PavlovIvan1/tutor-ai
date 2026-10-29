"use client";

/**
 * Нативная кнопка «Войти с Яндекс ID».
 * Иконка — официальный знак «Я» из логотипа Яндекса (path из Wikimedia,
 * Yandex_logo_2021_Russian.svg), на фирменной красной плашке #FC3F1D.
 */
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

/** Плашка с официальным белым знаком «Я» (характерные для Яндекс ID кнопки). */
export function YandexLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <rect width="24" height="24" rx="5" fill="#FC3F1D" />
      {/* Знак «Я»: bbox 61×91 → 8.98×13.5px, центр плашки (24×24) */}
      <g transform="translate(7.51 5.25) scale(0.1484)" fill="#FFFFFF">
        <path d="M60.5,91H44.6V12.3h-7.1c-13,0-19.8,6.5-19.8,16.2c0,11,4.7,16.1,14.4,22.6l8,5.4L17.1,91H0
          l20.7-30.8C8.8,51.7,2.1,43.4,2.1,29.4C2.1,11.9,14.3,0,37.4,0h23V91z" />
      </g>
    </svg>
  );
}

"use client";

import { Checkbox } from "@/components/ui/controls";

interface ConsentsProps {
  required: [boolean, (v: boolean) => void]; // условия + приватность (блокирует кнопку)
  mailing: [boolean, (v: boolean) => void];  // новостная рассылка
}

/** Чекбоксы согласий при регистрации: обязательно и рассылка. */
export function Consents({ required, mailing }: ConsentsProps) {
  const [ok, setOk] = required;
  const [sub, setSub] = mailing;

  return (
    <div className="grid gap-2 text-xs">
      <label className="flex cursor-pointer items-start gap-2">
        <span className="pt-0.5"><Checkbox checked={ok} onCheckedChange={setOk} /></span>
        <span className="text-base-content/60">
          Принимаю <a href="/legal" className="link link-hover text-primary">условия сервиса</a> и{" "}
          <a href="/legal" className="link link-hover text-primary">политику конфиденциальности</a> (обязательно)
        </span>
      </label>
      <label className="flex cursor-pointer items-start gap-2">
        <span className="pt-0.5"><Checkbox checked={sub} onCheckedChange={setSub} /></span>
        <span className="text-base-content/60">Хочу получать новости о новых функциях и методических материалах</span>
      </label>
    </div>
  );
}

import brasao from "@/assets/brasao.png";
import { COR } from "@/lib/tesouro";

export function ShieldMark({ size = 56 }: { size?: number }) {
  return (
    <img
      src={brasao}
      alt="Brasão da Congregação Mariana Nossa Senhora de Fátima e São Francisco de Assis"
      style={{ width: size, height: "auto", display: "block" }}
    />
  );
}

/* Pequeno selo decorativo usado como assinatura visual (conta de terço) */
export function DecadaDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 my-1 select-none w-full" aria-hidden="true">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${COR.gold}66)` }} />
      <span
        className="text-[10px] tracking-widest uppercase px-2"
        style={{ color: COR.gold, fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${COR.gold}66)` }} />
    </div>
  );
}

export function CelulaCheck({ marcado, onToggle }: { marcado: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={marcado}
      className="w-8 h-8 rounded-md border flex items-center justify-center transition active:scale-95"
      style={{
        background: marcado ? COR.gold : COR.ivory,
        borderColor: marcado ? COR.gold : `${COR.navy}33`,
      }}
    >
      {marcado ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M4 12.5L9.5 18L20 6" stroke={COR.navyDeep} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </button>
  );
}

export function CelulaNumero({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onChange(Math.max(0, Number(valor || 0) - 1))}
        className="w-6 h-8 rounded-md border text-sm flex items-center justify-center"
        style={{ borderColor: `${COR.navy}33`, background: COR.ivory, color: COR.navyDeep }}
        aria-label="Diminuir"
      >
        −
      </button>
      <span className="w-5 text-center text-sm font-medium" style={{ color: COR.navyDeep }}>
        {valor || 0}
      </span>
      <button
        onClick={() => onChange(Number(valor || 0) + 1)}
        className="w-6 h-8 rounded-md border text-sm flex items-center justify-center"
        style={{ borderColor: `${COR.navy}33`, background: COR.ivory, color: COR.navyDeep }}
        aria-label="Aumentar"
      >
        +
      </button>
    </div>
  );
}

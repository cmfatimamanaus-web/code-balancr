import { COR } from "@/lib/tesouro";
import { ShieldMark, DecadaDivider } from "./Shared";

export function Home({
  onEntrarMembro,
  onEntrarModerador,
}: {
  onEntrarMembro: () => void;
  onEntrarModerador: () => void;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{
        background: `radial-gradient(circle at 50% -10%, ${COR.navy} 0%, ${COR.navyDeep} 55%, #0B1830 100%)`,
      }}
    >
      <div className="flex flex-col items-center text-center max-w-sm w-full">
        <div
          className="rounded-full p-4 mb-6"
          style={{ background: COR.ivory, boxShadow: `0 0 0 3px ${COR.gold}55, 0 12px 40px rgba(0,0,0,0.45)` }}
        >
          <ShieldMark size={92} />
        </div>
        <h1
          className="text-3xl leading-tight"
          style={{ color: COR.ivory, fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "0.01em" }}
        >
          Tesouro Espiritual
        </h1>
        <p className="mt-2 text-sm" style={{ color: COR.goldSoft }}>
          Congregação Mariana Nossa Senhora de Fátima e São Francisco de Assis
        </p>

        <DecadaDivider label="Entrar" />

        <div className="w-full flex flex-col gap-3 mt-4">
          <button
            onClick={onEntrarMembro}
            className="w-full py-3.5 rounded-lg font-medium text-base transition active:scale-[0.98]"
            style={{ background: COR.gold, color: COR.navyDeep }}
          >
            Sou membro — registrar minhas devoções
          </button>
          <button
            onClick={onEntrarModerador}
            className="w-full py-3.5 rounded-lg font-medium text-base border transition active:scale-[0.98]"
            style={{ borderColor: `${COR.gold}88`, color: COR.ivory, background: "transparent" }}
          >
            Sou responsável — ver consolidado
          </button>
        </div>

        <p className="mt-8 text-xs leading-relaxed" style={{ color: `${COR.ivory}99` }}>
          O registro é anônimo: você é identificado apenas pelo seu número, nunca por nome.
        </p>
      </div>
    </div>
  );
}

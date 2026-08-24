import { useCallback, useEffect, useMemo, useState } from "react";
import {
  COLUMNS,
  COR,
  MESES,
  calcularTotais,
  listarRegistrosDoMes,
  type Dias,
} from "@/lib/tesouro";
import { ShieldMark } from "./Shared";
import { GraficosModerador } from "./GraficosModerador";

export function PainelModerador({ onSair }: { onSair: () => void }) {
  const hoje = new Date();
  const [mesIndex, setMesIndex] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [aba, setAba] = useState<"tabela" | "graficos">("tabela");
  const [carregando, setCarregando] = useState(true);
  const [registros, setRegistros] = useState<{ numero: string; dias: Dias }[]>([]);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      setRegistros(await listarRegistrosDoMes(mesIndex, ano));
    } catch {
      setErro("Não foi possível carregar os dados agora.");
    } finally {
      setCarregando(false);
    }
  }, [mesIndex, ano]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const totalPorMembro = useMemo(
    () => registros.map((r) => ({ numero: r.numero, totais: calcularTotais(r.dias) })),
    [registros],
  );

  const totalGeral = useMemo(() => {
    const t: Record<string, number> = {};
    COLUMNS.forEach((c) => (t[c.id] = 0));
    totalPorMembro.forEach((m) => {
      COLUMNS.forEach((c) => (t[c.id] = (t[c.id] ?? 0) + (m.totais[c.id] || 0)));
    });
    return t;
  }, [totalPorMembro]);

  return (
    <div className="min-h-screen pb-16" style={{ background: COR.cream }}>
      <div className="px-4 pt-5 pb-4" style={{ background: COR.navyDeep }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldMark size={34} />
            <span style={{ color: COR.ivory, fontFamily: "Georgia, serif" }}>Consolidado</span>
          </div>
          <button onClick={onSair} className="text-sm" style={{ color: COR.goldSoft }}>Sair</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={mesIndex}
            onChange={(e) => setMesIndex(Number(e.target.value))}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: COR.ivory, color: COR.ink }}
          >
            {MESES.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value) || hoje.getFullYear())}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: COR.ivory, color: COR.ink }}
          />
        </div>
      </div>

      <div className="px-4 pt-4">
        {carregando ? (
          <p className="text-sm" style={{ color: COR.navyDeep }}>Carregando registros…</p>
        ) : erro ? (
          <p className="text-sm" style={{ color: "#8A1F1F" }}>{erro}</p>
        ) : registros.length === 0 ? (
          <p className="text-sm" style={{ color: `${COR.navyDeep}99` }}>
            Nenhum membro registrou o tesouro espiritual em {MESES[mesIndex]}/{ano} ainda.
          </p>
        ) : (
          <>
            <p className="text-xs mb-3" style={{ color: `${COR.navyDeep}99` }}>
              {registros.length} {registros.length === 1 ? "membro registrado" : "membros registrados"} — identificados apenas por número.
            </p>
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: `${COR.navy}22` }}>
              <table className="border-collapse" style={{ minWidth: 780 }}>
                <thead>
                  <tr>
                    <th
                      className="sticky left-0 z-10 px-2 py-2 text-xs font-medium text-left"
                      style={{ background: COR.navy, color: COR.ivory, minWidth: 60 }}
                    >
                      Nº
                    </th>
                    {COLUMNS.map((c) => (
                      <th
                        key={c.id}
                        title={c.full}
                        className="px-2 py-2 text-[11px] font-medium text-center whitespace-nowrap"
                        style={{ background: COR.navy, color: COR.ivory, minWidth: 58 }}
                      >
                        {c.short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {totalPorMembro.map((m, idx) => (
                    <tr key={m.numero} style={{ background: idx % 2 === 0 ? COR.ivory : COR.cream }}>
                      <td
                        className="sticky left-0 z-10 px-2 py-1.5 text-sm font-medium"
                        style={{ background: idx % 2 === 0 ? COR.ivory : COR.cream, color: COR.navyDeep }}
                      >
                        {m.numero}
                      </td>
                      {COLUMNS.map((c) => (
                        <td key={c.id} className="px-2 py-1.5 text-center text-sm" style={{ color: COR.navyDeep }}>
                          {m.totais[c.id]}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td
                      className="sticky left-0 z-10 px-2 py-2 text-sm font-semibold"
                      style={{ background: COR.goldSoft, color: COR.navyDeep }}
                    >
                      Geral
                    </td>
                    {COLUMNS.map((c) => (
                      <td
                        key={c.id}
                        className="px-2 py-2 text-center text-sm font-semibold"
                        style={{ background: COR.goldSoft, color: COR.navyDeep }}
                      >
                        {totalGeral[c.id]}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
        <button
          onClick={carregar}
          className="mt-4 text-sm px-4 py-2 rounded-lg border"
          style={{ borderColor: `${COR.navy}33`, color: COR.navyDeep }}
        >
          Atualizar
        </button>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  COLUMNS,
  COR,
  MESES,
  contarDiasCumpridos,
  diasNoMes,
  listarRegistrosDoAno,
  percentuaisDoMes,
  type Dias,
} from "@/lib/tesouro";

type RegistroAno = { numero: string; mesIndex: number; dias: Dias };

export function GraficosModerador({
  registrosMes,
  mesIndex,
  ano,
}: {
  registrosMes: { numero: string; dias: Dias }[];
  mesIndex: number;
  ano: number;
}) {
  const [ anoDados, setAnoDados ] = useState<RegistroAno[]>([]);
  const [carregandoAno, setCarregandoAno] = useState(true);
  const [erroAno, setErroAno] = useState("");

  useEffect(() => {
    let ativo = true;
    setCarregandoAno(true);
    setErroAno("");
    listarRegistrosDoAno(ano)
      .then((d) => ativo && setAnoDados(d))
      .catch(() => ativo && setErroAno("Não foi possível carregar o ano."))
      .finally(() => ativo && setCarregandoAno(false));
    return () => {
      ativo = false;
    };
  }, [ano]);

  const dadosMes = useMemo(
    () => percentuaisDoMes(registrosMes, mesIndex, ano),
    [registrosMes, mesIndex, ano],
  );

  const mediaMes = useMemo(
    () =>
      dadosMes.length
        ? Math.round((dadosMes.reduce((s, d) => s + d.percentual, 0) / dadosMes.length) * 10) / 10
        : 0,
    [dadosMes],
  );

  const dadosAno = useMemo(() => {
    return MESES.map((nome, i) => {
      const regs = anoDados.filter((r) => r.mesIndex === i);
      const base = regs.length * diasNoMes(i, ano) * COLUMNS.length;
      let cumpridos = 0;
      regs.forEach((r) => {
        const c = contarDiasCumpridos(r.dias);
        COLUMNS.forEach((col) => (cumpridos += c[col.id] || 0));
      });
      return {
        mes: nome.slice(0, 3),
        membros: regs.length,
        percentual: base > 0 ? Math.round((cumpridos / base) * 1000) / 10 : 0,
      };
    });
  }, [anoDados, ano]);

  const cor = (p: number) => (p >= 70 ? COR.gold : p >= 40 ? COR.goldSoft : `${COR.navy}66`);

  return (
    <div className="space-y-6">
      <section
        className="rounded-lg border p-3"
        style={{ borderColor: `${COR.navy}22`, background: COR.ivory }}
      >
        <h2
          className="text-sm mb-1"
          style={{ color: COR.navyDeep, fontFamily: "Georgia, serif" }}
        >
          Adesão por devoção — {MESES[mesIndex]}/{ano}
        </h2>
        <p className="text-xs mb-3" style={{ color: `${COR.navyDeep}99` }}>
          Percentual dos dias possíveis cumpridos ({registrosMes.length}{" "}
          {registrosMes.length === 1 ? "membro" : "membros"}) — média geral {mediaMes}%.
        </p>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={dadosMes} margin={{ top: 4, right: 8, bottom: 40, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${COR.navy}1A`} vertical={false} />
              <XAxis
                dataKey="nome"
                interval={0}
                angle={-45}
                textAnchor="end"
                tick={{ fontSize: 10, fill: COR.navyDeep }}
                height={50}
              />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10, fill: COR.navyDeep }} />
              <Tooltip
                formatter={(v: number) => [`${v}%`, "Adesão"]}
                labelFormatter={(l: string) =>
                  dadosMes.find((d) => d.nome === l)?.completo ?? l
                }
                contentStyle={{ background: COR.ivory, border: `1px solid ${COR.navy}33`, borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="percentual" radius={[4, 4, 0, 0]}>
                {dadosMes.map((d) => (
                  <Cell key={d.id} fill={cor(d.percentual)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section
        className="rounded-lg border p-3"
        style={{ borderColor: `${COR.navy}22`, background: COR.ivory }}
      >
        <h2
          className="text-sm mb-1"
          style={{ color: COR.navyDeep, fontFamily: "Georgia, serif" }}
        >
          Comparação do ano de {ano}
        </h2>
        <p className="text-xs mb-3" style={{ color: `${COR.navyDeep}99` }}>
          Adesão geral de cada mês e número de membros que registraram.
        </p>
        {carregandoAno ? (
          <p className="text-sm" style={{ color: COR.navyDeep }}>Carregando o ano…</p>
        ) : erroAno ? (
          <p className="text-sm" style={{ color: "#8A1F1F" }}>{erroAno}</p>
        ) : (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={dadosAno} margin={{ top: 4, right: 8, bottom: 4, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${COR.navy}1A`} vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: COR.navyDeep }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10, fill: COR.navyDeep }} />
                <Tooltip
                  formatter={(v: number, n: string) =>
                    n === "percentual" ? [`${v}%`, "Adesão"] : [v, "Membros"]
                  }
                  contentStyle={{ background: COR.ivory, border: `1px solid ${COR.navy}33`, borderRadius: 8, fontSize: 12 }}
                />
                <Legend
                  formatter={(v) => (v === "percentual" ? "Adesão (%)" : "Membros")}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey="percentual"
                  stroke={COR.gold}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: COR.gold }}
                />
                <Line
                  type="monotone"
                  dataKey="membros"
                  stroke={COR.navy}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}

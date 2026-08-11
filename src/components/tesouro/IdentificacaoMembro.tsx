import { useState } from "react";
import { COR, MESES } from "@/lib/tesouro";
import { ShieldMark } from "./Shared";

export function IdentificacaoMembro({
  onConfirmar,
  onVoltar,
  carregando,
}: {
  onConfirmar: (numero: string, mesIndex: number, ano: number) => void;
  onVoltar: () => void;
  carregando: boolean;
}) {
  const [numero, setNumero] = useState("");
  const hoje = new Date();
  const [mesIndex, setMesIndex] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());

  const podeConfirmar = numero.trim().length > 0;

  return (
    <div className="min-h-screen px-5 py-8" style={{ background: COR.cream }}>
      <div className="max-w-sm mx-auto">
        <button onClick={onVoltar} className="text-sm mb-6" style={{ color: COR.navy }}>
          ← Voltar
        </button>
        <div className="flex items-center gap-3 mb-6">
          <ShieldMark size={44} />
          <div>
            <h2 className="text-lg leading-tight" style={{ color: COR.navyDeep, fontFamily: "Georgia, serif" }}>
              Identificação
            </h2>
            <p className="text-xs" style={{ color: `${COR.navyDeep}99` }}>Somente o seu número, sem nome</p>
          </div>
        </div>

        <label className="block text-sm mb-1.5" style={{ color: COR.navyDeep }}>
          Seu número de identificação
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={numero}
          onChange={(e) => setNumero(e.target.value.replace(/[^0-9A-Za-z-]/g, ""))}
          placeholder="ex.: 07"
          className="w-full px-4 py-3 rounded-lg border text-base mb-5 outline-none"
          style={{ borderColor: `${COR.navy}33`, background: COR.ivory, color: COR.ink }}
        />

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: COR.navyDeep }}>Mês</label>
            <select
              value={mesIndex}
              onChange={(e) => setMesIndex(Number(e.target.value))}
              className="w-full px-3 py-3 rounded-lg border text-base outline-none"
              style={{ borderColor: `${COR.navy}33`, background: COR.ivory, color: COR.ink }}
            >
              {MESES.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: COR.navyDeep }}>Ano</label>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value) || hoje.getFullYear())}
              className="w-full px-3 py-3 rounded-lg border text-base outline-none"
              style={{ borderColor: `${COR.navy}33`, background: COR.ivory, color: COR.ink }}
            />
          </div>
        </div>

        <button
          disabled={!podeConfirmar || carregando}
          onClick={() => onConfirmar(numero.trim(), mesIndex, ano)}
          className="w-full py-3.5 rounded-lg font-medium text-base transition active:scale-[0.98] disabled:opacity-50"
          style={{ background: COR.navy, color: COR.ivory }}
        >
          {carregando ? "Abrindo..." : "Abrir meu registro"}
        </button>
      </div>
    </div>
  );
}

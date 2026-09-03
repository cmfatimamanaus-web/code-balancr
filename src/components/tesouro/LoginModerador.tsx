import { useState } from "react";
import { COR } from "@/lib/tesouro";
import { ShieldMark } from "./Shared";

export function LoginModerador({
  onEntrar,
  onVoltar,
  erro,
}: {
  onEntrar: (senha: string) => void;
  onVoltar: () => void;
  erro: string;
}) {
    const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: COR.navyDeep }}>
      <div className="max-w-xs w-full">
        <button onClick={onVoltar} className="text-sm mb-6" style={{ color: COR.goldSoft }}>← Voltar</button>
        <div className="flex flex-col items-center text-center mb-6">
          <ShieldMark size={56} />
          <h2 className="mt-3 text-lg" style={{ color: COR.ivory, fontFamily: "Georgia, serif" }}>
            Acesso do responsável
          </h2>
        </div>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onEntrar(senha)}
          placeholder="Senha"
          className="w-full px-4 py-3 rounded-lg border text-base mb-3 outline-none"
          style={{ background: COR.ivory, borderColor: `${COR.gold}55`, color: COR.ink }}
        />
        {erro && <p className="text-sm mb-3" style={{ color: "#F3A6A6" }}>{erro}</p>}
        <button
          onClick={() => onEntrar(senha)}
          className="w-full py-3.5 rounded-lg font-medium text-base"
          style={{ background: COR.gold, color: COR.navyDeep }}
        >
          Entrar
        </button>
      </div>
    </div>
  );
}

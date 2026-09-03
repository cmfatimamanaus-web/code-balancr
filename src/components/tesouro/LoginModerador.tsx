import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
                <div className="relative mb-3">
          <input
            type={mostrarSenha ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onEntrar(senha)}
            placeholder="Senha"
            className="w-full px-4 py-3 pr-12 rounded-lg border text-base outline-none"
            style={{ background: COR.ivory, borderColor: `${COR.gold}55`, color: COR.ink }}
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((visivel) => !visivel)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            style={{ color: COR.navyDeep }}
          >
            {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
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

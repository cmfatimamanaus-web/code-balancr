import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import {
  MODERADOR_SENHA_PADRAO,
  carregarRegistro,
  entradaVazia,
  salvarRegistro,
  type Dias,
} from "@/lib/tesouro";
import { Home } from "@/components/tesouro/Home";
import { IdentificacaoMembro } from "@/components/tesouro/IdentificacaoMembro";
import { GradeRegistro } from "@/components/tesouro/GradeRegistro";
import { LoginModerador } from "@/components/tesouro/LoginModerador";
import { PainelModerador } from "@/components/tesouro/PainelModerador";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tesouro Espiritual — Congregação Mariana" },
      {
        name: "description",
        content:
          "Registro anônimo das devoções diárias dos membros da Congregação Mariana, com consolidado mensal para o responsável.",
      },
      { property: "og:title", content: "Tesouro Espiritual — Congregação Mariana" },
      {
        property: "og:description",
        content:
          "Marque suas devoções diárias pelo seu número e acompanhe o total do mês. Consolidado mensal para o responsável.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TesouroEspiritualApp,
});

function TesouroEspiritualApp() {
  const [tela, setTela] = useState<"home" | "identificacao" | "grade" | "login-mod" | "painel-mod">("home");
  const [numero, setNumero] = useState<string>("");
  const [mesIndex, setMesIndex] = useState(0);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [dias, setDias] = useState<Dias | null>(null);
  const [carregandoAbertura, setCarregandoAbertura] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroGrade, setErroGrade] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const abrirRegistro = async (num: string, mIdx: number, a: number) => {
    setCarregandoAbertura(true);
    setErroGrade("");
    try {
      const carregados = await carregarRegistro(num, mIdx, a);
      setNumero(num);
      setMesIndex(mIdx);
      setAno(a);
      setDias(carregados || entradaVazia(mIdx, a));
      setTela("grade");
    } catch {
      setErroGrade("Não foi possível abrir seu registro agora. Tente novamente.");
    } finally {
      setCarregandoAbertura(false);
    }
  };

  const salvar = useCallback(
    (novosDias: Dias) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      setSalvando(true);
      saveTimeout.current = setTimeout(async () => {
        try {
          await salvarRegistro(numero, mesIndex, ano, novosDias);
          setErroGrade("");
        } catch {
          setErroGrade(
            "Não foi possível salvar agora. Suas marcações mais recentes podem não ter sido gravadas — tente novamente em instantes.",
          );
        } finally {
          setSalvando(false);
        }
      }, 400);
    },
    [numero, mesIndex, ano],
  );

  const mudarDia = (dia: number, colId: string, valor: number) => {
    setDias((prev) => {
      if (!prev) return prev;
      const novo: Dias = {
        ...prev,
        [String(dia)]: { ...(prev[String(dia)] || {}), [colId]: valor },
      };
      salvar(novo);
      return novo;
    });
  };

  if (tela === "identificacao") {
    return (
      <IdentificacaoMembro
        carregando={carregandoAbertura}
        onVoltar={() => setTela("home")}
        onConfirmar={abrirRegistro}
      />
    );
  }

  if (tela === "grade" && dias) {
    return (
      <GradeRegistro
        numero={numero}
        mesIndex={mesIndex}
        ano={ano}
        dias={dias}
        onMudarDia={mudarDia}
        onVoltar={() => setTela("identificacao")}
        salvando={salvando}
        erro={erroGrade}
      />
    );
  }

  if (tela === "login-mod") {
    return (
      <LoginModerador
        erro={erroLogin}
        onVoltar={() => {
          setErroLogin("");
          setTela("home");
        }}
        onEntrar={(senha) => {
          if (senha === MODERADOR_SENHA_PADRAO) {
            setErroLogin("");
            setTela("painel-mod");
          } else {
            setErroLogin("Senha incorreta.");
          }
        }}
      />
    );
  }

  if (tela === "painel-mod") {
    return <PainelModerador onSair={() => setTela("home")} />;
  }

  return (
    <Home
      onEntrarMembro={() => setTela("identificacao")}
      onEntrarModerador={() => setTela("login-mod")}
    />
  );
}

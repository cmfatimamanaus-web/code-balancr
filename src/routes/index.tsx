import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MODERADOR_SENHA_PADRAO,
  carregarRegistro,
  entradaVazia,
  sairDaConta,
  salvarRegistro,
  usuarioAtual,
  type Dias,
} from "@/lib/tesouro";
import { Home } from "@/components/tesouro/Home";
import { AutenticacaoMembro } from "@/components/tesouro/AutenticacaoMembro";
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
          "Registro pessoal das devoções diárias dos membros da Congregação Mariana, com consolidado mensal para o responsável.",
      },
      { property: "og:title", content: "Tesouro Espiritual — Congregação Mariana" },
      {
        property: "og:description",
        content:
          "Entre com o seu número e senha, marque suas devoções diárias e acompanhe o total do mês.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TesouroEspiritualApp,
});

type Tela = "home" | "auth" | "identificacao" | "grade" | "login-mod" | "painel-mod";

function TesouroEspiritualApp() {
  const [tela, setTela] = useState<Tela>("home");
  const [numero, setNumero] = useState<string>("");
  const [mesIndex, setMesIndex] = useState(0);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [dias, setDias] = useState<Dias | null>(null);
  const [carregandoAbertura, setCarregandoAbertura] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroGrade, setErroGrade] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [senhaMod, setSenhaMod] = useState("");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    usuarioAtual().then((u) => u && setNumero(u.numero));
  }, []);

  const entrarNoApp = async () => {
    const u = await usuarioAtual();
    if (u) {
      setNumero(u.numero);
      setTela("identificacao");
    }
  };

  const abrirRegistro = async (mIdx: number, a: number) => {
    setCarregandoAbertura(true);
    setErroGrade("");
    try {
      const carregados = await carregarRegistro(mIdx, a);
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

  const sair = async () => {
    await sairDaConta();
    setNumero("");
    setDias(null);
    setTela("home");
  };

  if (tela === "auth") {
    return <AutenticacaoMembro onEntrou={entrarNoApp} onVoltar={() => setTela("home")} />;
  }

  if (tela === "identificacao") {
    return (
      <IdentificacaoMembro
        numero={numero}
        carregando={carregandoAbertura}
        onVoltar={sair}
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
          if (senha.trim().length === 0) {
            setErroLogin("Informe a senha.");
            return;
          }
          setErroLogin("");
          setSenhaMod(senha);
          setTela("painel-mod");
        }}
      />
    );
  }

  if (tela === "painel-mod") {
    return <PainelModerador senha={senhaMod || MODERADOR_SENHA_PADRAO} onSair={() => setTela("home")} />;
  }

  return (
    <Home
      onEntrarMembro={async () => {
        const u = await usuarioAtual();
        setTela(u ? "identificacao" : "auth");
        if (u) setNumero(u.numero);
      }}
      onEntrarModerador={() => setTela("login-mod")}
    />
  );
}

// SOMENTE servidor: lê cabeçalhos da requisição para descobrir origem/rpID.
import { getRequestHeader } from "@tanstack/start-server-core";

export function origemEId() {
  const referer = getRequestHeader("referer");
  const origin =
    getRequestHeader("origin") ??
    (referer ? new URL(referer).origin : "http://localhost:8080");
  const rpID = new URL(origin).hostname;
  return { origin, rpID };
}

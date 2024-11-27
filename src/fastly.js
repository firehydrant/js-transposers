const md5 = require('md5');

////////////////////
// COPY FROM HERE //

/**
 * Transpose a payload from a Fastly webhook into a signal. See:
 * https://docs.fastly.com/en/guides/managing-alert-integrations
 */
function transpose(input) {
  const payload = input.data;
  const signal = {
    summary: payload?.title || "Alert from Fastly Observability",
    body: payload?.description || "No body provided",
    level: 2,
    links: [
      { href: payload.definition_api, text: "Definition API" },
      { href: payload.definition_ui, text: "Definition UI" },
      { href: payload.history_api, text: "History API" },
      { href: payload.history_ui, text: "History UI" }
    ],
    idempotency_key: md5(payload.title),
    status: payload?.title.includes("FIRING") ? "OPEN" : payload?.title.includes("RESOLVED") ? "CLOSED" : "UNKNOWN"
  };
  return signal;
}
// COPY TO HERE //
//////////////////
module.exports = {
  transpose
}

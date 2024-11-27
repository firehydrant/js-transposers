////////////////////
// COPY FROM HERE //
/**
 * Map conviva levels to FH equivalents
 */
const levels = {
  info: 'INFO',
  warning: 'WARN',
  critical: 'ERROR' 
};

/**
 * Transpose a payload from Conviva into a signal. See:
 * https://docs.conviva.com/learning-center-files/content/ei_application/basics/settings/setting-webhook-notifications_1474897.html
 *
 */
function transpose(input) {
  const payload = input.data;
  let annotations = {
    "conviva.com/account_name": payload?.account_name,
    "conviva.com/active_plays": payload['active plays'] && `${payload['active plays']}` || "",
    "conviva.com/alert_source": payload?.alert_source,
    "conviva.com/alert_time": payload?.alert_time,
    "conviva.com/attempts": payload?.attempts && `${payload.attempts}` || "",
    "conviva.com/cumulative_impacted_unique_devices": `${payload?.cumulative_impacted_unique_devices}`,
    "conviva.com/event_id": `${payload?.event_id}`,
    "conviva.com/metric_name": payload?.metric_name,
    "conviva.com/plays": payload?.plays && `${payload.plays}` || "",
    "conviva.com/root_cause": payload?.root_cause,
    "conviva.com/severity": payload?.severity,
    "conviva.com/source": payload?.source,
    "conviva.com/value": payload?.value && `${payload.value}` || "",
    "conviva.com/version": payload?.version
  };

  payload?.custom_fields && Object.entries(payload.custom_fields).map((field) => {
    annotations[`conviva.com/custom_fields/${field[0]}`] = field[1];
  });

  const signal = {
    idempotency_key: `${payload?.event_id}`,
    summary: `[${payload?.severity.toUpperCase()}] ${payload?.metric_name} on ${payload?.root_cause}`,
    body: `A ${payload?.severity}-level alert has been triggered on ${payload?.source}: ${payload?.metric_name} on ${payload?.root_cause}.\n- Alert Source: ${payload.alert_source}\n- Account Name: ${payload?.account_name}\n- Impacted Unique Devices: ${payload?.cumulative_impacted_unique_devices}\n- Metric: ${payload?.metric_name}\n- Severity: ${payload?.severity}\n- Root Cause: ${payload?.root_cause}\n\n[View Diagnostic Report](${payload?.diagnostic_report_url})`,
    level: levels[payload?.severity],
    links: [
      {
        "href": payload?.diagnostic_report_url,
        "text": "Diagnostic Report URL"
      }
    ],
    status: "OPEN",
    annotations: annotations
  };
  return signal;
}
// COPY TO HERE //
//////////////////
module.exports = {
  transpose
}

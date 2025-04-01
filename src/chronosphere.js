////////////////////
// COPY FROM HERE //
/*
 * Transpose Chronosphere payload into a Signal
 */
function transpose(input) {
  const payload = input.data;

  let annotations = {
    'chronosphere/notifier': payload?.notifier || '',
    'chronosphere/status': payload?.status
  };

  // Append all the group labels, common labels, and common annotations
  for (const [key, value] of Object.entries(payload?.groupLabels)) {
    annotations[`chronosphere/grouplabel-${key}`] = value;
  }
  for (const [key, value] of Object.entries(payload?.commonLabels)) {
    annotations[`chronosphere/commonlabel-${key}`] = value;
  }
  for (const [key, value] of Object.entries(payload?.commonAnnotations)) {
    annotations[`chronosphere/annotation-${key}`] = value;
  }

  let signal = {
    idempotency_key: payload?.alerts[0]?.fingerprint,
    summary: payload?.commonLabels?.alertname || "No alert name provided",
    body: `Alert from Chronosphere via ${payload?.commonAnnotations?.notification_policy_slug}: ${payload?.commonLabels?.alertname}`,
    status: payload?.status === 'firing' ? 0 : 1,
    annotations: annotations
  };
  return signal;
}
// COPY TO HERE //
//////////////////
module.exports = {
  transpose
}

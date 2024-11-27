////////////////////
// COPY FROM HERE //
/**
 * Converts from PD severity to FH severity
 */
function severityToLevel(severity) {
  if (severity) {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 3;
      case 'error':
        return 2;
      case 'warning':
        return 1;
      default:
        return 0;
    }
  }

  return 0;
}

/**
 * Transpose a payload from PD Events v2 API to a FH Signal. See:
 * https://developer.pagerduty.com/api-reference/368ae3d938c9e-send-an-event-to-pager-duty
 */
function transpose(input) {
  const payload = input.data.payload;
  const allData = input.data;

  let links = [];
  if (allData.links) {
    links = Array.from(allData?.links);
  }
  if (allData?.client_url) {
    links.push({ href: allData.client_url, text: allData?.client || 'Client URL' });
  }

  let annotations = {
    'events.pagerduty.com/v2/payload_source': payload?.source || '',
    'events.pagerduty.com/v2/payload_severity': payload?.severity || '',
    'events.pagerduty.com/v2/payload_component': payload?.component || '',
    'events.pagerduty.com/v2/payload_group': payload?.group || '',
    'events.pagerduty.com/v2/payload_class': payload?.class || '',
    'events.pagerduty.com/v2/routing_key': allData.routing_key,
    'events.pagerduty.com/v2/event_action': allData.event_action,
    'events.pagerduty.com/v2/dedup_key': allData.dedup_key
  };

  if (payload?.custom_details) {
    for (const [key, value] of Object.entries(payload.custom_details)) {
      annotations[`events.pagerduty.com/v2/custom_details/${key}`] = value.toString();
    }
  }

  let summary, body;
  if (payload?.summary) {
    summary = `[${payload?.severity || 'no severity'}] ${payload?.summary}`;
    body = `Alert from ${payload.source}: ${payload.summary}`;
  } else {
    summary = allData.event_action + ' for ' + allData.dedup_key;
    body = allData.event_action + ' for ' + allData.dedup_key;
  }

  const signal = {
    idempotency_key: allData.dedup_key,
    summary: summary,
    body: body,
    level: severityToLevel(payload?.severity),
    links: links,
    images: (allData?.images ? allData.images.map(({ href, ...image }) => image) : []),
    status: allData.event_action === 'resolve' ? 'CLOSED' : 'OPEN',
    annotations: annotations
  };
  return signal;
}
// COPY TO HERE //
//////////////////

module.exports = {
  transpose
}

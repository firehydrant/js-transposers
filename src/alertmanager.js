const md5 = require('md5');
////////////////////
// COPY FROM HERE //
/*
 * Transpose a payload from Alertmanager into a Signal
 */
function transpose(input) {
  const payload = input.data;

  let summary, body = '';
  let links = [];

  // Links
  payload.alerts.forEach((alert) => {
    if (alert.generatorURL) {
      links.push({
        href: alert.generatorURL,
        text: `Generator URL${alert?.annotations?.summary ? ' - ' + alert.annotations.summary : ''}`
      });
    }
  });

  // Common Annotations
  let annotations = {
    'alertmanager/groupKey': payload.groupKey
  };

  if (payload?.commonAnnotations) {
    annotations = {
      ...Object.fromEntries(Object.entries(payload.commonAnnotations).map(([k, v]) => [`alertmanager/annotations-${k}`, v])),
      ...annotations
    }
  }

  if (payload?.commonLabels) {
    annotations = {
      ...Object.fromEntries(Object.entries(payload.commonLabels).map(([k, v]) => [`alertmanager/labels-${k}`, v])),
      ...annotations
    };
  }

  if (payload?.groupLabels) {
    annotations = {
      ...Object.fromEntries(Object.entries(payload.groupLabels).map(([k, v]) => [`alertmanager/grouped-by-${k}`, v])),
      ...annotations
    }
  }

  // If one alert in array, use that alert's info
  // If multiple, hard-code summary
  if (payload.alerts && payload.alerts.length > 0) {
    if (payload.alerts.length === 1) {
      summary = payload.alerts[0]?.annotations?.summary ? payload.alerts[0].annotations.summary : `Alert from ${payload.receiver}`;
    } else {
      summary = `${payload.alerts.length} alerts from ${payload.receiver}`;
    }

    // Summarize all alert titles/descriptions in body
    payload.alerts.forEach((alert) => {
      body += `${alert?.annotations?.summary}: ${alert?.annotations?.description}\n`;
    });

  } else {
    // If no alerts in array, hardcode a summary/body
    summary = `Alert from ${payload.receiver}`;
    body = `${payload.receiver} sent a webhook without any alerts or other information.`;
  }
  
  // Construct the Signal and return
  let signal = {
    idempotency_key: md5(payload.groupKey),
    summary: summary,
    body: body,
    status: payload.status == 'firing' ? 0 : 1,
    links: links,
    annotations: annotations
  };

  return signal;
}
// COPY TO HERE //
//////////////////
module.exports = {
  transpose
}

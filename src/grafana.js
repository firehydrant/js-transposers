const md5 = require('md5');

////////////////////
// COPY FROM HERE //
/*
 * Transpose a Grafana payload into a Signal
 */
function transpose(input) {
  const payload = input.data;

  // Map links from alerts
  let links = [];
  payload.alerts.forEach((alert) => {
    let displayText = alert?.labels?.alertname ? alert.labels.alertname : 'Grafana';
    links.push({
      text: displayText,
      href: alert.generatorURL
    });
  });

  // If images, add images
  let images = [];
  payload.alerts.forEach((alert) => {
    images.push({
      src: alert?.imageURL || 'null',
      alt: alert?.annotations?.description || 'Grafana Image'
    });
  });

  // Map annotations from commonAnnotations, commonLabels,
  // and groupLabels
  let annotations = {
    'grafana/groupKey': payload.groupKey,
    ...Object.fromEntries(Object.entries(payload.commonAnnotations).map(([k, v]) => [`grafana/annotations-${k}`, v])),
    ...Object.fromEntries(Object.entries(payload.commonLabels).map(([k, v]) => [`grafana/labels-${k}`, v])),
    ...Object.fromEntries(Object.entries(payload.groupLabels).map(([k, v]) => [`grafana/grouped-by-${k}`, v]))
  };
 
  // Construct Signal
  let signal = {
    idempotency_key: md5(payload.groupKey),
    summary: payload.title,
    body: payload.message,
    links: links,
    images: images,
    annotations: annotations,
    status: payload.status ? (payload.status == "firing" ? 0 : 1) : 0
  };

  return signal;
}
// COPY TO HERE //
//////////////////
module.exports = {
  transpose
}

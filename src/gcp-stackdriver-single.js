////////////////////
// COPY FROM HERE //

/**
 * Converts GCP severities to FireHydrant severities.
 */
function severityToLevel(severity) {
  switch (severity.toLowerCase()) {
    case 'emergency':
    case 'alert':
    case 'critical':
      return 3;
    case 'error':
      return 2;
    case 'warning':
    case 'notice':
      return 1;
    default:
      return 0;
  }
}

/**
 * Converts GCP severities to FireHydrant priorities.
 */
function severityToPriority(severity) {
  switch (severity.toLowerCase()) {
    case 'emergency':
    case 'alert':
    case 'critical':
    case 'error':
      return 'HIGH';
    default:
      return 'LOW';
  }
}

/**
 * Transpose a payload from a GCP stackdriver hook into a signal. See:
 * https://cloud.google.com/blog/products/gcp/how-to-connect-stackdriver-to-external-monitoring
 */
function transpose(input) {
  const payload = input.data;

  let links = [
    {
      href: payload?.incident.url,
      text: 'Google Cloud Stackdriver Trigger'
    }
  ];

  if (payload?.incident?.documentation?.links) {
    payload.incident.documentation.links.forEach((link) => {
      links.push({
        href: link.url,
        text: link.displayName
      });
    });
  }

  let annotations = {
    'signals.firehydrant.com/notification-priority': payload?.incident.severity ? severityToPriority(payload?.incident.severity) : 'HIGH',
    'cloud.google.com/incident_id': payload?.incident.incident_id || '',
    'cloud.google.com/scoping_project_id': payload?.incident.scoping_project_id || '',
    'cloud.google.com/scoping_project_number': `${payload?.incident.scoping_project_number || ''}`,
    'cloud.google.com/severity': payload?.incident.severity || '',
    'cloud.google.com/observed_value': payload?.incident.observed_value || '',
    'cloud.google.com/resource_id': payload?.incident.resource_id || '',
    'cloud.google.com/resource_name': payload?.incident.resource_name || '',
    'cloud.google.com/resource_type': payload?.incident.resource.type || '',
    'cloud.google.com/metric_type': payload?.incident.metric.type || '',
    'cloud.google.com/policy_name': payload?.incident.policy_name || '',
    'cloud.google.com/condition_name': payload?.incident.condition_name || '',
    'cloud.google.com/threshold_value': payload?.incident.threshold_value || '',
    'cloud.google.com/observed_value': payload?.incident.observed_value || '',
    'cloud.google.com/documentation_content': payload?.incident?.documentation?.content || '',
    'cloud.google.com/documentation_subject': payload?.incident?.documentation?.subject || '',
    'cloud.google.com/version': payload?.version || ''
  }

  if (payload?.incident?.resource?.labels) {
    for (const [key, value] of Object.entries(payload.incident.resource.labels)) {
      annotations[`cloud.google.com/resource_labels/${key}`] = value;
    }
  }

  if (payload?.incident?.metadata?.system_labels) {
    for (const [key, value] of Object.entries(payload.incident.metadata.system_labels)) {
      annotations[`cloud.google.com/metadata_system_labels/${key}`] = value;
    }
  }

  if (payload?.incident?.metadata?.user_labels) {
    for (const [key, value] of Object.entries(payload.incident.metadata.user_labels)) {
      annotations[`cloud.google.com/metadata_user_labels/${key}`] = value;
    }
  }

  if (payload?.incident?.policy_user_labels) {
    for (const [key, value] of Object.entries(payload.incident.policy_user_labels)) {
      annotations[`cloud.google.com/policy_user_labels/${key}`] = value;
    }
  }

  const signal = {
    idempotency_key: payload?.incident.incident_id,
    summary: `[${payload?.incident.severity || 'no severity'}] ${payload?.incident.policy_name}: ${payload?.incident.condition_name} on ${payload?.incident.resource_name}`,
    body: payload?.incident.summary,
    links: links,
    level: payload?.incident.severity ? severityToLevel(payload?.incident.severity) : 0,
    status: payload?.incident.state == 'closed' ? 1 : 0,
    annotations: annotations
  };

  return signal;
}
// COPY TO HERE //
//////////////////
module.exports = {
  transpose
}

////////////////////
// COPY FROM HERE //
/**
 * Translates from Datadog level to FH level.
 * See: https://docs.firehydrant.com/docs/events-data-model
 */
function getLevel(level) {
  if (level) {
    switch (level) {
      case 'error':
        return 2;
      case 'warning':
        return 1;
      default:
        return 0;
    }
  }

  return 0; // INFO
}

/**
 * Translates from Datadog priority (P*) to FH level.
 * This assumes default behavior but can be modified.
 */
function getPriority(priority) {
  if (priority) {
    switch (priority) {
      case 'P1':
      case 'P2':
        return 'HIGH';
      default:
        return 'LOW';
    }
  }

  return 'HIGH'; // Defaults to high priority
}

/*
 * Transpose a payload into a Signal
 */
function transpose(input) {
  const payload = input.data;
  let tags = [];

  // Apparently Tags can be comma-delimited string OR an
  // array of strings... why wtf
  if (payload?.tags) {
    if (typeof payload.tags === 'string') {
      tags = payload.tags.split(',').map(tag => tag.trim())
    } else if (typeof payload.tags === 'object' && payload.tags.constructor === Array) {
      tags = payload.tags;
    }
  }

  let signal = {
    idempotency_key: payload?.unique_key ? payload.unique_key : (payload?.summary ? payload.summary : ''),
    summary: payload?.summary ? payload.summary : 'Alert from Datadog',
    body: payload?.body ? payload.body : 'No information provided',
    level: getLevel(payload?.level),
    links: payload?.links ? payload.links : [],
    images: payload?.images.filter((link) => link.src !== 'null'),
    tags: tags,
    status: payload?.status && payload.status === 'Recovered' ? 1 : 0,
    annotations: {
      'signals.firehydrant.com/notification-priority': getPriority(payload?.annotations?.['datadog/priority']),
      ...(payload?.annotations || {})
    }
  };

  return signal;
}
// COPY TO HERE //
//////////////////
module.exports = {
  transpose
}

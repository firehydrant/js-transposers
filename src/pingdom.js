////////////////////
// COPY FROM HERE //
/**
 * Translates Pingdom importance_level to FH priority
 */
function importanceToPriority(importance) {
  switch (importance) {
    case 'CRITICAL':
      return 'HIGH';
    default:
      return importance; // Pingdom also uses HIGH/MEDIUM/LOW
  }
}

/**
 * Translates Pingdom importance_level to FH level 
 */
function importanceToLevel(importance) {
  switch (importance) {
    case 'CRITICAL':
      return 3;
    case 'HIGH':
      return 2;
    case 'MEDIUM':
      return 1;
    default:
      return 0; // Log INFO by default
  }
}

/**
 * Check for these annotation keys and insert if available
 */
function getAnnotations(payload) {
  let optionalKeys = [];

  switch (payload.check_type) {
    case 'HTTP':
      optionalKeys.push('basic_auth', 'encryption', 'full_url', 'header', 'hostname', 'ipv6', 'port', 'url');
      break;
    case 'HTTP_CUSTOM':
      optionalKeys.push('basic_auth', 'encryption', 'full_url', 'hostname', 'ipv6', 'port', 'url');
      break;
    case 'PORT_TCP':
      optionalKeys.push('basic_auth', 'hostname', 'ipv6', 'port');
      break;
    case 'PING':
      optionalKeys.push('basic_auth', 'hostname', 'ipv6');
      break;
    case 'DNS':
      optionalKeys.push('basic_auth', 'expected_ip', 'hostname', 'ipv6', 'nameserver');
      break;
    case 'UDP':
      optionalKeys.push('basic_auth', 'expect', 'hostname', 'ipv6', 'port', 'send');
      break;
    case 'SMTP':
    case 'POP3':
    case 'IMAP':
      optionalKeys.push('basic_auth', 'encryption', 'hostname', 'ipv6', 'port');
      break;
  }

  const optionalAnnotations = optionalKeys.reduce((acc, key) => {
    // Only add the key if it exists in check_params
    if (payload.check_params && payload.check_params[key] !== undefined) {
      acc[key] = String(payload.check_params[key]);
    }
    return acc;
  }, {});

  let annotations = {
    'signals.firehydrant.com/notification-priority': importanceToPriority(payload.importance_level),
    check_id: String(payload.check_id),
    check_name: payload.check_name,
    check_type: payload.check_type,
    current_state: payload.current_state,
    importance_level: payload.importance_level,
    previous_state: payload?.previous_state || '',
    state_changed_timestamp: String(payload.state_changed_timestamp),
    state_changed_utc_time: payload.state_changed_utc_time,
    ...optionalAnnotations // Spread the optional annotations into the main annotations object
  };
  
  return annotations; // Don't forget to return the annotations
}

/*
 * Transpose a payload into a Signal
 */
function transpose(input) {
  const payload = input.data;
  let links = [];

  if (payload?.check_params?.hostname) {
    links.push({
      href: payload.check_params.hostname,
      alt: 'Check Host'
    });
  }

  return {
    idempotency_key: String(payload?.check_id),
    summary: payload?.description || `Pingdom Alert for ${payload.check_name}`,
    body: payload?.long_description || 'No long description provided',
    images: [],
    level: importanceToLevel(payload.importance_level),
    links: links,
    tags: payload?.tags || [],
    annotations: getAnnotations(payload),
    status: (payload.current_state === "DOWN" || payload.current_state === "FAILING") ? 0 : 1
  };
}
// COPY TO HERE //
//////////////////
module.exports = {
  transpose
}

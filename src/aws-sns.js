////////////////////
// COPY FROM HERE //
/*
 * Transpose a payload from an AWS SNS webhook into a signal
 */
function transpose(input) {
  const payload = input.data;

  let signal = {
    idempotency_key: payload.MessageId,
    body: payload.Message,
    annotations: {
      'sns.amazonaws.com/Signature': payload.Signature,
      'sns.amazonaws.com/SigningCertURL': payload.SigningCertURL,
      'sns.amazonaws.com/SignatureVersion': payload.SignatureVersion,
      'sns.amazonaws.com/Timestamp': payload.Timestamp,
      'sns.amazonaws.com/TopicArn': payload.TopicArn,
      'sns.amazonaws.com/Type': payload.Type
    },
    links: [
      {
        href: payload.SigningCertURL,
        text: 'AWS SNS Signing Cert URL'
      }
    ]
  };

  if (payload.Type === 'SubscriptionConfirmation') {
    signal.summary = `${payload.Type} from AWS SNS`;
    signal.links.push({
      href: payload.SubscribeURL,
      text: 'Subscribe URL for SNS Topic'
    });
  } else {
    signal.summary = payload.Subject;
    signal.links.push({
      href: payload.UnsubscribeURL,
      text: 'Unsubscribe URL for SNS Topic'
    });
    
    for (const [key, object] of Object.entries(payload.MessageAttributes)) {
      signal.annotations[`sns.amazonaws.com/MessageAttributes/${key}`] = object.Value;
    }
  }

  return signal;
}
// COPY TO HERE //
//////////////////
module.exports = {
  transpose
}

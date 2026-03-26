const fetch = require('node-fetch');

const SEVERITY_EMOJI = {
  critical: ':red_circle:',
  warning: ':yellow_circle:',
  info: ':blue_circle:'
};

const sendSlackAlert = async (alertData) => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('Slack webhook not configured - logging alert instead:');
    console.log(JSON.stringify(alertData, null, 2));
    return;
  }

  const emoji = SEVERITY_EMOJI[alertData.severity] || ':white_circle:';

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} PipelineRadar Alert - ${alertData.severity.toUpperCase()}`
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Repository:*\n${alertData.repo}` },
          { type: 'mrkdwn', text: `*Pattern:*\n${alertData.pattern}` }
        ]
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Message:*\n${alertData.message}` }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Suggestions:*\n${alertData.suggestions.map(s => `• ${s}`).join('\n')}`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Detected at ${new Date(alertData.timestamp).toUTCString()}`
          }
        ]
      }
    ]
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });

  if (!response.ok) {
    throw new Error(`Slack API error: ${response.status}`);
  }

  console.log(`Slack alert sent for ${alertData.repo} - ${alertData.pattern}`);
};

module.exports = { sendSlackAlert };

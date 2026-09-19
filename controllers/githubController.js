const webhookService = require('../services/webhookService');

async function handleWebhook(req, res) {
  const event = req.webhookEvent;
  const deliveryId = req.webhookDeliveryId;
  const action = req.body.action;

  if (event === 'ping') {
    await webhookService.logWebhookEvent(deliveryId, {
      event: 'ping',
      action: null,
      signatureValid: true,
      outcome: 'pong'
    });
    return res.json({ status: 'pong' });
  }

  if (event !== 'pull_request') {
    await webhookService.logWebhookEvent(deliveryId, {
      event,
      action,
      signatureValid: true,
      outcome: 'ignored_event'
    });
    return res.json({ status: 'ignored', message: `Event ${event} not handled` });
  }

  try {
    const isDuplicate = await webhookService.isDuplicateDelivery(deliveryId);
    if (isDuplicate) {
      return res.json({ status: 'duplicate', message: 'Already recorded' });
    }

    const pr = req.body.pull_request;
    const payloadSummary = {
      action,
      prNumber: pr?.number,
      prTitle: pr?.title,
      user: pr?.user?.login,
      merged: pr?.merged
    };

    if (action === 'closed' && pr?.merged === true) {
      const result = await webhookService.processMergedPR(req.body, deliveryId);

      await webhookService.logWebhookEvent(deliveryId, {
        event,
        action,
        prNumber: pr.number,
        repository: req.body.repository?.full_name,
        signatureValid: true,
        outcome: result.status,
        payloadSummary
      });

      return res.json(result);
    }

    if (action === 'labeled' || action === 'unlabeled') {
      const result = await webhookService.processLabelEvent(req.body, action);

      await webhookService.logWebhookEvent(deliveryId, {
        event,
        action,
        prNumber: pr?.number,
        repository: req.body.repository?.full_name,
        signatureValid: true,
        outcome: result.status,
        payloadSummary
      });

      return res.json(result);
    }

    await webhookService.logWebhookEvent(deliveryId, {
      event,
      action,
      prNumber: pr?.number,
      repository: req.body.repository?.full_name,
      signatureValid: true,
      outcome: 'ignored_action',
      payloadSummary
    });

    return res.json({ status: 'ignored', message: `Action ${action} not handled` });

  } catch (err) {
    console.error('Webhook processing error:', err.message);

    await webhookService.logWebhookEvent(deliveryId, {
      event,
      action,
      prNumber: req.body.pull_request?.number,
      repository: req.body.repository?.full_name,
      signatureValid: true,
      outcome: 'error'
    }).catch(() => {});

    return res.status(500).json({ error: 'Processing failed' });
  }
}

module.exports = { handleWebhook };

// Cloudflare Pages Function: served at /api/recall-check when Pages builds this repo.
// Set ANTHROPIC_API_KEY under Pages project → Settings → Variables and Secrets.
import { handleRecallCheck } from '../../worker/recall-handler'
import type { Env } from '../../worker/recall-handler'

export const onRequest = ({ request, env }: { request: Request; env: Env }) =>
  handleRecallCheck(request, env)

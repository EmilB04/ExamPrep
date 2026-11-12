import { handleRecallCheck } from './recall-handler'
import type { Env } from './recall-handler'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname !== '/api/recall-check')
      return Response.json({ error: 'Not found.' }, { status: 404 })
    return handleRecallCheck(request, env)
  },
}

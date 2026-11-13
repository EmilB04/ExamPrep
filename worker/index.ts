import { handleApi, type ApiEnv } from './api'
export default { fetch: (request: Request, env: ApiEnv) => handleApi(request, env) }

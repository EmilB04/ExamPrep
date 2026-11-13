import { handleApi, type ApiEnv } from '../../worker/api'
export const onRequest = ({ request, env }: { request: Request; env: ApiEnv }) => handleApi(request, env)

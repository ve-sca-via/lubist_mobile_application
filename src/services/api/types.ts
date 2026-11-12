/**
 * Typed helpers over the generated backend contract.
 *
 * `generated/schema.d.ts` is produced by `npm run api:types` from the backend's
 * committed openapi/openapi.json. Hooks should derive their request/response
 * types from these helpers instead of re-declaring shapes by hand, so a backend
 * change that renames/removes a field fails `npm run typecheck` here rather than
 * failing silently on a user's phone.
 *
 *   type Res  = ApiResponse<'/api/v1/salons/public', 'get'>;
 *   type Body = ApiRequestBody<'/api/v1/auth/login', 'post'>;
 *   type Q    = ApiQuery<'/api/v1/salons/public', 'get'>;
 *   type S    = Schema<'PublicSalonResponse'>;
 *
 * Where the backend declares a field as an untyped `object` (e.g. a list of
 * raw rows), the hooks keep a hand-written element type and overlay it with
 * `WithFields` - see docs/API_CONTRACT.md.
 */
import type { components, paths } from './generated/schema';

export type { components, paths };

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/** Every path the backend exposes, e.g. '/api/v1/salons/{salon_id}'. */
export type ApiPath = keyof paths;

/** A named component schema from the contract. */
export type Schema<K extends keyof components['schemas']> = components['schemas'][K];

/** The operation object for a path + method (never if the method isn't defined). */
export type ApiOperation<P extends ApiPath, M extends HttpMethod> = M extends keyof paths[P]
  ? NonNullable<paths[P][M]>
  : never;

type JsonOf<R> = R extends { content: { 'application/json': infer B } } ? B : never;

/** JSON body of the first 2xx response (200, then 201, then 202). */
export type ApiResponse<P extends ApiPath, M extends HttpMethod> =
  ApiOperation<P, M> extends { responses: infer R }
    ? 200 extends keyof R
      ? JsonOf<R[200]>
      : 201 extends keyof R
        ? JsonOf<R[201]>
        : 202 extends keyof R
          ? JsonOf<R[202]>
          : never
    : never;

/** JSON request body for a path + method. */
export type ApiRequestBody<P extends ApiPath, M extends HttpMethod> =
  ApiOperation<P, M> extends { requestBody?: infer B } ? JsonOf<NonNullable<B>> : never;

/** Query-string parameters for a path + method. */
export type ApiQuery<P extends ApiPath, M extends HttpMethod> =
  ApiOperation<P, M> extends { parameters: { query?: infer Q } } ? NonNullable<Q> : never;

/** Replace the listed fields of a generated type (used where the contract says `object`). */
export type WithFields<T, F> = Omit<T, keyof F> & F;

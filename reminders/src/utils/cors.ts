// utils/cors.ts
export function withCors(response: Response, origin: string | null) {
  const headers = new Headers(response.headers);

  headers.set(
    'Access-Control-Allow-Origin',
    origin ?? '*'
  );
  headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

export function handleOptions(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': request.headers.get('Origin') ?? '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

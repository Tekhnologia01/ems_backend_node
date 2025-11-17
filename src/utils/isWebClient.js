export default function isWebClient(req) {
  return req.headers['x-client-type'] !== 'mobile';
}

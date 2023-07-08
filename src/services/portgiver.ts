export function makePort(): number {
  const port = Math.floor(Math.random() * 65535) + 1;
  return port;
}

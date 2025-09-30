declare const process: {
  env: Record<string, string | undefined>
}

declare const global: typeof globalThis & {
  fetch: jest.Mock
}

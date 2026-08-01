declare module '@onelabeler/core' {
  // Package `.d.ts` omits the `#overlay` slot this app uses; keep BaseDisplay loose
  // so ambient module override does not reject valid call sites. Prefer fixing
  // upstream types when `@onelabeler/core` declares slots.
  export const dataTypeImage: {
    BaseDisplay: any
  }
}

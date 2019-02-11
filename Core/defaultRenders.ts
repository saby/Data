export function real(value: number | string, decimals: number, delimiters?: boolean, floor?: boolean): string {
   const ceil = decimals === 0 ? Math.round(value as number) : Math.round(value as number / decimals) * decimals;
   return String(ceil);
}

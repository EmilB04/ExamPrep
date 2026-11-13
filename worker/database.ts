export type Statement = {
  bind(...values: (string | number)[]): Statement
  first<T>(): Promise<T | null>
  run(): Promise<{ meta: { changes: number } }>
}
export type Database = { prepare(sql: string): Statement }

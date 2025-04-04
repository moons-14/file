export type ResultType<
  T extends Record<string, any>,
  E extends string
> = 
  | ({ success: true } & T)
  | ({ success: false; error: E });

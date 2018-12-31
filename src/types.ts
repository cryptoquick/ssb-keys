export interface IKeys {
  id: string
  curve: string
  public: Buffer
  private?: Buffer
}

export interface IFileConfig {
  path: string
}

export interface ISignedObj {
  signature: string
}

export type NodeCallback<T> = (err: Error | null, arg: T) => void

export const AnyObj = {} as any

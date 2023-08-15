export enum UserType {
  MTurkWorker = 'MTurkWorker',
  Reviewer = 'Reviewer',
}

export interface User {
  type: UserType
  /** The name of the reviewer or the MTurk workerId. */
  name: string
  /** The uuid of the user. */
  uuid: string
}

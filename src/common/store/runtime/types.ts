export enum AuthProviders {
  google = 'google',
  facebook = 'facebook',
}

export enum AuthProcStages {
  initiated,
  failed,
  canceled,
  completed,
}

export interface IAuthProcState {
  stage: AuthProcStages;
  provider?: AuthProviders;
  msg?: string;
}

export interface IRuntimeState {
  authProc: IAuthProcState;
}

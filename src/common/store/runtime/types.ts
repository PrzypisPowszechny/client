//tslint:disable

export interface IUserState {
  // todo
}

export enum AuthProviders {
  google,
  facebook,
}

export enum AuthProcStages {
  initiated,
  failed,
  completed,
}

export interface IAuthProcState {
  stage: AuthProcStages;
  provider: AuthProviders;
  msg?: string;
}

export interface IRuntimeState {
  user: IUserState;
  authProc: IAuthProcState;
}
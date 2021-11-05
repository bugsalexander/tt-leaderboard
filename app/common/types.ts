export enum Page {
  Leaderboard = 'Leaderboard',
  TBD = 'TBD'
}

export type Leaderboard = {
  leaderboard: Array<UserScore>;
}

export type UserScore = {
  name: string;
  elo: number;
}
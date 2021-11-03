/**
 * represents leaderboard. maps from name -> elo.
 */
export type Leaderboard = {
  leaderboard: Array<UserScore>
};

export type UserScore = {
  name: string,
  elo: number
}

export type LeaderboardApiGetResponse = Leaderboard;
export type LeaderboardApiPutRequest = {
  winner: string,
  loser: string
};
export type LeaderboardApiPostRequest = string;

export type Handler = (req: Request, kv: KVNamespace) => Response | Promise<Response>;
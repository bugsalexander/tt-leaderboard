import type { NextPage } from "next";
import axios, { AxiosResponse } from "axios";
import useSWR from "swr";
import { UserScore } from "../components/UserScore";

type Leaderboard = {
  leaderboard: Array<UserScore>;
}

type UserScore = {
  name: string;
  elo: number;
}

const getLeaderboard = async (): Promise<AxiosResponse<Leaderboard>> =>
  axios.get("/api");

const Home: NextPage = () => {
  const { data } = useSWR("/api", getLeaderboard);

  return (
    <div>
      <h1>Ping POng Leaderboard!</h1>
      <ol>
        {data?.data.leaderboard.map((userScore) => (
          <UserScore name={userScore.name} elo={userScore.elo} />
        ))}
      </ol>
    </div>
  );
};

export default Home;

import type { NextPage } from "next";
import useSWR from "swr";
import { UserScore } from "../components/UserScore";
import { getLeaderboard } from "../common/client";

const Home: NextPage = () => {
  const { data } = useSWR("/api", getLeaderboard);

  return (
    <div>
      <h1>Ping POng Leaderboard!</h1>
      <ol>
        {data?.data.leaderboard.map((userScore) => (
          <UserScore
            key={userScore.name}
            name={userScore.name}
            elo={userScore.elo}
          />
        ))}
      </ol>
    </div>
  );
};

export default Home;

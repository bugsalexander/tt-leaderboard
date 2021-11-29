import type { NextPage } from "next";
import useSWR from "swr";
import { getLeaderboard } from "../common/client";
import { SubmitMatch } from "../components/SubmitMatch";
import {PageLayout} from "../components/Layout";
import {AddPlayer} from "../components/AddPlayer";
import {LeaderboardDisplay} from "../components/LeaderboardDisplay";

const Home: NextPage = () => {
  const { data, mutate } = useSWR("/api", getLeaderboard);
  const leaderboard = data?.data.leaderboard;

  return (
    <PageLayout>
    <div className="home">
      <div className="section">
        <LeaderboardDisplay leaderboard={leaderboard} />
      </div>
      <div className="section">
        <SubmitMatch mutate={mutate} leaderboard={leaderboard} />
      </div>
      <div className="section">
        <AddPlayer mutate={mutate} leaderboard={leaderboard} />
      </div>
    </div>
    </PageLayout>
  );
};

export default Home;

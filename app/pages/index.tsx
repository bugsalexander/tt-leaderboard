import type { NextPage } from "next";
import useSWR from "swr";
import { UserScore } from "../components/UserScore";
import { getLeaderboard } from "../common/client";
import { Button, Dropdown, Form, Input, Menu } from "antd";
import { SubmitMatch } from "../components/SubmitMatch";
import {PageLayout} from "../components/Layout";
import {AddPlayer} from "../components/AddPlayer";

const Home: NextPage = () => {
  const { data, mutate } = useSWR("/api", getLeaderboard);
  const leaderboard = data?.data.leaderboard;

  return (
    <PageLayout>
    <div className="home">
      <div className="section">
        <h1>Leaderboard</h1>
        <ol>
          {leaderboard?.map((userScore) => (
            <UserScore
              key={userScore.name}
              name={userScore.name}
              elo={userScore.elo}
            />
          ))}
        </ol>
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

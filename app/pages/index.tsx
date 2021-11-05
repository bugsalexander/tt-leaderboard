import type { NextPage } from "next";
import useSWR from "swr";
import { UserScore } from "../components/UserScore";
import { getLeaderboard } from "../common/client";
import { Button, Dropdown, Form, Input, Menu } from "antd";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { SubmitMatch } from "../components/SubmitMatch";

const Home: NextPage = () => {
  const { data, mutate } = useSWR("/api", getLeaderboard);
  const leaderboard = data?.data.leaderboard;

  return (
    <div className="home">
      <div className="section">
        <h1>Ping POng Leaderboard!</h1>
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
        <h1>Add Player</h1>
        <Input></Input>
        <Button>Add Player</Button>
      </div>
    </div>
  );
};

export default Home;

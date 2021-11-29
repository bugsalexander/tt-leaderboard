import {UserScore} from "../common/types";
import {Table} from "antd";

const { Column } = Table;

type LeaderboardProps = {
  leaderboard: UserScore[] | undefined;
}

const columns = [
  { title: "Rank", dataIndex: "rank", key: "rank", }
]

export const LeaderboardDisplay: React.FC<LeaderboardProps> = ({ leaderboard }) => {
  const data = (leaderboard ?? []).map(({ name, elo }, i) => ({ key: name, name, elo, rank: i + 1 }));
  return <div className="leaderboard">
    <h1>Leaderboard</h1>
    <Table dataSource={data} size="small">
      <Column title="Rank" dataIndex="rank" key="rank"/>
      <Column title="Name" dataIndex="name" key="name"/>
      <Column title="ELO" dataIndex="elo" key="elo"/>
    </Table>
  </div>
}

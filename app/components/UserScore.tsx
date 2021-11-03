type UserScoreProps = {
  name: string;
  elo: number;
};
export const UserScore: React.FC<UserScoreProps> = ({ name, elo }) => {
  return (
    <div>
      {name} - {elo}
    </div>
  );
};

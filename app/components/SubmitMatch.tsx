import React, { useState } from "react";
import { Alert, Button, Form, Input, notification, Select } from "antd";
import { KeyedMutator } from "swr";
import { Leaderboard, UserScore } from "../common/types";
import { AxiosResponse } from "axios";
import { submitMatch } from "../common/client";

// const NEW_PLAYER_UNIQUE_KEY = "aksd;jflakjefpoaiwfj;ldskf";

type SubmitMatchProps = {
  mutate: KeyedMutator<AxiosResponse<Leaderboard, any>>;
  leaderboard: UserScore[] | undefined;
};

enum MatchRole {
  Winner = "Winner",
  Loser = "Loser",
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

export const SubmitMatch: React.FC<SubmitMatchProps> = ({
  mutate,
  leaderboard,
}) => {
  const [form] = Form.useForm();
  const [error, setError] = useState<React.FC | null>(null);
  const onPlayerChange = (role: MatchRole) => (value: string) => {
    form.setFieldsValue({ [role]: value });
  };
  const onSubmit = async (values: any) => {
    let winner = values.winner;
    // values.winner === NEW_PLAYER_UNIQUE_KEY
    //   ? values.customizeWinner
    //   : values.winner;
    let loser = values.loser;
    // values.loser === NEW_PLAYER_UNIQUE_KEY
    //   ? values.customizeLoser
    //   : values.loser;
    const result = await submitMatch(winner, loser);
    if (typeof result.data === "string") {
      setError(() => (
        <Alert className="error" message={result.data} type="error" showIcon />
      ));
    } else {
      onReset();
      const resultType: AxiosResponse<Leaderboard> = result as AxiosResponse<Leaderboard>;
      const winnerOld = getElo(leaderboard!, winner);
      const winnerNew = getElo(resultType.data.leaderboard, winner);
      const winnerGain = winnerNew - winnerOld;
      const loserNew = getElo(resultType.data.leaderboard, loser);
      await mutate(resultType);
      notification.success({
        message: (
          <>
            Submitted <b>{winner}</b> def. {loser}
          </>
        ),
        description: (
          <>
            Δ{winnerGain} ELO – {winner}: {winnerNew}, {loser}: {loserNew}
          </>
        ),
        placement: "bottomRight",
        duration: 30,
      });
    }
  };

  const onReset = () => {
    form.resetFields();
    setError(null);
  };

  return (
    <div className="submit-match">
      <h1>Submit Match</h1>
      <Form {...layout} form={form} onFinish={onSubmit}>
        <Form.Item
          name="winner"
          label="Winner"
          rules={[{ required: true, message: "Please input the winner!" }]}
        >
          <PlayerDropdown
            className="input"
            leaderboard={leaderboard}
            placeholder={"Winner"}
            onChange={onPlayerChange(MatchRole.Winner)}
          />
        </Form.Item>
        {/*<Form.Item*/}
        {/*  noStyle*/}
        {/*  shouldUpdate={(prevValues, currentValues) =>*/}
        {/*    prevValues.winner !== currentValues.winner*/}
        {/*  }*/}
        {/*>*/}
        {/*  {({ getFieldValue }) =>*/}
        {/*    getFieldValue("winner") === NEW_PLAYER_UNIQUE_KEY ? (*/}
        {/*      <Form.Item*/}
        {/*        name="customizeWinner"*/}
        {/*        label="Add New Player"*/}
        {/*        rules={[{ required: true }]}*/}
        {/*      >*/}
        {/*        <Input className="input" />*/}
        {/*      </Form.Item>*/}
        {/*    ) : null*/}
        {/*  }*/}
        {/*</Form.Item>*/}
        <Form.Item
          name="loser"
          label="Loser"
          rules={[{ required: true, message: "Please input the loser!" }]}
        >
          <PlayerDropdown
            className="input"
            leaderboard={leaderboard}
            placeholder={"Loser"}
            onChange={onPlayerChange(MatchRole.Loser)}
          />
        </Form.Item>
        {/*<Form.Item*/}
        {/*  noStyle*/}
        {/*  shouldUpdate={(prevValues, currentValues) =>*/}
        {/*    prevValues.loser !== currentValues.loser*/}
        {/*  }*/}
        {/*>*/}
        {/*  {({ getFieldValue }) =>*/}
        {/*    getFieldValue("loser") === NEW_PLAYER_UNIQUE_KEY ? (*/}
        {/*      <Form.Item*/}
        {/*        name="customizeLoser"*/}
        {/*        label="Add New Player"*/}
        {/*        rules={[{ required: true }]}*/}
        {/*      >*/}
        {/*        <Input className="input" />*/}
        {/*      </Form.Item>*/}
        {/*    ) : null*/}
        {/*  }*/}
        {/*</Form.Item>*/}
        <Form.Item noStyle>{error}</Form.Item>
        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit" className="button">
            Submit
          </Button>
          <Button htmlType="button" onClick={onReset} className="button">
            Reset
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

type PlayerDropdownProps = {
  leaderboard: undefined | UserScore[];
  onChange: (name: string) => void;
  placeholder: string;
  className: string;
};

const PlayerDropdown: React.FC<PlayerDropdownProps> = (props) => {
  return (
    <Select
      className={props.className}
      placeholder={props.placeholder}
      onChange={props.onChange}
      allowClear
    >
      {props.leaderboard?.map(({ name }) => (
        <Select.Option key={name} value={name}>
          {name}
        </Select.Option>
      ))}
      {/*<Select.Option value={NEW_PLAYER_UNIQUE_KEY}>*/}
      {/*  Add New Player*/}
      {/*</Select.Option>*/}
    </Select>
  );
};

export const getElo = (leaderboard: UserScore[], name: string): number => {
  return leaderboard.find((u) => u.name === name)!.elo;
};

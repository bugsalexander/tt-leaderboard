import React from "react";
import { Button, Form, Input, Select } from "antd";
import { KeyedMutator } from "swr";
import { Leaderboard, UserScore } from "../common/types";
import { AxiosResponse } from "axios";

const NEW_PLAYER_UNIQUE_KEY = "aksd;jflakjefpoaiwfj;ldskf";

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
  // mutate('/api/user', { ...data, name: newName }, false)

  const onPlayerChange = (role: MatchRole) => (value: string) => {
    form.setFieldsValue({ [role]: value });
  };
  const onSubmit = (values: any) => {
    let winner =
      values.winner === NEW_PLAYER_UNIQUE_KEY
        ? values.customizeWinner
        : values.winner;
    let loser =
      values.loser === NEW_PLAYER_UNIQUE_KEY
        ? values.customizeLoser
        : values.loser;
    console.log({ loser, winner });
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <div>
      <h1>Submit Match</h1>
      <Form {...layout} form={form} name="control-hooks" onFinish={onSubmit}>
        <Form.Item
          name="winner"
          label="Winner"
          rules={[{ required: true, message: "Please input the winner!" }]}
        >
          <PlayerDropdown
            leaderboard={leaderboard}
            placeholder={"Winner"}
            onChange={onPlayerChange(MatchRole.Winner)}
          />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.winner !== currentValues.winner
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("winner") === NEW_PLAYER_UNIQUE_KEY ? (
              <Form.Item
                name="customizeWinner"
                label="Add New Player"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            ) : null
          }
        </Form.Item>
        <Form.Item
          name="loser"
          label="Loser"
          rules={[{ required: true, message: "Please input the loser!" }]}
        >
          <PlayerDropdown
            leaderboard={leaderboard}
            placeholder={"Loser"}
            onChange={onPlayerChange(MatchRole.Loser)}
          />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.loser !== currentValues.loser
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("loser") === NEW_PLAYER_UNIQUE_KEY ? (
              <Form.Item
                name="customizeLoser"
                label="Add New Player"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            ) : null
          }
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button
            type="primary"
            htmlType="submit"
            style={{ marginRight: "8px" }}
          >
            Submit
          </Button>
          <Button htmlType="button" onClick={onReset}>
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
};

const PlayerDropdown: React.FC<PlayerDropdownProps> = (props) => {
  return (
    <Select
      placeholder={props.placeholder}
      onChange={props.onChange}
      allowClear
    >
      {props.leaderboard?.map(({ name }) => (
        <Select.Option key={name} value={name}>
          {name}
        </Select.Option>
      ))}
      <Select.Option value={NEW_PLAYER_UNIQUE_KEY}>
        Add New Player
      </Select.Option>
    </Select>
  );
};

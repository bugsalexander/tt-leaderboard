import React, {useState} from "react";
import {KeyedMutator} from "swr";
import {Alert, Button, Form, Input, notification} from "antd";
import {Leaderboard, UserScore} from "../common/types";
import {AxiosResponse} from "axios";
import {createPlayer} from "../common/client";
import {getElo} from "./SubmitMatch";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

type AddPlayerProps = {
  mutate: KeyedMutator<AxiosResponse<Leaderboard, any>>;
  leaderboard: UserScore[] | undefined;
}

export const AddPlayer: React.FC<AddPlayerProps> = ({ mutate, leaderboard }) => {
  const [error, setError] = useState<React.FC | null>(null);
  const [form] = Form.useForm();
  const onSubmit = async (values: any) => {
    const name = values.name;
    console.log(name);
    const response = await createPlayer(name);
    const data = response.data;
    if (typeof data === "string") {
      setError(() => (
        <Alert className="error" message={data} type="error" showIcon />
      ));
    } else {
      const responseTyped = response as AxiosResponse<Leaderboard>
      notification.success({
        message: (<>Added player <b>{name}</b></>),
        description: (<>Added player with starting ELO: {getElo(responseTyped.data.leaderboard, name)}</>),
        placement: "bottomRight",
        duration: 30,
      });
      await mutate(responseTyped);
      onReset();
    }
  }
  const onReset = () => {
    form.resetFields();
    setError(null);
  }
  return <div className="add-player">
    <h1>Add Player</h1>
    <Form {...layout} form={form} onFinish={onSubmit}>
      <Form.Item name="name" label="Player Name"
                 rules={[{ required: true, message: "Please input the name of the player to add!" }]}>
        <Input className="player-name-input" placeholder="FlyingHippo2" />
      </Form.Item>
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
}

/*
<h1>Add Player</h1>
        <Input></Input>
        <Button>Add Player</Button>
 */
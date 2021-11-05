import { Breadcrumb, Layout, Menu } from "antd";
import React from "react";
import { Page } from "../common/types";

type PageLayoutProps = {
};

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
}) => {
  return (
    <Layout className="layout">
      <Layout.Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={[Page.Leaderboard]}>
          <Menu.Item key={Page.Leaderboard}>Leaderboard</Menu.Item>
        </Menu>
      </Layout.Header>
      <Layout.Content style={{ padding: "0 50px" }}>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>Leaderboard</Breadcrumb.Item>
          {/*<Breadcrumb.Item>List</Breadcrumb.Item>*/}
          {/*<Breadcrumb.Item>App</Breadcrumb.Item>*/}
        </Breadcrumb>
        <div className="site-layout-content">{children}</div>
      </Layout.Content>
      <Layout.Footer style={{ textAlign: "center" }}>
        {`Chris' Party House ©2021`}
      </Layout.Footer>
    </Layout>
  );
};

import axios, { AxiosResponse } from "axios";
import { Leaderboard } from "./types";

const baseURL = "https://tt-leaderboard.takayamasan.dev";

export const getLeaderboard = async (): Promise<AxiosResponse<Leaderboard>> => {
  return axios.get("/api", { baseURL });
};

export const createPlayer = async (
  name: string
): Promise<AxiosResponse<Leaderboard>> => {
  return axios.post("/api", name, { baseURL });
};

export const submitMatch = async (
  winner: string,
  loser: string
): Promise<AxiosResponse<Leaderboard>> => {
  return axios.put("/api", { winner, loser }, { baseURL });
};

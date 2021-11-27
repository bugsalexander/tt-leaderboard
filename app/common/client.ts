import axios, { AxiosResponse } from "axios";
import { Leaderboard } from "./types";

const baseURL = "https://tt-leaderboard.takayamasan.dev";

export const getLeaderboard = async (): Promise<AxiosResponse<Leaderboard>> => {
  return axios.get("/api", { baseURL });
};

export const createPlayer = async (
  name: string
): Promise<AxiosResponse<Leaderboard | string>> => {
  // have to JSON.stringify because base strings don't get quotes added to them
  // this is because we parse all request bodies as JSON on the backend
  return axios.post("/api", JSON.stringify(name), { baseURL, validateStatus: () => true });
};

export const submitMatch = async (
  winner: string,
  loser: string
): Promise<AxiosResponse<Leaderboard | string>> => {
  // include validate status so that we don't throw on 4xx
  return axios.put("/api", { winner, loser }, { baseURL, validateStatus: () => true });
};

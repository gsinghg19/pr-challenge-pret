import axios, { type AxiosResponse } from "axios";
import type { RequestHandler } from "express";
import { EXTERNAL_FRIENDS_SERVICE_BASE_URL } from "./external-friends-service/constants.js";
import getFriendsRecursively from "./src/utils/getFriendsRecursively.js";
import type { Friend, VisitedFriends } from "./types.js";


export const friendsRoute: RequestHandler = async (req, res) => {
  const { userId } = req.query;

  if (typeof userId !== "string") {
    return res.status(400).json({ error: 'Invalid userId' });
  }


  const friendsResponse = await axios.get<Friend[]>(
    `${EXTERNAL_FRIENDS_SERVICE_BASE_URL}/external-friends-service?userId=${userId}`
  );

  const visitedFriends: VisitedFriends = new Set<string>([userId]);
  const friendsTree = await getFriendsRecursively(friendsResponse.data, visitedFriends);
  return res.json(friendsTree);
};
import axios, { type AxiosResponse } from "axios";
import type { RequestHandler } from "express";
import { EXTERNAL_FRIENDS_SERVICE_BASE_URL } from "../../external-friends-service/constants.js";

export const friendsRoute: RequestHandler = async (req, res) => {
  const { userId } = req.query;

  if (typeof userId !== "string") {
    return res.status(400);
  }

  const friends = (await axios.get(
    `${EXTERNAL_FRIENDS_SERVICE_BASE_URL}/external-friends-service?userId=${userId}`
  )) as AxiosResponse<{ id: string; name: string }[]>;

  const visitedFriends = new Set<string>([userId]);

  const getFriendsRecursively = async (
    listOfFriends: { id: string; name: string }[]
  ) => {
    type FriendsTreeNode = {
      id: string;
      name: string;
      friends: FriendsTreeNode[];
    };

    let friendsTree = [];

    for (let friend of listOfFriends) {
      if (visitedFriends.has(friend.id)) {
        continue;
      }
      visitedFriends.add(friend.id);

      const friends = (
        await axios.get(
          `${EXTERNAL_FRIENDS_SERVICE_BASE_URL}/external-friends-service?userId=${friend.id}`
        )
      ).data as unknown;

      const friendNode: FriendsTreeNode = {
        id: friend.id,
        name: friend.name,
        // @ts-ignore
        friends: await getFriendsRecursively(await friends),
      };

      friendsTree.push(friendNode);
    }

    return friendsTree;
  };

  const friendsTree = await getFriendsRecursively(friends.data);

  return res.json(friendsTree);
};

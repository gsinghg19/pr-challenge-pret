/*
TODO: Discuss points on: 
-Type Safety '@ts-ignore' and 'unknown' defeat use of typescript. 
-Check recursion logic; Are repeated network calls being made? If so either batch them or cache them or maybe add some sort of depth limit.
 **Dont think pagiantion is gonna help here as the external friends route isnt set up for pagination in the route.**
 - Check variable names; using 'friend' alot. Be more descriptive in naming(e.g., friendList, friendNode, friendTree) would make the code easier to follow.
*/



import axios, { type AxiosResponse } from "axios";
import type { RequestHandler } from "express";
import { EXTERNAL_FRIENDS_SERVICE_BASE_URL } from "../../external-friends-service/constants.js";

export const friendsRoute: RequestHandler = async (req, res) => {
  const { userId } = req.query;

  if (typeof userId !== "string") {
     //[1] - NOTE: The repsonse gives the http code which is good, but it does not give a respose message to end the response; 
     //do something like: ```return res.status(400).json({ error: 'Invalid user ID' });```
    return res.status(400);
  }


  // [2] - NOTE: The Axios reponse is not taking into consideration any error handling. We dont catch any errors here.
  // We could either refactor the friends const to use a try/catch or a try/catch/final block,
  // then return a response http code of 500 and a response message detailing the error. 
  // OR
  // (The better and cleaner option) We could create an error handler middleware code, call that in the index.ts file,
  // and then call the next() like next(errorHandler), to call error handler (). Add next() as arg in the friendsRoute() args. 
  const friends = (await axios.get(
    `${EXTERNAL_FRIENDS_SERVICE_BASE_URL}/external-friends-service?userId=${userId}`
  )) as AxiosResponse<{ id: string; name: string }[]>;

  const visitedFriends = new Set<string>([userId]);

  // [4] - NOTE: Add the recursive 'getFriendsRecursively' logic into its own helper function and then import to use here. 
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

      //[3] - NOTE: Avoid using the 'ts-ignore' line, think about what interface for types we can add and use. 
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

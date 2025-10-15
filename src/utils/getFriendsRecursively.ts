import axios from "axios";
import { EXTERNAL_FRIENDS_SERVICE_BASE_URL } from "../../external-friends-service/constants.js";
import type { Friend, FriendsTreeNode, VisitedFriends } from "../../types.js";

const getFriendsRecursively = async (
  listOfFriends: Friend[],
  visitedFriends: VisitedFriends
): Promise<FriendsTreeNode[]> => {
  const friendsTree: FriendsTreeNode[] = [];

  for (const friend of listOfFriends) {
    if (visitedFriends.has(friend.id)) {
      continue;
    }
    visitedFriends.add(friend.id);

    try {
      const response = await axios.get<Friend[]>(
        `${EXTERNAL_FRIENDS_SERVICE_BASE_URL}/external-friends-service?userId=${friend.id}`
      );

      const friendNode: FriendsTreeNode = {
        id: friend.id,
        name: friend.name,
        friends: [],
      };
      friendsTree.push(friendNode);
    } catch (error) {
      // TODO: Add proper error handling middleware so errors bubble up.
      console.error(`Failed to fetch friends for user ${friend.id}:`, error);
      friendsTree.push({
        id: friend.id,
        name: friend.name,
        friends: [],
      });
    }
  }
  return friendsTree;
};

export default getFriendsRecursively;
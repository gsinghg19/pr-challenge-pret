  export interface Friend {
    id: string;
    name: string
  };

  export interface FriendsTreeNode extends Friend {
    friends: FriendsTreeNode[];
  };

  export type VisitedFriends = Set<string>;
  
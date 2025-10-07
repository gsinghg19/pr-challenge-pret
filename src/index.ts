import express from "express";
import { externalFriendsServiceRoute } from "../external-friends-service/external-friends-service.route.js";
import { friendsRoute } from "./routes/friends.route.js";

const app = express();

/**
 * Review this route handler
 */
app.get("/friends", friendsRoute);

/**
 * Ignore this for the purposes of the challenge.
 * Assume it exists on another server and cannot be changed.
 */
app.get("/external-friends-service", externalFriendsServiceRoute);

/* 
Note: example of where to put the error handler middleware. 
Note: register last: all thrown or next()’d errors will end up here

app.use(errorhandler)
*/
app.listen(3000);
console.log("Running at http://localhost:3000");

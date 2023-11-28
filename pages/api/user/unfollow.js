import { db } from "../../../utils/db/firebase-admin";
import { Firestore } from "firebase-admin/firestore";

/** [POST] Unfollow user by id
 * req.body requires:
 * @param id user to unfollow
 * @param currentUserId
 * @returns user
 */
export default async function followUserHandler(req, res) {
  try {
    const { id, currentUserId } = req.body;
    if (!id || !currentUserId) {
      res.status(500).json({ message: "Empty user id" });
    } else {
      // remove from [id] user followers
      await db.doc(`users/${id}`).update({
        followers: Firestore.FieldValue.arrayRemove(currentUserId),
      });

      // remove from current user following
      await db.doc(`users/${currentUserId}`).update({
        following: Firestore.FieldValue.arrayRemove(id),
      });

      res.status(200).json({ message: "Success" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}

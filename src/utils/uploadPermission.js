import { query } from "./database.js";
import { AppError } from "../middlewares/appError.js";

export async function checkMediaUploadPermission(userId, mediaType, targetId) {
  switch (mediaType) {
    case "EVENT": {
      const [row] = await query(
        `SELECT created_by 
         FROM tbl_event 
         WHERE event_id = ? 
           AND event_status = '1'`,
        [targetId]
      );
      if (!row || row.created_by !== userId) {
        throw new AppError("You are not allowed to upload media to this event", 403);
      }
      break;
    }

    case "SHARED_ALBUM": {
      const [access] = await query(
        `SELECT sa.shared_album_id
         FROM tbl_shared_album sa
         LEFT JOIN tbl_shared_albm_user sau
           ON sa.shared_album_id = sau.shared_albm_id
         WHERE sa.shared_album_id = ?
           AND sa.shared_album_status = '1'
           AND (
             sa.created_by = ? OR
             (sau.shared_albm_user_user_id = ? AND sau.shared_albm_user_status = '1')
           )`,
        [targetId, userId, userId]
      );
      if (!access) {
        throw new AppError("You are not allowed to upload media to this album", 403);
      }
      break;
    }

    case "MY_ALBUM": {
      const [row] = await query(
        `SELECT created_by 
         FROM tbl_my_album 
         WHERE my_album_id = ? 
           AND my_album_status = '1'`,
        [targetId]
      );
      if (!row || row.created_by !== userId) {
        throw new AppError("You are not allowed to upload media to this album", 403);
      }
      break;
    }

    default:
      throw new AppError("Invalid media type", 400);
  }
}


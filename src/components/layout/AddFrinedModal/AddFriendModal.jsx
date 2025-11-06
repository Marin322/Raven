import styles from "../../../styles/components/layout/AddFriendModal/AddFrinedModal.module.css";
import { motion } from "framer-motion";
const AddFriendModal = ({ onClick }) => {
  return (
    <div className={styles["addFriend-window-container"]}>
      <motion.div
        className={styles["addFriend-window"]}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.5 }}
      ></motion.div>
    </div>
  );
};

export default AddFriendModal;

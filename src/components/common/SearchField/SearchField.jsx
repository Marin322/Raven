import styles from "../../../styles/components/common/SearchField/SearchField.module.css";

const SearchField = ({ value, onChange, placeholder = "Поиск..."}) => {
  return (
    <div className={styles["search-field"]}>
      <div className={styles["search-input-container"]}>
        <span className={styles["search-icon"]}></span>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          className={styles["search-input"]}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default SearchField;

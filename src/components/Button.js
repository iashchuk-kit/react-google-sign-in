import React from "react";
import PropTypes from "prop-types";

import styles from "../styles/Button.module.css";

const Button = ({ text, onSign }) => {
  return (
    <button className={styles.button} onClick={onSign}>
      {text}
    </button>
  );
};

Button.propTypes = {
  text: PropTypes.string.isRequired
};

Button.defaultProps = {
  text: "Google Sign In"
};

export default Button;

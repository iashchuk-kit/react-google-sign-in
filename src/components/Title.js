import React from "react";
import PropTypes from "prop-types";

import styles from "../styles/Title.module.css";

const Title = ({ text }) => {
  return <p className={styles.title}>{text}</p>;
};

Title.propTypes = {
  text: PropTypes.string.isRequired
};

Title.defaultProps = {
  text: "Google Sign In"
};

export default Title;

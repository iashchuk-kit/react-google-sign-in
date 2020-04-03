import React from "react";
import { string } from "prop-types";

import styles from "../styles/Title.module.css";

export const Title = ({ text }) => {
    return <p className={styles.title}>{text}</p>;
};

Title.propTypes = {
    text: string.isRequired
};

Title.defaultProps = {
    text: "Google Sign In / Gmail"
};

export default Title;

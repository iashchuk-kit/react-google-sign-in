import React from "react";
import { node, func } from "prop-types";
import styles from "../styles/Button.module.css";

export const Button = ({ children, onClick }) => {
    return (
        <button className={styles.button} onClick={onClick}>
            {children}
        </button>
    );
};

Button.propTypes = {
    children: node.isRequired,
    onClick: func.isRequired
};

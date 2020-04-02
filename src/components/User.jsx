import React from "react";
import { string } from "prop-types";

export const User = ({ name, imgUrl }) => {
    return (
        <>
            <p>Привет, {name}!</p>
            <img src={imgUrl} alt="profle" />
        </>
    );
};

User.propTypes = {
    name: string.isRequired,
    imgUrl: string.isRequired
};

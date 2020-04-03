import React from "react";
import { string } from "prop-types";

export const User = ({ name, surname, imgUrl }) => {
    return (
        <>
            <p>
                Привет, {name} {surname}!
            </p>
            <img src={imgUrl} alt="profle" />
        </>
    );
};

User.propTypes = {
    name: string.isRequired,
    surname: string,
    imgUrl: string.isRequired
};

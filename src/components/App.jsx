import React, { useEffect, useCallback } from "react";
import { useSetState } from "react-use";
import { User } from "./User";
import { Title } from "./Title";
import { Button } from "./Button";
import styles from "../styles/App.module.css";

const initialState = {
    id: null,
    name: "",
    surname: "",
    imgUrl: null,
    value: ""
};

const gmailScope = [
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.readonly"
];

const App = () => {
    const [state, setState] = useSetState(initialState);
    const isAuthorized = Boolean(state.id);

    const createGoogleApi = () => {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        document.body.appendChild(script);
        return script;
    };

    const authorize = useCallback(async () => {
        const onSuccess = auth2 => {
            console.log("Auth Init OK");

            if (auth2.isSignedIn.get()) {
                const token = localStorage.getItem("token");
                const profile = auth2.currentUser.get().getBasicProfile();

                setState({
                    id: profile.getId(),
                    name: profile.getGivenName(),
                    surname: profile.getFamilyName(),
                    imgUrl: profile.getImageUrl(),
                    token
                });
            }
        };
        const onError = error => {
            console.log("Auth Error", error);
        };

        window.gapi.load("client:auth2", () => {
            window.gapi.auth2
                .init({
                    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID
                })
                .then(onSuccess, onError);
        });
    }, [setState]);

    useEffect(() => {
        const apiScript = createGoogleApi();
        apiScript.onload = authorize;
    }, [authorize]);

    const sendMail = () => {
        const base64EncodedEmail = "id93555@mail.ru";

        const onSuccess = response => {
            console.log("Response", response);
        };

        const onError = error => {
            console.error("Execute error", error);
        };

        window.gapi.client.gmail.users.messages
            .send({
                userId: state.id,
                raw: btoa(
                    "From:Vitalii\r\nTo:" +
                        base64EncodedEmail +
                        "\r\nSubject:" +
                        "Hello form subject" +
                        "\r\n\r\n" +
                        "message"
                )
            })
            .then(onSuccess, onError);
    };

    const loadGmailClient = () => {
        if (window.gapi.client) {
            const onSuccess = () => {
                console.log("GAPI client loaded for API");
            };

            const onError = error => {
                console.error("Execute error", error);
            };

            return window.gapi.client.load("gmail", "v1").then(onSuccess, onError);
        }
    };

    const onSignIn = () => {
        const GoogleAuth = window.gapi.auth2.getAuthInstance();
        const scope = gmailScope.join(" ");

        const onSuccess = googleUser => {
            loadGmailClient();

            const profile = googleUser.getBasicProfile();
            const token = googleUser.getAuthResponse().id_token;

            localStorage.setItem("token", token);

            setState({
                id: profile.getId(),
                name: profile.getName(),
                imgUrl: profile.getImageUrl(),
                token
            });
            console.log("SignIn successful");
        };

        const onError = () => {
            console.error("SignIn Error");
        };

        GoogleAuth.signIn({ scope }).then(onSuccess, onError);
    };

    const onSignOut = () => {
        const GoogleAuth = window.gapi.auth2.getAuthInstance();

        const onSuccess = () => {
            setState(initialState);
        };

        const onError = () => {
            console.error("Sign Out Error");
        };

        GoogleAuth.signOut().then(onSuccess, onError);
    };

    return (
        <div className={styles.app}>
            <header className={styles.header}>
                <Title />
                {isAuthorized ? (
                    <>
                        <User name={state.name} imgUrl={state.imgUrl} />
                        <Button onClick={onSignOut}>Log out</Button>
                        <Button onClick={sendMail}>Send e-mail</Button>
                    </>
                ) : (
                    <Button onClick={onSignIn}>Log in</Button>
                )}
            </header>
        </div>
    );
};

export default App;

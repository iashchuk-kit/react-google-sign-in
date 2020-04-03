// @ts-check

import React, { useState, useEffect, useCallback } from "react";
import { useSetState } from "react-use";
import ReactQuill from "react-quill";
import { Form, Input, Button } from "antd";
import { User } from "./User";
import { Title } from "./Title";

import styles from "../styles/App.module.css";
import "react-quill/dist/quill.snow.css";

const initialState = {
    id: null,
    name: "",
    surname: "",
    imgUrl: null
};

const gmailScope = [
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.readonly"
];

const App = () => {
    const [profile, setProfile] = useSetState(initialState);
    const [form] = Form.useForm();
    const [message, setMessage] = useState("");
    const [successSent, setSuccessSent] = useState(false);
    const isAuthorized = Boolean(profile.id);

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
                loadGmailClient();
                const token = localStorage.getItem("token");
                const userProfile = auth2.currentUser.get().getBasicProfile();

                setProfile({
                    id: userProfile.getId(),
                    name: userProfile.getGivenName(),
                    surname: userProfile.getFamilyName(),
                    imgUrl: userProfile.getImageUrl(),
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
    }, [setProfile]);

    useEffect(() => {
        const apiScript = createGoogleApi();
        apiScript.onload = authorize;
    }, [authorize]);

    const encodeEmail = (from, to, subject, content) => {
        const str = [
            'Content-Type: text/html; charset="UTF-8"\r\n',
            "to: ",
            to,
            "\r\n",
            "from: ",
            from,
            "\r\n",
            "subject: ",
            subject,
            "\r\n\r\n",
            message
        ].join("");

        return new Buffer(str)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
    };

    const sendMail = ({ email }) => {
        const onSuccess = response => {
            console.log("Response", response);
            setMessage("");
            form.resetFields();
            setSuccessSent(true);

            setTimeout(() => {
                setSuccessSent(false);
            }, 2500);
        };

        const onError = error => {
            console.error("Execute error", error);
        };

        window.gapi.client.gmail.users.messages
            .send({
                userId: profile.id,
                resource: {
                    raw: encodeEmail("Vitalii", email, "Hello form subject", message)
                }
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

            const userProfile = googleUser.getBasicProfile();
            const token = googleUser.getAuthResponse().id_token;

            localStorage.setItem("token", token);

            setProfile({
                id: userProfile.getId(),
                name: userProfile.getName(),
                imgUrl: userProfile.getImageUrl(),
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
            setProfile(initialState);
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
                        <User
                            name={profile.name}
                            surname={profile.surname}
                            imgUrl={profile.imgUrl}
                        />
                        <div className={styles.buttons}>
                            <Button className={styles.logout} type="primary" onClick={onSignOut}>
                                Log out
                            </Button>
                        </div>
                        <Form className={styles.form} form={form} onFinish={sendMail}>
                            <div className={styles.block}>
                                <Button className={styles.submit} type="primary" htmlType="submit">
                                    Send e-mail
                                </Button>
                                {successSent && (
                                    <span className={styles.success}>Message sent successed!</span>
                                )}
                            </div>

                            <Form.Item
                                className={styles.field}
                                name="email"
                                rules={[
                                    { type: "email", message: "Email is not valid" },
                                    { required: true, message: "Please input email" }
                                ]}
                            >
                                <Input className={styles.input} placeholder={"Send email to"} />
                            </Form.Item>

                            <ReactQuill
                                className={styles.quill}
                                theme="snow"
                                value={message}
                                onChange={value => setMessage(value)}
                            />
                        </Form>
                    </>
                ) : (
                    <Button className={styles.login} type="primary" onClick={onSignIn}>
                        Log in
                    </Button>
                )}
            </header>
        </div>
    );
};

export default App;

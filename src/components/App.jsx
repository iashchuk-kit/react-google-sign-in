// @ts-check

import React, { useState, useEffect, useCallback } from "react";
import { useSetState } from "react-use";
import ReactQuill from "react-quill";
import { Form, Input, Checkbox, Button } from "antd";
import { User } from "./User";
import { Title } from "./Title";

import styles from "../styles/App.module.css";
import "react-quill/dist/quill.snow.css";

const initialState = {
    id: null,
    name: "",
    surname: "",
    fullname: "",
    email: "",
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
    const [isDraft, setDraft] = useState(true);
    const [isRedirect, setRedirect] = useState(false);
    const [isSelectAccount, setSelectAccount] = useState(true);
    const isAuthorized = Boolean(profile.id);

    const createGoogleApi = () => {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        document.body.appendChild(script);
        return script;
    };

    const authorize = useCallback(async () => {
        const onSuccess = auth2 => {
            console.log("Auth Init OK", auth2);

            if (auth2.isSignedIn.get()) {
                loadGmailClient();
                const token = localStorage.getItem("token");
                const userProfile = auth2.currentUser.get().getBasicProfile();

                setProfile({
                    id: userProfile.getId(),
                    name: userProfile.getGivenName(),
                    surname: userProfile.getFamilyName(),
                    fullname: userProfile.getName(),
                    imgUrl: userProfile.getImageUrl(),
                    email: userProfile.getEmail(),
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
        const options = new window.gapi.auth2.SigninOptionsBuilder();
        options.setScope(gmailScope.join(" "));

        if (isSelectAccount) {
            options.setPrompt("select_account");
        }

        const onSuccess = googleUser => {
            loadGmailClient();

            const userProfile = googleUser.getBasicProfile();
            const token = googleUser.getAuthResponse().id_token;

            localStorage.setItem("token", token);

            setProfile({
                id: userProfile.getId(),
                name: userProfile.getName(),
                surname: userProfile.getFamilyName(),
                fullname: userProfile.getName(),
                imgUrl: userProfile.getImageUrl(),
                email: userProfile.getEmail(),
                token
            });
            console.log("SignIn successful");
        };

        const onError = () => {
            console.error("SignIn Error");
        };

        GoogleAuth.signIn(options).then(onSuccess, onError);
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

    const encodeEmail = (to, subject, content) => {
        const str = [
            'Content-Type: text/html; charset="UTF-8"\r\n',
            "to: ",
            to,
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

    const handleSuccessSent = response => {
        console.log("Response", response);
        setMessage("");
        form.resetFields();
        setSuccessSent(true);

        setTimeout(() => {
            setSuccessSent(false);
        }, 2500);
    };

    const redirectToGmailDrafts = threadId => {
        window.open(`https://mail.google.com/mail/u/0/#drafts/${threadId}`);
    };

    const redirectToGmailSent = threadId => {
        window.open(`https://mail.google.com/mail/u/0/#sent/${threadId}`);
    };

    const sendMail = ({ email, subject }) => {
        const onSuccess = response => {
            handleSuccessSent(response);
            if (isRedirect) {
                redirectToGmailSent(response.result.threadId);
            }
        };

        const onError = error => {
            console.error("Execute error", error);
        };

        window.gapi.client.gmail.users.messages
            .send({
                userId: profile.id,
                resource: {
                    raw: encodeEmail(email, subject, message)
                }
            })
            .then(onSuccess, onError);
    };

    const sendDraft = ({ email, subject }) => {
        const onSuccess = response => {
            handleSuccessSent(response);
            if (isRedirect) {
                redirectToGmailDrafts(response.result.message.threadId);
            }
        };

        const onError = error => {
            console.error("Execute error", error);
        };

        window.gapi.client.gmail.users.drafts
            .create({
                userId: profile.id,
                message: {
                    raw: encodeEmail(email, subject, message)
                }
            })
            .then(onSuccess, onError);
    };

    const onSubmit = isDraft ? sendDraft : sendMail;

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
                        <Form className={styles.form} form={form} onFinish={onSubmit}>
                            <div className={styles.block}>
                                <Button className={styles.submit} type="primary" htmlType="submit">
                                    {isDraft ? "Save draft" : "Send e-mail"}
                                </Button>
                                {successSent && (
                                    <span className={styles.success}>Message sent successed!</span>
                                )}

                                <Checkbox
                                    className={styles.checkbox}
                                    checked={isDraft}
                                    onChange={evt => setDraft(evt.target.checked)}
                                >
                                    Draft
                                </Checkbox>
                                <Checkbox
                                    className={styles.checkbox}
                                    checked={isRedirect}
                                    onChange={evt => setRedirect(evt.target.checked)}
                                >
                                    Redirect to Gmail
                                </Checkbox>
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
                            <Form.Item
                                className={styles.field}
                                name="subject"
                                rules={[{ required: true, message: "Please input subject" }]}
                            >
                                <Input className={styles.input} placeholder={"Subject"} />
                            </Form.Item>

                            <ReactQuill
                                className={styles.quill}
                                theme="snow"
                                value={message}
                                onChange={value => setMessage(value)}
                            />
                            <div className={styles.warning}>
                                {isDraft && !successSent ? (
                                    <span className={styles.info}>
                                        {`Draft will be saved in ${profile.email}`}
                                    </span>
                                ) : (
                                    <span className={styles.info}>
                                        {`Message will be sended from ${profile.email}`}
                                    </span>
                                )}
                            </div>
                        </Form>
                    </>
                ) : (
                    <div className={styles.block}>
                        <Button className={styles.login} type="primary" onClick={onSignIn}>
                            Log in
                        </Button>
                        <Checkbox
                            className={styles.checkbox}
                            checked={isSelectAccount}
                            onChange={evt => setSelectAccount(evt.target.checked)}
                        >
                            Select account
                        </Checkbox>
                    </div>
                )}
            </header>
        </div>
    );
};

export default App;

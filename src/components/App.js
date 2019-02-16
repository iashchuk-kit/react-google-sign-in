import React, { Component } from "react";
import User from "./User";
import Title from "./Title";
import Button from "./Button";

import styles from "../styles/App.module.css";

class App extends Component {
  state = {
    name: null,
    imgUrl: null
  };

  componentDidMount() {
    const _onInit = auth2 => {
      console.log("Auth Init OK", auth2);
    };
    const _onError = err => {
      console.log("Auth Error", err);
    };

    window.gapi.load("auth2", () => {
      window.gapi.auth2
        .init({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID
        })
        .then(_onInit, _onError);
    });
  }

  signIn = () => {
    const GoogleAuth = window.gapi.auth2.getAuthInstance();

    GoogleAuth.signIn().then(
      googleUser => {
        const profile = googleUser.getBasicProfile();
        this.setState({
          name: profile.getName(),
          imgUrl: profile.getImageUrl()
        });
      },
      () => console.log("Sign In Error")
    );
  };

  signOut = () => {
    const GoogleAuth = window.gapi.auth2.getAuthInstance();
    GoogleAuth.signOut().then(
      () => {
        this.setState({
          name: null,
          imgUrl: null
        });
      },
      () => console.log("Sign Out Error")
    );
  };

  render() {
    const { name, imgUrl } = this.state;
    const isAuthorized = Boolean(name);
    return (
      <div className={styles.app}>
        <header className={styles.header}>
          <Title />
          {!isAuthorized && <Button text="Log in" onSign={this.signIn} />}
          {isAuthorized && <User name={name} imgUrl={imgUrl} />}
          {isAuthorized && <Button text="Log out" onSign={this.signOut} />}
        </header>
      </div>
    );
  }
}

export default App;

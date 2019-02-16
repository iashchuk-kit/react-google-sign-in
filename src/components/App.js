import React, { Component } from "react";
import Title from "./Title";
import Button from "./Button";

import styles from "../styles/App.module.css";

class App extends Component {
  render() {
    return (
      <div className={styles.app}>
        <header className={styles.header}>
          <Title />
          <Button text="Log in" />
        </header>
      </div>
    );
  }
}

export default App;

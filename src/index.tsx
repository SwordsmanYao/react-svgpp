/**
 * @class ExampleComponent
 */

import * as React from 'react';

import styles from './styles.css';

export interface IProps {
  text: string;
}

export default function ExampleComponent(props: IProps) {
  const { text } = props;

  return <div className={styles.test}>Example Component: {text}</div>;
}

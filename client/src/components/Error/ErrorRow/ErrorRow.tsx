import React from 'react';
import styles from './styles/ErrorRow.module.css';
export interface ErrorRowInterface {
  message: string;
  param: string;
}

const ErrorRow: React.FC<ErrorRowInterface> = ({ message, param }) => {
  return (
    <li className={styles.errorrow}>
      <div className={styles.element}>
        <span className={styles.span}>Message: </span> {message}
      </div>
      <div className={styles.element}>
        <span className={styles.span}>Param: </span> {param}
      </div>
    </li>
  );
};

export default ErrorRow;

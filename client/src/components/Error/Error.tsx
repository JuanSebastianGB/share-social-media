import React from 'react';
import { ErrorRow } from './ErrorRow';
import styles from './styles/Error.module.css';
interface Error {
  value: string;
  msg: string;
  param: string;
}

export interface ErrorInterface {
  errorString?: string;
  errorList?: Error[];
}

const Error: React.FC<ErrorInterface> = ({ errorString, errorList }) => {
  if (errorString)
    return (
      <div className={styles.error}>
        <h4>{errorString}</h4>
      </div>
    );
  if (errorList)
    return (
      <div className={styles.error}>
        <ul className={styles.ul}>
          {errorList.map((single: Error, index: number) => (
            <ErrorRow message={single.msg} param={single.param} />
          ))}
        </ul>
      </div>
    );
  return <>Something went wrong</>;
};

export default Error;

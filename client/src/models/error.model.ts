interface Response {
  data: string;
  status: number;
  statusText: string;
}

export interface errorInterface {
  response: Response;
}

export const errorInitialState = {
  data: '',
  status: 0,
  statusText: '',
};

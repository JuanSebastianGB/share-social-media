interface Response {
  data: string;
  status: number;
  statusText: string;
}

export interface errorInterface {
  response: Response;
}

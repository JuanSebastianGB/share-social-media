export const loginAdapter = (data: any) => ({
  token: data.token,
  user: data.userFound,
});

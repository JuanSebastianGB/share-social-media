export const formatDate = (date: string) => {
  const resultDate = new Date(date).getDate();
  const month = new Date(date).getMonth() + 1;
  const year = new Date(date).getFullYear();
  const hours = new Date(date).getHours();
  const minutes = new Date(date).getMinutes();
  return `${resultDate} - ${month} - ${year} H: ${hours} ${minutes}`;
};

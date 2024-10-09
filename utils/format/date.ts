function formatMessageDate(date: string): string {
  {
  }

  let dateObj = new Date(date);
  let formattedDate = dateObj.toLocaleDateString();
  let formattedTime = dateObj.toLocaleTimeString();
  return `${formattedDate} ${formattedTime}`;
}

export { formatMessageDate };

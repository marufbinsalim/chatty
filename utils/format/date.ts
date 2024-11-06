function formatMessageDate(date: string): string {
  let dateObj = new Date(date);

  // Format the date
  let formattedDate = dateObj.toLocaleDateString();

  // Format the time without seconds
  let options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  let formattedTime = dateObj.toLocaleTimeString(undefined, options);

  return `${ formattedTime }`;
}

export { formatMessageDate };

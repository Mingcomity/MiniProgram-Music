const randomNum = (min: number, max: number): number => {
  const choices = max - min + 1;
  return Math.floor(Math.random() * choices + min);
}
export default randomNum
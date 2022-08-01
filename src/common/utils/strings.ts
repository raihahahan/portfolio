export function stringToBackTick(str: string, linkColor: string) {
  const actualString = new Function("linkColor", "return `" + str + "`");
  return actualString(linkColor);
}

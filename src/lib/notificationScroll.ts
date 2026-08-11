export function shouldMarkNotificationsRead({
  currentScrollY,
  previousScrollY,
  hasScrolledDown,
}: {
  currentScrollY: number;
  previousScrollY: number;
  hasScrolledDown: boolean;
}) {
  return hasScrolledDown && currentScrollY < previousScrollY;
}

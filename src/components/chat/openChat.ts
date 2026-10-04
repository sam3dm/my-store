/** Opens the chat panel from anywhere (header button, contact page). */
export const OPEN_CHAT_EVENT = 'mdm:open-chat';

export function openChat(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(OPEN_CHAT_EVENT));
}

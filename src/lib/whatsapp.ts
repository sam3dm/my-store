/**
 * WhatsApp utility for Metropolitan Digital Marketing.
 *
 * All project inquiry buttons across the site open a direct WhatsApp
 * conversation with the official company number.
 */

export const WHATSAPP_NUMBER = '971508221108';

/** Generic project inquiry message */
export const WA_MSG_GENERIC =
  'Hello Metropolitan Digital Marketing, I would like to discuss a new project and request information about your services.';

/**
 * Builds a wa.me URL with an optional pre-filled message.
 * The message is percent-encoded so it is safe in an href.
 */
export function waLink(message: string = WA_MSG_GENERIC): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Returns a service-specific WhatsApp inquiry link.
 * e.g. waServiceLink('3D Animation & CGI')
 */
export function waServiceLink(serviceName: string): string {
  const msg = `Hello Metropolitan Digital Marketing, I am interested in your ${serviceName} services. I would like to discuss a new project.`;
  return waLink(msg);
}

/**
 * Returns an industry-specific WhatsApp inquiry link.
 * e.g. waIndustryLink('Healthcare')
 */
export function waIndustryLink(industryName: string): string {
  const msg = `Hello Metropolitan Digital Marketing, I would like to discuss a project for the ${industryName} sector.`;
  return waLink(msg);
}

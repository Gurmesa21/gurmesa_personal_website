export function serializeJsonLd(data: any): string {
  return JSON.stringify(data).replace(/<\/script>/gi, '<\\/script>');
}

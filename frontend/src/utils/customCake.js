/** Session payload from `/custom-cake` → prefilled at checkout */
export const CUSTOM_CAKE_STORAGE_KEY = 'customCakeRequest';

export function loadCustomCakeRequest() {
  try {
    const raw = sessionStorage.getItem(CUSTOM_CAKE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCustomCakeRequest(data) {
  sessionStorage.setItem(CUSTOM_CAKE_STORAGE_KEY, JSON.stringify(data));
}

export function clearCustomCakeRequest() {
  sessionStorage.removeItem(CUSTOM_CAKE_STORAGE_KEY);
}

/** Readable block appended to order notes */
export function formatCustomCakeNotes(data) {
  if (!data || typeof data !== 'object') return '';
  const lines = [
    '[Custom cake — builder]',
    data.shape && `Shape / style: ${data.shape}`,
    data.tiers != null && data.tiers !== '' && `Tiers: ${data.tiers}`,
    data.servingWeight && `Serving size: ${data.servingWeight}`,
    data.flavour && `Flavour: ${data.flavour}`,
    data.customFlavour && `Custom flavour note: ${data.customFlavour}`,
    data.spongeType && `Sponge: ${data.spongeType}`,
    data.eggless != null && `Eggless: ${data.eggless ? 'Yes' : 'No'}`,
    data.frostingNote && `Frosting / colour: ${data.frostingNote}`,
    data.designTheme && `Design theme: ${data.designTheme}`,
    Array.isArray(data.toppings) &&
      data.toppings.length > 0 &&
      `Toppings: ${data.toppings.join(', ')}`,
    data.messageOnCake?.trim() &&
      `Message on cake: ${data.messageOnCake.trim()}`,
    data.candleRequired != null &&
      `Candles: ${data.candleRequired ? 'Yes' : 'No'}`,
    data.knifeIncluded != null &&
      `Cake knife: ${data.knifeIncluded ? 'Yes' : 'No'}`,
    data.lessSugar != null &&
      `Less sugar: ${data.lessSugar ? 'Yes' : 'No'}`,
    data.preferredDate && `Preferred ready-by: ${data.preferredDate}`,
    data.extraNotes && `Extra: ${data.extraNotes}`,
  ].filter(Boolean);
  return lines.join('\n');
}

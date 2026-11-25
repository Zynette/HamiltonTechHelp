// Fixed city endpoint: no visitor location or arbitrary upstream URL is accepted.
const endpoint =
  'https://api.weather.gc.ca/collections/citypageweather-realtime/items/on-77?f=json';
export function weatherKind(condition, hour) {
  if (/snow|flurr|ice pellet/i.test(condition)) return 'snow';
  if (/rain|drizzle|shower|thunder/i.test(condition)) return 'rain';
  if (/cloud|overcast|fog/i.test(condition)) return 'cloudy';
  return hour < 7 || hour >= 19 ? 'night' : 'sunny';
}
export function createWeatherService(fetcher = (...args) => fetch(...args), clock = Date.now) {
  let cached = null,
    expires = 0,
    pending = null;
  return async function weather() {
    if (clock() < expires) return cached;
    if (pending) return pending;
    pending = (async () => {
      try {
        const r = await fetcher(endpoint, { signal: AbortSignal.timeout(5000) });
        if (!r.ok) throw Error('weather unavailable');
        const p = (await r.json()).properties,
          c = p?.currentConditions;
        const observed = c?.timestamp?.en,
          condition = c?.condition?.en,
          temp = c?.temperature?.value?.en;
        if (
          p?.name?.en !== 'Hamilton' ||
          typeof condition !== 'string' ||
          !Number.isFinite(temp) ||
          !Number.isFinite(Date.parse(observed)) ||
          Math.abs(clock() - Date.parse(observed)) > 3 * 3600000
        )
          throw Error('stale weather');
        const hour = Number(
          new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Toronto',
            hour: '2-digit',
            hourCycle: 'h23',
          }).format(new Date(clock())),
        );
        cached = {
          city: 'Hamilton, Ontario',
          temperature: temp,
          condition: condition.slice(0, 100),
          kind: weatherKind(condition, hour),
          observed,
        };
        expires = clock() + 15 * 60000;
      } catch {
        cached = null;
        expires = clock() + 5 * 60000;
      } finally {
        pending = null;
      }
      return cached;
    })();
    return pending;
  };
}
export const getWeather = createWeatherService();

export default async function fetcher(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  let payload;

  try {
    payload = await response.json();
  } catch (error) {
    if (response.ok) {
      throw new Error(`Invalid JSON response (${response.status})`, { cause: error });
    }
  }

  if (!response.ok) {
    const message = payload?.error?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

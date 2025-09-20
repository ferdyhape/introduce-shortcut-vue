const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const postCallback = async (valueObj) => {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: API_KEY,
        value: valueObj,
      }),
    });
  } catch (err) {
    console.error("Callback error:", err);
  }
};

"use client";

export default function Error({ error, reset }) {
  return (
    <main>
      <h2>Something went wrong.</h2>

      <button onClick={() => reset()}>
        Try Again
      </button>
    </main>
  );
}
export type StrictTimestamp = {
  seconds: number;
  nanos: number;
};

export function createTimestamp(): StrictTimestamp {
  const now = new Date().getTime();

  const seconds = Math.floor(now / 1000);

  const nanos = (now - seconds * 1000) * 1000000;

  return {
    seconds,
    nanos,
  };
}

export function duration(
  start: StrictTimestamp,
  end: StrictTimestamp
): StrictTimestamp {
  return {
    seconds: end.seconds - start.seconds,
    nanos: end.nanos - start.nanos,
  };
}

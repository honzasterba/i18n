import { DateTime } from "../../index.d";

/**
 * Parse a given `date` string into a JavaScript Date object.
 * This function is time zone aware.
 *
 * The following string formats are recognized:
 *
 * ```
 * yyyy-mm-dd
 * yyyy-mm-dd[ T]hh:mm::ss
 * yyyy-mm-dd[ T]hh:mm::ss
 * yyyy-mm-dd[ T]hh:mm::ssZ
 * yyyy-mm-dd[ T]hh:mm::ss+0000
 * yyyy-mm-dd[ T]hh:mm::ss+00:00
 * yyyy-mm-dd[ T]hh:mm::ss.123Z
 * ```
 *
 * @example
 * ```js
 * i18n.parseDate("2019-12-09");
 * ```
 *
 * @param {DateTime} input The date string or number timestamp that must be
 *                         parsed into a Date object. If a Date object is
 *                         provided, then that's what it'll be returned.
 * @return {date}          The parsed date.
 */
export function parseDate(input: DateTime): Date {
  // we have a date, so just return it.
  if (input instanceof Date) {
    return input;
  }

  if (typeof input === "number") {
    // UNIX timestamp
    const date = new Date();
    date.setTime(input as unknown as number);
    return date;
  }

  const matches = new String(input).match(
    /(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2})(?:[.,](\d{1,3}))?)?(Z|\+00:?00)?/,
  );

  if (matches) {
    const parts = matches.slice(1, 8).map((match) => parseInt(match, 10) || 0);

    // month starts on 0
    parts[1] -= 1;

    const [year, month, day, hour, minute, second, milliseconds] = parts;
    const timezone = matches[8];

    if (timezone) {
      return new Date(
        Date.UTC(year, month, day, hour, minute, second, milliseconds),
      );
    } else {
      return new Date(year, month, day, hour, minute, second, milliseconds);
    }
  }

  if (
    input.match(
      /([A-Z][a-z]{2}) ([A-Z][a-z]{2}) (\d+) (\d+:\d+:\d+) ([+-]\d+) (\d+)/,
    )
  ) {
    // This format `Wed Jul 20 13:03:39 +0000 2011` is parsed by
    // webkit/firefox, but not by IE, so we must parse it manually.
    const date = new Date();
    date.setTime(
      Date.parse(
        [RegExp.$1, RegExp.$2, RegExp.$3, RegExp.$6, RegExp.$4, RegExp.$5].join(
          " ",
        ),
      ),
    );
  } else if (input.match(/\d+ \d+:\d+:\d+ [+-]\d+ \d+/)) {
    // a valid javascript format with timezone info
    const date = new Date();
    date.setTime(Date.parse(input));
    return date;
  }

  // an arbitrary javascript string
  const date = new Date();
  date.setTime(Date.parse(input));

  return date;
}

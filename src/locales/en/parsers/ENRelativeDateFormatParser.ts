import { DateTime } from "luxon";
import { ParsingContext } from "../../../chrono";
import { AbstractParserWithWordBoundaryChecking } from "../../../common/parsers/AbstractParserWithWordBoundary";
import { ParsingComponents } from "../../../results";
import { matchAnyPattern } from "../../../utils/pattern";
import { TimeUnits } from "../../../utils/timeunits";
import { TIME_UNIT_DICTIONARY } from "../constants";

const PATTERN = new RegExp(
  `(this|last|past|next|after\\s*this)\\s*(${matchAnyPattern(TIME_UNIT_DICTIONARY)})(?=\\s*)` +
    String.raw`(?=\W|$)`,
  "i"
);

const MODIFIER_WORD_GROUP = 1;
const RELATIVE_WORD_GROUP = 2;

export default class ENRelativeDateFormatParser extends AbstractParserWithWordBoundaryChecking {
  innerPattern(): RegExp {
    return PATTERN;
  }

  innerExtract(
    context: ParsingContext,
    match: RegExpMatchArray
  ): ParsingComponents {
    const modifier = match[MODIFIER_WORD_GROUP]!.toLowerCase();
    const unitWord = match[RELATIVE_WORD_GROUP]!.toLowerCase();
    const timeunit = TIME_UNIT_DICTIONARY[unitWord]!;

    if (modifier === "next" || modifier.startsWith("after")) {
      const timeUnits: TimeUnits = {};
      timeUnits[timeunit] = 1;
      return ParsingComponents.createRelativeFromReference(
        context.reference,
        timeUnits
      );
    }

    if (modifier === "last" || modifier === "past") {
      const timeUnits: TimeUnits = {};
      timeUnits[timeunit] = -1;
      return ParsingComponents.createRelativeFromReference(
        context.reference,
        timeUnits
      );
    }

    const components = context.createParsingComponents();
    let date = DateTime.fromJSDate(context.reference.instant, {
      zone: context.reference.zone,
    });

    // This week
    if (/week/i.test(unitWord)) {
      date = date.startOf("week", { useLocaleWeeks: true });
      components.imply("day", date.day);
      components.imply("month", date.month);
      components.imply("year", date.year);
    }

    // This month
    else if (/month/i.test(unitWord)) {
      date = date.startOf("month");
      components.imply("day", date.day);
      components.assign("year", date.year);
      components.assign("month", date.month);
    }

    // This year
    else if (/year/i.test(unitWord)) {
      date = date.startOf("year");

      components.imply("day", date.day);
      components.imply("month", date.month);
      components.assign("year", date.year);
    }

    return components;
  }
}

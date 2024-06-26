import { DateTime } from "luxon";
import { ParsingContext } from "../../../chrono";
import * as references from "../../../common/casualReferences";
import { AbstractParserWithWordBoundaryChecking } from "../../../common/parsers/AbstractParserWithWordBoundary";
import { ParsingComponents, ParsingResult } from "../../../results";
import { assignSimilarDate } from "../../../utils/luxon";

const PATTERN =
  /(now|today|tonight|tomorrow|tmr|tmrw|yesterday|last\s*night)(?=\W|$)/i;

export default class ENCasualDateParser extends AbstractParserWithWordBoundaryChecking {
  innerPattern(_: ParsingContext): RegExp {
    return PATTERN;
  }

  innerExtract(
    context: ParsingContext,
    match: RegExpMatchArray
  ): ParsingComponents | ParsingResult {
    let targetDate = DateTime.fromJSDate(context.reference.instant, {
      zone: context.reference.zone,
    });
    const lowerText = match[0].toLowerCase();
    let component = context.createParsingComponents();

    switch (lowerText) {
      case "now": {
        component = references.now(context.reference);
        break;
      }

      case "today": {
        component = references.today(context.reference);
        break;
      }

      case "yesterday": {
        component = references.yesterday(context.reference);
        break;
      }

      case "tomorrow":
      case "tmr":
      case "tmrw": {
        component = references.tomorrow(context.reference);
        break;
      }

      case "tonight": {
        component = references.tonight(context.reference);
        break;
      }

      default: {
        if (/last\s*night/.test(lowerText)) {
          if (targetDate.hour > 6) {
            targetDate = targetDate.plus({ day: -1 });
          }

          assignSimilarDate(component, targetDate);
          component.imply("hour", 0);
        }
        break;
      }
    }
    component.addTag("parser/ENCasualDateParser");
    return component;
  }
}

import { MergingRefiner } from "../../../common/abstractRefiners";
import {
  ParsingComponents,
  ParsingResult,
  ReferenceWithTimezone,
} from "../../../results";
import { reverseTimeUnits } from "../../../utils/timeunits";
import { parseTimeUnits } from "../constants";

function hasImpliedEarlierReferenceDate(result: ParsingResult): boolean {
  return /\s+(before|from)$/i.test(result.text);
}

function hasImpliedLaterReferenceDate(result: ParsingResult): boolean {
  return /\s+(after|since)$/i.test(result.text);
}

/**
 * Merges a relative data/time that follow by an absolute date.
 * - [2 weeks before] [2020-02-13]
 * - [2 days after] [next Friday]
 */
export default class ENMergeRelativeFollowByDateRefiner extends MergingRefiner {
  patternBetween(): RegExp {
    return /^\s*$/i;
  }

  shouldMergeResults(
    textBetween: string,
    currentResult: ParsingResult,
    nextResult: ParsingResult
  ): boolean {
    // Dates need to be next to each other to get merged
    if (!this.patternBetween().test(textBetween)) {
      return false;
    }

    // Check if any relative tokens were swallowed by the first date.
    // E.g. [<relative_date1> from] [<date2>]
    if (
      !hasImpliedEarlierReferenceDate(currentResult) &&
      !hasImpliedLaterReferenceDate(currentResult)
    ) {
      return false;
    }

    // make sure that <date2> implies an absolute date
    return (
      !!nextResult.start.get("day") &&
      !!nextResult.start.get("month") &&
      !!nextResult.start.get("year")
    );
  }

  mergeResults(
    textBetween: string,
    currentResult: ParsingResult,
    nextResult: ParsingResult
  ): ParsingResult {
    let timeUnits = parseTimeUnits(currentResult.text);
    if (hasImpliedEarlierReferenceDate(currentResult)) {
      timeUnits = reverseTimeUnits(timeUnits);
    }

    const components = ParsingComponents.createRelativeFromReference(
      new ReferenceWithTimezone(nextResult.start.date()),
      timeUnits
    );

    return new ParsingResult(
      nextResult.reference,
      currentResult.index,
      `${currentResult.text}${textBetween}${nextResult.text}`,
      components
    );
  }
}

import { TotalSurveyResults } from '..';
import { getCountrySurveyData } from './api';
import { reverseDateString } from './utils';

export const VALID_VALUES = ['Always', 'Frequently', 'Sometimes', 'Rarely', 'Not at all']

// query the survey data from the github repo
// and then compile results for each week for the given code (defaults to mask wearing)
export async function collateSurveyDataForCode(_country: string, code='i12_health_1') {
  const country = _country.split(' ').join('-').toLowerCase();
  try {
    const surveyData = await getCountrySurveyData(country);
    const results: TotalSurveyResults = {};
    for (const result of surveyData) {
      const dateString = reverseDateString(result.endtime.split(' ')[0])

      if (!results[dateString]) {
        console.log('did not have', dateString);
        results[dateString] = {
          always: 0,
          frequently: 0,
          sometimes: 0,
          rarely: 0,
          not_at_all: 0,
        }
      }

      const value = result[code].split(" ").join("_").toLowerCase();

      if (!results[dateString].hasOwnProperty(value)) {
        continue
      }

      results[dateString][value]++
    }
    return results;
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.error(`There was a problem getting survey data for ${_country}.`)
    // tslint:disable-next-line: no-console
    console.error(e);
    process.exit();
  }
}


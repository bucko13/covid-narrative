import { graphql } from 'gatsby';

export const europe2Fields = graphql`
  fragment europe2Fields on Europe2Json {
      location
      population
      data {
        date
        new_deaths_smoothed
        new_deaths_smoothed_per_million
        new_cases_smoothed_per_million
        new_cases_smoothed
        new_tests_smoothed
        new_tests_smoothed_per_thousand
        total_cases
        total_cases_per_million
        total_deaths
        total_deaths_per_million
      }
    }    
`

export const europe1Fields = graphql`
  fragment europe1Fields on Europe1Json {
      location
      population
      data {
        date
        new_deaths_smoothed
        new_deaths_smoothed_per_million
        new_cases_smoothed_per_million
        new_cases_smoothed
        new_tests_smoothed
        new_tests_smoothed_per_thousand
        total_cases
        total_cases_per_million
        total_deaths
        total_deaths_per_million
      }
    }    
`

export const northAmerica2Fields = graphql`
  fragment northAmerica2Fields on NorthAmerica2Json {
      location
      population
      data {
        date
        new_deaths_smoothed
        new_deaths_smoothed_per_million
        new_cases_smoothed_per_million
        new_cases_smoothed
        new_tests_smoothed
        new_tests_smoothed_per_thousand
        total_cases
        total_cases_per_million
        total_deaths
        total_deaths_per_million
      }
    }    
`

export const stateHistoricalFields = graphql`
  fragment stateHistoricalFields on StateHistoricalData {
    state
    code
    population
    data {
      positiveIncrease
      hospitalizedCurrently
      date
      death
      deathIncrease
      deathsIncreaseRollingAverage
    }
  }
`
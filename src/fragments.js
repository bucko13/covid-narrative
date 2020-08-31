import { graphql } from 'gatsby';

export const europe2Fields = graphql`
  fragment europe2Fields on Europe2Json {
      location
      population
      data {
        total_deaths
        date
        new_deaths_smoothed
        new_deaths_smoothed_per_million
        new_cases_smoothed_per_million
        new_tests_smoothed_per_thousand
        total_cases_per_million
        total_cases
      }
    }    
`

export const europe1Fields = graphql`
  fragment europe1Fields on Europe1Json {
      location
      population
      data {
        total_deaths
        date
        new_deaths_smoothed
        new_deaths_smoothed_per_million
        new_cases_smoothed_per_million
        new_tests_smoothed_per_thousand
        total_cases_per_million
        total_cases
      }
    }    
`

export const northAmerica2Fields = graphql`
  fragment northAmerica2Fields on NorthAmerica2Json {
      location
      population
      data {
        total_deaths
        date
        new_deaths_smoothed
        new_deaths_smoothed_per_million
        new_cases_smoothed_per_million
        new_tests_smoothed_per_thousand
        total_cases_per_million
        total_cases
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
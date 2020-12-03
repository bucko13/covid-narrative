# The COVID Narrative Project

This is the repo for the data and visualization website
currently available live at [covid-narrative.vercel.app/](https://covid-narrative.vercel.app/).
as well as [threekindsoflies.com](https://threekindsoflies.com).

Pull Request and issue submissions are welcome on this repo
in case there are any requests for new narratives or graphs
or a bug or mistake is found in the data visualizations or
calculations.

## Running a Self-Hosted Graphql Server for Data

This entire project can be self-hosted. This includes running all data queries from
their original sources and making them available via a graphql server which
is setup automatically by [Gatsby](https://gatsbyjs.com/). This means that you can
make custom queries against all of the data available as well as run the site yourself.

#### Custom list of countries and states

The list of locations to query is also completely customizable. To edit the list of countries go to the constants file `plugins/source-covid-data/constants/index.ts`
and either add or remove from the list of states or countries. The lists store locations
based on their [ISO Alpha-2 code](https://www.nationsonline.org/oneworld/country_code_list.htm),
so make sure to look up the appropriate code if you're adding to the list.

As this library is written in TypeScript, you must also update the corresponding type
for the list in `plugins/source-covid-data/types/index.d.ts` file so that the code
compiles correctly.

## Usage

- Clone the repo from GitHub or [download zip file](https://github.com/bucko13/covid-narrative/archive/master.zip)
- In your terminal `cd` into the directory and run `yarn` to install dependencies
- Note that a Gatsby plugin manages all the data retrieval and calculations and
  has its own directory and set of dependencies.
- Next run `gatsby develop`. This will make network requests for
  the latest data from all relevant API endpoints and store them locally as
  json files (this makes re-running the script faster).

This will take some time to complete due to the size of
the data sets you're requesting.

When finished, you will be able to visit the site locally at
`http://localhost:8000` and the graphql server where you can make custom queries against the data at `http://localhost:8000/__graphql`.

Learn more about interacting with Gatsby's Graphql server and UI [here](https://www.gatsbyjs.com/docs/graphql/).

### Refreshing the data

If you stop the server and want to restart it, just run `gatsby develop` again.
This should run significantly faster however will only run using the data from the
last time the network requests were made.

To reload the data with the latest versions from the respective sources, run:

```
gatsby develop:reload
```

## Data Sources

All API endpoints are listed in a constants file and can be inspected
directly there. This file can be found in `plugins/source-covid-data/constants/index.ts`.

**State Level Data:** [COVID Tracking Project](https://covidtracking.com/data/api) and [Johns Hopkins University](https://github.com/CSSEGISandData/COVID-19)

**Populations (US):** [DataUSA.io](https://datausa.io/)

**Employment/Labor Statistics (US):** [Bureau of Labor Statistics](https://www.bls.gov/)

**Labor and GDP Statistics (EU):** [Eurostat](https://ec.europa.eu/eurostat/)

**Policy Tracking Data (US and Global):** [Oxford Covid-19 Government Response Tracker](https://github.com/OxCGRT/covid-policy-tracker)

**Behavior/Survey Data:** [Imperial College London YouGov Covid 19 Behaviour Tracker Data Hub](https://github.com/YouGov-Data/covid-19-tracker)

**Rt (transmission rate) Data:** [Rt.live](https://rt.live/)

**Country-level Data:** [Our World In Data (OWID)](https://github.com/owid/covid-19-data/tree/master/public/data/)

Polimath has a great list of data sources on [his substack](https://polimath.substack.com/p/measuring-certainty-and-mountains) and his own data visualization tool on [GitHub](https://github.com/politicalmath/covid-sharp).

Infection Fatality Rate Estimate (IFR):
.65%
https://www.cdc.gov/coronavirus/2019-ncov/hcp/planning-scenarios.html

## More Questions?

Visit the [FAQ](https://threekindsoflies.com/faq) page on the website
for any other questions about data selection, calculation, and more.
To submit a new question, feel free to post in the Issues on GitHub
or ping me on Twitter.

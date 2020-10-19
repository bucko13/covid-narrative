# The COVID Narrative Project
This is the repo for the data and visualization website
currently available live at [covid-narrative.vercel.app/](https://covid-narrative.vercel.app/).
as well as [threekindsoflies.com](https://threekindsoflies.com).

Pull Request and issue submissions are welcome on this repo
in case there are any requests for new narratives or graphs
or a bug or mistake is found in the data visualizations or 
calculations. 

## How to Use
To build or refresh data for states 

```
$> RELOAD_DATA=true gatsby develop
```

Reloading all data in one build currently doesn't always scale unfortunately
so to rebuild the national data from OWID, you need a different 
env variable:

```
$> RELOAD_OWID_DATA=true gatsby develop
```

### Data Sources
#### State
https://covidtracking.com/data/api

**Populations:** https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest

**Unemployment Data** https://datausa.io/api/covid19/employment/latest/

$R_t$ Data: https://rt.live/

#### World
**Our World In Data**
https://github.com/owid/covid-19-data/tree/master/public/data/

Infection Fatality Rate Estimate (IFR):
.65% 
https://www.cdc.gov/coronavirus/2019-ncov/hcp/planning-scenarios.html
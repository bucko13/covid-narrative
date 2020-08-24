import React, { useEffect, useState } from "react"
import { graphql } from "gatsby"
import {Typography, Box} from "@material-ui/core"
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Brush,
  BarChart,
  Bar,
  CartesianAxis,
} from "recharts"
import { get } from 'axios';
import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"
import HistoricComparisonLineChart from "../components/HistoricComparisonLineChart";
import statePops from '../states/populations.json';

interface StateData {
  date: number;
  hospitalizedCurrently: number;
  positiveIncrease: number;
}

interface CombinedData {
  date: number;
  ny: number;
  tx: number;
}

interface IndexPageProps {
  data: {
    ny: {
      nodes: StateData[]
    },
    tx: {
      nodes: StateData[]
    }
    az: {
      nodes: StateData[]
    }
  }
}

console.log(statePops);
interface CSSECountrySummary {
  confirmed: {
    value: number
    detail: string
  };
  deaths: {
    value: number
    detail: string
  };
  recovered: {
    value: number
    detail: string
  };
  lastUpdate: string;
}

interface CovidTrackingStateSummary {
  date: number
  state: string
  positive: number
  negative: number
  death: number 
}

const NY_POP_2020 = 19440500
const TX_POP_2020 = 29472300
const NJ_POP_2020 = 8936570

// https://www.worldometers.info/world-population/sweden-population/
const SWEDEN_POP_2020 = 10107890
const FRANCE_POP_2020 = 65293187
const SPAIN_POP_2020 = 46757239
const ITALY_POP_2020 = 60449775
const US_POP_2020 = 331268378

interface Object {
  hasOwnProperty<T>(this: T, v: any): v is keyof T
}

const populations: { [key: string]: number } = {
  ny: NY_POP_2020,
  tx: TX_POP_2020,
  nj: NJ_POP_2020,
  az: statePops.arizona.Population,
  se: SWEDEN_POP_2020,
  es: SPAIN_POP_2020,
  it: ITALY_POP_2020,
  fr: FRANCE_POP_2020,
  us: US_POP_2020,
  usAdjusted: US_POP_2020 - NY_POP_2020 - NJ_POP_2020,
}

const getPerMPop = (name: string, value: number): number => 
  Math.floor(value / (populations[name] / 100000))

const IndexPage = ({ data }: IndexPageProps) => {
  const [swedenData, setSwedenData] = useState<CSSECountrySummary|undefined>()
  const [italyData, setItalyData] = useState<CSSECountrySummary|undefined>()
  const [franceData, setFranceData] = useState<CSSECountrySummary | undefined>()
  const [spainData, setSpainData] = useState<CSSECountrySummary | undefined>()
  const [usData, setUSData] = useState<CSSECountrySummary | undefined>()
  const [nyData, setNyData] = useState<CovidTrackingStateSummary | undefined>()
  const [njData, setNjData] = useState<CovidTrackingStateSummary | undefined>()
  const [txData, setTxData] = useState<CovidTrackingStateSummary | undefined>()
  const [fatalityData, setFatalityData] = useState<{name: string, fatalities: number}[]>()

  useEffect(() => {
    get("https://covid19.mathdro.id/api/countries/sweden")
      .then(({data}: { data: CSSECountrySummary}) => setSwedenData(data));
    get("https://covid19.mathdro.id/api/countries/us")
      .then(({data}: { data: CSSECountrySummary}) => setUSData(data));
    get("https://covid19.mathdro.id/api/countries/italy")
      .then(({ data }: { data: CSSECountrySummary }) => setItalyData(data))      
    get("https://covid19.mathdro.id/api/countries/france")
      .then(({ data }: { data: CSSECountrySummary }) => setFranceData(data))          
    get("https://covid19.mathdro.id/api/countries/spain")
      .then(({ data }: { data: CSSECountrySummary }) => setSpainData(data)) 
    get("https://api.covidtracking.com/v1/states/current.json")
      .then(({data}: { data: CovidTrackingStateSummary[]}) => {
        setNjData(data.find(({state}) => state === "NJ"))
        setNyData(data.find(({ state }) => state === "NY"))
        setTxData(data.find(({ state }) => state === "TX"))
      })
  }, []);
  
  useEffect(() => {
    const fatalityData = [];
    if (franceData)
      fatalityData.push({
        name: "France",
        fatalities: getPerMPop('fr', franceData.deaths.value),
      })
    if (italyData)
      fatalityData.push({
        name: "Italy",
        fatalities: getPerMPop('it', italyData.deaths.value),
      })

    if (swedenData) {
      fatalityData.push({
        name: "Sweden",
        fatalities: getPerMPop('se', swedenData.deaths.value),
      })
    }

    if (spainData) {
      fatalityData.push({
        name: "Spain",
        fatalities: getPerMPop('es', spainData.deaths.value),
      })
    }

    if (usData && nyData && njData && txData) {
      fatalityData.push(
        {
          name: "US",
          fatalities: getPerMPop('usAdjusted', usData.deaths.value - nyData.death - njData.death),
        },
        {
          name: "NJ",
          fatalities: getPerMPop('nj', njData.death),
        },
        {
          name: "NY",
          fatalities: getPerMPop('ny', nyData.death),
        },
        {
          name: "TX",
          fatalities: getPerMPop('tx', txData.death)
        }
      )}
    setFatalityData(fatalityData);
  }, [franceData, spainData, italyData, swedenData, usData, nyData, njData])

  const testData = [
    {
      location: "ny",
      pop: populations.ny,
      data: data.ny.nodes,
    },
    {
      location: "tx",
      pop: populations.tx,
      data: data.tx.nodes,
    },
    {
      location: "az",
      pop: populations.az,
      data: data.az.nodes,
    }
  ];

  return (
    <Layout>
      <SEO title="COVID-19 Data By the Numbers" />
      <Typography>
        "There are three kinds of lies: lies, damned lies, and statistics." -
        Mark Twain
      </Typography>

      <h4>Hospitalized By State</h4>
      <HistoricComparisonLineChart
        comparisonData={testData}
        comparitor="hospitalizedCurrently"
      />

      <h4>Daily Hospitalized By State per 100k</h4>
      <HistoricComparisonLineChart
        comparisonData={testData}
        comparitor="hospitalizedCurrently"
        perM={true}
      />

      <Box my={5}>
        <Typography variant="h5">Fatalities per 100k</Typography>
        <Typography variant="subtitle2">US Adjusted w/o NY and NJ</Typography>
      </Box>
      <ResponsiveContainer width="80%" aspect={2}>
        {fatalityData ? (
          <BarChart data={fatalityData}>
            <Bar dataKey="fatalities" fill="#663399" />
            <Legend />
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
          </BarChart>
        ) : null}
      </ResponsiveContainer>
    </Layout>
  )
}

export default IndexPage

export const query = graphql`
    query StateData {
      ny: allNyHistoricJson(sort: { fields: date, order: ASC }) {
        nodes {
          positiveIncrease
          hospitalizedCurrently 
          date
        }
      }
     az: allAzHistoricJson(sort: {fields: date, order: ASC}) {
          nodes {
            positiveIncrease
            hospitalizedCurrently 
            date
          }
        }
      tx: allTxHistoricJson(sort: {fields: date, order: ASC}) {
          nodes {
            positiveIncrease
            hospitalizedCurrently 
            date
          }
        }
    }
  ` 

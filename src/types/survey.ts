// src/types/survey.ts
export interface Survey {
  _id: string;
  mediaOutlet: string;
  surveyStartDate: string;
  surveyEndDate: string;
  sampleSize?: number;
}

export interface PoliticalParty {
  _id: string;
  name: string;
  shortName: string;
  colorCode: string;
}

export interface SupportRate {
  _id: string;
  surveyId: string;
  partyId: string;
  supportRate: number;
  rateChange?: number;
  party?: PoliticalParty;
}

export interface PartyData {
  _id: string;
  name: string;
  shortName: string;
  colorCode: string;
  supportRate: number;
  rateChange: number;
}

export interface ChartDataPoint {
  surveyId: string;
  date: string;
  fullDate: string;
  monthDate?: string;
  mediaOutlet: string;
  [key: string]: string | number | undefined;
}
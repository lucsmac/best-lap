import { MetricsRepository } from "@/data/repositories";
import { IMetricsUnchecked } from "@/models/entities";
import { PerformanceResult } from "@/models/types";
import { adaptLighthouseResultsToMetrics, setUpQuery } from "@/utils";

export class CreateCollectMetricsJob {
  constructor(private metricsRepository: MetricsRepository) {}
  
  async execute(channelUrl: string, channelId: string) {
    const url = setUpQuery(channelUrl)
    const response = await fetch(url)

    if (!response.ok) {
      const responseData = await response.json()
      throw new Error(`Network response was not ok, status: ${response.status} - Data: ${responseData}`);
    }
    
    const responseData = await response.json() as PerformanceResult

    if (!responseData?.lighthouseResult) {
      const logMessage = `ERROR - RESULT IS UNAVAILABLE - CHANNEL: ${channelUrl} - RESPONSE: ${JSON.stringify(responseData)}`
      console.log(logMessage)
      
      return null
    }

    const metrics = adaptLighthouseResultsToMetrics(responseData.lighthouseResult)

    const data: IMetricsUnchecked = {
      channel_id: channelId,
      time: new Date(),
      ...metrics,
    }

    this.metricsRepository.create(data)
  }
}

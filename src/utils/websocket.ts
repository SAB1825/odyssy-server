import { jobSubscriptions } from "../app";
import { webSocketLogger } from "./winston";

interface JobResult {
    jobId: string;
    executionTime : number;
    error? : string;
    output : string;
    success : boolean;
    status : "COMPLETED" | "QUEUED" | "FAILED";
}
         

export const notifyJobCompletion = (result : JobResult) => {
    const ws : any = jobSubscriptions[result.jobId];
    
    webSocketLogger.info(`Attempting to notify job completion for ${result.jobId}`);
    
    if(ws && ws.readyState === 1) { 
        try {
            const message = {
                type: "job_completed",
                jobId : result.jobId,
                output : result.output,
                error : result.error || null,
                success : result.success,
                executionTime : result.executionTime,
                status : result.status
            };
            
            ws.send(JSON.stringify(message));
            webSocketLogger.info(`Successfully notified job completion for ${result.jobId}`);
            
            delete jobSubscriptions[result.jobId];
        } catch (error) {
            webSocketLogger.error(`Error sending WebSocket message for job ${result.jobId}:`, error);
            // Clean up the subscription even if sending failed
            delete jobSubscriptions[result.jobId];
        }
    } else {
        if (!ws) {
            webSocketLogger.warn(`No WebSocket subscription found for job ${result.jobId}`);
        } else {
            webSocketLogger.warn(`WebSocket for job ${result.jobId} is not in OPEN state. ReadyState: ${ws.readyState}`);
            // Clean up dead connections
            delete jobSubscriptions[result.jobId];
        }
    }
};
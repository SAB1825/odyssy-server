// interfaces/queue.ts

export interface CodeExecutionJob {
  id: string;
  userId: string;
  code: string;
  language: string;
  codeSnippetId?: string;
  timestamp: number;
  priority?: number;
}

export interface JobResult {
  jobId: string;
  success: boolean;
  code : string;
  language : string;
  output: string;
  error?: string;
  executionTime: number;
  completedAt: Date;
}

export interface ExecutionRequest {
  code: string;
  language: string;
  userId: string;
  codeSnippetId?: string;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  codeSnippetId?: string;
  fromCache?: boolean;
}

export interface QueueConfig {
  url: string;
  queueName: string;
  durable: boolean;
  prefetch: number;
}

export interface ConnectionState {
  connection: any;
  channel: any;
  isConnected: boolean;
}
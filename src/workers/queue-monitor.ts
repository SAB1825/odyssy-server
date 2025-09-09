interface QueueMetrics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  processingJobs: number;
  averageExecutionTime: number;
  queueLength: number;
}

class QueueMonitor {
  private metrics: QueueMetrics = {
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    processingJobs: 0,
    averageExecutionTime: 0,
    queueLength: 0
  };

  jobStarted(): void {
    this.metrics.totalJobs++;
    this.metrics.processingJobs++;
  }

  jobCompleted(executionTime: number): void {
    this.metrics.completedJobs++;
    this.metrics.processingJobs--;
    this.updateAverageExecutionTime(executionTime);
  }

  jobFailed(): void {
    this.metrics.failedJobs++;
    this.metrics.processingJobs--;
  }

  private updateAverageExecutionTime(newTime: number): void {
    const totalTime = this.metrics.averageExecutionTime * (this.metrics.completedJobs - 1) + newTime;
    this.metrics.averageExecutionTime = totalTime / this.metrics.completedJobs;
  }

  async updateQueueLength(channel: any): Promise<void> {
    try {
      const queueInfo = await channel.checkQueue(process.env.QUEUE_NAME);
      this.metrics.queueLength = queueInfo.messageCount;
    } catch (error) {
      console.error('Failed to get queue length:', error);
    }
  }

  getMetrics(): QueueMetrics {
    return { ...this.metrics };
  }

  getHealthStatus(): { status: 'healthy' | 'warning' | 'critical'; details: any } {
    const failureRate = this.metrics.totalJobs > 0 ? this.metrics.failedJobs / this.metrics.totalJobs : 0;
    
    if (failureRate > 0.5) {
      return {
        status: 'critical',
        details: { failureRate, queueLength: this.metrics.queueLength }
      };
    }
    
    if (failureRate > 0.2 || this.metrics.queueLength > 100) {
      return {
        status: 'warning',
        details: { failureRate, queueLength: this.metrics.queueLength }
      };
    }
    
    return {
      status: 'healthy',
      details: this.getMetrics()
    };
  }
}

export const queueMonitor = new QueueMonitor();

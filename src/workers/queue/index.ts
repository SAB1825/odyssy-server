import { closePublisher, connectPublisher, publishCodeExecution } from "./publisher"
import { closeWorker, connectWorker, startProcessing } from "./worker";

export const initilizePublisher = async () => {
    await connectPublisher()
}

export const initializeWorker = async (): Promise<void> => {
  await connectWorker();
  await startProcessing();
};

export const queueCodeExecution = async (
  userId: string,
  code: string,
  language: string,
  codeSnippetId?: string
): Promise<string> => {
  return await publishCodeExecution(userId, code, language, codeSnippetId);
};

export const closeAllConnections = async (): Promise<void> => {
  await Promise.all([
    closePublisher(),
    closeWorker()
  ]);
};

export {
  connectPublisher,
  publishCodeExecution,
  closePublisher,
  connectWorker,
  startProcessing,
  closeWorker
};
export interface ExamTopic {
  id: number;
  title: string;
  description: string;
  questions: number;
  durationMins: number;
}

const az204Topics: ExamTopic[] = [
  {
    id: 1,
    title: 'Develop Azure compute solutions',
    description:
      'Implement IaaS solutions, Create Azure App Service Web Apps, Implement Azure functions',
    questions: 103,
    durationMins: 60
  },
  {
    id: 2,
    title: 'Develop for Azure storage',
    description:
      'Develop solutions that use Cosmos DB storage, Develop solutions that use blob storage',
    questions: 85,
    durationMins: 60
  },
  {
    id: 3,
    title: 'Implement Azure security',
    description:
      'Implement user authentication and authorization, Implement secure cloud solutions',
    questions: 89,
    durationMins: 60
  },
  {
    id: 4,
    title: 'Monitor, troubleshoot, and optimize Azure solutions',
    description:
      'Integrate caching and content delivery within solutions, Instrument solutions to support monitoring and logging',
    questions: 60,
    durationMins: 50
  },
  {
    id: 5,
    title: 'Connect to and consume Azure services and third-party services set-1',
    description:
      'Develop an App Service Logic App, Implement API Management, Develop event-based solutions, Develop message-based solutions',
    questions: 60,
    durationMins: 60
  }
];

const defaultTopics: ExamTopic[] = [
  {
    id: 1,
    title: 'Section 1',
    description: 'Practice questions grouped by exam domain',
    questions: 60,
    durationMins: 60
  },
  {
    id: 2,
    title: 'Section 2',
    description: 'Practice questions grouped by exam domain',
    questions: 60,
    durationMins: 60
  }
];

export function getExamTopics(code: string): ExamTopic[] {
  const norm = code.trim().toUpperCase();
  if (norm === 'AZ-204') return az204Topics;
  return defaultTopics;
}

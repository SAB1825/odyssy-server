

export interface ICodePublisherData {
    userId : string;
    code : string;
    language : string;
    code_snippet_id? : string;
}

export interface ICodeExecutionJob {
     id: string
      userId : string
      code: string
      language: string
      codeSnippetId?: string | null
      timestamp: Date
}


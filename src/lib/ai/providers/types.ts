
export interface AIProviderResponse<T = unknown> {
  data: T;
  model: string;
  provider: string;
}

export interface AIProvider {
  name: string;
  generate<T = unknown>(
    prompt: string,
    userMessage: string,
  ): Promise<AIProviderResponse<T>>;
}

export class AIProviderError extends Error {
  constructor(
    public provider: string,
    public model: string,
    public status?: number,
    message?: string,
    public isRetryable: boolean = true
  ) {
    super(message || `Error from provider ${provider} using model ${model}`);
    this.name = "AIProviderError";
  }
}

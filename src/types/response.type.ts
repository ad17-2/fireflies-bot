export interface WebResponse<T> {
  message: string;
  data: T | null;
}

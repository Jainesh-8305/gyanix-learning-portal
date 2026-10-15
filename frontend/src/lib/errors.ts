import { isAxiosError } from 'axios';
export function apiError(error: unknown, fallback: string) {
  return isAxiosError(error) &&
    typeof error.response?.data?.message === 'string'
    ? error.response.data.message
    : fallback;
}

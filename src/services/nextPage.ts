import handleResponse from '../helpers/handleResponse';
import { PostPagination } from '../pages/interface/HomeInterface';

export async function nextPageService(url: string) {
  return await fetch(url).then((response: Response) => handleResponse<PostPagination>(response));
}

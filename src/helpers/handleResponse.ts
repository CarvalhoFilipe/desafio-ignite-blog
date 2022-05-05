export default  function handleResponse<T>(response: Response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        return data as T;
    });
}